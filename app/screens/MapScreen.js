import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from "react-native";
import { C } from "../utils/constants";
import MapView from "../components/MapView";
import { RouteService } from "../services/routeService";
import { getCurrentLocation } from "../services/locationService";

const MapScreen = () => {
  const [route, setRoute] = useState("safe");
  const [source, setSource] = useState("My Location");
  const [destination, setDestination] = useState("");
  const [routeData, setRouteData] = useState(null);

  const calculateRoute = async (mode) => {
    const loc = await getCurrentLocation();
    if (loc) {
      const start = { lat: loc.coords.latitude, lng: loc.coords.longitude };
      // Simulated destination coord based on search string or default
      const end = { lat: loc.coords.latitude + 0.012, lng: loc.coords.longitude + 0.008 };

      const path = RouteService.findPath(start, end, mode);
      setRouteData(path);
      setRoute(mode);
    }
  };

  useEffect(() => {
    calculateRoute('safe');
  }, []);

  return (
    <View style={styles.container}>
      {/* Search Dashboard */}
      <View style={styles.searchDashboard}>
        <View style={styles.inputCard}>
          <View style={styles.searchRow}>
            <View style={[styles.dot, { backgroundColor: C.blue }]} />
            <TextInput
              style={styles.input}
              placeholder="Source"
              value={source}
              onChangeText={setSource}
              placeholderTextColor={C.text2}
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.searchRow}>
            <View style={[styles.dot, { backgroundColor: C.accent }]} />
            <TextInput
              style={styles.input}
              placeholder="Where to?"
              value={destination}
              onChangeText={setDestination}
              placeholderTextColor={C.text2}
              autoFocus
            />
          </View>
        </View>
      </View>

      {/* Map visual */}
      <MapView activeRoute={route} routePoints={routeData?.polyline} />

      {/* Route Info Popup */}
      <View style={styles.routePopup}>
        <View style={styles.popupHeader}>
          <Text style={styles.popupTitle}>SELECT ROUTE</Text>
          <View style={styles.safetyTag}>
            <Text style={styles.safetyText}>AI Verified</Text>
          </View>
        </View>

        <View style={styles.routeOptions}>
          {[
            { id: "safe", label: "Safer", sub: routeData?.duration || "14 min", color: C.safe, icon: "🛡" },
            { id: "fast", label: "Fastest", sub: routeData?.duration || "8 min", color: C.accent, icon: "⚡" },
          ].map(({ id, label, sub, color, icon }) => (
            <TouchableOpacity
              key={id}
              onPress={() => calculateRoute(id)}
              style={[
                styles.routeBtn,
                route === id ? { borderColor: color, backgroundColor: id === "safe" ? C.safeDim : C.accentDim } : styles.btnInactive
              ]}
            >
              <Text style={styles.btnIcon}>{icon}</Text>
              <View>
                <Text style={styles.btnLabel}>{label}</Text>
                <Text style={[styles.btnSub, route === id && { color: color }]}>{sub}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg1,
  },
  searchDashboard: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    zIndex: 10,
  },
  inputCard: {
    backgroundColor: C.bg2,
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    paddingHorizontal: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: C.text0,
    fontSize: 14,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: C.border,
    marginHorizontal: 10,
    marginVertical: 4,
  },
  routePopup: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: C.bg2,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  popupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  popupTitle: {
    fontSize: 11,
    color: C.text2,
    fontWeight: '800',
    letterSpacing: 1,
  },
  safetyTag: {
    backgroundColor: 'rgba(25,201,125,0.1)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  safetyText: {
    color: C.safe,
    fontSize: 9,
    fontWeight: '700',
  },
  routeOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  routeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 10,
  },
  btnInactive: {
    borderColor: C.border,
    backgroundColor: C.bg3,
  },
  btnIcon: {
    fontSize: 18,
  },
  btnLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: C.text0,
  },
  btnSub: {
    fontSize: 11,
    color: C.text2,
  },
});

export default MapScreen;
