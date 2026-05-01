import * as Location from 'expo-location';

const MOCK_LOCATION = {
  latitude: 12.9784,
  longitude: 77.6408,
  area: "Indiranagar",
  city: "Bengaluru",
  areaSafetyScore: 7.2,
};

const MOCK_DESTINATION = {
  latitude: 12.9757,
  longitude: 77.6063,
  area: "MG Road",
  city: "Bengaluru",
  distance: "1.2 km",
};

/**
 * Get the current user location (Real GPS).
 */
export async function getCurrentLocation() {
  try {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.warn('Permission to access location was denied');
      return { ...MOCK_LOCATION }; // Fallback
    }

    let location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    // Reverse geocode to get area name
    let reverseGeocode = await Location.reverseGeocodeAsync({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });

    const area = reverseGeocode[0]?.district || reverseGeocode[0]?.name || "Unknown Area";
    const city = reverseGeocode[0]?.city || "Bengaluru";

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      area: area,
      city: city,
      areaSafetyScore: 7.2, // Still mock for now until backend integrated
    };
  } catch (error) {
    console.error('Error fetching real location:', error);
    return { ...MOCK_LOCATION };
  }
}

/**
 * Get the destination info (simulated for MVP).
 * @returns {Promise<Object>} Destination object
 */
export async function getDestination() {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ ...MOCK_DESTINATION }), 100);
  });
}

/**
 * Get the area safety score for a given location.
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<number>} Safety score (0-10)
 */
export async function getAreaSafetyScore(lat, lng) {
  // TODO: Replace with real API call to risk engine
  return new Promise((resolve) => {
    setTimeout(() => resolve(MOCK_LOCATION.areaSafetyScore), 150);
  });
}

/**
 * Detect the movement state of the user.
 * @returns {Promise<Object>} Movement state { type, pace }
 */
export async function getMovementState() {
  // TODO: Replace with accelerometer / pedometer data
  return new Promise((resolve) => {
    setTimeout(() => resolve({ type: "Walking", pace: "normal pace" }), 100);
  });
}

/**
 * Get live signals for the dashboard.
 * Aggregates location, time, movement, and area safety data.
 * @returns {Promise<Array>} Array of signal objects
 */
export async function getLiveSignals() {
  const location = await getCurrentLocation();
  const movement = await getMovementState();
  const hour = new Date().getHours();
  const isNight = hour >= 20 || hour < 6;

  return [
    { label: "Location", value: `${location.area}, ${location.city}`, color: "#19C97D", dot: true },
    { label: "Time risk", value: `${new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false })} — Night factor ×${isNight ? "1.4" : "1.0"}`, color: isNight ? "#F5A623" : "#19C97D", dot: true },
    { label: "Movement", value: `${movement.type} — ${movement.pace}`, color: "#19C97D", dot: true },
    { label: "Area safety", value: `Score ${location.areaSafetyScore} / 10`, color: location.areaSafetyScore >= 6 ? "#19C97D" : "#F5A623", dot: true },
  ];
}
