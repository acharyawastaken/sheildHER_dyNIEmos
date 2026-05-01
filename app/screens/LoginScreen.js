import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions, 
  ImageBackground,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { C } from '../utils/constants';

const { width } = Dimensions.get('window');

const LoginScreen = ({ onLogin }) => {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {/* Background Decor */}
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logoIcon}>
              <Text style={styles.logoText}>Σ</Text>
            </View>
          </View>
          <Text style={styles.title}>EPOCH</Text>
          <Text style={styles.subtitle}>Privacy-first safety assistant.</Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.legal}>
            By continuing, you agree to Epoch's Terms of Service and Privacy Policy.
          </Text>
          
          <TouchableOpacity 
            style={styles.googleButton} 
            onPress={onLogin}
            activeOpacity={0.8}
          >
            <View style={styles.googleIconContainer}>
              <Svg width="20" height="20" viewBox="0 0 24 24">
                <Path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <Path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <Path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <Path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </Svg>
            </View>
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.altButton}>
            <Text style={styles.altButtonText}>Use phone number instead</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg0,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'space-between',
    paddingBottom: 40,
  },
  glowTop: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: C.accent,
    opacity: 0.1,
  },
  glowBottom: {
    position: 'absolute',
    bottom: -150,
    left: -150,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: C.blue,
    opacity: 0.05,
  },
  header: {
    marginTop: 100,
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: C.bg2,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  logoText: {
    fontSize: 40,
    color: C.accent,
    fontWeight: '700',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: C.text0,
    letterSpacing: 4,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: C.text2,
    letterSpacing: 0.5,
  },
  footer: {
    width: '100%',
  },
  legal: {
    fontSize: 12,
    color: C.text2,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    height: 56,
    borderRadius: 16,
    paddingHorizontal: 8,
  },
  googleIconContainer: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleButtonText: {
    flex: 1,
    textAlign: 'center',
    marginRight: 40,
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  altButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  altButtonText: {
    fontSize: 14,
    color: C.text1,
    fontWeight: '500',
  },
});

export default LoginScreen;
