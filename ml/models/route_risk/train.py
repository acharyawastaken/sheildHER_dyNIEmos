"""
Route Risk Scorer — Training Script

Model: Logistic Regression (for risk level) + Linear Regression (for score)
Input: Route-aggregated safety features
Output: Route risk score (0-100) + segment-level breakdown

Usage:
    python -m ml.models.route_risk.train
"""

import sys
import json
from pathlib import Path
from datetime import datetime

import numpy as np
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.linear_model import Ridge
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent))

from ml.config import ROUTE_RISK_PARAMS, PROCESSED_DIR, MODELS_DIR

MODEL_DIR = MODELS_DIR / "route_risk"
MODEL_DIR.mkdir(parents=True, exist_ok=True)


def load_data():
    """Load route risk dataset."""
    data_path = PROCESSED_DIR / "route_risk_data.csv"
    if not data_path.exists():
        from ml.data.download_datasets import save_datasets
        save_datasets()
    df = pd.read_csv(data_path)
    print(f"[Data] Loaded {len(df)} route samples")
    return df


def prepare_features(df):
    """Prepare features for route risk model."""
    feature_cols = [
        "route_length_km",
        "n_segments",
        "avg_safety_score",
        "min_safety_score",
        "dark_segments",
        "police_coverage",
        "arterial_fraction",
        "cctv_coverage",
        "hour",
        "is_night",
        "is_weekend",
    ]
    X = df[feature_cols].copy()
    y = df["route_risk"].copy()
    return X, y, feature_cols


def train_model(X_train, y_train, X_test, y_test, feature_cols):
    """Train the route risk model."""
    print("[Train] Training Route Risk Scorer...")

    # Use a pipeline with StandardScaler + Ridge regression
    model = Pipeline([
        ("scaler", StandardScaler()),
        ("regressor", Ridge(alpha=1.0, random_state=42)),
    ])

    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    y_pred = np.clip(y_pred, 0, 100)

    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    r2 = r2_score(y_test, y_pred)

    print(f"\n{'='*50}")
    print(f"  ROUTE RISK SCORER — Results")
    print(f"{'='*50}")
    print(f"  MAE:  {mae:.4f}")
    print(f"  RMSE: {rmse:.4f}")
    print(f"  R²:   {r2:.4f}")
    print(f"{'='*50}\n")

    # Feature coefficients (explainability)
    ridge = model.named_steps["regressor"]
    scaler = model.named_steps["scaler"]
    scaled_coefs = ridge.coef_
    coef_dict = dict(zip(feature_cols, scaled_coefs.tolist()))
    sorted_coefs = sorted(coef_dict.items(), key=lambda x: abs(x[1]), reverse=True)

    print("  Feature Coefficients (standardized):")
    for feat, coef in sorted_coefs:
        sign = "+" if coef > 0 else "-"
        bar = "█" * int(abs(coef) * 3)
        print(f"    {feat:25s} {sign}{abs(coef):.4f}  {bar}")

    return model, {
        "mae": mae, "rmse": rmse, "r2": r2,
        "coefficients": coef_dict,
    }


def save_model(model, metrics, feature_cols):
    """Save trained model and metadata."""
    model_path = MODEL_DIR / "model.pkl"
    joblib.dump(model, model_path)
    print(f"[✓] Model saved: {model_path}")

    metadata = {
        "model_type": "Ridge Regression Pipeline",
        "trained_at": datetime.utcnow().isoformat(),
        "feature_columns": feature_cols,
        "metrics": {k: float(v) if isinstance(v, (int, float, np.floating)) else v for k, v in metrics.items()},
        "description": "Route Risk Scorer — predicts route risk (0-100) from aggregated safety features",
        "explainability": "Linear coefficients show direct feature contribution to risk",
    }
    meta_path = MODEL_DIR / "metadata.json"
    with open(meta_path, "w") as f:
        json.dump(metadata, f, indent=2, default=str)
    print(f"[✓] Metadata saved: {meta_path}")


def main():
    print("\n" + "=" * 60)
    print("  🛣️  EPOCH — Route Risk Scorer Training")
    print("=" * 60 + "\n")

    df = load_data()
    X, y, feature_cols = prepare_features(df)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    print(f"[Split] Train: {len(X_train)}, Test: {len(X_test)}")

    model, metrics = train_model(X_train, y_train, X_test, y_test, feature_cols)
    save_model(model, metrics, feature_cols)

    print("\n[✓] Route Risk Scorer training complete!")
    return model


if __name__ == "__main__":
    main()
