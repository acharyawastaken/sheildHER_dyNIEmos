"""
Risk Engine — Calculates risk score using explainable, threshold-based logic.
Per AI_RULES.md: No black-box models, explainable scoring, threshold-based.

Now powered by trained ML models (XGBoost for area safety, Ridge for routes).
Falls back to rule-based scoring when models are unavailable.
"""

import sys
from pathlib import Path
from datetime import datetime
from typing import Optional

# Add project root so ml module is importable
sys.path.insert(0, str(Path(__file__).parent.parent.parent))


# Risk factor weights
WEIGHTS = {
    "location": 0.4,
    "time": 0.3,
    "movement": 0.15,
    "crowding": 0.15,
}

# Risk thresholds
THRESHOLDS = {
    "low": 35,
    "moderate": 65,
}

# Night factor multipliers
NIGHT_FACTORS = {
    "late_night": {"hours": (23, 5), "factor": 1.6},
    "evening": {"hours": (20, 23), "factor": 1.4},
    "early_morning": {"hours": (5, 7), "factor": 1.2},
    "day": {"hours": (7, 20), "factor": 1.0},
}


def _get_night_factor(hour: int) -> float:
    """Get the night factor multiplier for a given hour."""
    if hour >= 23 or hour < 5:
        return 1.6
    if hour >= 20:
        return 1.4
    if hour < 7:
        return 1.2
    return 1.0


def _get_area_safety_score(latitude: float, longitude: float) -> float:
    """
    Get area safety score (0-10) for a given location.
    Uses the trained Area Safety ML model if available,
    otherwise falls back to rule-based defaults.
    """
    try:
        from ml.serving.predictor import get_predictor
        predictor = get_predictor()
        result = predictor.predict_area_safety(
            crime_rate=30.0,    # Default — will be replaced by Google Places lookup
            lighting_score=6.0,
            police_distance_km=2.0,
            hospital_distance_km=3.0,
            road_type=2,
            crowd_density=20.0,
            cctv_count=3,
            transport_access=5.0,
            urban_density=0.5,
        )
        return result["safety_score"]
    except Exception as e:
        print(f"[RiskEngine] ML model unavailable ({e}), using fallback")
        return 7.2


def _calculate_location_risk(area_safety_score: float) -> float:
    """Invert area safety (0-10) to location risk (0-100)."""
    return round((10 - area_safety_score) * 10)


def _calculate_time_risk(hour: int) -> float:
    """Calculate time-based risk component (0-100)."""
    factor = _get_night_factor(hour)
    return round((factor - 1) * 100)


async def calculate_risk_score(
    latitude: float,
    longitude: float,
    hour: Optional[int] = None,
    movement_risk: float = 0.0,
    crowding_risk: float = 0.0,
) -> dict:
    """
    Calculate overall risk score with explainable components.
    
    Formula: score = Σ(component_risk × weight)
    Clamped to 0-100.
    
    Args:
        latitude: User latitude
        longitude: User longitude
        hour: Hour of day (0-23), defaults to current
        movement_risk: Movement anomaly risk (0-100)
        crowding_risk: Crowd density risk (0-100)
    
    Returns:
        Dict with score, level, components, and explanation
    """
    if hour is None:
        hour = datetime.utcnow().hour
    
    area_safety = _get_area_safety_score(latitude, longitude)
    location_risk = _calculate_location_risk(area_safety)
    time_risk = _calculate_time_risk(hour)
    night_factor = _get_night_factor(hour)
    
    raw_score = (
        location_risk * WEIGHTS["location"]
        + time_risk * WEIGHTS["time"]
        + movement_risk * WEIGHTS["movement"]
        + crowding_risk * WEIGHTS["crowding"]
    )
    
    score = min(100, max(0, round(raw_score)))
    
    if score < THRESHOLDS["low"]:
        level = "low"
    elif score < THRESHOLDS["moderate"]:
        level = "moderate"
    else:
        level = "high"
    
    return {
        "score": score,
        "level": level,
        "components": {
            "location": location_risk,
            "time": time_risk,
            "movement": movement_risk,
            "crowding": crowding_risk,
        },
        "weights": WEIGHTS,
        "night_factor": night_factor,
        "area_safety_score": area_safety,
        "explanation": f"Risk {level} ({score}/100): Location risk {location_risk} (area safety {area_safety}/10), Time risk {time_risk} (night factor ×{night_factor})",
    }


async def get_area_safety(latitude: float, longitude: float) -> dict:
    """
    Get detailed area safety information.
    
    Args:
        latitude: Location latitude
        longitude: Location longitude
    
    Returns:
        Dict with safety score and context
    """
    score = _get_area_safety_score(latitude, longitude)
    
    return {
        "latitude": latitude,
        "longitude": longitude,
        "safety_score": score,
        "max_score": 10.0,
        "level": "safe" if score >= 7 else "moderate" if score >= 4 else "unsafe",
        "factors": [
            "Well-lit area",
            "Moderate foot traffic",
            "Near main road",
        ],
    }
