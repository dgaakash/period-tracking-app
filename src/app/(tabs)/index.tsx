import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../context/ThemeContext';
import { PinkCard } from '../../components/common/PinkCard';
import { PinkButton } from '../../components/common/PinkButton';
import { CircularPhaseIndicator } from '../../components/common/CircularPhaseIndicator';
import { AnimatedHearts } from '../../components/common/AnimatedHearts';
import { AppLogo } from '../../components/common/AppLogo';
import { FlowSelectionModal } from '../../components/common/FlowSelectionModal';
import { getDatabase } from '../../db/sqlite';
import {
  CycleRecord,
  calculateCyclePrediction,
  getCurrentPhase,
  predictPMSAndCramps,
} from '../../services/cycleEngine';
import {
  Heart,
  Droplet,
  Moon,
  Sparkles,
  Calendar,
  MessageCircleHeart,
  Smile,
  HeartHandshake,
  Image as ImageIcon,
  Wind,
  CheckCircle2,
  Plus,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { format } from 'date-fns';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function HomeScreen() {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);

  const [cycles, setCycles] = useState<CycleRecord[]>([]);
  const [waterIntake, setWaterIntake] = useState(0);
  const [todayMood, setTodayMood] = useState<string | null>(null);
  const [todayEnergy, setTodayEnergy] = useState<number | null>(null);
  const [todaySleep, setTodaySleep] = useState<number | null>(null);
  const [latestLoveMessage, setLatestLoveMessage] = useState<string | null>(null);
  const [isPeriodActive, setIsPeriodActive] = useState(false);
  const [todayPeriodFlow, setTodayPeriodFlow] = useState<string | null>(null);
  const [showFlowModal, setShowFlowModal] = useState(false);

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const loadData = useCallback(async () => {
    try {
      const db = await getDatabase();
      const cycleRows = await db.getAllAsync<any>(
        'SELECT * FROM menstrual_cycles ORDER BY start_date DESC'
      );
      const mappedCycles: CycleRecord[] = cycleRows.map((c) => ({
        id: c.id,
        startDate: c.start_date,
        endDate: c.end_date,
        cycleLength: c.cycle_length,
        periodLength: c.period_length,
      }));
      setCycles(mappedCycles);

      // Check if period is active today & its flow
      const todayPeriod = await db.getFirstAsync<{ id: string; flow?: string }>(
        'SELECT id, flow FROM period_days WHERE date = ?',
        [todayStr]
      );
      setIsPeriodActive(Boolean(todayPeriod));
      setTodayPeriodFlow(todayPeriod?.flow || null);

      // Load today's daily log
      const log = await db.getFirstAsync<any>(
        'SELECT * FROM daily_logs WHERE date = ?',
        [todayStr]
      );
      if (log) {
        setWaterIntake(log.water_intake_ml || 0);
        setTodayEnergy(log.energy_level);
        setTodaySleep(log.sleep_hours);
      }

      // Load today's mood
      const moodRow = await db.getFirstAsync<any>(
        'SELECT mood_type FROM mood_entries WHERE date = ? ORDER BY created_at DESC LIMIT 1',
        [todayStr]
      );
      if (moodRow) {
        setTodayMood(moodRow.mood_type);
      }

      // Load latest love message
      const msg = await db.getFirstAsync<any>(
        'SELECT content FROM love_messages ORDER BY created_at DESC LIMIT 1'
      );
      if (msg) {
        setLatestLoveMessage(msg.content);
      }
    } catch (err) {
      console.warn('Error loading dashboard data:', err);
    }
  }, [todayStr]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleAddWater = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const newWater = waterIntake + 250;
      setWaterIntake(newWater);
      const db = await getDatabase();
      await db.runAsync(
        `INSERT INTO daily_logs (id, user_id, date, water_intake_ml)
         VALUES (?, 'local-princess-user', ?, ?)
         ON CONFLICT(user_id, date) DO UPDATE SET water_intake_ml = ?`,
        [`log_${todayStr}`, todayStr, newWater, newWater]
      );
    } catch (err) {
      console.warn('Failed to update water:', err);
    }
  };

  const handleOpenFlowModal = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setShowFlowModal(true);
  };

  const handleSavePeriodFlow = async (flow: string) => {
    try {
      const db = await getDatabase();
      await db.runAsync(
        `INSERT INTO period_days (id, user_id, date, flow)
         VALUES (?, 'local-princess-user', ?, ?)
         ON CONFLICT(user_id, date) DO UPDATE SET flow = excluded.flow`,
        [`p_${todayStr}`, todayStr, flow]
      );

      // Also add or update cycle start if needed
      const currentCycle = await db.getFirstAsync<any>(
        'SELECT * FROM menstrual_cycles ORDER BY start_date DESC LIMIT 1'
      );
      if (!currentCycle || currentCycle.end_date) {
        await db.runAsync(
          `INSERT INTO menstrual_cycles (id, user_id, start_date, period_length)
           VALUES (?, 'local-princess-user', ?, 5)`,
          [`cycle_${Date.now()}`, todayStr]
        );
      }
      setIsPeriodActive(true);
      setTodayPeriodFlow(flow);
      await loadData();
    } catch (err) {
      console.warn('Error saving period flow:', err);
    }
  };

  const handleRemovePeriodToday = async () => {
    try {
      const db = await getDatabase();
      await db.runAsync('DELETE FROM period_days WHERE date = ?', [todayStr]);
      setIsPeriodActive(false);
      setTodayPeriodFlow(null);
      await loadData();
    } catch (err) {
      console.warn('Error removing period today:', err);
    }
  };

  const prediction = calculateCyclePrediction(cycles);
  const currentPhase = getCurrentPhase(cycles);
  const pmsStatus = predictPMSAndCramps(cycles);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <AnimatedHearts />
      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* Top Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <AppLogo size={46} showGlow={false} />
            <View>
              <Text style={[styles.subGreeting, { color: colors.textMuted }]}>
                {format(new Date(), 'EEEE, MMMM d')}
              </Text>
              <Text style={[styles.mainGreeting, { color: colors.text }]}>
                Good day, Princess! 👑
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.careBadge, { backgroundColor: colors.highlight, borderColor: colors.border }]}
            onPress={() => router.push('/features/princess-care')}
          >
            <Wind size={18} color={colors.primary} />
            <Text style={[styles.careBadgeText, { color: colors.primary }]}>Care Mode</Text>
          </TouchableOpacity>
        </View>

        {/* Phase Circular Visualizer Card */}
        <PinkCard style={styles.phaseCard}>
          <CircularPhaseIndicator
            cycleDay={currentPhase.cycleDay}
            totalCycleDays={prediction.averageCycleLength}
            phase={currentPhase.phase}
            phaseName={currentPhase.phaseName}
            daysUntilPeriod={prediction.daysUntilNextPeriod}
          />

          <Text style={[styles.phaseDesc, { color: colors.text }]}>
            {currentPhase.description}
          </Text>

          <View style={[styles.tipBox, { backgroundColor: `${colors.primary}12`, borderColor: `${colors.primary}25` }]}>
            <Sparkles size={16} color={colors.primary} style={{ marginTop: 2 }} />
            <Text style={[styles.tipText, { color: colors.text }]}>{currentPhase.tip}</Text>
          </View>

          {/* Quick Period Action Button */}
          <PinkButton
            title={
              isPeriodActive
                ? (todayPeriodFlow
                    ? `Period Logged (${todayPeriodFlow.charAt(0).toUpperCase() + todayPeriodFlow.slice(1)}) ✓`
                    : 'Period Logged Today ✓')
                : '+ Log Period Today 💗'
            }
            onPress={handleOpenFlowModal}
            variant={isPeriodActive ? 'secondary' : 'primary'}
            style={{ marginTop: 14 }}
          />
        </PinkCard>

        {/* Cycle Metrics Chips */}
        <View style={styles.metricsGrid}>
          <PinkCard style={styles.metricItem}>
            <Calendar size={18} color={colors.primary} />
            <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Next Period</Text>
            <Text style={[styles.metricValue, { color: colors.text }]}>
              {format(new Date(prediction.nextPeriodStartDate), 'MMM d')}
            </Text>
          </PinkCard>

          <PinkCard style={styles.metricItem}>
            <Sparkles size={18} color={colors.phases.ovulation} />
            <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Est. Ovulation</Text>
            <Text style={[styles.metricValue, { color: colors.text }]}>
              {format(new Date(prediction.ovulationDate), 'MMM d')}
            </Text>
          </PinkCard>

          <PinkCard style={styles.metricItem}>
            <Heart size={18} color={colors.secondary} />
            <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Avg. Cycle</Text>
            <Text style={[styles.metricValue, { color: colors.text }]}>
              {prediction.averageCycleLength} days
            </Text>
          </PinkCard>
        </View>

        {/* Surprise Love Message Preview */}
        {latestLoveMessage && (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push('/features/love-messages')}
          >
            <PinkCard style={[styles.loveNoteCard, { backgroundColor: colors.surface }]}>
              <View style={styles.loveNoteHeader}>
                <MessageCircleHeart size={20} color={colors.primary} />
                <Text style={[styles.loveNoteTitle, { color: colors.primary }]}>
                  Surprise Love Note 💕
                </Text>
              </View>
              <Text style={[styles.loveNoteBody, { color: colors.text }]}>
                "{latestLoveMessage}"
              </Text>
              <Text style={[styles.loveNoteFooter, { color: colors.textMuted }]}>
                Tap to read your messages & schedule sweet replies ✨
              </Text>
            </PinkCard>
          </TouchableOpacity>
        )}

        {/* Daily Wellness Quick Logs */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Today's Wellness</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/track')}>
            <Text style={[styles.sectionLink, { color: colors.primary }]}>Full Log →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.wellnessGrid}>
          {/* Water Tracker */}
          <PinkCard style={styles.wellnessCard}>
            <View style={styles.wellnessCardHeader}>
              <Droplet size={20} color="#4FC3F7" />
              <TouchableOpacity onPress={handleAddWater} style={styles.addMiniBtn}>
                <Plus size={16} color={colors.primary} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.wellnessValue, { color: colors.text }]}>
              {waterIntake} <Text style={{ fontSize: 13, fontWeight: '500' }}>ml</Text>
            </Text>
            <Text style={[styles.wellnessLabel, { color: colors.textMuted }]}>Water Intake</Text>
          </PinkCard>

          {/* Mood Tracker */}
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={0.85}
            onPress={() => router.push('/features/emotional-checkin')}
          >
            <PinkCard style={styles.wellnessCard}>
              <View style={styles.wellnessCardHeader}>
                <Smile size={20} color="#FFB300" />
              </View>
              <Text style={[styles.wellnessValue, { color: colors.text }]}>
                {todayMood || 'Tap to Log'}
              </Text>
              <Text style={[styles.wellnessLabel, { color: colors.textMuted }]}>Emotional Mood</Text>
            </PinkCard>
          </TouchableOpacity>

          {/* Sleep Hours */}
          <PinkCard style={styles.wellnessCard}>
            <View style={styles.wellnessCardHeader}>
              <Moon size={20} color="#9575CD" />
            </View>
            <Text style={[styles.wellnessValue, { color: colors.text }]}>
              {todaySleep ? `${todaySleep} hrs` : '--'}
            </Text>
            <Text style={[styles.wellnessLabel, { color: colors.textMuted }]}>Sleep Duration</Text>
          </PinkCard>
        </View>

        {/* 5 Mandatory Feature Quick Navigation Cards */}
        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 20 }]}>
          Princess Romance & Care Suite
        </Text>

        <View style={styles.featureList}>
          {/* A. Boyfriend's Care Dashboard */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push('/features/boyfriend-dashboard')}
          >
            <PinkCard style={styles.featureItem}>
              <View style={[styles.featureIconBox, { backgroundColor: '#FFE4EE' }]}>
                <HeartHandshake size={24} color={colors.primary} />
              </View>
              <View style={styles.featureContent}>
                <Text style={[styles.featureTitle, { color: colors.text }]}>
                  Boyfriend's Care Dashboard
                </Text>
                <Text style={[styles.featureSubtitle, { color: colors.textMuted }]}>
                  A dedicated portal for him to care for you during each phase ❤️
                </Text>
              </View>
            </PinkCard>
          </TouchableOpacity>

          {/* B. Daily Emotional Check-in */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push('/features/emotional-checkin')}
          >
            <PinkCard style={styles.featureItem}>
              <View style={[styles.featureIconBox, { backgroundColor: '#F3E5F5' }]}>
                <Heart size={24} color="#AB47BC" />
              </View>
              <View style={styles.featureContent}>
                <Text style={[styles.featureTitle, { color: colors.text }]}>
                  "How are you feeling today, Princess?" 💗
                </Text>
                <Text style={[styles.featureSubtitle, { color: colors.textMuted }]}>
                  Daily emotional reflection, stress score & gentle journaling
                </Text>
              </View>
            </PinkCard>
          </TouchableOpacity>

          {/* C. Period Comfort Checklist */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push('/features/comfort-checklist')}
          >
            <PinkCard style={styles.featureItem}>
              <View style={[styles.featureIconBox, { backgroundColor: '#E0F2F1' }]}>
                <CheckCircle2 size={24} color="#00897B" />
              </View>
              <View style={styles.featureContent}>
                <Text style={[styles.featureTitle, { color: colors.text }]}>
                  Period Comfort Checklist
                </Text>
                <Text style={[styles.featureSubtitle, { color: colors.textMuted }]}>
                  Heating pad, chamomile tea, cozy snacks & personalized relief kit
                </Text>
              </View>
            </PinkCard>
          </TouchableOpacity>

          {/* D. Our Little Memories Scrapbook */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push('/features/memories-scrapbook')}
          >
            <PinkCard style={styles.featureItem}>
              <View style={[styles.featureIconBox, { backgroundColor: '#FFF3E0' }]}>
                <ImageIcon size={24} color="#FB8C00" />
              </View>
              <View style={styles.featureContent}>
                <Text style={[styles.featureTitle, { color: colors.text }]}>
                  Our Little Memories Scrapbook
                </Text>
                <Text style={[styles.featureSubtitle, { color: colors.textMuted }]}>
                  Private photo diary of anniversaries, sweet dates & cuddles 📸
                </Text>
              </View>
            </PinkCard>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Menstrual Flow Selection Dialog */}
      <FlowSelectionModal
        visible={showFlowModal}
        date={new Date()}
        initialFlow={todayPeriodFlow}
        isAlreadyLogged={isPeriodActive}
        onSelectFlow={handleSavePeriodFlow}
        onRemovePeriod={handleRemovePeriodToday}
        onClose={() => setShowFlowModal(false)}
      />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  subGreeting: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  mainGreeting: {
    fontSize: 22,
    fontWeight: '800',
  },
  careBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  careBadgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  phaseCard: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 16,
  },
  phaseDesc: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 8,
    paddingHorizontal: 16,
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 14,
    marginHorizontal: 8,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  metricItem: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    gap: 4,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  loveNoteCard: {
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF4FA3',
  },
  loveNoteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  loveNoteTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  loveNoteBody: {
    fontSize: 15,
    fontStyle: 'italic',
    lineHeight: 22,
    marginBottom: 8,
  },
  loveNoteFooter: {
    fontSize: 11,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  sectionLink: {
    fontSize: 13,
    fontWeight: '700',
  },
  wellnessGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  wellnessCard: {
    flex: 1,
    padding: 12,
  },
  wellnessCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addMiniBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFF0F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wellnessValue: {
    fontSize: 17,
    fontWeight: '800',
  },
  wellnessLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  featureList: {
    gap: 12,
    marginTop: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 14,
  },
  featureIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  featureSubtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
});
