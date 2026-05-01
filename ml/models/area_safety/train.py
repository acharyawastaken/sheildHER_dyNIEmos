"""
Area Safety Classifier — Training Script

Model: XGBoost Gradient Boosted Decision Tree
Input: Location features (crime_rate, lighting, police_dist, etc.)
Output: Safety score (0-10)

Explainability: Feature importance + SHAP values exported after training.
Per AI_RULES.md: No black-box models — this model uses interpretable trees.

Usage:
    python -m ml.models.area_safety.train
"""

import sys
import os
import json
from pathlib import Path
from datetime import datetime

import numpy as np
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score,
)

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent))

from ml.config import (
    AREA_SAFETY_PARAMS,
    PROCESSED_DIR,
    MODELS_DIR,
)

# Model output directory
MODEL_DIR = MODELS_DIR / "area_safety"
MODEL_DIR.mkdir(parents=True, exist_ok=True)


def load_data():
    """Load the area safety training dataset."""
    data_path = PROCESSED_DIR / "area_safety_data.csv"
    if not data_path.exists():
        print("[!] Dataset not found. Generating...")
        sys.path.insert(0, str(Path(__file__).parent.parent.parent))
        from ml.data.download_datasets import save_datasets
        save_datasets()

    df = pd.read_csv(data_path)
    print(f"[Data] Loaded {len(df)} samples from {data_path}")
    return df


def prepare_features(df: pd.DataFrame):
    """Prepare feature matrix and target."""
    feature_cols = [
        "crime_rate",
        "lighting_score",
        "police_distance_km",
        "hospital_distance_km",
        "road_type",
        "crowd_density",
        "cctv_count",
        "transport_access",
        "urban_density",
    ]

    X = df[feature_cols].copy()
    y = df["safety_score"].copy()

    return X, y, feature_cols


def train_model(X_train, y_train, X_test, y_test, feature_cols):
    """Train the XGBoost model."""
    try:
        from xgboost import XGBRegressor
        print("[Model] Using XGBoost")
        model = XGBRegressor(
            objective="reg:squarederror",
            **AREA_SAFETY_PARAMS,
        )
    except ImportError:
        print("[Model] XGBoost not available, using sklearn GradientBoosting")
        from sklearn.ensemble import GradientBoostingRegressor
        model = GradientBoostingRegressor(
            n_estimators=AREA_SAFETY_PARAMS["n_estimators"],
            max_depth=AREA_SAFETY_PARAMS["max_depth"],
            learning_rate=AREA_SAFETY_PARAMS["learning_rate"],
            subsample=AREA_SAFETY_PARAMS["subsample"],
            random_state=AREA_SAFETY_PARAMS["random_state"],
        )

    print("[Train] Training Area Safety Classifier...")
    model.fit(X_train, y_train)

    # Predictions
    y_pred = model.predict(X_test)
    y_pred = np.clip(y_pred, 0, 10)

    # Metrics
    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    r2 = r2_score(y_test, y_pred)

    print(f"\n{'='*50}")
    print(f"  AREA SAFETY CLASSIFIER — Results")
    print(f"{'='*50}")
    print(f"  MAE:  {mae:.4f}")
    print(f"  RMSE: {rmse:.4f}")
    print(f"  R²:   {r2:.4f}")
    print(f"{'='*50}\n")

    # Feature importance
    if hasattr(model, "feature_importances_"):
        importances = model.feature_importances_
        importance_dict = dict(zip(feature_cols, importances.tolist()))
        sorted_imp = sorted(importance_dict.items(), key=lambda x: x[1], reverse=True)

        print("  Feature Importance:")
        for feat, imp in sorted_imp:
            bar = "█" * int(imp * 50)
            print(f"    {feat:25s} {imp:.4f}  {bar}")

    return model, {"mae": mae, "rmse": rmse, "r2": r2, "feature_importance": importance_dict}


def export_shap_explanations(model, X_test, feature_cols):
    """Generate SHAP explanations for model transparency."""
    try:
        import shap
        print("[SHAP] Generating feature explanations...")

        explainer = shap.TreeExplainer(model)
        shap_values = explainer.shap_values(X_test[:100])

        # Save mean absolute SHAP values
        mean_shap = np.abs(shap_values).mean(axis=0)
        shap_dict = dict(zip(feature_cols, mean_shap.tolist()))
        sorted_shap = sorted(shap_dict.items(), key=lambda x: x[1], reverse=True)

        print("\n  SHAP Feature Contributions (mean |SHAP|):")
        for feat, val in sorted_shap:
            bar = "█" * int(val * 30)
            print(f"    {feat:25s} {val:.4f}  {bar}")

        # Save SHAP values
        shap_path = MODEL_DIR / "shap_values.json"
        with open(shap_path, "w") as f:
            json.dump(shap_dict, f, indent=2)
        print(f"\n[✓] SHAP values saved: {shap_path}")

        return shap_dict

    except ImportError:
        print("[SHAP] shap package not installed. Skipping explanations.")
        print("[SHAP] Install with: pip install shap")
        return None


def save_model(model, metrics, feature_cols):
    """Save the trained model and metadata."""
    # Save model
    model_path = MODEL_DIR / "model.pkl"
    joblib.dump(model, model_path)
    print(f"[✓] Model saved: {model_path}")

    # Save metadata
    metadata = {
        "model_type": type(model).__name__,
        "trained_at": datetime.utcnow().isoformat(),
        "feature_columns": feature_cols,
        "metrics": {k: float(v) if isinstance(v, (int, float, np.floating)) else v for k, v in metrics.items()},
        "hyperparameters": AREA_SAFETY_PARAMS,
        "description": "Area Safety Classifier — predicts safety score (0-10) from location features",
        "explainability": "Feature importance + SHAP values available",
    }
    meta_path = MODEL_DIR / "metadata.json"
    with open(meta_path, "w") as f:
        json.dump(metadata, f, indent=2, default=str)
    print(f"[✓] Metadata saved: {meta_path}")


def main():
    """Full training pipeline."""
    print("\n" + "=" * 60)
    print("  🗺️  EPOCH — Area Safety Classifier Training")
    print("=" * 60 + "\n")

    # 1. Load data
    df = load_data()

    # 2. Prepare features
    X, y, feature_cols = prepare_features(df)
    print(f"[Features] {len(feature_cols)} features: {feature_cols}")
    print(f"[Target] safety_score range: {y.min():.1f} – {y.max():.1f}, mean: {y.mean():.2f}")

    # 3. Split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    print(f"[Split] Train: {len(X_train)}, Test: {len(X_test)}")

    # 4. Train
    model, metrics = train_model(X_train, y_train, X_test, y_test, feature_cols)

    # 5. SHAP explanations
    shap_dict = export_shap_explanations(model, X_test, feature_cols)

    # 6. Save
    save_model(model, metrics, feature_cols)

    print("\n[✓] Area Safety Classifier training complete!")
    return model


if __name__ == "__main__":
    main()
