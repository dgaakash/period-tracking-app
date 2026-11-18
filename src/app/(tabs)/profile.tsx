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
import { PinkButton } from '../../components/common/PinkButton';
import { THEMES, ThemeName } from '../../constants/theme';
import { getDatabase } from '../../db/sqlite';
import { deleteAllUserData } from '../../services/dataExport';
import { isBiometricAvailable } from '../../services/security';
import {
  Crown,
  Palette,
  Bell,
  HeartHandshake,
  BookOpen,
  Watch,
  ShieldCheck,
  Trash2,
  ChevronRight,
  Sparkles,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export default function ProfileScreen() {
  const { colors, themeName, setTheme } = useAppTheme();
  const insets = useSafeAreaInsets();

  const [greetingEnabled, setGreetingEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [trackingMode, setTrackingMode] = useState('standard');

  useEffect(() => {
    async function loadSettings() {
      try {
        const db = await getDatabase();
        const prefs = await db.getFirstAsync<any>(
          'SELECT * FROM user_preferences LIMIT 1'
        );
        if (prefs) {
          setGreetingEnabled(prefs.greeting_enabled === 1);
          setNotificationsEnabled(prefs.notifications_enabled === 1);
          setBiometricEnabled(prefs.biometric_enabled === 1);
          if (prefs.tracking_mode) setTrackingMode(prefs.tracking_mode);
        }
      } catch (err) {
        console.warn('Error loading preferences:', err);
      }
    }
    loadSettings();
  }, []);

  const handleToggleGreeting = async (val: boolean) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setGreetingEnabled(val);
      const db = await getDatabase();
      await db.runAsync('UPDATE user_preferences SET greeting_enabled = ?', [val ? 1 : 0]);
    } catch (err) {
      console.warn('Error saving greeting setting:', err);
    }
  };

  const handleToggleBiometrics = async (val: boolean) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (val) {
        const available = await isBiometricAvailable();
        if (!available) {
          Alert.alert('Biometrics Not Available', 'Please configure fingerprint or Face ID in device settings.');
          return;
        }
      }
      setBiometricEnabled(val);
      const db = await getDatabase();
      await db.runAsync('UPDATE user_preferences SET biometric_enabled = ?', [val ? 1 : 0]);
    } catch (err) {
      console.warn('Error saving biometric setting:', err);
    }
  };

  const handleTrackingModeChange = async (mode: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setTrackingMode(mode);
      const db = await getDatabase();
      await db.runAsync('UPDATE user_preferences SET tracking_mode = ?', [mode]);
    } catch (err) {
      console.warn('Error saving tracking mode:', err);
    }
  };

  const handleDeleteData = () => {
    Alert.alert(
      'Delete All Data?',
      'This will permanently delete all your logged periods, moods, symptoms, and private journal entries. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Forever',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAllUserData();
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert('Data Deleted', 'All personal tracking records have been wiped clean.');
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'Could not delete data');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <PinkCard style={styles.profileCard}>
          <View style={[styles.avatarBox, { backgroundColor: colors.highlight }]}>
            <Crown size={36} color={colors.primary} />
          </View>
          <Text style={[styles.profileName, { color: colors.text }]}>
            Princess 👑
          </Text>
          <Text style={[styles.profileTag, { color: colors.primary }]}>
            Free Forever Premium Companion
          </Text>
          <Text style={[styles.profileSub, { color: colors.textMuted }]}>
            No subscriptions • No paywalls • No ads
          </Text>
        </PinkCard>

        {/* Tracking Mode Selection */}
        <PinkCard style={styles.sectionCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Tracking Mode
          </Text>
          <View style={styles.modeButtons}>
            {[
              { id: 'standard', label: 'Period Tracking' },
              { id: 'ttc', label: 'Conception (TTC)' },
              { id: 'pregnancy', label: 'Pregnancy Mode' },
              { id: 'perimenopause', label: 'Perimenopause' },
            ].map((m) => {
              const active = trackingMode === m.id;
              return (
                <TouchableOpacity
                  key={m.id}
                  onPress={() => handleTrackingModeChange(m.id)}
                  style={[
                    styles.modeBtn,
                    { borderColor: colors.primary },
                    active && { backgroundColor: colors.primary },
                  ]}
                >
                  <Text
                    style={[
                      styles.modeBtnText,
                      { color: active ? '#FFFFFF' : colors.text },
                    ]}
                  >
                    {m.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </PinkCard>

        {/* Custom Barbie Theme Selector */}
        <PinkCard style={styles.sectionCard}>
          <View style={styles.rowBetween}>
            <View style={styles.rowLeft}>
              <Palette size={20} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Color Theme
              </Text>
            </View>
          </View>

          <View style={styles.themeGrid}>
            {(Object.keys(THEMES) as ThemeName[]).map((tKey) => {
              const t = THEMES[tKey];
              const isSelected = themeName === tKey;
              return (
                <TouchableOpacity
                  key={tKey}
                  onPress={() => {
                    try {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    } catch {}
                    setTheme(tKey);
                  }}
                  style={[
                    styles.themeItem,
                    { borderColor: t.colors.primary },
                    isSelected && { borderWidth: 2.5, transform: [{ scale: 1.02 }] },
                  ]}
                >
                  <View style={[styles.themeSwatch, { backgroundColor: t.colors.primary }]} />
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.themeLabel,
                      { color: colors.text },
                      isSelected && { fontWeight: '800', color: colors.primary },
                    ]}
                  >
                    {t.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </PinkCard>

        {/* Preferences Toggles */}
        <PinkCard style={styles.sectionCard}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleTextGroup}>
              <Text style={[styles.toggleTitle, { color: colors.text }]}>
                Personalized Welcome Greetings
              </Text>
              <Text style={[styles.toggleDesc, { color: colors.textMuted }]}>
                Romantic greetings every time you open the app 💗
              </Text>
            </View>
            <Switch
              value={greetingEnabled}
              onValueChange={handleToggleGreeting}
              trackColor={{ false: '#FFE0ED', true: colors.primary }}
            />
          </View>

          <View style={[styles.toggleRow, { marginTop: 14 }]}>
            <View style={styles.toggleTextGroup}>
              <Text style={[styles.toggleTitle, { color: colors.text }]}>
                Biometric Protection (Face/Fingerprint)
              </Text>
              <Text style={[styles.toggleDesc, { color: colors.textMuted }]}>
                Locks journal and sensitive health data
              </Text>
            </View>
            <Switch
              value={biometricEnabled}
              onValueChange={handleToggleBiometrics}
              trackColor={{ false: '#FFE0ED', true: colors.primary }}
            />
          </View>
        </PinkCard>

        {/* Navigation Shortcuts to Key Features */}
        <View style={styles.menuList}>
          {/* Partner Sharing */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/features/partner-sharing')}
          >
            <PinkCard style={styles.menuItem}>
              <HeartHandshake size={20} color={colors.primary} />
              <Text style={[styles.menuText, { color: colors.text }]}>
                Partner Sharing & Scoped Permissions
              </Text>
              <ChevronRight size={18} color={colors.textLight} />
            </PinkCard>
          </TouchableOpacity>

          {/* Educational Content Library */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/features/education')}
          >
            <PinkCard style={styles.menuItem}>
              <BookOpen size={20} color="#AB47BC" />
              <Text style={[styles.menuText, { color: colors.text }]}>
                17-Category Women's Health Library
              </Text>
              <ChevronRight size={18} color={colors.textLight} />
            </PinkCard>
          </TouchableOpacity>

          {/* Wearables */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/features/wearables')}
          >
            <PinkCard style={styles.menuItem}>
              <Watch size={20} color="#00897B" />
              <Text style={[styles.menuText, { color: colors.text }]}>
                Wearable & Sensor Integrations (Health Connect, Oura, Fitbit)
              </Text>
              <ChevronRight size={18} color={colors.textLight} />
            </PinkCard>
          </TouchableOpacity>
        </View>

        {/* Account Deletion / Data Wipe */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleDeleteData}
          style={styles.dangerZone}
        >
          <Trash2 size={18} color="#FF5252" />
          <Text style={styles.dangerText}>Delete All Health Data & Wipe Storage</Text>
        </TouchableOpacity>

        <Text style={[styles.versionText, { color: colors.textLight }]}>
          Barbie Period Tracker v1.0.0 (Native Android Build)
        </Text>
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
  profileCard: {
    alignItems: 'center',
    padding: 20,
    marginBottom: 16,
  },
  avatarBox: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '800',
  },
  profileTag: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
  },
  profileSub: {
    fontSize: 12,
    marginTop: 2,
  },
  sectionCard: {
    padding: 16,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 10,
  },
  modeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  modeBtn: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  modeBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
  },
  themeItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
    backgroundColor: '#FFFFFF',
  },
  themeSwatch: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  themeLabel: {
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
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
  menuList: {
    gap: 10,
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  menuText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  dangerZone: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    marginBottom: 10,
  },
  dangerText: {
    color: '#FF5252',
    fontSize: 13,
    fontWeight: '700',
  },
  versionText: {
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 20,
  },
});
