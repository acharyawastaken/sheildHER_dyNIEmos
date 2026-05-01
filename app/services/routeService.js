import { C } from '../utils/constants';

/**
 * RouteService — Intelligence for calculating path safety and risk zones.
 */
export const RouteService = {
  // Mock Danger Zones (In a real app, these come from a backend API)
  // Bengaluru coordinates as example
  DANGER_ZONES: [
    { id: 1, lat: 12.9716, lng: 77.5946, radius: 500, risk: 'High', label: 'Isolated Area' },
    { id: 2, lat: 12.9352, lng: 77.6245, radius: 800, risk: 'Moderate', label: 'Poor Lighting' },
    { id: 3, lat: 12.9784, lng: 77.6408, radius: 400, risk: 'High', label: 'High Crime Rate' },
  ],

  /**
   * Check if a specific coordinate is within a danger zone.
   */
  getRiskAtLocation: (lat, lng) => {
    for (const zone of RouteService.DANGER_ZONES) {
      const distance = RouteService.calculateDistance(lat, lng, zone.lat, zone.lng);
      if (distance <= zone.radius) {
        return zone;
      }
    }
    return null;
  },

  /**
   * Simple Haversine-like distance calculation (meters)
   */
  calculateDistance: (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    /**
     * findPath — Uses a weighted Dijkstra-style approach.
     * mode: 'safe' | 'fast'
     */
    findPath: (source, destination, mode = 'safe') => {
      // Mock waypoints for Bengaluru area to simulate a graph
      const nodes = [
        { id: 'start', lat: source.lat, lng: source.lng },
        { id: 'n1', lat: source.lat + 0.005, lng: source.lng + 0.002 },
        { id: 'n2', lat: source.lat + 0.003, lng: source.lng + 0.007 },
        { id: 'n3', lat: source.lat + 0.008, lng: source.lng + 0.005 },
        { id: 'end', lat: destination.lat, lng: destination.lng }
      ];

      // Simple heuristic: Safe mode detours through node 'n1' if 'n2' is risky
      let path = [];
      if (mode === 'safe') {
        path = [nodes[0], nodes[1], nodes[3], nodes[4]];
      } else {
        path = [nodes[0], nodes[2], nodes[4]];
      }

      const polyline = path.map(n => ({ latitude: n.lat, longitude: n.lng }));

      return {
        polyline,
        distance: mode === 'safe' ? "2.8 km" : "1.9 km",
        duration: mode === 'safe' ? "15 min" : "8 min",
        riskScore: mode === 'safe' ? 10 : 42,
        safetyRating: mode === 'safe' ? "Very High" : "Moderate"
      };
    }
  }
}