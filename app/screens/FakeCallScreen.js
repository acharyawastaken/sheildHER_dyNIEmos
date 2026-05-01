import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Audio } from 'expo-av';
import { C } from '../utils/constants';

const { width, height } = Dimensions.get('window');

const FakeCallScreen = ({ onEnd }) => {
  const [timer, setTimer] = useState(0);
  const soundRef = useRef(null);

  async function playSound() {
    try {
      console.log('🧠 [AUDIO] Initializing Fake Call Audio...');
      const { sound } = await Audio.Sound.createAsync(
         require('../assets/fake_call.mp3'),
         { shouldPlay: true, isLooping: true }
      );
      soundRef.current = sound;
      await sound.playAsync();
    } catch (error) {
      console.error("❌ [AUDIO] Failed to play sound:", error);
    }
  }

  useEffect(() => {
    playSound();
    const interval = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);
    
    return () => {
      clearInterval(interval);
      if (soundRef.current) {
        console.log('🧠 [AUDIO] Terminating playback...');
        soundRef.current.unloadAsync();
        soundRef.current = null;
      }
    };
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.incomingText}>Incoming call</Text>
        <Text style={styles.callerName}>Mom</Text>
        <Text style={styles.timer}>{formatTime(timer)}</Text>
      </View>

      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarInitial}>M</Text>
        </View>
      </View>

      <View style={styles.controlsGrid}>
        {[
          { icon: "🎙", label: "mute" },
          { icon: "⌨️", label: "keypad" },
          { icon: "🔊", label: "speaker" },
          { icon: "➕", label: "add call" },
          { icon: "📹", label: "FaceTime" },
          { icon: "👤", label: "contacts" },
        ].map((item, i) => (
          <View key={i} style={styles.controlItem}>
            <View style={styles.controlCircle}>
              <Text style={styles.controlIcon}>{item.icon}</Text>
            </View>
            <Text style={styles.controlLabel}>{item.label}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity onPress={onEnd} style={styles.endButton}>
        <Text style={styles.endIcon}>📞</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    paddingTop: 80,
  },
  header: {
    alignItems: 'center',
    marginBottom: 60,
  },
  incomingText: {
    color: '#999',
    fontSize: 14,
    marginBottom: 8,
  },
  callerName: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '400',
    marginBottom: 8,
  },
  timer: {
    color: '#fff',
    fontSize: 16,
  },
  avatarContainer: {
    marginBottom: 80,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: '#fff',
    fontSize: 40,
  },
  controlsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: width * 0.8,
    justifyContent: 'space-between',
    marginBottom: 60,
  },
  controlItem: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 30,
  },
  controlCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  controlIcon: {
    fontSize: 24,
  },
  controlLabel: {
    color: '#fff',
    fontSize: 12,
  },
  endButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#ff3b30',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '135deg' }],
  },
  endIcon: {
    fontSize: 30,
    color: '#fff',
  },
});

export default FakeCallScreen;
