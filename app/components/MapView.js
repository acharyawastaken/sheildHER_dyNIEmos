import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Line, G, Path, Circle, Text as SvgText } from 'react-native-svg';
import { C, FONT } from "../utils/constants";

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

/**
 * MapView — Stylized map visualization using SVG for React Native.
 */
const MapView = ({ activeRoute = "safe" }) => {
  const gridLines = Array.from({ length: 15 });

  return (
    <View style={styles.container}>
      {/* Grid background */}
      <View style={styles.gridContainer}>
        <Svg width="100%" height="100%">
          {gridLines.map((_, i) => (
            <G key={`h-${i}`}>
              <Line x1="0" y1={i * 40} x2="100%" y2={i * 40} stroke={C.blue} strokeWidth="0.5" opacity="0.1" />
            </G>
          ))}
          {gridLines.map((_, i) => (
            <G key={`v-${i}`}>
              <Line x1={i * 40} y1="0" x2={i * 40} y2="100%" stroke={C.blue} strokeWidth="0.5" opacity="0.1" />
            </G>
          ))}
        </Svg>
      </View>

      {/* Scan line effect would need Animated, omitting for simplicity in static conversion */}

      {/* Route SVG */}
      <Svg width="100%" height="100%" style={styles.svgOverlay}>
        {/* Unsafe route */}
        <Path 
          d="M 70 420 Q 100 380 130 340 Q 160 280 200 240 Q 230 200 260 170" 
          fill="none" 
          stroke={C.accent} 
          strokeWidth={activeRoute === "unsafe" ? 3 : 1.5} 
          strokeDasharray="6 4" 
          opacity={activeRoute === "unsafe" ? 0.8 : 0.3} 
          strokeLinecap="round" 
        />
        {/* Safe route */}
        <Path 
          d="M 70 420 Q 120 400 160 360 Q 200 320 240 290 Q 270 260 280 220 Q 285 200 270 170" 
          fill="none" 
          stroke={C.safe} 
          strokeWidth={activeRoute === "safe" ? 3 : 1.5}
          opacity={activeRoute === "safe" ? 0.9 : 0.3} 
          strokeLinecap="round" 
        />

        {/* User position */}
        <Circle cx="70" cy="420" r="18" fill={C.blue} opacity="0.15" />
        <Circle cx="70" cy="420" r="8" fill={C.blue} opacity="0.9" />
        <Circle cx="70" cy="420" r="4" fill="#fff" />

        {/* Destination */}
        <Circle cx="270" cy="170" r="14" fill={C.safe} opacity="0.2" />
        <Circle cx="270" cy="170" r="6" fill={C.safe} />

        {/* Warning zone */}
        <Circle cx="180" cy="310" r="30" fill={C.accent} opacity="0.08" stroke={C.accent} strokeWidth="1" strokeDasharray="4 3" />
        <SvgText x="176" y="314" fill={C.accent} fontSize="20" fontWeight="bold" opacity="0.8">!</SvgText>
      </Svg>

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>AREA RISK</Text>
        {[{ c: C.safe, l: "Low" }, { c: C.warn, l: "Moderate" }, { c: C.accent, l: "High" }].map(({ c, l }) => (
          <View key={l} style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: c }]} />
            <Text style={styles.legendText}>{l}</Text>
          </View>
        ))}
      </View>

      {/* Location chip */}
      <View style={styles.locationChip}>
        <View style={styles.blueDot} />
        <Text style={styles.locationText}>Indiranagar → MG Road</Text>
        <Text style={styles.distanceText}>1.2 km</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e15',
    overflow: 'hidden',
  },
  gridContainer: {
    position: 'absolute',
    inset: 0,
  },
  svgOverlay: {
    position: 'absolute',
    inset: 0,
  },
  legend: {
    position: 'absolute',
    top: 50,
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
  locationChip: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(14,18,24,0.95)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  blueDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.blue,
    marginRight: 8,
    shadowColor: C.blue,
    shadowRadius: 4,
    shadowOpacity: 0.8,
  },
  locationText: {
    fontSize: 12,
    color: C.text0,
    marginRight: 8,
  },
  distanceText: {
    fontSize: 11,
    color: C.safe,
    fontWeight: '700',
  },
});

export default MapView;
