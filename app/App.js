import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, ActivityIndicator } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Screens
import LoginScreen from './screens/LoginScreen';
import ProfileSetupScreen from './screens/ProfileSetupScreen';
import HomeScreen from './screens/HomeScreen';
import MapScreen from './screens/MapScreen';
import SOSScreen from './screens/SOSScreen';
import ContactsScreen from './screens/ContactsScreen';
import SettingsScreen from './screens/SettingsScreen';
import { GuardianService } from './services/guardianService';
import { Alert } from 'react-native';

// Constants
import { C } from './utils/constants';

const Tab = createBottomTabNavigator();

const TabIcon = ({ name, color, size }) => {
  // Simple icon mapping using SVG
  let path = "";
  if (name === "Home") path = "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z";
  else if (name === "Map") path = "M1 6v14l7-4 8 4 7-4V2l-7 4-8-4-7 4z";
  else if (name === "SOS") path = "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z";
  else if (name === "Contacts") path = "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2";
  else if (name === "Settings") path = "M12 15a3 3 0 100-6 3 3 0 000 6z";

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d={path} />
      {name === "Settings" && <Path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />}
    </Svg>
  );
};

import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [authState, setAuthState] = useState('loading'); // loading, login, setup, main
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    checkProfile();
  }, []);

  useEffect(() => {
    if (authState === 'main') {
      GuardianService.startMonitoring((force) => {
        Alert.alert(
          "🚨 Guardian AI: Anomaly Detected",
          "We detected a high-impact event (sudden jerk or fall). Would you like to trigger an SOS?",
          [
            { text: "I'm Safe", style: "cancel" },
            { text: "TRIGGER SOS", onPress: () => console.log("SOS TRIGGERED BY AI") }
          ]
        );
      });
    } else {
      GuardianService.stopMonitoring();
    }
    return () => GuardianService.stopMonitoring();
  }, [authState]);

  const checkProfile = async () => {
    try {
      const savedProfile = await AsyncStorage.getItem('userProfile');
      if (savedProfile) {
        setUserProfile(JSON.parse(savedProfile));
        setAuthState('main');
      } else {
        setAuthState('login');
      }
    } catch (e) {
      setAuthState('login');
    }
  };

  const handleLogin = () => {
    setAuthState('setup');
  };

  const handleEditProfile = () => {
    setAuthState('setup');
  };

  const handleSetupComplete = async (profile) => {
    try {
      await AsyncStorage.setItem('userProfile', JSON.stringify(profile));
      setUserProfile(profile);
      setAuthState('main');
    } catch (e) {
      console.error("Error saving profile", e);
    }
  };

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        {authState === 'loading' && (
          <View style={{ flex: 1, backgroundColor: C.bg0, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator color={C.accent} size="large" />
          </View>
        )}
        {authState === 'login' && <LoginScreen onLogin={handleLogin} />}
        {authState === 'setup' && <ProfileSetupScreen onComplete={handleSetupComplete} />}
        {authState === 'main' && (
          <Tab.Navigator
            screenOptions={({ route }) => ({
              headerShown: false,
              tabBarStyle: {
                backgroundColor: C.bg1,
                borderTopColor: C.border,
                height: 90,
                paddingBottom: 30,
                paddingTop: 10,
              },
              tabBarActiveTintColor: C.accent,
              tabBarInactiveTintColor: C.text2,
              tabBarIcon: ({ color, size }) => (
                <TabIcon name={route.name} color={color} size={size} />
              ),
            })}
          >
            <Tab.Screen name="Home">
              {props => <HomeScreen {...props} userProfile={userProfile} />}
            </Tab.Screen>
            <Tab.Screen name="Map">
              {props => <MapScreen {...props} userProfile={userProfile} />}
            </Tab.Screen>
            <Tab.Screen name="SOS">
              {props => <SOSScreen {...props} userProfile={userProfile} />}
            </Tab.Screen>
            <Tab.Screen name="Contacts">
              {props => <ContactsScreen {...props} userProfile={userProfile} />}
            </Tab.Screen>
            <Tab.Screen name="Settings">
              {props => <SettingsScreen {...props} userProfile={userProfile} onEditProfile={handleEditProfile} />}
            </Tab.Screen>
          </Tab.Navigator>
        )}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
