import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { C, FONT } from "../utils/constants";
import { getRiskColor, getRiskLabel } from "../utils/helpers";

/**
 * RiskIndicator — Arc gauge showing the current risk score for React Native.
 */
const RiskIndicator = ({ score }) => {
  const r = 72, cx = 90, cy = 90;
  const circ = 2 * Math.PI * r;
  const arc = circ * 0.75;
  const filled = arc * (score / 100);
  const color = getRiskColor(score);
  const label = getRiskLabel(score);

  return (
    <View style={styles.container}>
      <Svg width="180" height="180" viewBox="0 0 180 180">
        {/* Background arc */}
        <Circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={C.bg3}
          strokeWidth="8"
          strokeDasharray={`${arc} ${circ}`}
          strokeDashoffset={-circ * 0.125}
          strokeLinecap="round"
          transform="rotate(0, 90, 90)"
        />
        {/* Filled arc */}
        <Circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={`${filled} ${circ}`}
          strokeDashoffset={-circ * 0.125}
          strokeLinecap="round"
          // In React Native SVG, filters like drop-shadow are not as direct as CSS.
          // We'll skip the drop-shadow for now or use a shadow on the parent View.
        />
      </Svg>
      <View style={styles.textContainer}>
        <Text style={[styles.scoreText, { color }]}>{score}</Text>
        <Text style={[styles.labelArea, { color }]}>{label}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 180,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 12,
  },
  scoreText: {
    fontSize: 40,
    fontWeight: '700', // Approximation of DM Serif Display if not loaded
    lineHeight: 48,
  },
  labelArea: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.5,
    marginTop: 4,
  }
});

export default RiskIndicator;
