import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import MapView, { Marker, Circle, Polyline, Heatmap } from 'react-native-maps';
import * as Location from 'expo-location';
import { C } from "../utils/constants";
import { RouteService } from "../services/routeService";

const { width, height } = Dimensions.get('window');

/**
 * RealMapView — Interactive Maps integration.
 */
const RealMapView = ({ activeRouteId = "safe", routes = [] }) => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLoading(false);
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator color={C.accent} size="large" />
      </View>
    );
  }

  const initialRegion = location ? {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  } : {
    latitude: 12.9716,
    longitude: 77.5946,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        customMapStyle={darkMapStyle}
        initialRegion={initialRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {/* Risk Heatmap (Weather Radar Style) */}
        <Heatmap
          points={RouteService.DANGER_ZONES.map(z => ({
            latitude: z.lat,
            longitude: z.lng,
            weight: z.risk === 'High' ? 10 : 5
          }))}
          radius={50}
          opacity={0.7}
          gradient={{
            colors: ['#19C97D', '#F5A623', '#E8354A'],
            startPoints: [0.2, 0.5, 0.8],
            colorMapSize: 256,
          }}
        />

        {/* Render Route Paths */}
        {routes.map(r => (
          <Polyline
            key={r.id}
            coordinates={r.polyline}
            strokeColor={r.id === activeRouteId ? r.color : 'rgba(142,142,147,0.3)'}
            strokeWidth={r.id === activeRouteId ? 6 : 3}
            zIndex={r.id === activeRouteId ? 10 : 1}
            lineDashPattern={r.style === 'dashed' ? [10, 5] : null}
          />
        ))}

        {/* Destination Markers with Time Labels */}
        {routes.map(r => (
          <Marker
            key={`marker-${r.id}`}
            coordinate={r.polyline[r.polyline.length - 1]}
            opacity={r.id === activeRouteId ? 1 : 0.5}
          >
            <View style={[styles.markerLabel, { backgroundColor: r.color }]}>
              <Text style={styles.markerText}>{r.est}</Text>
            </View>
          </Marker>
        ))}

        {location && (
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="Your Location"
            pinColor={C.blue}
          />
        )}
      </MapView>

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>LIVE RISK FEED</Text>
        {[{ c: C.safe, l: "Low Risk" }, { c: C.warn, l: "Moderate" }, { c: C.accent, l: "High Alert" }].map(({ c, l }) => (
          <View key={l} style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: c }]} />
            <Text style={styles.legendText}>{l}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const darkMapStyle = [
  { "elementType": "geometry", "stylers": [{ "color": "#080B10" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#746855" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#242f3e" }] },
  { "featureType": "administrative.locality", "elementType": "labels.text.fill", "stylers": [{ "color": "#d59563" }] },
  { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#d59563" }] },
  { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#263c3f" }] },
  { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#1C2230" }] },
  { "featureType": "road", "elementType": "geometry.stroke", "stylers": [{ "color": "#212a37" }] },
  { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#9ca5b3" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#17263c" }] }
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080B10',
  },
  map: {
    width: width,
    height: height,
  },
  markerLabel: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  markerText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  legend: {
    position: 'absolute',
    top: 60,
    left: 20,
    backgroundColor: 'rgba(14,18,24,0.9)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    padding: 12,
  },
  legendTitle: {
    fontSize: 10,
    color: C.text2,
    letterSpacing: 1,
    marginBottom: 8,
    fontWeight: '600',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  legendColor: {
    width: 8,
    height: 8,
    borderRadius: 2,
    marginRight: 8,
    opacity: 0.8,
  },
  legendText: {
    fontSize: 11,
    color: C.text1,
  },
});

export default RealMapView;
