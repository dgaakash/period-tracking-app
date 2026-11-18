import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useAppTheme } from '../../context/ThemeContext';
import { PinkCard } from '../../components/common/PinkCard';
import { PinkButton } from '../../components/common/PinkButton';
import { AnimatedHearts } from '../../components/common/AnimatedHearts';
import {
  Wind,
  ChevronLeft,
  Sparkles,
  Heart,
  Smile,
  Shield,
  Coffee,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const AFFIRMATIONS = [
  "My body is wise, gentle, and doing extraordinary work every day.",
  "I give myself permission to slow down, rest, and nourish my spirit.",
  "I am deeply loved, completely safe, and cherished just as I am.",
  "Pain is temporary, and my peace is restored with every breath.",
  "I honor my natural rhythms with patience, self-compassion, and warmth.",
];

export default function PrincessCareScreen() {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  const [isBreathing, setIsBreathing] = useState(false);
  const [breathInstruction, setBreathInstruction] = useState('Tap to Start');
  const [affirmationIdx, setAffirmationIdx] = useState(0);

  const scale = useSharedValue(1);

  const startBreathing = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    setIsBreathing(true);
    setBreathInstruction('Inhale deeply (4s)... 🌸');

    // 4s inhale, 4s hold, 4s exhale = 12s cycle
    scale.value = withRepeat(
      withSequence(
        withTiming(1.4, { duration: 4000, easing: Easing.inOut(Easing.quad) }),
        withTiming(1.4, { duration: 4000 }), // hold
        withTiming(1.0, { duration: 4000, easing: Easing.inOut(Easing.quad) }) // exhale
      ),
      -1,
      false
    );
  };

  const stopBreathing = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setIsBreathing(false);
    scale.value = withTiming(1, { duration: 600 });
    setBreathInstruction('Tap to Start');
  };

  const animatedCircleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const nextAffirmation = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setAffirmationIdx((prev) => (prev + 1) % AFFIRMATIONS.length);
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <AnimatedHearts />
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
          <View style={[styles.iconBox, { backgroundColor: '#FCE4EC' }]}>
            <Wind size={32} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>
            Princess Care & Relaxation 👑
          </Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Mindful breathing exercises, soothing affirmations & restorative tranquility
          </Text>
        </View>

        {/* Guided Breathing Circle */}
        <PinkCard style={styles.breathingCard}>
          <Text style={[styles.cardHeaderTitle, { color: colors.text }]}>
            Relaxation Breathing (4-4-4)
          </Text>
          <Text style={[styles.cardHeaderSub, { color: colors.textMuted }]}>
            Calms the vagus nerve, reduces pelvic tension, and brings immediate peace
          </Text>

          <View style={styles.circleContainer}>
            <Animated.View
              style={[
                styles.breathingCircle,
                { backgroundColor: `${colors.primary}25`, borderColor: colors.primary },
                animatedCircleStyle,
              ]}
            >
              <Text style={styles.breathingEmoji}>🌸</Text>
            </Animated.View>
          </View>

          <Text style={[styles.instructionText, { color: colors.primary }]}>
            {isBreathing ? 'Inhale • Hold • Exhale softly...' : breathInstruction}
          </Text>

          <PinkButton
            title={isBreathing ? 'Stop Exercise' : 'Begin Breathing Exercise 🌸'}
            onPress={isBreathing ? stopBreathing : startBreathing}
            variant={isBreathing ? 'outline' : 'primary'}
            style={{ width: '100%', marginTop: 14 }}
          />
        </PinkCard>

        {/* Daily Affirmation Card */}
        <PinkCard style={styles.affirmationCard}>
          <View style={styles.affirmationHeader}>
            <Sparkles size={18} color={colors.primary} />
            <Text style={[styles.affirmationTitle, { color: colors.primary }]}>
              Princess Affirmation of the Day
            </Text>
          </View>
          <Text style={[styles.affirmationBody, { color: colors.text }]}>
            "{AFFIRMATIONS[affirmationIdx]}"
          </Text>
          <TouchableOpacity onPress={nextAffirmation} style={styles.nextAffBtn}>
            <Text style={[styles.nextAffText, { color: colors.primary }]}>
              Next Affirmation ✨ →
            </Text>
          </TouchableOpacity>
        </PinkCard>

        {/* Self-Care Rituals */}
        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 14, marginBottom: 10 }]}>
          Gentle Self-Care Rituals
        </Text>

        <View style={styles.ritualsList}>
          <PinkCard style={styles.ritualItem}>
            <Text style={styles.ritualEmoji}>☕</Text>
            <View style={styles.ritualContent}>
              <Text style={[styles.ritualTitle, { color: colors.text }]}>
                Warm Herbal Hydration
              </Text>
              <Text style={[styles.ritualDesc, { color: colors.textMuted }]}>
                Chamomile and ginger tea reduce inflammatory prostaglandins and relax smooth muscles.
              </Text>
            </View>
          </PinkCard>

          <PinkCard style={styles.ritualItem}>
            <Text style={styles.ritualEmoji}>🧸</Text>
            <View style={styles.ritualContent}>
              <Text style={[styles.ritualTitle, { color: colors.text }]}>
                Guilt-Free Rest & Low Lighting
              </Text>
              <Text style={[styles.ritualDesc, { color: colors.textMuted }]}>
                Dim the lights 1 hour before bed to signal your pineal gland to release natural melatonin.
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
  breathingCard: {
    alignItems: 'center',
    padding: 20,
    marginBottom: 16,
  },
  cardHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  cardHeaderSub: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
    paddingHorizontal: 10,
  },
  circleContainer: {
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 14,
  },
  breathingCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  breathingEmoji: {
    fontSize: 34,
  },
  instructionText: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 10,
  },
  affirmationCard: {
    padding: 18,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF4FA3',
  },
  affirmationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  affirmationTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  affirmationBody: {
    fontSize: 15,
    fontStyle: 'italic',
    lineHeight: 22,
    marginBottom: 10,
  },
  nextAffBtn: {
    alignSelf: 'flex-end',
  },
  nextAffText: {
    fontSize: 12,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  ritualsList: {
    gap: 10,
  },
  ritualItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 14,
  },
  ritualEmoji: {
    fontSize: 28,
  },
  ritualContent: {
    flex: 1,
  },
  ritualTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  ritualDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
});
