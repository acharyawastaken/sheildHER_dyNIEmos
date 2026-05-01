"""
API Clients — Wrappers for external APIs used by Epoch.

Supported APIs:
- Google Maps (Places, Directions, Geocoding)
- OpenWeather (visibility, conditions)

All clients gracefully degrade to defaults when API keys are missing.
"""
import os
from typing import Optional


class GoogleMapsClient:
    """Wrapper for Google Maps Platform APIs."""

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("GOOGLE_MAPS_API_KEY")
        self.client = None
        if self.api_key and self.api_key != "YOUR_GOOGLE_MAPS_API_KEY":
            try:
                import googlemaps
                self.client = googlemaps.Client(key=self.api_key)
                print("[GoogleMaps] Client initialized")
            except ImportError:
                print("[GoogleMaps] googlemaps package not installed. pip install googlemaps")
            except Exception as e:
                print(f"[GoogleMaps] Init error: {e}")
        else:
            print("[GoogleMaps] No API key — using offline defaults")

    @property
    def is_available(self) -> bool:
        return self.client is not None

    def nearby_police_stations(self, lat: float, lng: float, radius: int = 5000) -> list:
        """Find nearby police stations."""
        if not self.is_available:
            return [{"name": "Local Police Station", "distance_km": 2.0}]
        try:
            result = self.client.places_nearby(
                location=(lat, lng), radius=radius, type="police"
            )
            stations = []
            for place in result.get("results", [])[:5]:
                ploc = place["geometry"]["location"]
                from ml.features.location_features import haversine_distance
                dist = haversine_distance(lat, lng, ploc["lat"], ploc["lng"])
                stations.append({"name": place["name"], "distance_km": round(dist, 2)})
            return stations or [{"name": "Unknown", "distance_km": 5.0}]
        except Exception as e:
            print(f"[GoogleMaps] Places error: {e}")
            return [{"name": "Fallback", "distance_km": 2.0}]

    def nearby_hospitals(self, lat: float, lng: float, radius: int = 5000) -> list:
        """Find nearby hospitals."""
        if not self.is_available:
            return [{"name": "Local Hospital", "distance_km": 3.0}]
        try:
            result = self.client.places_nearby(
                location=(lat, lng), radius=radius, type="hospital"
            )
            hospitals = []
            for place in result.get("results", [])[:5]:
                hloc = place["geometry"]["location"]
                from ml.features.location_features import haversine_distance
                dist = haversine_distance(lat, lng, hloc["lat"], hloc["lng"])
                hospitals.append({"name": place["name"], "distance_km": round(dist, 2)})
            return hospitals or [{"name": "Unknown", "distance_km": 5.0}]
        except Exception as e:
            print(f"[GoogleMaps] Places error: {e}")
            return [{"name": "Fallback", "distance_km": 3.0}]

    def get_directions(self, origin: tuple, destination: tuple, alternatives: bool = True) -> list:
        """
        Get route directions with alternatives.
        Returns list of routes with waypoints for safety scoring.
        """
        if not self.is_available:
            return [{"summary": "Default Route", "duration": "12 min", "distance": "1.2 km", "waypoints": []}]
        try:
            result = self.client.directions(
                origin=f"{origin[0]},{origin[1]}",
                destination=f"{destination[0]},{destination[1]}",
                mode="walking",
                alternatives=alternatives,
            )
            routes = []
            for route in result:
                leg = route["legs"][0]
                waypoints = []
                for step in leg["steps"]:
                    loc = step["end_location"]
                    waypoints.append((loc["lat"], loc["lng"]))
                routes.append({
                    "summary": route.get("summary", "Route"),
                    "duration": leg["duration"]["text"],
                    "distance": leg["distance"]["text"],
                    "waypoints": waypoints,
                })
            return routes
        except Exception as e:
            print(f"[GoogleMaps] Directions error: {e}")
            return [{"summary": "Fallback", "duration": "N/A", "distance": "N/A", "waypoints": []}]

    def reverse_geocode(self, lat: float, lng: float) -> dict:
        """Convert lat/lng to area name."""
        if not self.is_available:
            return {"area": "Unknown", "city": "Unknown", "state": "Unknown"}
        try:
            results = self.client.reverse_geocode((lat, lng))
            if results:
                components = results[0].get("address_components", [])
                area = city = state = "Unknown"
                for comp in components:
                    types = comp.get("types", [])
                    if "sublocality_level_1" in types:
                        area = comp["long_name"]
                    elif "locality" in types:
                        city = comp["long_name"]
                    elif "administrative_area_level_1" in types:
                        state = comp["long_name"]
                return {"area": area, "city": city, "state": state}
            return {"area": "Unknown", "city": "Unknown", "state": "Unknown"}
        except Exception as e:
            print(f"[GoogleMaps] Geocode error: {e}")
            return {"area": "Unknown", "city": "Unknown", "state": "Unknown"}


class OpenWeatherClient:
    """Wrapper for OpenWeather API — visibility and conditions."""

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("OPENWEATHER_API_KEY")
        self.available = bool(self.api_key and self.api_key != "YOUR_OPENWEATHER_API_KEY")
        if not self.available:
            print("[OpenWeather] No API key — using defaults")

    def get_conditions(self, lat: float, lng: float) -> dict:
        """Get weather conditions affecting safety."""
        if not self.available:
            return {"visibility_km": 10.0, "condition": "clear", "risk_modifier": 0}
        try:
            import requests
            url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lng}&appid={self.api_key}&units=metric"
            resp = requests.get(url, timeout=5)
            data = resp.json()
            visibility = data.get("visibility", 10000) / 1000  # to km
            weather = data.get("weather", [{}])[0].get("main", "Clear")
            risk_mod = 0
            if visibility < 1:
                risk_mod = 15
            elif visibility < 3:
                risk_mod = 8
            if weather in ("Rain", "Thunderstorm"):
                risk_mod += 5
            return {"visibility_km": visibility, "condition": weather.lower(), "risk_modifier": risk_mod}
        except Exception as e:
            print(f"[OpenWeather] Error: {e}")
            return {"visibility_km": 10.0, "condition": "unknown", "risk_modifier": 0}
