import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAppTheme } from '../../context/ThemeContext';
import { PinkCard } from '../../components/common/PinkCard';
import { getDatabase } from '../../db/sqlite';
import { isBiometricAvailable } from '../../services/security';
import {
  ShieldCheck,
  ChevronLeft,
  Lock,
  EyeOff,
  Server,
  Key,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export default function SecurityScreen() {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [hasHardware, setHasHardware] = useState(false);

  useEffect(() => {
    async function checkBio() {
      const avail = await isBiometricAvailable();
      setHasHardware(avail);
      const db = await getDatabase();
      const prefs = await db.getFirstAsync<{ biometric_enabled: number }>(
        'SELECT biometric_enabled FROM user_preferences LIMIT 1'
      );
      if (prefs) {
        setBiometricEnabled(prefs.biometric_enabled === 1);
      }
    }
    checkBio();
  }, []);

  const handleToggleBio = async (val: boolean) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (val && !hasHardware) {
        Alert.alert('Notice', 'No enrolled biometric hardware found on this device.');
        return;
      }
      setBiometricEnabled(val);
      const db = await getDatabase();
      await db.runAsync('UPDATE user_preferences SET biometric_enabled = ?', [val ? 1 : 0]);
    } catch (err) {
      console.warn('Error saving biometric setting:', err);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Navigation Back */}
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color={colors.primary} />
          <Text style={[styles.backText, { color: colors.primary }]}>Back</Text>
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.iconBox, { backgroundColor: '#E0F2F1' }]}>
            <ShieldCheck size={32} color="#00897B" />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>
            Privacy & Security Sanctuary 🛡️
          </Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Your intimate health details are protected with bank-grade encryption and local hardware isolation
          </Text>
        </View>

        {/* Biometric Toggle Card */}
        <PinkCard style={styles.card}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleTextGroup}>
              <Text style={[styles.toggleTitle, { color: colors.text }]}>
                Face ID / Biometric Passcode
              </Text>
              <Text style={[styles.toggleDesc, { color: colors.textMuted }]}>
                Require biometric authentication every time the application is opened
              </Text>
            </View>
            <Switch
              value={biometricEnabled}
              onValueChange={handleToggleBio}
              trackColor={{ false: '#FFE0ED', true: colors.primary }}
            />
          </View>
        </PinkCard>

        {/* Privacy Principles */}
        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 14, marginBottom: 10 }]}>
          Our Privacy Guarantees
        </Text>

        <View style={styles.guaranteeList}>
          <PinkCard style={styles.guaranteeItem}>
            <EyeOff size={22} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.gTitle, { color: colors.text }]}>
                Zero Ad Trackers or Data Brokers
              </Text>
              <Text style={[styles.gDesc, { color: colors.textMuted }]}>
                We will never sell, monetize, or disclose your menstrual cycles, fertility data, or private thoughts to advertisers or data brokers.
              </Text>
            </View>
          </PinkCard>

          <PinkCard style={styles.guaranteeItem}>
            <Server size={22} color={colors.secondary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.gTitle, { color: colors.text }]}>
                Offline-First Local Storage
              </Text>
              <Text style={[styles.gDesc, { color: colors.textMuted }]}>
                All your cycles, symptoms, and diary logs are stored directly on your phone via SQLite. The app operates 100% offline.
              </Text>
            </View>
          </PinkCard>

          <PinkCard style={styles.guaranteeItem}>
            <Key size={22} color="#00897B" />
            <View style={{ flex: 1 }}>
              <Text style={[styles.gTitle, { color: colors.text }]}>
                Row-Level Security & Scoped Permissions
              </Text>
              <Text style={[styles.gDesc, { color: colors.textMuted }]}>
                When cloud sync is enabled, PostgreSQL Row Level Security (RLS) ensures only your cryptographic key can read or mutate your records.
              </Text>
            </View>
          </PinkCard>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContainer: {
    paddingHorizontal: 20,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 16,
  },
  backText: {
    fontSize: 14,
    fontWeight: '700',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
    paddingHorizontal: 16,
  },
  card: {
    padding: 16,
    marginBottom: 14,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleTextGroup: {
    flex: 1,
    paddingRight: 12,
  },
  toggleTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  toggleDesc: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  guaranteeList: {
    gap: 10,
    marginBottom: 20,
  },
  guaranteeItem: {
    flexDirection: 'row',
    gap: 12,
    padding: 14,
  },
  gTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  gDesc: {
    fontSize: 12,
    lineHeight: 17,
  },
});
