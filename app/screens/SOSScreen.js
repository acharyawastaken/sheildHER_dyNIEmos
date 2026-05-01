import React, { useState, useRef } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getCurrentLocation } from "../services/locationService";
import { C, FONT } from "../utils/constants";
import SOSButton from "../components/SOSButton";

const { width } = Dimensions.get('window');

const SOSScreen = () => {
  const [triggered, setTriggered] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const countdownRef = useRef(null);

  const handleTriggered = async () => {
    setTriggered(true);
    
    // Fetch real location for logging
    const location = await getCurrentLocation();
    const timestamp = new Date().toLocaleString();
    const riskScore = 28; // This would come from state or service

    // Log to CLI (Terminal)
    console.log("-----------------------------------------");
    console.log("🚨 SOS ACTIVATED 🚨");
    console.log(`TIME:      ${timestamp}`);
    console.log(`LOCATION:  ${location.area}, ${location.city} (${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)})`);
    console.log(`RISK SCORE: ${riskScore}/100`);
    console.log("STATUS:    Emergency contacts notified.");
    console.log("-----------------------------------------");

    let c = 5;
    countdownRef.current = setInterval(() => {
      c--;
      if (c >= 0) setCountdown(c);
      if (c <= 0) clearInterval(countdownRef.current);
    }, 1000);
  };

  const cancel = () => {
    setTriggered(false);
    setCountdown(5);
    clearInterval(countdownRef.current);
  };

  if (triggered) return (
    <View style={styles.triggeredContainer}>
      <View style={styles.sosAlertCircle}>
        <Text style={styles.sosAlertText}>SOS</Text>
      </View>
      <Text style={styles.statusTitle}>Alert Sent</Text>
      <Text style={styles.statusSub}>Notifying emergency contacts…</Text>
      <Text style={styles.statusDetail}>Live location sharing active</Text>

      <View style={styles.contactsCard}>
        {["Meera (Mom)", "Rohan (Brother)", "Ankita (Friend)"].map((c, i) => (
          <View key={i} style={[styles.contactRow, i < 2 && styles.borderBottom]}>
            <View style={styles.contactInfo}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{c[0]}</Text>
              </View>
              <Text style={styles.contactName}>{c}</Text>
            </View>
            <View style={styles.notifiedBadge}>
              <View style={styles.greenDot} />
              <Text style={styles.notifiedText}>Notified</Text>
            </View>
          </View>
        ))}
      </View>

      <TouchableOpacity onPress={cancel} style={styles.cancelButton}>
        <Text style={styles.cancelButtonText}>Cancel SOS</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.category}>EMERGENCY</Text>
        <Text style={styles.title}>Hold to activate</Text>
        <Text style={styles.subtitle}>Hold for 2 seconds to send SOS</Text>
      </View>

      <View style={styles.buttonContainer}>
        <SOSButton onTriggered={handleTriggered} />
      </View>

      <View style={styles.actionsGrid}>
        {[
          { icon: "📞", label: "Fake call", sub: "Simulate incoming" },
          { icon: "🔇", label: "Silent alert", sub: "Notify only" },
          { icon: "📍", label: "Share location", sub: "To all contacts" },
          { icon: "🎙", label: "Record audio", sub: "Capture sound" },
        ].map(({ icon, label, sub }, i) => (
          <TouchableOpacity key={i} style={styles.actionItem}>
            <Text style={styles.actionIcon}>{icon}</Text>
            <Text style={styles.actionLabel}>{label}</Text>
            <Text style={styles.actionSub}>{sub}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg1,
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  category: {
    fontSize: 11,
    color: C.text2,
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    color: C.text0,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: C.text2,
  },
  buttonContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  actionItem: {
    width: (width - 64) / 2,
    backgroundColor: C.bg2,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 12,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: C.text0,
  },
  actionSub: {
    fontSize: 11,
    color: C.text2,
    marginTop: 2,
  },
  triggeredContainer: {
    flex: 1,
    backgroundColor: C.bg1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  sosAlertCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: C.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: C.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
  sosAlertText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 2,
  },
  statusTitle: {
    fontSize: 32,
    color: C.accent,
    fontWeight: '700',
    marginBottom: 8,
  },
  statusSub: {
    fontSize: 14,
    color: C.text1,
    marginBottom: 6,
  },
  statusDetail: {
    fontSize: 13,
    color: C.text2,
    marginBottom: 32,
  },
  contactsCard: {
    width: '100%',
    backgroundColor: C.bg2,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: C.bg4,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 12,
    color: C.text1,
  },
  contactName: {
    fontSize: 14,
    color: C.text0,
  },
  notifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.safe,
    marginRight: 6,
  },
  notifiedText: {
    fontSize: 11,
    color: C.safe,
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 16,
    backgroundColor: C.bg3,
    borderWidth: 1,
    borderColor: C.border,
  },
  cancelButtonText: {
    fontSize: 14,
    color: C.text1,
    fontWeight: '600',
  },
});

export default SOSScreen;
