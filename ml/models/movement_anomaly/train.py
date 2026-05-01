"""
Movement Anomaly Detector — Training Script
Model: Isolation Forest | Input: Speed, acceleration, heading | Output: Anomaly score (0-100)
Usage: python -m ml.models.movement_anomaly.train
"""
import sys, json
from pathlib import Path
from datetime import datetime
import numpy as np, pandas as pd, joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, precision_score, recall_score, f1_score

sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent))
from ml.config import MOVEMENT_ANOMALY_PARAMS, PROCESSED_DIR, MODELS_DIR

MODEL_DIR = MODELS_DIR / "movement_anomaly"
MODEL_DIR.mkdir(parents=True, exist_ok=True)

FEATURE_COLS = ["speed_ms","acceleration_ms2","heading_change_deg_s","route_deviation_m","stop_duration_s","jerk_ms3"]

def main():
    print("\n" + "="*60 + "\n  🚶 EPOCH — Movement Anomaly Detector Training\n" + "="*60)
    data_path = PROCESSED_DIR / "movement_data.csv"
    if not data_path.exists():
        from ml.data.download_datasets import save_datasets; save_datasets()
    df = pd.read_csv(data_path)
    print(f"[Data] {len(df)} samples, anomaly rate: {df['is_anomaly'].mean():.2%}")

    X, y = df[FEATURE_COLS], df["is_anomaly"]
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    scaler = StandardScaler()
    X_tr = scaler.fit_transform(X_train); X_te = scaler.transform(X_test)

    model = IsolationForest(**MOVEMENT_ANOMALY_PARAMS, n_jobs=-1)
    model.fit(X_tr)

    y_pred = (model.predict(X_te) == -1).astype(int)
    p, r, f = precision_score(y_test,y_pred,zero_division=0), recall_score(y_test,y_pred,zero_division=0), f1_score(y_test,y_pred,zero_division=0)
    print(f"\n  Precision: {p:.4f}  Recall: {r:.4f}  F1: {f:.4f}\n")
    print(classification_report(y_test, y_pred, target_names=["Normal","Anomaly"]))

    joblib.dump(model, MODEL_DIR/"model.pkl"); joblib.dump(scaler, MODEL_DIR/"scaler.pkl")
    json.dump({"model":"IsolationForest","trained_at":datetime.utcnow().isoformat(),"features":FEATURE_COLS,
               "metrics":{"precision":p,"recall":r,"f1":f}}, open(MODEL_DIR/"metadata.json","w"), indent=2, default=str)
    print("[✓] Movement Anomaly Detector training complete!")

if __name__ == "__main__": main()
