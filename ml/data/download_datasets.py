"""
Dataset Downloader — Fetch all required datasets for Epoch model training.

Datasets:
1. NCRB Crime Against Women (data.gov.in) — Area safety scoring
2. India District Boundaries (DataMeet) — Spatial crime mapping
3. India PIN code lat/lng — Location enrichment
4. ESC-50 Environmental Sound — Distress audio (Phase 2)
5. Synthetic crime data for MVP — Generated locally for immediate training

Usage:
    python download_datasets.py          # Download all available datasets
    python download_datasets.py --mvp    # Generate synthetic data only (no internet required)
"""

import os
import sys
import json
import csv
import random
import math
from pathlib import Path
from datetime import datetime

# Add parent to path for config
sys.path.insert(0, str(Path(__file__).parent.parent))
from config import RAW_DIR, PROCESSED_DIR, TRAINING_CITIES

import numpy as np
import pandas as pd


def generate_synthetic_crime_data(n_samples: int = 50000) -> pd.DataFrame:
    """
    Generate synthetic crime-rate data for Indian cities.

    This creates realistic-looking training data for the Area Safety model.
    Each sample represents a location with safety-relevant features.

    In production, this should be replaced with real NCRB data.
    """
    print(f"[Dataset] Generating {n_samples} synthetic crime samples...")

    np.random.seed(42)
    records = []

    for i in range(n_samples):
        # Pick a random city as the base
        city = random.choice(TRAINING_CITIES)
        base_lat = city["lat"]
        base_lng = city["lng"]

        # Add random offset (within ~5km radius)
        lat = base_lat + np.random.normal(0, 0.02)
        lng = base_lng + np.random.normal(0, 0.02)

        # Generate correlated features
        # Urban density (0-1): higher in city center
        dist_from_center = math.sqrt((lat - base_lat)**2 + (lng - base_lng)**2)
        urban_density = max(0, min(1, 1 - dist_from_center * 20 + np.random.normal(0, 0.15)))

        # Crime rate per 100K (realistic range: 5-200)
        # Higher in dense areas but also in isolated areas (U-shaped)
        base_crime = 30 + abs(urban_density - 0.5) * 200
        crime_rate = max(5, base_crime + np.random.normal(0, 25))

        # Street lighting score (0-10)
        lighting = min(10, max(0, urban_density * 8 + np.random.normal(1, 1.5)))

        # Distance to nearest police station (km)
        police_dist = max(0.1, (1 - urban_density) * 5 + np.random.exponential(0.8))

        # Distance to nearest hospital (km)
        hospital_dist = max(0.2, (1 - urban_density) * 8 + np.random.exponential(1.2))

        # Road type (0=alley, 1=residential, 2=collector, 3=arterial, 4=highway)
        road_probs = [0.1, 0.3, 0.25, 0.25, 0.1]
        road_type = np.random.choice(5, p=road_probs)

        # Average crowd density (people per 100m²)
        crowd_density = max(0, urban_density * 50 + np.random.normal(0, 10))

        # Nearby CCTV cameras count
        cctv_count = max(0, int(urban_density * 10 + np.random.normal(0, 2)))

        # Public transport accessibility (0-10)
        transport_access = min(10, max(0, urban_density * 9 + np.random.normal(0, 1.5)))

        # ─── Compute safety score (ground truth label) ───
        # Weighted combination of features → inverted to safety
        risk_raw = (
            crime_rate * 0.30
            + (10 - lighting) * 8 * 0.20
            + police_dist * 10 * 0.15
            + hospital_dist * 5 * 0.10
            + (4 - road_type) * 10 * 0.10
            + max(0, 20 - crowd_density) * 0.10
            + (10 - cctv_count) * 3 * 0.05
        )
        # Normalize to 0-10 safety score (inverse of risk)
        safety_score = max(0, min(10, 10 - (risk_raw / 15) + np.random.normal(0, 0.5)))
        safety_score = round(safety_score, 1)

        records.append({
            "latitude": round(lat, 6),
            "longitude": round(lng, 6),
            "city": city["name"],
            "crime_rate": round(crime_rate, 1),
            "lighting_score": round(lighting, 1),
            "police_distance_km": round(police_dist, 2),
            "hospital_distance_km": round(hospital_dist, 2),
            "road_type": int(road_type),
            "crowd_density": round(crowd_density, 1),
            "cctv_count": int(cctv_count),
            "transport_access": round(transport_access, 1),
            "urban_density": round(urban_density, 3),
            "safety_score": safety_score,
        })

    df = pd.DataFrame(records)
    return df


def generate_synthetic_route_data(n_samples: int = 10000) -> pd.DataFrame:
    """
    Generate synthetic route data for the Route Risk Scorer.
    Each sample represents a route with aggregated safety metrics.
    """
    print(f"[Dataset] Generating {n_samples} synthetic route samples...")

    np.random.seed(43)
    records = []

    for i in range(n_samples):
        city = random.choice(TRAINING_CITIES)

        # Route characteristics
        n_segments = random.randint(3, 15)
        route_length_km = round(random.uniform(0.5, 15.0), 1)

        # Aggregate safety along route
        avg_safety_score = round(random.uniform(2, 9), 1)
        min_safety_score = round(max(0, avg_safety_score - random.uniform(1, 4)), 1)
        dark_segments = random.randint(0, max(1, n_segments // 2))
        police_coverage = round(random.uniform(0, 1), 2)  # fraction of route near police
        arterial_fraction = round(random.uniform(0, 1), 2)  # fraction on main roads
        cctv_coverage = round(random.uniform(0, 1), 2)

        # Time features
        hour = random.randint(0, 23)
        is_night = 1 if (hour >= 20 or hour < 6) else 0
        is_weekend = random.choice([0, 1])

        # Compute route risk (0-100)
        risk = (
            (10 - avg_safety_score) * 6
            + dark_segments * 3
            + (1 - police_coverage) * 15
            + (1 - arterial_fraction) * 10
            + is_night * 15
            + (1 - cctv_coverage) * 8
            + np.random.normal(0, 5)
        )
        route_risk = int(max(0, min(100, risk)))

        records.append({
            "city": city["name"],
            "route_length_km": route_length_km,
            "n_segments": n_segments,
            "avg_safety_score": avg_safety_score,
            "min_safety_score": min_safety_score,
            "dark_segments": dark_segments,
            "police_coverage": police_coverage,
            "arterial_fraction": arterial_fraction,
            "cctv_coverage": cctv_coverage,
            "hour": hour,
            "is_night": is_night,
            "is_weekend": is_weekend,
            "route_risk": route_risk,
        })

    return pd.DataFrame(records)


def generate_synthetic_movement_data(n_samples: int = 100000) -> pd.DataFrame:
    """
    Generate synthetic accelerometer / GPS movement data.
    Used to train the Movement Anomaly Detector.
    """
    print(f"[Dataset] Generating {n_samples} synthetic movement samples...")

    np.random.seed(44)
    records = []

    for i in range(n_samples):
        # Determine movement type
        movement_type = np.random.choice(
            ["walking_normal", "walking_fast", "running", "stationary", "vehicle", "erratic"],
            p=[0.35, 0.15, 0.05, 0.20, 0.15, 0.10],
        )

        if movement_type == "walking_normal":
            speed = abs(np.random.normal(1.2, 0.3))  # m/s
            acceleration = abs(np.random.normal(0.5, 0.2))
            heading_change = abs(np.random.normal(5, 3))  # degrees/s
            is_anomaly = 0
        elif movement_type == "walking_fast":
            speed = abs(np.random.normal(1.8, 0.3))
            acceleration = abs(np.random.normal(0.8, 0.3))
            heading_change = abs(np.random.normal(8, 4))
            is_anomaly = 0
        elif movement_type == "running":
            speed = abs(np.random.normal(3.5, 0.8))
            acceleration = abs(np.random.normal(2.0, 0.5))
            heading_change = abs(np.random.normal(10, 5))
            is_anomaly = int(np.random.random() < 0.6)  # 60% anomalous
        elif movement_type == "stationary":
            speed = abs(np.random.normal(0.05, 0.02))
            acceleration = abs(np.random.normal(0.1, 0.05))
            heading_change = abs(np.random.normal(1, 1))
            is_anomaly = 0
        elif movement_type == "vehicle":
            speed = abs(np.random.normal(8, 3))
            acceleration = abs(np.random.normal(1.5, 0.5))
            heading_change = abs(np.random.normal(3, 2))
            is_anomaly = 0
        else:  # erratic
            speed = abs(np.random.normal(2.0, 1.5))
            acceleration = abs(np.random.normal(3.0, 1.0))
            heading_change = abs(np.random.normal(30, 15))
            is_anomaly = 1

        # Additional features
        route_deviation = max(0, np.random.exponential(5 if is_anomaly else 0.5))  # meters
        stop_duration = max(0, np.random.exponential(30 if movement_type == "stationary" else 2))  # seconds
        jerk = abs(np.random.normal(1.5 if is_anomaly else 0.3, 0.3))  # m/s³

        records.append({
            "speed_ms": round(speed, 3),
            "acceleration_ms2": round(acceleration, 3),
            "heading_change_deg_s": round(heading_change, 1),
            "route_deviation_m": round(route_deviation, 1),
            "stop_duration_s": round(stop_duration, 1),
            "jerk_ms3": round(jerk, 3),
            "movement_type": movement_type,
            "is_anomaly": is_anomaly,
        })

    return pd.DataFrame(records)


def download_ncrb_data():
    """
    Download NCRB crime data from data.gov.in
    Falls back to synthetic data if download fails.
    """
    print("[Dataset] Attempting to download NCRB crime data...")
    try:
        import requests
        # data.gov.in open API for crime against women
        url = "https://data.gov.in/resource/stateut-wise-incidence-and-rate-crime-against-women-during-2001-2012"
        print(f"[Dataset] ⚠️  NCRB data requires manual download from: https://data.gov.in/catalog/crime-against-women")
        print(f"[Dataset]    Place downloaded CSV in: {RAW_DIR / 'ncrb_crime.csv'}")
        print(f"[Dataset]    Using synthetic data for now.")
        return None
    except Exception as e:
        print(f"[Dataset] Download failed: {e}. Using synthetic data.")
        return None


def save_datasets():
    """Generate and save all datasets."""
    print("=" * 60)
    print("  EPOCH — Dataset Generation")
    print("=" * 60)

    # 1. Crime / Area Safety data
    crime_df = generate_synthetic_crime_data(50000)
    crime_path = PROCESSED_DIR / "area_safety_data.csv"
    crime_df.to_csv(crime_path, index=False)
    print(f"[✓] Area safety data saved: {crime_path} ({len(crime_df)} samples)")

    # 2. Route Risk data
    route_df = generate_synthetic_route_data(10000)
    route_path = PROCESSED_DIR / "route_risk_data.csv"
    route_df.to_csv(route_path, index=False)
    print(f"[✓] Route risk data saved: {route_path} ({len(route_df)} samples)")

    # 3. Movement data
    movement_df = generate_synthetic_movement_data(100000)
    movement_path = PROCESSED_DIR / "movement_data.csv"
    movement_df.to_csv(movement_path, index=False)
    print(f"[✓] Movement data saved: {movement_path} ({len(movement_df)} samples)")

    # 4. Try downloading real NCRB data
    download_ncrb_data()

    print("\n" + "=" * 60)
    print(f"  All datasets saved to: {PROCESSED_DIR}")
    print("=" * 60)

    return {
        "area_safety": crime_path,
        "route_risk": route_path,
        "movement": movement_path,
    }


if __name__ == "__main__":
    use_mvp = "--mvp" in sys.argv
    save_datasets()
