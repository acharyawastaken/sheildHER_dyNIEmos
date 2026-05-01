"""
Feature Engineering — Time Features
Extracts risk-relevant features from time of day, day of week, etc.
"""

from datetime import datetime


# Night factor multipliers (matching AI_RULES: explainable, threshold-based)
NIGHT_FACTORS = {
    "late_night": {"start": 23, "end": 5, "factor": 1.6},
    "evening": {"start": 20, "end": 23, "factor": 1.4},
    "early_morning": {"start": 5, "end": 7, "factor": 1.2},
    "day": {"start": 7, "end": 20, "factor": 1.0},
}


def get_night_factor(hour: int) -> float:
    """Get the night factor multiplier for a given hour (0-23)."""
    if hour >= 23 or hour < 5:
        return 1.6
    if hour >= 20:
        return 1.4
    if hour < 7:
        return 1.2
    return 1.0


def get_time_period(hour: int) -> str:
    """Get human-readable time period name."""
    if hour >= 23 or hour < 5:
        return "Late Night"
    if hour >= 20:
        return "Evening"
    if hour < 7:
        return "Early Morning"
    if hour < 12:
        return "Morning"
    if hour < 17:
        return "Afternoon"
    return "Evening"


def calculate_time_risk(hour: int) -> float:
    """
    Calculate time-based risk component (0-100).
    Directly derived from night factor — fully explainable.
    """
    factor = get_night_factor(hour)
    return round((factor - 1) * 100)


def get_time_features(dt: datetime = None) -> dict:
    """
    Extract all time-based features from a datetime.

    Returns:
        Dict with hour, night_factor, time_risk, is_night, day_of_week, is_weekend
    """
    if dt is None:
        dt = datetime.now()

    hour = dt.hour
    dow = dt.weekday()  # 0=Monday, 6=Sunday

    return {
        "hour": hour,
        "night_factor": get_night_factor(hour),
        "time_risk": calculate_time_risk(hour),
        "time_period": get_time_period(hour),
        "is_night": int(hour >= 20 or hour < 6),
        "is_late_night": int(hour >= 23 or hour < 5),
        "day_of_week": dow,
        "is_weekend": int(dow >= 5),
    }
