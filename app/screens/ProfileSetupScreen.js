import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  ScrollView, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C } from '../utils/constants';

const ProfileSetupScreen = ({ onComplete }) => {
  const [form, setForm] = useState({
    name: '',
    age: '',
    phone: '',
    occupation: '',
    govId: '',
    contacts: [{ name: '', phone: '' }, { name: '', phone: '' }],
    locations: [{ name: '', address: '' }]
  });

  const addLocation = () => {
    setForm({ ...form, locations: [...form.locations, { name: '', address: '' }] });
  };

  const handleSubmit = () => {
    if (!form.name || !form.phone || !form.age) {
      Alert.alert("Missing Information", "Please fill in the required identity fields.");
      return;
    }
    if (!form.contacts[0].name || !form.contacts[1].name) {
      Alert.alert("Contacts Required", "Please provide exactly 2 emergency contacts.");
      return;
    }
    onComplete(form);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.headerTitle}>Complete Profile</Text>
          <Text style={styles.headerSub}>Help us protect you better by providing these details.</Text>

          {/* Section: Identity */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>IDENTITY</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Full Name" 
              placeholderTextColor={C.text2}
              value={form.name}
              onChangeText={(t) => setForm({...form, name: t})}
            />
            <View style={styles.row}>
              <TextInput 
                style={[styles.input, { flex: 0.4, marginRight: 12 }]} 
                placeholder="Age" 
                keyboardType="numeric"
                placeholderTextColor={C.text2}
                value={form.age}
                onChangeText={(t) => setForm({...form, age: t})}
              />
              <TextInput 
                style={[styles.input, { flex: 1 }]} 
                placeholder="Phone Number" 
                keyboardType="phone-pad"
                placeholderTextColor={C.text2}
                value={form.phone}
                onChangeText={(t) => setForm({...form, phone: t})}
              />
            </View>
            <TextInput 
              style={styles.input} 
              placeholder="Occupation / Work" 
              placeholderTextColor={C.text2}
              value={form.occupation}
              onChangeText={(t) => setForm({...form, occupation: t})}
            />
            <TextInput 
              style={styles.input} 
              placeholder="Government ID (Number or Serial)" 
              placeholderTextColor={C.text2}
              value={form.govId}
              onChangeText={(t) => setForm({...form, govId: t})}
            />
          </View>

          {/* Section: Emergency Contacts */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>EMERGENCY CONTACTS (2 REQUIRED)</Text>
            {form.contacts.map((c, i) => (
              <View key={i} style={styles.itemBox}>
                <TextInput 
                  style={styles.inputSmall} 
                  placeholder={`Contact ${i+1} Name`} 
                  placeholderTextColor={C.text2}
                  value={c.name}
                  onChangeText={(t) => {
                    let nc = [...form.contacts];
                    nc[i].name = t;
                    setForm({...form, contacts: nc});
                  }}
                />
                <TextInput 
                  style={styles.inputSmall} 
                  placeholder="Phone Number" 
                  keyboardType="phone-pad"
                  placeholderTextColor={C.text2}
                  value={c.phone}
                  onChangeText={(t) => {
                    let nc = [...form.contacts];
                    nc[i].phone = t;
                    setForm({...form, contacts: nc});
                  }}
                />
              </View>
            ))}
          </View>

          {/* Section: Trusted Locations */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>TRUSTED LOCATIONS</Text>
              <TouchableOpacity onPress={addLocation}>
                <Text style={styles.addText}>+ Add</Text>
              </TouchableOpacity>
            </View>
            {form.locations.map((l, i) => (
              <View key={i} style={styles.itemBox}>
                <TextInput 
                  style={styles.inputSmall} 
                  placeholder="Location Name (e.g. Home, Office)" 
                  placeholderTextColor={C.text2}
                  value={l.name}
                  onChangeText={(t) => {
                    let nl = [...form.locations];
                    nl[i].name = t;
                    setForm({...form, locations: nl});
                  }}
                />
                <TextInput 
                  style={styles.inputSmall} 
                  placeholder="Full Address" 
                  placeholderTextColor={C.text2}
                  value={l.address}
                  onChangeText={(t) => {
                    let nl = [...form.locations];
                    nl[i].address = t;
                    setForm({...form, locations: nl});
                  }}
                />
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Finish Setup</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 60,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: C.text0,
    marginBottom: 8,
  },
  headerSub: {
    fontSize: 14,
    color: C.text2,
    marginBottom: 32,
    lineHeight: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 11,
    color: C.accent,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  addText: {
    fontSize: 12,
    color: C.blue,
    fontWeight: '600',
  },
  input: {
    backgroundColor: C.bg2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    color: C.text0,
    fontSize: 15,
    marginBottom: 12,
  },
  inputSmall: {
    backgroundColor: C.bg3,
    borderRadius: 10,
    padding: 12,
    color: C.text0,
    fontSize: 14,
    marginBottom: 8,
  },
  itemBox: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  row: {
    flexDirection: 'row',
  },
  submitButton: {
    backgroundColor: C.accent,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    shadowColor: C.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});

export default ProfileSetupScreen;
