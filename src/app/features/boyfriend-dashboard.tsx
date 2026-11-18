import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
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
  HeartHandshake,
  Heart,
  Coffee,
  Sparkles,
  ChevronLeft,
  Send,
  CheckCircle,
} from 'lucide-react-native';
import { format } from 'date-fns';

export default function BoyfriendDashboardScreen() {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  const [cycles, setCycles] = useState<CycleRecord[]>([]);
  const [todayMood, setTodayMood] = useState<string | null>(null);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
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
          'SELECT mood_type FROM mood_entries WHERE date = ?',
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
  }, [todayStr]);

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
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
        >
          <ChevronLeft size={24} color={colors.primary} />
          <Text style={[styles.backText, { color: colors.primary }]}>Back to Dashboard</Text>
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.iconBox, { backgroundColor: '#FFE4EE' }]}>
            <HeartHandshake size={32} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>
            Boyfriend's Care Dashboard ❤️
          </Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Your guide to supporting, pampering, and understanding your Princess today
          </Text>
        </View>

        {/* Current Shared Status Card */}
        <PinkCard style={styles.statusCard}>
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
            Her Current Cycle Status
          </Text>
          <Text style={[styles.phaseHeadline, { color: colors.primary }]}>
            {currentPhase.phaseName} (Day {currentPhase.cycleDay})
          </Text>
          <Text style={[styles.phaseSub, { color: colors.text }]}>
            Next period expected in{' '}
            <Text style={{ fontWeight: '800', color: colors.primary }}>
              {prediction.daysUntilNextPeriod} days
            </Text>{' '}
            ({format(new Date(prediction.nextPeriodStartDate), 'MMM d')})
          </Text>

          <View style={styles.sharedInfoRow}>
            <View style={styles.sharedBadge}>
              <Text style={[styles.sharedBadgeLabel, { color: colors.textMuted }]}>Today's Mood:</Text>
              <Text style={[styles.sharedBadgeVal, { color: colors.text }]}>
                {todayMood || 'Feeling good 😊'}
              </Text>
            </View>

            {symptoms.length > 0 && (
              <View style={styles.sharedBadge}>
                <Text style={[styles.sharedBadgeLabel, { color: colors.textMuted }]}>Symptoms:</Text>
                <Text style={[styles.sharedBadgeVal, { color: colors.text }]}>
                  {symptoms.join(', ')}
                </Text>
              </View>
            )}
          </View>
        </PinkCard>

        {/* Actionable Care Checklist for Him */}
        <PinkCard style={styles.careCard}>
          <View style={styles.careHeader}>
            <Sparkles size={20} color={colors.primary} />
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

        {/* Send Her a Surprise Message */}
        <PinkCard style={styles.actionCard}>
          <Text style={[styles.actionTitle, { color: colors.text }]}>
            Brighten Her Day Instantly 💌
          </Text>
          <Text style={[styles.actionSubtitle, { color: colors.textMuted }]}>
            Send or schedule a sweet surprise love note that pops up on her phone!
          </Text>
          <PinkButton
            title="Send Surprise Love Note 💕"
            onPress={() => router.push('/features/love-messages')}
            icon={<Send size={18} color="#FFFFFF" />}
            style={{ marginTop: 12 }}
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
  statusCard: {
    padding: 18,
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  phaseHeadline: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 4,
  },
  phaseSub: {
    fontSize: 14,
    marginTop: 4,
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
});
