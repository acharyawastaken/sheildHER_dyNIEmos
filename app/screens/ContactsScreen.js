import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { C, FONT } from "../utils/constants";

const ContactsScreen = ({ userProfile }) => {
  const contacts = userProfile?.contacts || [
    { name: "Contact 1", phone: "Not Set", active: false, color: C.blue },
    { name: "Contact 2", phone: "Not Set", active: false, color: C.blue },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.category}>EMERGENCY</Text>
          <Text style={styles.title}>Contacts</Text>
        </View>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.contactsCard}>
        {contacts.map((c, i) => (
          <View key={i} style={[styles.contactRow, i < contacts.length - 1 && styles.borderBottom]}>
            <View style={[styles.avatar, { backgroundColor: `${C.blue}22`, borderColor: `${C.blue}44` }]}>
              <Text style={[styles.avatarText, { color: C.blue }]}>{c.name[0]}</Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.name}>{c.name}</Text>
              <Text style={styles.rel}>{c.phone}</Text>
            </View>
            <View style={styles.status}>
              <View style={[styles.dot, { backgroundColor: userProfile ? C.safe : C.text2 }]} />
              <Text style={[styles.statusText, { color: userProfile ? C.safe : C.text2 }]}>
                {userProfile ? "Active" : "Off"}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* SOS test */}
      <View style={styles.testCard}>
        <Text style={styles.testTitle}>Test SOS alert</Text>
        <Text style={styles.testSub}>Send a test to verify all contacts receive alerts correctly</Text>
        <TouchableOpacity style={styles.testButton}>
          <Text style={styles.testButtonText}>Send test alert</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  category: {
    fontSize: 11,
    color: C.text2,
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  title: {
    fontSize: 26,
    color: C.text0,
    fontWeight: '700',
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: C.accentDim,
    borderWidth: 1,
    borderColor: C.accentGlow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: C.accent,
    fontSize: 20,
    fontWeight: '600',
  },
  contactsCard: {
    backgroundColor: C.bg2,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
    marginBottom: 20,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: C.text0,
  },
  rel: {
    fontSize: 12,
    color: C.text2,
    marginTop: 2,
  },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  testCard: {
    padding: 20,
    backgroundColor: C.accentDim,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(232,53,74,0.2)',
  },
  testTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: C.text0,
    marginBottom: 4,
  },
  testSub: {
    fontSize: 12,
    color: C.text2,
    marginBottom: 16,
  },
  testButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: C.accent,
    alignSelf: 'flex-start',
  },
  testButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
});

export default ContactsScreen;
