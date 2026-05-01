"""
Feature Engineering — Location Features
Extracts safety-relevant features from geographic coordinates.
"""

import math
from typing import Optional


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance between two lat/lng points in kilometers."""
    R = 6371  # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dlon / 2) ** 2
    )
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def get_nearby_places_features(
    lat: float, lng: float, gmaps_client=None
) -> dict:
    """
    Get safety-relevant features from Google Places API.
    
    Returns:
        Dict with police_distance_km, hospital_distance_km, etc.
    """
    if gmaps_client is None:
        # Return defaults when API is not available
        return {
            "police_distance_km": 2.0,
            "hospital_distance_km": 3.0,
            "bus_stop_distance_km": 0.5,
            "nearby_police_count": 1,
            "nearby_hospital_count": 1,
        }

    try:
        features = {}

        # Find nearest police station
        police = gmaps_client.places_nearby(
            location=(lat, lng),
            radius=5000,
            type="police",
        )
        if police.get("results"):
            nearest = police["results"][0]
            ploc = nearest["geometry"]["location"]
            features["police_distance_km"] = round(
                haversine_distance(lat, lng, ploc["lat"], ploc["lng"]), 2
            )
            features["nearby_police_count"] = len(police["results"])
        else:
            features["police_distance_km"] = 5.0
            features["nearby_police_count"] = 0

        # Find nearest hospital
        hospital = gmaps_client.places_nearby(
            location=(lat, lng),
            radius=5000,
            type="hospital",
        )
        if hospital.get("results"):
            nearest = hospital["results"][0]
            hloc = nearest["geometry"]["location"]
            features["hospital_distance_km"] = round(
                haversine_distance(lat, lng, hloc["lat"], hloc["lng"]), 2
            )
            features["nearby_hospital_count"] = len(hospital["results"])
        else:
            features["hospital_distance_km"] = 5.0
            features["nearby_hospital_count"] = 0

        # Find nearest bus stop / transit
        transit = gmaps_client.places_nearby(
            location=(lat, lng),
            radius=2000,
            type="transit_station",
        )
        if transit.get("results"):
            nearest = transit["results"][0]
            tloc = nearest["geometry"]["location"]
            features["bus_stop_distance_km"] = round(
                haversine_distance(lat, lng, tloc["lat"], tloc["lng"]), 2
            )
        else:
            features["bus_stop_distance_km"] = 2.0

        return features

    except Exception as e:
        print(f"[LocationFeatures] Google Places error: {e}")
        return {
            "police_distance_km": 2.0,
            "hospital_distance_km": 3.0,
            "bus_stop_distance_km": 0.5,
            "nearby_police_count": 1,
            "nearby_hospital_count": 1,
        }


def get_road_type_name(road_type_code: int) -> str:
    """Convert road type code to human-readable name."""
    names = {
        0: "Alley/Lane",
        1: "Residential",
        2: "Collector Road",
        3: "Arterial Road",
        4: "Highway",
    }
    return names.get(road_type_code, "Unknown")


def compute_isolation_score(
    crowd_density: float, cctv_count: int, police_distance: float
) -> float:
    """
    Compute how isolated a location is.
    Higher score = more isolated = higher risk.
    
    Returns: 0-100 isolation score
    """
    crowd_factor = max(0, 1 - crowd_density / 50) * 40  # 0-40
    cctv_factor = max(0, 1 - cctv_count / 10) * 30  # 0-30
    police_factor = min(30, police_distance * 6)  # 0-30

    return round(crowd_factor + cctv_factor + police_factor, 1)
