import React, { useState, useRef, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from "react-native";
import Svg, { Circle } from 'react-native-svg';
import { C, FONT, SOS_CONFIG } from "../utils/constants";

/**
 * SOSButton — Hold-to-activate emergency button with progress ring for React Native.
 */
const SOSButton = ({ onTriggered }) => {
  const [held, setHeld] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const startHold = () => {
    setHeld(true);
    Animated.timing(scaleAnim, {
      toValue: 0.96,
      duration: 150,
      useNativeDriver: true,
      easing: Easing.out(Easing.quad),
    }).start();

    intervalRef.current = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(intervalRef.current);
          return 100;
        }
        return p + SOS_CONFIG.PROGRESS_STEP;
      });
    }, SOS_CONFIG.PROGRESS_INTERVAL_MS);
  };

  useEffect(() => {
    if (progress >= 100) {
      if (onTriggered) onTriggered();
    }
  }, [progress, onTriggered]);

  const endHold = () => {
    if (progress < 100) {
      setHeld(false);
      clearInterval(intervalRef.current);
      setProgress(0);
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 5,
      }).start();
    }
  };

  const r = 90;
  const circ = 2 * Math.PI * r;
  const strokeDashoffset = circ - (circ * progress) / 100;

  return (
    <View style={styles.container}>
      {/* Pulse rings when held - simplified for RN */}
      {held && (
        <View style={styles.pulseContainer}>
          <View style={styles.pulse} />
        </View>
      )}

      {/* Progress ring */}
      <Svg style={styles.progressRing} width="192" height="192" viewBox="0 0 192 192">
        <Circle
          cx="96"
          cy="96"
          r={r}
          fill="none"
          stroke={C.accent}
          strokeWidth="3"
          strokeDasharray={`${circ}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform="rotate(-90, 96, 96)"
        />
      </Svg>

      {/* Main button */}
      <Animated.View style={[styles.buttonWrapper, { transform: [{ scale: scaleAnim }] }]}>
        <TouchableOpacity
          activeOpacity={1}
          onPressIn={startHold}
          onPressOut={endHold}
          style={[
            styles.button,
            held ? styles.buttonHeld : styles.buttonNormal
          ]}
        >
          <Text style={[styles.sosText, { color: held ? "#fff" : C.accent }]}>SOS</Text>
          <Text style={[styles.subText, { color: held ? "rgba(255,255,255,0.7)" : C.text2 }]}>
            {held ? `${Math.round(progress)}%` : "HOLD"}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressRing: {
    position: 'absolute',
  },
  buttonWrapper: {
    width: 180,
    height: 180,
    borderRadius: 90,
    overflow: 'hidden',
  },
  button: {
    width: '100%',
    height: '100%',
    borderRadius: 90,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  buttonNormal: {
    backgroundColor: C.bg2,
    borderColor: C.border,
  },
  buttonHeld: {
    backgroundColor: C.accent,
    borderColor: C.accent,
  },
  sosText: {
    fontSize: 42,
    fontWeight: '700',
    letterSpacing: 4,
  },
  subText: {
    fontSize: 11,
    marginTop: 6,
    letterSpacing: 1.2,
    fontWeight: '600',
  },
  pulseContainer: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 1,
    borderColor: C.accent,
    opacity: 0.2,
  },
  pulse: {
    // simplified pulse
  }
});

export default SOSButton;
