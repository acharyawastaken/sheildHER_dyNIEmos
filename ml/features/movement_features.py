"""
Feature Engineering — Movement Features
Extracts anomaly-relevant features from accelerometer/GPS data.
"""

import math
from typing import List, Optional


def compute_speed(distance_m: float, time_s: float) -> float:
    """Compute speed in m/s."""
    if time_s <= 0:
        return 0.0
    return distance_m / time_s


def compute_acceleration(speed_current: float, speed_prev: float, time_s: float) -> float:
    """Compute acceleration in m/s²."""
    if time_s <= 0:
        return 0.0
    return abs(speed_current - speed_prev) / time_s


def compute_jerk(accel_current: float, accel_prev: float, time_s: float) -> float:
    """Compute jerk (rate of change of acceleration) in m/s³."""
    if time_s <= 0:
        return 0.0
    return abs(accel_current - accel_prev) / time_s


def compute_heading_change_rate(
    heading_current: float, heading_prev: float, time_s: float
) -> float:
    """
    Compute heading change rate in degrees/second.
    Handles wrap-around at 360°.
    """
    if time_s <= 0:
        return 0.0
    diff = abs(heading_current - heading_prev)
    if diff > 180:
        diff = 360 - diff
    return diff / time_s


def classify_movement(speed_ms: float) -> str:
    """
    Classify movement type based on speed.
    Thresholds based on typical human locomotion research.
    """
    if speed_ms < 0.1:
        return "stationary"
    elif speed_ms < 0.8:
        return "walking_slow"
    elif speed_ms < 1.6:
        return "walking_normal"
    elif speed_ms < 2.5:
        return "walking_fast"
    elif speed_ms < 5.0:
        return "running"
    else:
        return "vehicle"


def compute_route_deviation(
    current_lat: float,
    current_lng: float,
    expected_lat: float,
    expected_lng: float,
) -> float:
    """
    Compute deviation from expected route in meters.
    Uses simplified haversine for short distances.
    """
    R = 6371000  # Earth radius in meters
    dlat = math.radians(expected_lat - current_lat)
    dlng = math.radians(expected_lng - current_lng)
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(current_lat))
        * math.cos(math.radians(expected_lat))
        * math.sin(dlng / 2) ** 2
    )
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def extract_movement_features(
    speed_ms: float,
    acceleration_ms2: float,
    heading_change_deg_s: float,
    route_deviation_m: float = 0.0,
    stop_duration_s: float = 0.0,
    jerk_ms3: float = 0.0,
) -> dict:
    """
    Extract all movement features for the anomaly detector.

    Returns:
        Dict with all movement features
    """
    movement_type = classify_movement(speed_ms)

    return {
        "speed_ms": round(speed_ms, 3),
        "acceleration_ms2": round(acceleration_ms2, 3),
        "heading_change_deg_s": round(heading_change_deg_s, 1),
        "route_deviation_m": round(route_deviation_m, 1),
        "stop_duration_s": round(stop_duration_s, 1),
        "jerk_ms3": round(jerk_ms3, 3),
        "movement_type": movement_type,
        "is_moving": int(speed_ms > 0.1),
        "is_fast": int(speed_ms > 2.5),
        "is_erratic": int(heading_change_deg_s > 20),
    }
