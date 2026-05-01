"""
Epoch ML — Configuration
API keys, model hyperparameters, and dataset paths.

⚠️  IMPORTANT: Replace placeholder API keys with real ones before use.
    Never commit real API keys to version control.
    Use environment variables or a .env file in production.
"""

import os
from pathlib import Path

# ─── Paths ───
ML_DIR = Path(__file__).parent
DATA_DIR = ML_DIR / "data"
RAW_DIR = DATA_DIR / "raw"
PROCESSED_DIR = DATA_DIR / "processed"
MODELS_DIR = ML_DIR / "models"

# Create directories
for d in [RAW_DIR, PROCESSED_DIR, MODELS_DIR]:
    d.mkdir(parents=True, exist_ok=True)

# ─── API Keys (load from environment) ───
GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY", "YOUR_GOOGLE_MAPS_API_KEY")
OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY", "YOUR_OPENWEATHER_API_KEY")
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID", "YOUR_TWILIO_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN", "YOUR_TWILIO_TOKEN")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER", "+1234567890")

# ─── Model Hyperparameters ───
AREA_SAFETY_PARAMS = {
    "n_estimators": 200,
    "max_depth": 6,
    "learning_rate": 0.1,
    "min_child_weight": 3,
    "subsample": 0.8,
    "colsample_bytree": 0.8,
    "random_state": 42,
}

ROUTE_RISK_PARAMS = {
    "C": 1.0,
    "max_iter": 1000,
    "random_state": 42,
}

MOVEMENT_ANOMALY_PARAMS = {
    "n_estimators": 100,
    "contamination": 0.05,
    "random_state": 42,
}

DISTRESS_AUDIO_PARAMS = {
    "C": 10.0,
    "kernel": "rbf",
    "gamma": "scale",
    "random_state": 42,
}

# ─── Risk Engine Config ───
RISK_WEIGHTS = {
    "location": 0.40,
    "time": 0.30,
    "movement": 0.15,
    "crowding": 0.15,
}

RISK_THRESHOLDS = {
    "low": 35,
    "moderate": 65,
}

# ─── Indian Cities for Training Data ───
TRAINING_CITIES = [
    {"name": "Delhi", "lat": 28.6139, "lng": 77.2090},
    {"name": "Mumbai", "lat": 19.0760, "lng": 72.8777},
    {"name": "Bengaluru", "lat": 12.9716, "lng": 77.5946},
    {"name": "Chennai", "lat": 13.0827, "lng": 80.2707},
    {"name": "Hyderabad", "lat": 17.3850, "lng": 78.4867},
    {"name": "Kolkata", "lat": 22.5726, "lng": 88.3639},
    {"name": "Pune", "lat": 18.5204, "lng": 73.8567},
    {"name": "Jaipur", "lat": 26.9124, "lng": 75.7873},
    {"name": "Lucknow", "lat": 26.8467, "lng": 80.9462},
    {"name": "Ahmedabad", "lat": 23.0225, "lng": 72.5714},
]
