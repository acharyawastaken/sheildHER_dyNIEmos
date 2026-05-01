"""
Epoch — Master Training Pipeline
Generates datasets, trains all models, and validates results.

Usage:
    python train_all.py              # Train all models
    python train_all.py --model area # Train only area safety model
"""
import sys, time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))


def train_all():
    """Run the complete training pipeline."""
    start = time.time()
    print("╔" + "═"*58 + "╗")
    print("║   🧠 EPOCH — Complete Model Training Pipeline            ║")
    print("╚" + "═"*58 + "╝\n")

    # Step 1: Generate datasets
    print("━"*60)
    print("  STEP 1/5 — Generating Training Datasets")
    print("━"*60)
    from ml.data.download_datasets import save_datasets
    save_datasets()

    # Step 2: Train Area Safety Classifier
    print("\n" + "━"*60)
    print("  STEP 2/5 — Training Area Safety Classifier")
    print("━"*60)
    from ml.models.area_safety.train import main as train_area
    train_area()

    # Step 3: Train Route Risk Scorer
    print("\n" + "━"*60)
    print("  STEP 3/5 — Training Route Risk Scorer")
    print("━"*60)
    from ml.models.route_risk.train import main as train_route
    train_route()

    # Step 4: Train Movement Anomaly Detector
    print("\n" + "━"*60)
    print("  STEP 4/5 — Training Movement Anomaly Detector")
    print("━"*60)
    from ml.models.movement_anomaly.train import main as train_movement
    train_movement()

    # Step 5: Train Distress Audio Detector
    print("\n" + "━"*60)
    print("  STEP 5/5 — Training Distress Audio Detector")
    print("━"*60)
    from ml.models.distress_audio.train import main as train_distress
    train_distress()

    elapsed = time.time() - start
    print("\n" + "╔" + "═"*58 + "╗")
    print(f"║   ✅ All models trained in {elapsed:.1f}s{' '*(28-len(f'{elapsed:.1f}'))}║")
    print("╚" + "═"*58 + "╝")

    # Verify all models exist
    from ml.config import MODELS_DIR
    models = ["area_safety/model.pkl", "route_risk/model.pkl", "movement_anomaly/model.pkl", "distress_audio/model.pkl"]
    print("\nModel artifacts:")
    for m in models:
        p = MODELS_DIR / m
        status = "✓" if p.exists() else "✗"
        size = f"{p.stat().st_size/1024:.0f}KB" if p.exists() else "missing"
        print(f"  [{status}] {m} ({size})")


if __name__ == "__main__":
    if "--model" in sys.argv:
        idx = sys.argv.index("--model") + 1
        model = sys.argv[idx] if idx < len(sys.argv) else "all"
        if model == "area":
            from ml.data.download_datasets import save_datasets; save_datasets()
            from ml.models.area_safety.train import main; main()
        elif model == "route":
            from ml.data.download_datasets import save_datasets; save_datasets()
            from ml.models.route_risk.train import main; main()
        elif model == "movement":
            from ml.data.download_datasets import save_datasets; save_datasets()
            from ml.models.movement_anomaly.train import main; main()
        elif model == "distress" or model == "audio":
            from ml.models.distress_audio.train import main; main()
        else:
            train_all()
    else:
        train_all()
