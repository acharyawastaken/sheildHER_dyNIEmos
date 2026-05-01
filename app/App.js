import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Screens
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import MapScreen from './screens/MapScreen';
import SOSScreen from './screens/SOSScreen';
import ContactsScreen from './screens/ContactsScreen';
import SettingsScreen from './screens/SettingsScreen';

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

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => {
    // Simulated Google Login success
    setIsAuthenticated(true);
  };

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        {!isAuthenticated ? (
          <LoginScreen onLogin={handleLogin} />
        ) : (
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
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Map" component={MapScreen} />
            <Tab.Screen name="SOS" component={SOSScreen} />
            <Tab.Screen name="Contacts" component={ContactsScreen} />
            <Tab.Screen name="Settings" component={SettingsScreen} />
          </Tab.Navigator>
        )}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
