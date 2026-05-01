"""
Distress Audio Detector — Training Script

Model: Support Vector Machine (SVM) on MFCC + spectral features
Input: Raw audio signal (2-5 seconds)
Output: { is_distress: bool, confidence: float, category: str }

Classes:
  DISTRESS:     scream, shout_help, glass_breaking
  NON-DISTRESS: speech_normal, traffic, silence, footsteps, music, crowd, dog_bark

Privacy: On-device inference ONLY — raw audio is NEVER stored or sent to server.
Per AI_RULES.md: Explainable — feature contribution scores explain every prediction.

Usage:
    python -m ml.models.distress_audio.train
    python -m ml.models.distress_audio.train --samples 5000
"""

import sys
import json
import time
from pathlib import Path
from datetime import datetime

import numpy as np
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.svm import SVC
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
)

sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent))

from ml.config import DISTRESS_AUDIO_PARAMS, PROCESSED_DIR, MODELS_DIR

MODEL_DIR = MODELS_DIR / "distress_audio"
MODEL_DIR.mkdir(parents=True, exist_ok=True)

# ─── Category definitions ───
DISTRESS_CATEGORIES = ["scream", "shout_help", "glass_breaking"]
NON_DISTRESS_CATEGORIES = [
    "speech_normal", "traffic", "silence",
    "footsteps", "music", "crowd", "dog_bark",
]
ALL_CATEGORIES = DISTRESS_CATEGORIES + NON_DISTRESS_CATEGORIES

# Samples per category
DEFAULT_SAMPLES_PER_CATEGORY = 500


def generate_audio_dataset(
    samples_per_category: int = DEFAULT_SAMPLES_PER_CATEGORY,
    sample_rate: int = 22050,
    duration_s: float = 2.0,
) -> pd.DataFrame:
    """
    Generate a synthetic audio dataset with extracted features.

    For each category, generates N audio samples, extracts MFCC + spectral
    features, and labels them as distress / non-distress.

    Args:
        samples_per_category: Number of samples per sound category
        sample_rate: Audio sample rate
        duration_s: Duration of each audio clip

    Returns:
        DataFrame with all extracted features + labels
    """
    from ml.features.audio_features import (
        extract_audio_features,
        synthesize_audio_sample,
        get_feature_names,
    )

    total = samples_per_category * len(ALL_CATEGORIES)
    print(f"[Dataset] Generating {total} audio samples "
          f"({samples_per_category} × {len(ALL_CATEGORIES)} categories)...")

    records = []
    feature_names = None

    for cat_idx, category in enumerate(ALL_CATEGORIES):
        is_distress = category in DISTRESS_CATEGORIES
        label = 1 if is_distress else 0

        print(f"  [{cat_idx+1}/{len(ALL_CATEGORIES)}] {category:20s} "
              f"({'DISTRESS' if is_distress else 'normal':>8s}) ", end="", flush=True)

        cat_start = time.time()

        for i in range(samples_per_category):
            # Generate synthetic audio
            audio = synthesize_audio_sample(
                category=category,
                duration_s=duration_s + np.random.uniform(-0.5, 0.5),
                sample_rate=sample_rate,
            )

            # Extract features
            features = extract_audio_features(
                audio_signal=audio,
                sample_rate=sample_rate,
            )

            if feature_names is None:
                feature_names = sorted(features.keys())

            # Add metadata
            features["category"] = category
            features["is_distress"] = label

            records.append(features)

        elapsed = time.time() - cat_start
        print(f"({elapsed:.1f}s)")

    df = pd.DataFrame(records)

    # Save to disk
    data_path = PROCESSED_DIR / "distress_audio_data.csv"
    df.to_csv(data_path, index=False)
    print(f"\n[✓] Audio dataset saved: {data_path} ({len(df)} samples, {len(feature_names)} features)")

    return df


def load_or_generate_data(samples_per_category: int = DEFAULT_SAMPLES_PER_CATEGORY):
    """Load existing dataset or generate new one."""
    data_path = PROCESSED_DIR / "distress_audio_data.csv"

    if data_path.exists():
        df = pd.read_csv(data_path)
        print(f"[Data] Loaded existing dataset: {len(df)} samples")
        print(f"[Data] Distress: {(df['is_distress']==1).sum()}, "
              f"Normal: {(df['is_distress']==0).sum()}")
        return df
    else:
        return generate_audio_dataset(samples_per_category=samples_per_category)


def prepare_features(df: pd.DataFrame):
    """Prepare feature matrix and target labels."""
    # Exclude metadata columns
    exclude_cols = {"category", "is_distress", "duration_s"}
    feature_cols = [c for c in df.columns if c not in exclude_cols and df[c].dtype in [np.float64, np.int64, float, int]]
    feature_cols = sorted(feature_cols)

    X = df[feature_cols].copy()
    y = df["is_distress"].copy()
    categories = df["category"].copy()

    # Handle any NaN/inf values
    X = X.replace([np.inf, -np.inf], np.nan)
    X = X.fillna(0)

    print(f"[Features] {len(feature_cols)} audio features extracted")
    print(f"[Target] Distress: {(y==1).sum()}, Normal: {(y==0).sum()}")

    return X, y, categories, feature_cols


def train_model(X_train, y_train, X_test, y_test, feature_cols, categories_test):
    """
    Train the SVM classifier.

    SVM is chosen because:
    1. Works well with high-dimensional MFCC features
    2. Good generalization with proper kernel choice
    3. Support vectors provide interpretability
    4. Robust to outliers with RBF kernel
    """
    print("[Train] Training Distress Audio Detector (SVM)...")

    # Build pipeline: StandardScaler → SVM
    model = Pipeline([
        ("scaler", StandardScaler()),
        ("svm", SVC(
            C=DISTRESS_AUDIO_PARAMS["C"],
            kernel=DISTRESS_AUDIO_PARAMS["kernel"],
            gamma=DISTRESS_AUDIO_PARAMS["gamma"],
            random_state=DISTRESS_AUDIO_PARAMS["random_state"],
            probability=True,  # Enable probability estimates for confidence
            class_weight="balanced",  # Handle class imbalance
        )),
    ])

    # Train
    train_start = time.time()
    model.fit(X_train, y_train)
    train_time = time.time() - train_start

    # Predict
    y_pred = model.predict(X_test)
    y_proba = model.predict_proba(X_test)

    # ─── Metrics ───
    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred, zero_division=0)
    recall = recall_score(y_test, y_pred, zero_division=0)
    f1 = f1_score(y_test, y_pred, zero_division=0)

    print(f"\n{'='*60}")
    print(f"  🎙️  DISTRESS AUDIO DETECTOR — Results")
    print(f"{'='*60}")
    print(f"  Accuracy:  {accuracy:.4f}")
    print(f"  Precision: {precision:.4f}  (low false alarm rate)")
    print(f"  Recall:    {recall:.4f}  (catches real distress)")
    print(f"  F1 Score:  {f1:.4f}")
    print(f"  Train time: {train_time:.1f}s")
    print(f"{'='*60}\n")

    # Detailed classification report
    print("  Per-class Report:")
    print(classification_report(
        y_test, y_pred,
        target_names=["Normal", "Distress"],
        digits=4,
    ))

    # Confusion matrix
    cm = confusion_matrix(y_test, y_pred)
    print("  Confusion Matrix:")
    print(f"                Predicted Normal  Predicted Distress")
    print(f"  Actual Normal     {cm[0][0]:>6d}          {cm[0][1]:>6d}")
    print(f"  Actual Distress   {cm[1][0]:>6d}          {cm[1][1]:>6d}")

    # ─── Per-category accuracy ───
    print(f"\n  Per-Category Accuracy:")
    for cat in ALL_CATEGORIES:
        cat_mask = categories_test == cat
        if cat_mask.sum() > 0:
            cat_acc = accuracy_score(y_test[cat_mask], y_pred[cat_mask])
            is_d = "🔴" if cat in DISTRESS_CATEGORIES else "🟢"
            print(f"    {is_d} {cat:20s} {cat_acc:.4f}  ({cat_mask.sum()} samples)")

    # ─── Feature importance via permutation ───
    print(f"\n  Top 15 Most Important Features:")
    feature_importance = compute_feature_importance(
        model, X_test, y_test, feature_cols
    )
    sorted_imp = sorted(feature_importance.items(), key=lambda x: x[1], reverse=True)
    for feat, imp in sorted_imp[:15]:
        bar = "█" * int(imp * 200)
        print(f"    {feat:35s} {imp:.4f}  {bar}")

    metrics = {
        "accuracy": accuracy,
        "precision": precision,
        "recall": recall,
        "f1": f1,
        "train_time_s": train_time,
        "confusion_matrix": cm.tolist(),
        "feature_importance": {k: round(v, 6) for k, v in sorted_imp[:20]},
    }

    return model, metrics


def compute_feature_importance(model, X_test, y_test, feature_cols, n_repeats=5):
    """
    Compute feature importance via permutation.
    This is model-agnostic and fully explainable.
    """
    try:
        from sklearn.inspection import permutation_importance
        result = permutation_importance(
            model, X_test, y_test,
            n_repeats=n_repeats,
            random_state=42,
            n_jobs=-1,
        )
        importance = dict(zip(feature_cols, result.importances_mean))
        return importance
    except Exception as e:
        print(f"  [!] Permutation importance failed: {e}")
        return {col: 0.0 for col in feature_cols}


def save_model(model, metrics, feature_cols):
    """Save trained model and metadata."""
    # Save model pipeline (includes scaler + SVM)
    model_path = MODEL_DIR / "model.pkl"
    joblib.dump(model, model_path)
    print(f"\n[✓] Model saved: {model_path}")

    # Save metadata
    metadata = {
        "model_type": "SVM (RBF kernel) Pipeline",
        "trained_at": datetime.utcnow().isoformat(),
        "feature_columns": feature_cols,
        "n_features": len(feature_cols),
        "categories": {
            "distress": DISTRESS_CATEGORIES,
            "non_distress": NON_DISTRESS_CATEGORIES,
        },
        "metrics": {
            k: float(v) if isinstance(v, (int, float, np.floating)) else v
            for k, v in metrics.items()
        },
        "hyperparameters": DISTRESS_AUDIO_PARAMS,
        "description": (
            "Distress Audio Detector — classifies audio as distress (scream, "
            "shout, glass breaking) or normal (speech, traffic, music, etc.) "
            "using MFCC + spectral features"
        ),
        "explainability": (
            "Feature importance via permutation shows which audio features "
            "(MFCCs, spectral centroid, pitch, energy) contribute most to "
            "each prediction"
        ),
        "privacy": (
            "On-device inference ONLY. Raw audio is NEVER stored, transmitted, "
            "or logged. Only the binary distress/normal prediction is used."
        ),
    }

    meta_path = MODEL_DIR / "metadata.json"
    with open(meta_path, "w") as f:
        json.dump(metadata, f, indent=2, default=str)
    print(f"[✓] Metadata saved: {meta_path}")

    # Save feature column list for inference
    cols_path = MODEL_DIR / "feature_columns.json"
    with open(cols_path, "w") as f:
        json.dump(feature_cols, f, indent=2)
    print(f"[✓] Feature columns saved: {cols_path}")


def main():
    """Full training pipeline for Distress Audio Detector."""
    # Parse args
    samples = DEFAULT_SAMPLES_PER_CATEGORY
    if "--samples" in sys.argv:
        idx = sys.argv.index("--samples") + 1
        if idx < len(sys.argv):
            samples = int(sys.argv[idx])

    print("\n" + "╔" + "═"*58 + "╗")
    print("║  🎙️  EPOCH — Distress Audio Detector Training             ║")
    print("╚" + "═"*58 + "╝\n")

    pipeline_start = time.time()

    # 1. Load or generate dataset
    print("━"*60)
    print("  Step 1: Dataset Generation")
    print("━"*60)
    df = load_or_generate_data(samples_per_category=samples)

    # 2. Prepare features
    print("\n" + "━"*60)
    print("  Step 2: Feature Preparation")
    print("━"*60)
    X, y, categories, feature_cols = prepare_features(df)

    # 3. Split
    X_train, X_test, y_train, y_test, cat_train, cat_test = train_test_split(
        X, y, categories, test_size=0.2, random_state=42, stratify=y,
    )
    print(f"[Split] Train: {len(X_train)}, Test: {len(X_test)}")

    # 4. Train
    print("\n" + "━"*60)
    print("  Step 3: Model Training")
    print("━"*60)
    model, metrics = train_model(
        X_train, y_train, X_test, y_test, feature_cols, cat_test,
    )

    # 5. Cross-validation
    print("\n" + "━"*60)
    print("  Step 4: Cross-Validation")
    print("━"*60)
    cv_scores = cross_val_score(model, X, y, cv=5, scoring="f1", n_jobs=-1)
    print(f"  5-Fold CV F1: {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")
    print(f"  Fold scores: {[f'{s:.4f}' for s in cv_scores]}")

    # 6. Save
    print("\n" + "━"*60)
    print("  Step 5: Saving Model")
    print("━"*60)
    save_model(model, metrics, feature_cols)

    total_time = time.time() - pipeline_start
    print(f"\n╔{'═'*58}╗")
    print(f"║  ✅ Distress Audio Detector trained in {total_time:.1f}s{' '*(17-len(f'{total_time:.1f}'))}║")
    print(f"║  F1: {metrics['f1']:.4f}  Precision: {metrics['precision']:.4f}  Recall: {metrics['recall']:.4f}  ║")
    print(f"╚{'═'*58}╝")

    return model


if __name__ == "__main__":
    main()
