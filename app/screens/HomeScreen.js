import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Switch, 
  Dimensions,
  Animated,
  ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from 'expo-status-bar';
import Svg, { Path, Circle } from 'react-native-svg';
import { C, FONT } from "../utils/constants";
import { getRiskDimColor } from "../utils/helpers";
import RiskIndicator from "../components/RiskIndicator";
import { getLiveSignals } from "../services/locationService";

const { width } = Dimensions.get('window');

const HomeScreen = () => {
  const [risk, setRisk] = useState(28);
  const [time, setTime] = useState(new Date());
  const [tracking, setTracking] = useState(true);
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    
    // Initial fetch
    fetchSignals();
    
    // Refresh signals every 30s
    const s = setInterval(fetchSignals, 30000);
    
    return () => {
      clearInterval(t);
      clearInterval(s);
    };
  }, []);

  const fetchSignals = async () => {
    const s = await getLiveSignals();
    setSignals(s);
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <StatusBar style="light" />
        
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>GOOD EVENING</Text>
            <Text style={styles.userName}>Priya</Text>
          </View>
          <TouchableOpacity style={styles.notifButton}>
            <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.text1} strokeWidth="1.7" strokeLinecap="round">
              <Path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <Path d="M13.73 21a2 2 0 01-3.46 0" />
            </Svg>
          </TouchableOpacity>
        </View>

        {/* Risk Orb */}
        <View style={styles.riskContainer}>
          <View style={[styles.glow, { backgroundColor: getRiskDimColor(risk) }]} />
          <RiskIndicator score={risk} />
        </View>

        {/* Signals Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>LIVE SIGNALS</Text>
          <View style={styles.signalsCard}>
            {loading ? (
              <View style={{ padding: 20 }}>
                <ActivityIndicator color={C.accent} />
              </View>
            ) : (
              signals.map((s, i) => (
                <View key={i} style={[styles.signalItem, i < signals.length - 1 && styles.borderBottom]}>
                  <View style={[styles.dot, { backgroundColor: s.color, shadowColor: s.color }]} />
                  <View style={styles.signalText}>
                    <Text style={styles.signalLabel}>{s.label}</Text>
                    <Text style={styles.signalValue}>{s.value}</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>

        {/* Tracking Toggle */}
        <View style={[styles.toggleCard, tracking && { backgroundColor: C.safeDim, borderColor: 'rgba(25,201,125,0.2)' }]}>
          <View>
            <Text style={styles.toggleTitle}>Guardian mode</Text>
            <Text style={styles.toggleSub}>{tracking ? "Active · monitoring you" : "Paused"}</Text>
          </View>
          <Switch 
            value={tracking} 
            onValueChange={setTracking}
            trackColor={{ false: C.bg4, true: C.safe }}
            thumbColor="#fff"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 28,
  },
  greeting: {
    fontSize: 13,
    color: C.text2,
    letterSpacing: 1.2,
    fontWeight: '500',
    marginBottom: 4,
  },
  userName: {
    fontSize: 26,
    color: C.text0,
    fontWeight: '700',
  },
  notifButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: C.bg3,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  riskContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    height: 200,
  },
  glow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    opacity: 0.3,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 11,
    color: C.text2,
    letterSpacing: 1.5,
    fontWeight: '600',
    marginBottom: 12,
  },
  signalsCard: {
    backgroundColor: C.bg2,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
  },
  signalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 16,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 2,
  },
  signalText: {
    flex: 1,
  },
  signalLabel: {
    fontSize: 11,
    color: C.text2,
    letterSpacing: 0.5,
  },
  signalValue: {
    fontSize: 13,
    color: C.text0,
    marginTop: 2,
  },
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: C.bg2,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  toggleTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: C.text0,
  },
  toggleSub: {
    fontSize: 12,
    color: C.text2,
    marginTop: 2,
  },
});

export default HomeScreen;
