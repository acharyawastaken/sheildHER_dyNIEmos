import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { C } from "../utils/constants";
import MapView from "../components/MapView";

const MapScreen = () => {
  const [route, setRoute] = useState("safe");

  return (
    <View style={styles.container}>
      {/* Map visual */}
      <MapView activeRoute={route} />

      {/* Route chooser */}
      <View style={styles.controls}>
        <Text style={styles.label}>CHOOSE ROUTE</Text>
        <View style={styles.row}>
          {[
            { id: "safe", label: "Safe route", sub: "12 min · well-lit", color: C.safe, icon: "🛡" },
            { id: "unsafe", label: "Fast route", sub: "8 min · risk zone", color: C.accent, icon: "⚡" },
          ].map(({ id, label, sub, color, icon }) => (
            <TouchableOpacity 
              key={id} 
              onPress={() => setRoute(id)} 
              style={[
                styles.button,
                route === id ? { borderColor: color, backgroundColor: id === "safe" ? C.safeDim : C.accentDim } : styles.buttonInactive
              ]}
            >
              <Text style={styles.icon}>{icon}</Text>
              <Text style={styles.buttonLabel}>{label}</Text>
              <Text style={[styles.buttonSub, route === id && { color: color }]}>{sub}</Text>
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
  controls: {
    padding: 20,
    backgroundColor: C.bg1,
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingBottom: 40,
  },
  label: {
    fontSize: 11,
    color: C.text2,
    letterSpacing: 1.2,
    marginBottom: 12,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  buttonInactive: {
    backgroundColor: C.bg2,
    borderColor: C.border,
  },
  icon: {
    fontSize: 18,
    marginBottom: 8,
  },
  buttonLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: C.text0,
  },
  buttonSub: {
    fontSize: 11,
    color: C.text2,
    marginTop: 2,
  }
});

export default MapScreen;
