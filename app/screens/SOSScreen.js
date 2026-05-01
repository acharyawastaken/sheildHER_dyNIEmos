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
import { CameraView, useCameraPermissions } from 'expo-camera';
import { WebView } from 'react-native-webview';
import { StreamingService } from "../services/streamingService";
import FakeCallScreen from "./FakeCallScreen";

const { width, height } = Dimensions.get('window');

const SOSScreen = ({ userProfile }) => {
  const [triggered, setTriggered] = useState(false);
  const [fakeCallActive, setFakeCallActive] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [streamUrl, setStreamUrl] = useState("");
  const [permission, requestPermission] = useCameraPermissions();
  const countdownRef = useRef(null);

  const handleTriggered = async () => {
    setTriggered(true);
    
    // Request camera permission for streaming
    if (!permission || !permission.granted) {
      await requestPermission();
    }

    // Start Agora Stream
    const roomId = StreamingService.generateRoomId();
    const url = await StreamingService.startStream(roomId);
    setStreamUrl(url);

    // Fetch real location for logging
    const location = await getCurrentLocation();
    const timestamp = new Date().toLocaleString();

    // Log to CLI (Terminal)
    console.log("-----------------------------------------");
    console.log("🚨 SOS ACTIVATED 🚨");
    console.log(`TIME:      ${timestamp}`);
    console.log(`LOCATION:  ${location.area}, ${location.city}`);
    console.log(`STREAM:    ${url}`);
    console.log("-----------------------------------------");

    let c = 5;
    countdownRef.current = setInterval(() => {
      c--;
      if (c >= 0) setCountdown(c);
      if (c <= 0) clearInterval(countdownRef.current);
    }, 1000);
  };

  const cancel = async () => {
    setTriggered(false);
    setCountdown(5);
    clearInterval(countdownRef.current);
    await StreamingService.stopStream();
  };

  if (fakeCallActive) return <FakeCallScreen onEnd={() => setFakeCallActive(false)} />;

  if (triggered) return (
    <View style={styles.triggeredContainer}>
      {/* Background Dim */}
      <View style={styles.overlayBg} />

      {/* Safety Dispatch Window (Popup) */}
      <View style={styles.dispatchWindow}>
        <View style={styles.dispatchHeader}>
          <View style={styles.liveIndicator}>
            <View style={styles.redDot} />
            <Text style={styles.liveLabel}>ENCRYPTED LIVE FEED</Text>
          </View>
          <Text style={styles.dispatchTitle}>SAFETY DISPATCH</Text>
        </View>

        <View style={styles.cameraFrame}>
          <CameraView style={styles.camera} facing="back" />
          <View style={styles.viewersCount}>
            <Text style={styles.viewersText}>BROADCASTING</Text>
          </View>
        </View>

        {/* Live Monitor (The "Other Side") */}
        <View style={styles.monitorFrame}>
          <Text style={styles.monitorTitle}>CONTACT VIEW (LIVE MONITOR)</Text>
          {streamUrl ? (
            <WebView 
              source={{ uri: streamUrl }} 
              style={styles.webview}
              allowsInlineMediaPlayback={true}
              mediaPlaybackRequiresUserAction={false}
            />
          ) : (
            <View style={styles.monitorLoading}>
              <ActivityIndicator color={C.accent} />
            </View>
          )}
        </View>

        <View style={styles.dispatchInfo}>
          <Text style={styles.alertMain}>SOS ACTIVATED</Text>
          <Text style={styles.alertSub}>Signals sent to Emergency Contacts</Text>
          
          <View style={styles.statusList}>
            <View style={styles.statusItem}>
              <View style={[styles.statusDot, { backgroundColor: C.safe }]} />
              <Text style={styles.statusText}>GPS Location Sharing: Active</Text>
            </View>
            <View style={styles.statusItem}>
              <View style={[styles.statusDot, { backgroundColor: C.safe }]} />
              <Text style={styles.statusText}>Evidence Recording: Started</Text>
            </View>
          </View>
        </View>

        <View style={styles.contactsGrid}>
          {userProfile?.contacts.map((c, i) => (
            <View key={i} style={styles.miniContactCard}>
              <View style={styles.avatarMini}>
                <Text style={styles.avatarTextMini}>{c.name[0]}</Text>
              </View>
              <View>
                <Text style={styles.miniName}>{c.name}</Text>
                <Text style={styles.miniStatus}>NOTIFIED</Text>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity onPress={cancel} style={styles.deactivateButton}>
          <Text style={styles.deactivateText}>I AM SAFE (CANCEL SOS)</Text>
        </TouchableOpacity>
      </View>
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
          { icon: "📞", label: "Fake call", sub: "Simulate incoming", action: () => setFakeCallActive(true) },
          { icon: "🔇", label: "Silent alert", sub: "Notify only" },
          { icon: "📍", label: "Share location", sub: "To all contacts" },
          { icon: "🎙", label: "Record audio", sub: "Capture sound" },
        ].map(({ icon, label, sub, action }, i) => (
          <TouchableOpacity key={i} style={styles.actionItem} onPress={action}>
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
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  dispatchWindow: {
    width: width * 0.9,
    backgroundColor: C.bg2,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
    paddingBottom: 24,
  },
  dispatchHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: C.bg3,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(232,53,74,0.1)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  redDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.accent,
    marginRight: 6,
  },
  liveLabel: {
    color: C.accent,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  dispatchTitle: {
    color: C.text2,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  cameraFrame: {
    width: '100%',
    height: 180,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  viewersCount: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(232,53,74,0.8)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  viewersText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  monitorFrame: {
    width: '100%',
    height: 120,
    backgroundColor: C.bg1,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  monitorTitle: {
    fontSize: 8,
    color: C.text2,
    fontWeight: '800',
    padding: 8,
    letterSpacing: 1,
    backgroundColor: C.bg3,
  },
  webview: {
    flex: 1,
    backgroundColor: '#000',
    opacity: 0.7,
  },
  monitorLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dispatchInfo: {
    padding: 20,
  },
  alertMain: {
    color: C.accent,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 1,
  },
  alertSub: {
    color: C.text1,
    fontSize: 12,
    marginTop: 4,
    marginBottom: 16,
  },
  statusList: {
    gap: 8,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 10,
  },
  statusText: {
    color: C.text2,
    fontSize: 12,
  },
  contactsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  miniContactCard: {
    flex: 1,
    backgroundColor: C.bg3,
    borderRadius: 12,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: C.border,
  },
  avatarMini: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: C.bg4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTextMini: {
    color: C.text0,
    fontSize: 12,
    fontWeight: '700',
  },
  miniName: {
    color: C.text0,
    fontSize: 11,
    fontWeight: '600',
  },
  miniStatus: {
    color: C.safe,
    fontSize: 9,
    fontWeight: '700',
  },
  deactivateButton: {
    marginHorizontal: 20,
    height: 50,
    borderRadius: 12,
    backgroundColor: C.bg4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: C.border,
  },
  deactivateText: {
    color: C.text0,
    fontSize: 13,
    fontWeight: '700',
  },
});

export default SOSScreen;
