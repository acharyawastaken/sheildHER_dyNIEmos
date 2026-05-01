import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from "react-native";
import { C, FONT } from "../utils/constants";

const SettingsScreen = ({ userProfile, onEditProfile }) => {
  const [vals, setVals] = useState({ guardian: true, noise: false, gesture: true, checkin: true, share: false });
  const toggle = k => setVals(v => ({ ...v, [k]: !v[k] }));

  const name = userProfile?.name || "Guest User";
  const phone = userProfile?.phone || "+91 00000 00000";

  const sections = [
    {
      title: "Safety",
      items: [
        { key: "guardian", label: "Guardian AI", sub: "Continuous background monitoring" },
        { key: "noise", label: "Distress detection", sub: "Detect screams and panic voice" },
        { key: "gesture", label: "Gesture SOS", sub: "Triple press volume to trigger" },
        { key: "checkin", label: "Check-in timer", sub: "Prompt if not checked in" },
      ],
    },
    {
      title: "Privacy",
      items: [
        { key: "share", label: "Always share location", sub: "With contacts continuously" },
      ],
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.category}>PREFERENCES</Text>
        <Text style={styles.title}>Settings</Text>
      </View>

      {/* Profile card */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{name.charAt(0)}</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{name}</Text>
          <Text style={styles.profilePhone}>{phone}</Text>
        </View>
        <TouchableOpacity onPress={onEditProfile}>
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
      </View>

      {sections.map(({ title, items }) => (
        <View key={title} style={styles.section}>
          <Text style={styles.sectionTitle}>{title.toUpperCase()}</Text>
          <View style={styles.itemsCard}>
            {items.map(({ key, label, sub }, i) => (
              <View key={key} style={[styles.itemRow, i < items.length - 1 && styles.borderBottom]}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemLabel}>{label}</Text>
                  <Text style={styles.itemSub}>{sub}</Text>
                </View>
                <Switch
                  value={vals[key]}
                  onValueChange={() => toggle(key)}
                  trackColor={{ false: C.bg4, true: C.safe }}
                  thumbColor="#fff"
                />
              </View>
            ))}
          </View>
        </View>
      ))}

      {/* App info */}
      <View style={styles.infoCard}>
        <View>
          <Text style={styles.appTitle}>Epoch Guardian</Text>
          <Text style={styles.version}>Version 1.0.0 MVP</Text>
        </View>
        <Text style={styles.privacyTag}>Privacy-first</Text>
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
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    backgroundColor: C.bg2,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 24,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: C.bg3, // Would use gradient in real RN if lib installed
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: C.border,
  },
  avatarText: {
    fontSize: 22,
    color: C.text0,
    fontWeight: '700',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 15,
    fontWeight: '600',
    color: C.text0,
  },
  profilePhone: {
    fontSize: 12,
    color: C.text2,
    marginTop: 2,
  },
  editText: {
    fontSize: 11,
    color: C.accent,
    fontWeight: '700',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 11,
    color: C.text2,
    letterSpacing: 1,
    marginBottom: 10,
    fontWeight: '600',
  },
  itemsCard: {
    backgroundColor: C.bg2,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  itemInfo: {
    flex: 1,
  },
  itemLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: C.text0,
  },
  itemSub: {
    fontSize: 11,
    color: C.text2,
    marginTop: 2,
  },
  infoCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    backgroundColor: C.bg2,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  appTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: C.text0,
  },
  version: {
    fontSize: 11,
    color: C.text2,
    marginTop: 2,
  },
  privacyTag: {
    fontSize: 11,
    color: C.text2,
    fontWeight: '500',
  },
});

export default SettingsScreen;
