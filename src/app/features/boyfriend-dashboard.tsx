import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAppTheme } from '../../context/ThemeContext';
import { PinkCard } from '../../components/common/PinkCard';
import { PinkButton } from '../../components/common/PinkButton';
import { getDatabase } from '../../db/sqlite';
import {
  CycleRecord,
  calculateCyclePrediction,
  getCurrentPhase,
} from '../../services/cycleEngine';
import {
  isBiometricAvailable,
  authenticateBoyfriendBiometrics,
  isBoyfriendPinSet,
  verifyBoyfriendPin,
  setBoyfriendPin,
} from '../../services/security';
import {
  HeartHandshake,
  Heart,
  Coffee,
  Sparkles,
  ChevronLeft,
  Send,
  CheckCircle,
  Lock,
  Unlock,
  Key,
  ShieldCheck,
  Fingerprint,
  Delete,
} from 'lucide-react-native';
import { format } from 'date-fns';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type PinMode = 'unlock' | 'setup_enter' | 'setup_confirm' | 'change_old' | 'change_new';

export default function BoyfriendDashboardScreen() {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinMode, setPinMode] = useState<PinMode>('unlock');
  const [pinDigits, setPinDigits] = useState<string>('');
  const [tempFirstPin, setTempFirstPin] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');
  const [hasBiometrics, setHasBiometrics] = useState(false);

  // Dashboard Data State
  const [cycles, setCycles] = useState<CycleRecord[]>([]);
  const [todayMood, setTodayMood] = useState<string | null>(null);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  // Check PIN setup & trigger biometrics on initial mount
  useEffect(() => {
    async function initAuth() {
      const bioAvail = await isBiometricAvailable();
      setHasBiometrics(bioAvail);

      const pinConfigured = await isBoyfriendPinSet();
      if (!pinConfigured) {
        setPinMode('setup_enter');
      } else {
        setPinMode('unlock');
        // Try quick biometric unlock if available
        if (bioAvail) {
          const success = await authenticateBoyfriendBiometrics();
          if (success) {
            try {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch {}
            setIsAuthenticated(true);
          }
        }
      }
    }
    initAuth();
  }, []);

  // Keypad Number Press
  const handleKeyPress = (num: string) => {
    if (pinDigits.length >= 4) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setAuthError('');
    const newDigits = pinDigits + num;
    setPinDigits(newDigits);

    if (newDigits.length === 4) {
      processCompletedPin(newDigits);
    }
  };

  const handleBackspace = () => {
    if (pinDigits.length === 0) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setAuthError('');
    setPinDigits(pinDigits.slice(0, -1));
  };

  const processCompletedPin = async (completedPin: string) => {
    if (pinMode === 'unlock') {
      const isValid = await verifyBoyfriendPin(completedPin);
      if (isValid) {
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {}
        setIsAuthenticated(true);
      } else {
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } catch {}
        setAuthError('Incorrect PIN. Only her boyfriend can enter 💕');
        setPinDigits('');
      }
    } else if (pinMode === 'setup_enter') {
      setTempFirstPin(completedPin);
      setPinDigits('');
      setPinMode('setup_confirm');
    } else if (pinMode === 'setup_confirm') {
      if (completedPin === tempFirstPin) {
        await setBoyfriendPin(completedPin);
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {}
        setIsAuthenticated(true);
        Alert.alert(
          'Secret PIN Created! 🔐',
          'Your personal boyfriend passcode is now active. Only you can unlock this sanctuary.'
        );
      } else {
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } catch {}
        setAuthError('PINs did not match. Please try again.');
        setPinDigits('');
        setTempFirstPin('');
        setPinMode('setup_enter');
      }
    } else if (pinMode === 'change_old') {
      const isValid = await verifyBoyfriendPin(completedPin);
      if (isValid) {
        setPinDigits('');
        setPinMode('change_new');
      } else {
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } catch {}
        setAuthError('Current PIN is incorrect.');
        setPinDigits('');
      }
    } else if (pinMode === 'change_new') {
      await setBoyfriendPin(completedPin);
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
      setPinDigits('');
      setIsAuthenticated(true);
      Alert.alert('PIN Updated! ✨', 'Your new boyfriend passcode has been saved.');
    }
  };

  const handleManualBiometricUnlock = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    const success = await authenticateBoyfriendBiometrics();
    if (success) {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
      setIsAuthenticated(true);
    }
  };

  const handleChangePinRequest = () => {
    setPinDigits('');
    setAuthError('');
    setPinMode('change_old');
    setIsAuthenticated(false);
  };

  // Load Dashboard Data once authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    async function loadData() {
      try {
        const db = await getDatabase();
        const cycleRows = await db.getAllAsync<any>(
          'SELECT * FROM menstrual_cycles ORDER BY start_date DESC'
        );
        setCycles(
          cycleRows.map((c) => ({
            id: c.id,
            startDate: c.start_date,
            endDate: c.end_date,
            cycleLength: c.cycle_length,
            periodLength: c.period_length,
          }))
        );

        const mood = await db.getFirstAsync<any>(
          'SELECT mood_type FROM mood_entries WHERE date = ? ORDER BY created_at DESC LIMIT 1',
          [todayStr]
        );
        if (mood) setTodayMood(mood.mood_type);

        const syms = await db.getAllAsync<any>(
          'SELECT symptom_name FROM symptoms WHERE date = ?',
          [todayStr]
        );
        setSymptoms(syms.map((s) => s.symptom_name));
      } catch (err) {
        console.warn('Error loading boyfriend dashboard:', err);
      }
    }
    loadData();
  }, [isAuthenticated, todayStr]);

  const prediction = calculateCyclePrediction(cycles);
  const currentPhase = getCurrentPhase(cycles);

  const getPhaseCareGuide = () => {
    switch (currentPhase.phase) {
      case 'menstrual':
        return {
          title: 'Period Care Mode (Needs Extra TLC) 🧸',
          suggestions: [
            'Warm up her heating pad without her even asking ❤️',
            'Bring her favorite sweet snack, hot chamomile tea, or dark chocolate 🍫',
            'Give gentle lower back or foot rubs to ease cramping 🌸',
            'Offer unlimited cozy cuddles and put on her favorite movie 🎬',
            'Remind her she is safe, loved, and beautiful even when in pain 💕',
          ],
        };
      case 'follicular':
        return {
          title: 'Follicular Phase (Energy & Joy Returning) ✨',
          suggestions: [
            'Plan a fun, creative date together outside 🌷',
            'Cheer her on with her new projects and goals 🌟',
            'Compliment her radiant glow today 💖',
            'Enjoy great conversations and laughter over dinner ☕',
          ],
        };
      case 'ovulation':
        return {
          title: 'Ovulation Phase (Peak Radiance & Vitality) 👑',
          suggestions: [
            'Take her out on a romantic dress-up date night 🌹',
            'Tell her how captivating and breathtaking she is ✨',
            'Engage in fun active adventures and quality time ❤️',
          ],
        };
      case 'luteal':
        return {
          title: 'Luteal Phase (PMS Care & Emotional Comfort) 🌸',
          suggestions: [
            'Be extra patient, gentle, and understanding of emotions 🕊️',
            'Cook or order comforting, warm nourishing meals 🍲',
            'Listen attentively if she feels stressed or sensitive 👂',
            'Surprise her with sweet little love messages 💌',
          ],
        };
    }
  };

  const careGuide = getPhaseCareGuide();

  // ----------------------------------------------------
  // 1. RENDER AUTHENTICATION LOCK SCREEN (If locked)
  // ----------------------------------------------------
  if (!isAuthenticated) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <View style={[styles.lockContainer, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}>
          
          {/* Top Bar with Safe Back Navigation */}
          <View style={styles.lockTopBar}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
              <ChevronLeft size={24} color={colors.primary} />
              <Text style={[styles.backText, { color: colors.primary }]}>Exit</Text>
            </TouchableOpacity>
          </View>

          {/* Central Security Card */}
          <View style={styles.lockContent}>
            <View style={[styles.lockIconCircle, { backgroundColor: `${colors.primary}18` }]}>
              <Lock size={36} color={colors.primary} />
              <View style={styles.lockHeartMiniBadge}>
                <Heart size={14} color="#FFFFFF" fill="#FF4FA3" />
              </View>
            </View>

            <Text style={[styles.lockTitle, { color: colors.text }]}>
              {pinMode === 'unlock'
                ? 'Boyfriend Verification 🔐'
                : pinMode === 'setup_enter'
                ? 'Set Boyfriend Secret PIN 💌'
                : pinMode === 'setup_confirm'
                ? 'Confirm Your PIN ✨'
                : pinMode === 'change_old'
                ? 'Enter Current PIN 🔑'
                : 'Enter New PIN ✨'}
            </Text>

            <Text style={[styles.lockSubtitle, { color: colors.textMuted }]}>
              {pinMode === 'unlock'
                ? 'This space is reserved strictly for you to care for and pamper her.'
                : pinMode === 'setup_enter'
                ? 'Choose a 4-digit passcode so only you can open this dashboard.'
                : pinMode === 'setup_confirm'
                ? 'Re-enter your 4-digit passcode to confirm.'
                : pinMode === 'change_old'
                ? 'Please verify your current passcode first.'
                : 'Enter your new 4-digit secret passcode.'}
            </Text>

            {/* 4-Digit Indicator Dots */}
            <View style={styles.pinDotsRow}>
              {[0, 1, 2, 3].map((index) => {
                const isFilled = pinDigits.length > index;
                return (
                  <View
                    key={index}
                    style={[
                      styles.pinDot,
                      {
                        borderColor: colors.primary,
                        backgroundColor: isFilled ? colors.primary : 'transparent',
                        transform: [{ scale: isFilled ? 1.15 : 1 }],
                      },
                    ]}
                  />
                );
              })}
            </View>

            {/* Error Message */}
            {authError ? (
              <Text style={styles.lockErrorText}>{authError}</Text>
            ) : (
              <View style={{ height: 20 }} />
            )}

            {/* Numeric Keypad */}
            <View style={styles.keypad}>
              {[
                ['1', '2', '3'],
                ['4', '5', '6'],
                ['7', '8', '9'],
              ].map((row, rIdx) => (
                <View key={rIdx} style={styles.keypadRow}>
                  {row.map((digit) => (
                    <TouchableOpacity
                      key={digit}
                      style={[styles.keypadButton, { backgroundColor: colors.surface }]}
                      onPress={() => handleKeyPress(digit)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.keypadDigit, { color: colors.text }]}>{digit}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ))}

              {/* Bottom Keypad Row: Biometric, 0, Backspace */}
              <View style={styles.keypadRow}>
                {hasBiometrics && pinMode === 'unlock' ? (
                  <TouchableOpacity
                    style={[styles.keypadButton, { backgroundColor: `${colors.primary}12` }]}
                    onPress={handleManualBiometricUnlock}
                    activeOpacity={0.7}
                  >
                    <Fingerprint size={26} color={colors.primary} />
                  </TouchableOpacity>
                ) : (
                  <View style={styles.keypadButtonPlaceholder} />
                )}

                <TouchableOpacity
                  style={[styles.keypadButton, { backgroundColor: colors.surface }]}
                  onPress={() => handleKeyPress('0')}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.keypadDigit, { color: colors.text }]}>0</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.keypadButton, { backgroundColor: colors.surface }]}
                  onPress={handleBackspace}
                  activeOpacity={0.7}
                >
                  <Delete size={22} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
            </View>

          </View>
        </View>
      </View>
    );
  }

  // ----------------------------------------------------
  // 2. RENDER AUTHENTICATED DASHBOARD
  // ----------------------------------------------------
  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Navigation Back & Header Row */}
        <View style={styles.topActionRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
            <ChevronLeft size={24} color={colors.primary} />
            <Text style={[styles.backText, { color: colors.primary }]}>Back</Text>
          </TouchableOpacity>

          {/* Lock / Change PIN Button */}
          <TouchableOpacity
            onPress={handleChangePinRequest}
            style={[styles.lockStatusPill, { backgroundColor: `${colors.primary}15`, borderColor: `${colors.primary}30` }]}
            activeOpacity={0.75}
          >
            <ShieldCheck size={14} color={colors.primary} />
            <Text style={[styles.lockStatusText, { color: colors.primary }]}>Boyfriend Mode • PIN Protected</Text>
          </TouchableOpacity>
        </View>

        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.iconBox, { backgroundColor: '#FCE4EC' }]}>
            <HeartHandshake size={32} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>
            Boyfriend Care Center 👑
          </Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Everything you need to support, pamper, and understand your girlfriend today
          </Text>
        </View>

        {/* Her Current Status Card */}
        <PinkCard style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Sparkles size={18} color={colors.primary} />
            <Text style={[styles.statusTitle, { color: colors.primary }]}>
              Her Cycle Right Now
            </Text>
          </View>

          <Text style={[styles.phaseName, { color: colors.text }]}>
            {currentPhase.phaseName} (Day {currentPhase.cycleDay})
          </Text>
          <Text style={[styles.phaseSub, { color: colors.textMuted }]}>
            {prediction.isOverdue
              ? `Period is ${prediction.daysOverdue} ${prediction.daysOverdue === 1 ? 'day' : 'days'} late. Be extra gentle and comforting 🌸`
              : prediction.daysUntilNextPeriod === 0
              ? 'Her period is expected today 💗'
              : prediction.daysUntilNextPeriod > 0
              ? `Next period expected in ~${prediction.daysUntilNextPeriod} days`
              : 'Period is active'}
          </Text>

          {/* Today's Logged Mood & Symptoms */}
          <View style={styles.sharedInfoRow}>
            <View style={styles.sharedBadge}>
              <Text style={[styles.sharedBadgeLabel, { color: colors.textMuted }]}>Today's Mood:</Text>
              <Text style={[styles.sharedBadgeVal, { color: colors.text }]}>
                {todayMood ? `${todayMood.charAt(0).toUpperCase() + todayMood.slice(1)}` : 'Not logged yet'}
              </Text>
            </View>

            <View style={styles.sharedBadge}>
              <Text style={[styles.sharedBadgeLabel, { color: colors.textMuted }]}>Reported Symptoms:</Text>
              <Text style={[styles.sharedBadgeVal, { color: colors.primary }]}>
                {symptoms.length > 0 ? symptoms.join(', ') : 'None reported yet'}
              </Text>
            </View>
          </View>
        </PinkCard>

        {/* Personalized Care Checklist */}
        <PinkCard style={styles.careCard}>
          <View style={styles.careHeader}>
            <Coffee size={20} color={colors.primary} />
            <Text style={[styles.careTitle, { color: colors.text }]}>
              {careGuide.title}
            </Text>
          </View>

          <View style={styles.checklist}>
            {careGuide.suggestions.map((item, idx) => (
              <View key={idx} style={styles.checkItem}>
                <CheckCircle size={18} color={colors.primary} style={{ marginTop: 2 }} />
                <Text style={[styles.checkText, { color: colors.text }]}>{item}</Text>
              </View>
            ))}
          </View>
        </PinkCard>

        {/* Quick Send Love Note Action */}
        <PinkCard style={styles.actionCard}>
          <Text style={[styles.actionTitle, { color: colors.text }]}>
            Send Her a Surprise Love Note 💕
          </Text>
          <Text style={[styles.actionSubtitle, { color: colors.textMuted }]}>
            Leave an affectionate thought that will pop up on her home dashboard
          </Text>
          <PinkButton
            title="Write Love Message 💌"
            onPress={() => router.push('/features/love-messages')}
            style={{ marginTop: 14, width: '100%' }}
          />
        </PinkCard>
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
  topActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backText: {
    fontSize: 14,
    fontWeight: '700',
  },
  lockStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  lockStatusText: {
    fontSize: 11,
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
  statusCard: {
    padding: 18,
    marginBottom: 16,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  statusTitle: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  phaseName: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 4,
  },
  phaseSub: {
    fontSize: 14,
    marginTop: 4,
    lineHeight: 19,
  },
  sharedInfoRow: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#FFE0ED',
    gap: 8,
  },
  sharedBadge: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sharedBadgeLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  sharedBadgeVal: {
    fontSize: 13,
    fontWeight: '700',
  },
  careCard: {
    padding: 18,
    marginBottom: 16,
  },
  careHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  careTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  checklist: {
    gap: 12,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  checkText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  actionCard: {
    padding: 18,
    alignItems: 'center',
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  actionSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },

  // -------------------------
  // LOCK SCREEN STYLES
  // -------------------------
  lockContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  lockTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  lockContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  lockIconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  lockHeartMiniBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#FF4FA3',
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  lockTitle: {
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  lockSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 20,
    marginBottom: 26,
  },
  pinDotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    marginBottom: 16,
  },
  pinDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
  },
  lockErrorText: {
    color: '#D81B60',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    height: 20,
    marginBottom: 8,
  },
  keypad: {
    width: '100%',
    maxWidth: 290,
    marginTop: 10,
    gap: 14,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  keypadButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF4FA3',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  keypadButtonPlaceholder: {
    width: 72,
    height: 72,
  },
  keypadDigit: {
    fontSize: 26,
    fontWeight: '700',
  },
});
