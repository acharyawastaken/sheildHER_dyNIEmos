"""
Model Predictor — Load trained models and run inference.
This is the bridge between trained ML models and the FastAPI backend.
"""
import sys
from pathlib import Path
from typing import Optional
import numpy as np

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from ml.config import MODELS_DIR


class EpochPredictor:
    """Loads all trained Epoch models and provides inference methods."""

    def __init__(self):
        self.area_safety_model = None
        self.route_risk_model = None
        self.movement_model = None
        self.movement_scaler = None
        self.distress_model = None
        self.distress_feature_cols = None
        self._load_models()

    def _load_models(self):
        """Load all available trained models."""
        import joblib

        # Area Safety
        area_path = MODELS_DIR / "area_safety" / "model.pkl"
        if area_path.exists():
            self.area_safety_model = joblib.load(area_path)
            print("[Predictor] ✓ Area Safety model loaded")
        else:
            print("[Predictor] ✗ Area Safety model not found — run training first")

        # Route Risk
        route_path = MODELS_DIR / "route_risk" / "model.pkl"
        if route_path.exists():
            self.route_risk_model = joblib.load(route_path)
            print("[Predictor] ✓ Route Risk model loaded")
        else:
            print("[Predictor] ✗ Route Risk model not found")

        # Movement Anomaly
        move_path = MODELS_DIR / "movement_anomaly" / "model.pkl"
        scaler_path = MODELS_DIR / "movement_anomaly" / "scaler.pkl"
        if move_path.exists() and scaler_path.exists():
            self.movement_model = joblib.load(move_path)
            self.movement_scaler = joblib.load(scaler_path)
            print("[Predictor] ✓ Movement Anomaly model loaded")
        else:
            print("[Predictor] ✗ Movement Anomaly model not found")

        # Distress Audio
        distress_path = MODELS_DIR / "distress_audio" / "model.pkl"
        cols_path = MODELS_DIR / "distress_audio" / "feature_columns.json"
        if distress_path.exists():
            self.distress_model = joblib.load(distress_path)
            if cols_path.exists():
                import json
                self.distress_feature_cols = json.load(open(cols_path))
            print("[Predictor] ✓ Distress Audio model loaded")
        else:
            print("[Predictor] ✗ Distress Audio model not found")

    def predict_area_safety(
        self,
        crime_rate: float = 30.0,
        lighting_score: float = 5.0,
        police_distance_km: float = 2.0,
        hospital_distance_km: float = 3.0,
        road_type: int = 2,
        crowd_density: float = 20.0,
        cctv_count: int = 3,
        transport_access: float = 5.0,
        urban_density: float = 0.5,
    ) -> dict:
        """
        Predict area safety score (0-10).
        Falls back to rule-based scoring if model not available.
        """
        if self.area_safety_model is None:
            # Fallback: rule-based
            risk = (crime_rate * 0.3 + (10 - lighting_score) * 8 * 0.2
                    + police_distance_km * 10 * 0.15 + (4 - road_type) * 10 * 0.1)
            score = max(0, min(10, 10 - risk / 15))
            return {"safety_score": round(score, 1), "source": "rule_based"}

        features = np.array([[
            crime_rate, lighting_score, police_distance_km,
            hospital_distance_km, road_type, crowd_density,
            cctv_count, transport_access, urban_density,
        ]])
        score = float(np.clip(self.area_safety_model.predict(features)[0], 0, 10))
        return {"safety_score": round(score, 1), "source": "ml_model"}

    def predict_route_risk(
        self,
        route_length_km: float = 1.0,
        n_segments: int = 5,
        avg_safety_score: float = 7.0,
        min_safety_score: float = 5.0,
        dark_segments: int = 1,
        police_coverage: float = 0.5,
        arterial_fraction: float = 0.5,
        cctv_coverage: float = 0.5,
        hour: int = 12,
        is_night: int = 0,
        is_weekend: int = 0,
    ) -> dict:
        """Predict route risk score (0-100)."""
        if self.route_risk_model is None:
            risk = (10 - avg_safety_score) * 8 + dark_segments * 3 + is_night * 15
            return {"route_risk": int(min(100, max(0, risk))), "source": "rule_based"}

        features = np.array([[
            route_length_km, n_segments, avg_safety_score, min_safety_score,
            dark_segments, police_coverage, arterial_fraction, cctv_coverage,
            hour, is_night, is_weekend,
        ]])
        score = float(np.clip(self.route_risk_model.predict(features)[0], 0, 100))
        return {"route_risk": int(round(score)), "source": "ml_model"}

    def predict_movement_anomaly(
        self,
        speed_ms: float = 1.2,
        acceleration_ms2: float = 0.5,
        heading_change_deg_s: float = 5.0,
        route_deviation_m: float = 0.0,
        stop_duration_s: float = 0.0,
        jerk_ms3: float = 0.3,
    ) -> dict:
        """Predict if movement is anomalous."""
        if self.movement_model is None or self.movement_scaler is None:
            is_anomaly = (speed_ms > 3.5 and heading_change_deg_s > 20) or route_deviation_m > 50
            return {"anomaly_score": 80 if is_anomaly else 10, "is_anomaly": is_anomaly, "source": "rule_based"}

        features = np.array([[speed_ms, acceleration_ms2, heading_change_deg_s,
                              route_deviation_m, stop_duration_s, jerk_ms3]])
        scaled = self.movement_scaler.transform(features)
        prediction = self.movement_model.predict(scaled)[0]
        raw_score = self.movement_model.decision_function(scaled)[0]
        anomaly_score = int(max(0, min(100, (1 - (raw_score + 0.5)) * 100)))

        return {
            "anomaly_score": anomaly_score,
            "is_anomaly": prediction == -1,
            "source": "ml_model",
        }

    def predict_distress(self, audio_signal: np.ndarray, sample_rate: int = 22050) -> dict:
        """
        Predict if an audio signal contains distress sounds.
        Privacy: Only the prediction result leaves this function — never the audio.
        """
        if self.distress_model is None:
            return {"is_distress": False, "confidence": 0.0, "source": "unavailable"}

        try:
            from ml.features.audio_features import extract_audio_features
            features = extract_audio_features(audio_signal, sample_rate)

            # Build feature vector in correct column order
            if self.distress_feature_cols:
                feat_vector = [features.get(c, 0.0) for c in self.distress_feature_cols]
            else:
                feat_vector = [v for k, v in sorted(features.items()) if isinstance(v, (int, float))]

            X = np.array([feat_vector])
            X = np.nan_to_num(X, nan=0.0, posinf=0.0, neginf=0.0)

            prediction = self.distress_model.predict(X)[0]
            proba = self.distress_model.predict_proba(X)[0]
            confidence = float(max(proba))

            return {
                "is_distress": bool(prediction == 1),
                "confidence": round(confidence, 4),
                "source": "ml_model",
            }
        except Exception as e:
            print(f"[Predictor] Distress prediction error: {e}")
            return {"is_distress": False, "confidence": 0.0, "source": "error"}


# Singleton instance
_predictor: Optional[EpochPredictor] = None

def get_predictor() -> EpochPredictor:
    """Get or create the global predictor instance."""
    global _predictor
    if _predictor is None:
        _predictor = EpochPredictor()
    return _predictor
