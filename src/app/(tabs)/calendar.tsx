import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../context/ThemeContext';
import { PinkCard } from '../../components/common/PinkCard';
import { PinkButton } from '../../components/common/PinkButton';
import { FlowSelectionModal } from '../../components/common/FlowSelectionModal';
import { getDatabase } from '../../db/sqlite';
import {
  CycleRecord,
  calculateCyclePrediction,
  getCurrentPhase,
  predictFutureCycles,
  MEDICAL_DISCLAIMER,
} from '../../services/cycleEngine';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  parseISO,
  isWithinInterval,
} from 'date-fns';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Plus,
  Check,
  CalendarHeart,
  Droplet,
  Heart,
  Flower2,
  Calendar as CalendarIcon,
  Smile,
  Activity,
  FileText,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const FLOW_EMOJIS: Record<string, string> = {
  spotting: '🌸',
  light: '💧',
  medium: '💧',
  heavy: '🩸',
  super: '🩸',
};

export default function CalendarScreen() {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [cycles, setCycles] = useState<CycleRecord[]>([]);
  const [periodDaysMap, setPeriodDaysMap] = useState<Record<string, string>>({});
  const [loggedActivityDates, setLoggedActivityDates] = useState<string[]>([]);
  const [selectedDateDetails, setSelectedDateDetails] = useState<{
    periodFlow?: string;
    mood?: string;
    symptoms?: string[];
    water?: number;
    notes?: string;
  }>({});
  const [showFlowModal, setShowFlowModal] = useState(false);

  const loadData = useCallback(async () => {
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

      // Load period days with exact flow intensity
      const periodDaysRows = await db.getAllAsync<{ date: string; flow: string }>(
        'SELECT date, flow FROM period_days'
      );
      const flowMap: Record<string, string> = {};
      for (const row of periodDaysRows) {
        flowMap[row.date] = row.flow || 'medium';
      }
      setPeriodDaysMap(flowMap);

      // Load dates with symptoms, moods, or logs for activity dots
      const activityRows = await db.getAllAsync<{ date: string }>(
        `SELECT DISTINCT date FROM mood_entries
         UNION SELECT DISTINCT date FROM symptoms
         UNION SELECT DISTINCT date FROM daily_logs WHERE water_intake_ml > 0 OR (notes IS NOT NULL AND notes != '')`
      );
      setLoggedActivityDates(activityRows.map((r) => r.date));

      // Load details for selected date
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const periodDay = await db.getFirstAsync<{ flow: string }>(
        'SELECT flow FROM period_days WHERE date = ?',
        [dateStr]
      );
      const moodRow = await db.getFirstAsync<{ mood_type: string }>(
        'SELECT mood_type FROM mood_entries WHERE date = ? ORDER BY created_at DESC LIMIT 1',
        [dateStr]
      );
      const symptomRows = await db.getAllAsync<{ symptom_name: string }>(
        'SELECT symptom_name FROM symptoms WHERE date = ?',
        [dateStr]
      );
      const logRow = await db.getFirstAsync<{ water_intake_ml: number; notes: string }>(
        'SELECT water_intake_ml, notes FROM daily_logs WHERE date = ?',
        [dateStr]
      );

      setSelectedDateDetails({
        periodFlow: periodDay?.flow,
        mood: moodRow?.mood_type,
        symptoms: symptomRows.map((s) => s.symptom_name),
        water: logRow?.water_intake_ml,
        notes: logRow?.notes,
      });
    } catch (err) {
      console.warn('Error loading calendar data:', err);
    }
  }, [selectedDate]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const prevMonth = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const nextMonth = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const jumpToToday = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    const now = new Date();
    setCurrentMonth(now);
    setSelectedDate(now);
  };

  const handleSelectDate = (day: Date) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setSelectedDate(day);
  };

  const handleSavePeriodFlow = async (flow: string) => {
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const db = await getDatabase();
      await db.runAsync(
        `INSERT INTO period_days (id, user_id, date, flow)
         VALUES (?, 'local-princess-user', ?, ?)
         ON CONFLICT(user_id, date) DO UPDATE SET flow = excluded.flow`,
        [`p_${dateStr}`, dateStr, flow]
      );
      await loadData();
    } catch (err) {
      console.warn('Error saving period flow for calendar date:', err);
    }
  };

  const handleRemovePeriod = async () => {
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const db = await getDatabase();
      await db.runAsync('DELETE FROM period_days WHERE date = ?', [dateStr]);
      await loadData();
    } catch (err) {
      console.warn('Error removing period date:', err);
    }
  };

  // Predictions calculation
  const prediction = calculateCyclePrediction(cycles);
  const futurePredictions = predictFutureCycles(cycles, 6);
  const selectedDatePhase = getCurrentPhase(cycles, selectedDate);

  // Calendar matrix calculation
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const daysInMatrix = eachDayOfInterval({ start: startDate, end: endDate });

  const getDayStatus = (day: Date) => {
    const dayStr = format(day, 'yyyy-MM-dd');

    // 1. Logged period (Pink with flow intensity)
    if (periodDaysMap[dayStr]) {
      return {
        type: 'logged_period',
        color: colors.phases.menstrual,
        label: 'Period',
        flow: periodDaysMap[dayStr],
      };
    }

    // 2. Future predicted periods
    for (const fp of futurePredictions) {
      if (
        isWithinInterval(day, {
          start: parseISO(fp.startDate),
          end: parseISO(fp.endDate),
        })
      ) {
        return {
          type: 'predicted_period',
          color: `${colors.phases.menstrual}40`,
          label: 'Predicted Period',
        };
      }

      // Ovulation day
      if (dayStr === fp.ovulationDate) {
        return {
          type: 'ovulation',
          color: colors.phases.ovulation,
          label: 'Ovulation',
        };
      }

      // Fertile window
      if (
        isWithinInterval(day, {
          start: parseISO(fp.fertileWindowStart),
          end: parseISO(fp.fertileWindowEnd),
        })
      ) {
        return {
          type: 'fertile',
          color: `${colors.phases.luteal}35`,
          label: 'Fertile Window',
        };
      }
    }

    return null;
  };

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const isSelectedPeriod = Boolean(periodDaysMap[selectedDateStr]);
  const isViewingCurrentMonth = isSameMonth(currentMonth, new Date());

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Summary Banner */}
        <PinkCard style={styles.topSummaryCard}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Average Cycle</Text>
            <View style={styles.summaryValRow}>
              <Heart size={14} color={colors.primary} />
              <Text style={[styles.summaryVal, { color: colors.text }]}>
                {prediction.averageCycleLength}d
              </Text>
            </View>
          </View>

          <View style={[styles.summaryDivider, { backgroundColor: `${colors.primary}20` }]} />

          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Average Period</Text>
            <View style={styles.summaryValRow}>
              <Droplet size={14} color={colors.primary} />
              <Text style={[styles.summaryVal, { color: colors.text }]}>
                {prediction.averagePeriodLength}d
              </Text>
            </View>
          </View>

          <View style={[styles.summaryDivider, { backgroundColor: `${colors.primary}20` }]} />

          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Next Period</Text>
            <View style={styles.summaryValRow}>
              <Sparkles size={14} color={colors.phases.ovulation} />
              <Text style={[styles.summaryVal, { color: colors.text }]}>
                {prediction.isOverdue
                  ? `${prediction.daysOverdue}d late`
                  : prediction.daysUntilNextPeriod === 0
                  ? 'Today 💗'
                  : `In ${prediction.daysUntilNextPeriod}d`}
              </Text>
            </View>
          </View>
        </PinkCard>

        {/* Month Header Navigation */}
        <View style={styles.header}>
          <View style={styles.headerTitleGroup}>
            <Text style={[styles.monthTitle, { color: colors.text }]}>
              {format(currentMonth, 'MMMM yyyy')}
            </Text>
            {!isViewingCurrentMonth && (
              <TouchableOpacity
                onPress={jumpToToday}
                style={[styles.todayPill, { backgroundColor: colors.highlight }]}
                activeOpacity={0.75}
              >
                <Sparkles size={11} color={colors.primary} />
                <Text style={[styles.todayPillText, { color: colors.primary }]}>Today</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.navControls}>
            <TouchableOpacity
              onPress={prevMonth}
              style={[
                styles.monthNavBtn,
                { backgroundColor: colors.surfaceGlass, borderColor: colors.cardBorder },
              ]}
              activeOpacity={0.7}
            >
              <ChevronLeft size={22} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={nextMonth}
              style={[
                styles.monthNavBtn,
                { backgroundColor: colors.surfaceGlass, borderColor: colors.cardBorder },
              ]}
              activeOpacity={0.7}
            >
              <ChevronRight size={22} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Calendar Grid Card */}
        <PinkCard style={styles.calendarCard}>
          {/* Weekday Labels */}
          <View style={styles.weekDaysRow}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((wd, i) => (
              <View key={i} style={styles.weekDayCell}>
                <Text
                  style={[
                    styles.weekDayText,
                    { color: i === 0 || i === 6 ? colors.primary : colors.textMuted },
                  ]}
                >
                  {wd}
                </Text>
              </View>
            ))}
          </View>

          {/* Days Grid */}
          <View style={styles.daysGrid}>
            {daysInMatrix.map((day, idx) => {
              const status = getDayStatus(day);
              const dayStr = format(day, 'yyyy-MM-dd');
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isSelected = isSameDay(day, selectedDate);
              const isToday = isSameDay(day, new Date());
              const hasActivity = loggedActivityDates.includes(dayStr);

              return (
                <TouchableOpacity
                  key={idx}
                  onPress={() => handleSelectDate(day)}
                  style={[
                    styles.dayCell,
                    isSelected && { borderColor: colors.primary, borderWidth: 2.5 },
                    status?.type === 'logged_period' && { backgroundColor: colors.phases.menstrual },
                    status?.type === 'predicted_period' && {
                      backgroundColor: `${colors.phases.menstrual}30`,
                      borderWidth: 1,
                      borderColor: `${colors.phases.menstrual}60`,
                    },
                    status?.type === 'ovulation' && {
                      backgroundColor: colors.phases.ovulation,
                    },
                    status?.type === 'fertile' && {
                      backgroundColor: `${colors.phases.luteal}35`,
                    },
                  ]}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styles.dayText,
                      { color: isCurrentMonth ? colors.text : colors.textLight },
                      status?.type === 'logged_period' && { color: '#FFFFFF', fontWeight: '800' },
                      status?.type === 'ovulation' && { color: '#FFFFFF', fontWeight: '800' },
                      isToday && !status && { color: colors.primary, fontWeight: '800' },
                    ]}
                  >
                    {format(day, 'd')}
                  </Text>

                  {/* Flow or Ovulation Badge */}
                  {status?.type === 'logged_period' && status.flow && (
                    <Text style={styles.cellFlowEmoji}>
                      {FLOW_EMOJIS[status.flow] || '💧'}
                    </Text>
                  )}

                  {status?.type === 'ovulation' && (
                    <View style={styles.ovulationSparkle}>
                      <Sparkles size={9} color="#FFD54F" />
                    </View>
                  )}

                  {/* Activity Indicator Dot (Mood / Symptoms / Notes) */}
                  {hasActivity && status?.type !== 'logged_period' && (
                    <View
                      style={[
                        styles.activityDot,
                        { backgroundColor: status?.type ? colors.primary : colors.secondary },
                      ]}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Phase Color Legend */}
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendBox, { backgroundColor: colors.phases.menstrual }]} />
              <Text style={[styles.legendLabel, { color: colors.textMuted }]}>Period</Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[
                  styles.legendBox,
                  {
                    backgroundColor: `${colors.phases.menstrual}30`,
                    borderColor: `${colors.phases.menstrual}60`,
                    borderWidth: 1,
                  },
                ]}
              />
              <Text style={[styles.legendLabel, { color: colors.textMuted }]}>Predicted</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendBox, { backgroundColor: colors.phases.ovulation }]} />
              <Text style={[styles.legendLabel, { color: colors.textMuted }]}>Ovulation</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendBox, { backgroundColor: `${colors.phases.luteal}35` }]} />
              <Text style={[styles.legendLabel, { color: colors.textMuted }]}>Fertile</Text>
            </View>
          </View>
        </PinkCard>

        {/* Selected Date Details Card */}
        <PinkCard style={styles.detailsCard}>
          <View style={styles.detailsHeader}>
            <View style={styles.detailsHeaderLeft}>
              <View style={styles.detailsDateRow}>
                <CalendarHeart size={18} color={colors.primary} />
                <Text style={[styles.detailsDate, { color: colors.text }]}>
                  {format(selectedDate, 'EEEE, MMM d')}
                </Text>
              </View>

              {/* Day's Phase & Conception Badge */}
              <View style={styles.badgeRow}>
                <View
                  style={[
                    styles.phasePill,
                    {
                      backgroundColor: `${colors.phases[selectedDatePhase.phase]}18`,
                      borderColor: `${colors.phases[selectedDatePhase.phase]}40`,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.phasePillText,
                      { color: colors.phases[selectedDatePhase.phase] },
                    ]}
                  >
                    {selectedDatePhase.phaseName}
                  </Text>
                </View>

                <View
                  style={[
                    styles.conceptionPill,
                    {
                      backgroundColor:
                        selectedDatePhase.conceptionProbability === 'Peak' ||
                        selectedDatePhase.conceptionProbability === 'High'
                          ? '#E8F5E9'
                          : `${colors.primary}10`,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.conceptionPillText,
                      {
                        color:
                          selectedDatePhase.conceptionProbability === 'Peak' ||
                          selectedDatePhase.conceptionProbability === 'High'
                            ? '#2E7D32'
                            : colors.textMuted,
                      },
                    ]}
                  >
                    Conception: {selectedDatePhase.conceptionProbability}
                  </Text>
                </View>
              </View>
            </View>

            {/* Quick Flow / Log Button */}
            <PinkButton
              title={
                isSelectedPeriod
                  ? (selectedDateDetails.periodFlow
                      ? `${selectedDateDetails.periodFlow.charAt(0).toUpperCase() + selectedDateDetails.periodFlow.slice(1)} ✏️`
                      : 'Logged ✓')
                  : '+ Log Period 🩸'
              }
              onPress={() => {
                try {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                } catch {}
                setShowFlowModal(true);
              }}
              variant={isSelectedPeriod ? 'secondary' : 'primary'}
              style={styles.logButton}
              textStyle={{ fontSize: 13 }}
            />
          </View>

          {/* Daily Health & Lifestyle Summary List */}
          <View style={styles.detailsList}>
            {selectedDateDetails.periodFlow && (
              <View style={styles.detailRow}>
                <View style={styles.detailIconTitle}>
                  <Droplet size={15} color={colors.primary} />
                  <Text style={[styles.detailKey, { color: colors.textMuted }]}>Flow Intensity:</Text>
                </View>
                <Text style={[styles.detailVal, { color: colors.primary, fontWeight: '800' }]}>
                  {selectedDateDetails.periodFlow.charAt(0).toUpperCase() +
                    selectedDateDetails.periodFlow.slice(1)}{' '}
                  {FLOW_EMOJIS[selectedDateDetails.periodFlow]}
                </Text>
              </View>
            )}

            {selectedDateDetails.mood && (
              <View style={styles.detailRow}>
                <View style={styles.detailIconTitle}>
                  <Smile size={15} color="#FFB300" />
                  <Text style={[styles.detailKey, { color: colors.textMuted }]}>Mood:</Text>
                </View>
                <Text style={[styles.detailVal, { color: colors.text, fontWeight: '700' }]}>
                  {selectedDateDetails.mood.charAt(0).toUpperCase() +
                    selectedDateDetails.mood.slice(1)}
                </Text>
              </View>
            )}

            {selectedDateDetails.symptoms && selectedDateDetails.symptoms.length > 0 && (
              <View style={styles.detailRow}>
                <View style={styles.detailIconTitle}>
                  <Activity size={15} color={colors.secondary} />
                  <Text style={[styles.detailKey, { color: colors.textMuted }]}>Symptoms:</Text>
                </View>
                <Text style={[styles.detailVal, { color: colors.text, fontWeight: '600', flex: 1, textAlign: 'right' }]}>
                  {selectedDateDetails.symptoms.join(', ')}
                </Text>
              </View>
            )}

            {selectedDateDetails.water !== undefined && selectedDateDetails.water > 0 && (
              <View style={styles.detailRow}>
                <View style={styles.detailIconTitle}>
                  <Droplet size={15} color="#29B6F6" />
                  <Text style={[styles.detailKey, { color: colors.textMuted }]}>Water Intake:</Text>
                </View>
                <Text style={[styles.detailVal, { color: colors.text, fontWeight: '700' }]}>
                  {selectedDateDetails.water} ml 💧
                </Text>
              </View>
            )}

            {selectedDateDetails.notes && (
              <View style={styles.detailRow}>
                <View style={styles.detailIconTitle}>
                  <FileText size={15} color={colors.primary} />
                  <Text style={[styles.detailKey, { color: colors.textMuted }]}>Journal:</Text>
                </View>
                <Text style={[styles.detailVal, { color: colors.text, fontStyle: 'italic', flex: 1, textAlign: 'right' }]}>
                  "{selectedDateDetails.notes}"
                </Text>
              </View>
            )}
          </View>

          {/* Daily Phase Tip Quote */}
          <View style={[styles.phaseTipCard, { backgroundColor: `${colors.primary}08` }]}>
            <Flower2 size={15} color={colors.primary} style={{ marginTop: 2 }} />
            <Text style={[styles.phaseTipText, { color: colors.text }]}>
              {selectedDatePhase.tip}
            </Text>
          </View>

          {/* Full Tracking Action */}
          <TouchableOpacity
            style={[styles.fullLogBtn, { borderColor: colors.primary }]}
            onPress={() => router.push('/(tabs)/track')}
            activeOpacity={0.8}
          >
            <Plus size={16} color={colors.primary} />
            <Text style={[styles.fullLogBtnText, { color: colors.primary }]}>
              Log Mood, Symptoms & Journal
            </Text>
          </TouchableOpacity>
        </PinkCard>

        {/* Disclaimer */}
        <Text style={[styles.disclaimerText, { color: colors.textLight }]}>
          {MEDICAL_DISCLAIMER}
        </Text>
      </ScrollView>

      {/* Menstrual Flow Selection Dialog */}
      <FlowSelectionModal
        visible={showFlowModal}
        date={selectedDate}
        initialFlow={selectedDateDetails.periodFlow}
        isAlreadyLogged={isSelectedPeriod}
        onSelectFlow={handleSavePeriodFlow}
        onRemovePeriod={handleRemovePeriod}
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
    paddingHorizontal: 18,
  },
  topSummaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  summaryValRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  summaryVal: {
    fontSize: 14,
    fontWeight: '800',
  },
  summaryDivider: {
    width: 1,
    height: 28,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  todayPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  todayPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  navControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  monthNavBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  calendarCard: {
    padding: 14,
    marginBottom: 16,
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  weekDayCell: {
    width: (SCREEN_WIDTH - 68) / 7,
    alignItems: 'center',
  },
  weekDayText: {
    textAlign: 'center',
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 0.2,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: (SCREEN_WIDTH - 68) / 7,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 23,
    marginVertical: 2,
    position: 'relative',
  },
  dayText: {
    fontSize: 14,
    fontWeight: '600',
  },
  cellFlowEmoji: {
    fontSize: 8,
    position: 'absolute',
    bottom: 3,
  },
  ovulationSparkle: {
    position: 'absolute',
    top: 2,
    right: 4,
  },
  activityDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    position: 'absolute',
    bottom: 4,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 79, 163, 0.12)',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendBox: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  detailsCard: {
    padding: 16,
    marginBottom: 14,
  },
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  detailsHeaderLeft: {
    flex: 1,
    paddingRight: 10,
  },
  detailsDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  detailsDate: {
    fontSize: 16,
    fontWeight: '800',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  phasePill: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  phasePillText: {
    fontSize: 10.5,
    fontWeight: '800',
  },
  conceptionPill: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  conceptionPillText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  logButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  detailsList: {
    gap: 8,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 79, 163, 0.12)',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailIconTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailKey: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  detailVal: {
    fontSize: 13,
  },
  phaseTipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 10,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 12,
  },
  phaseTipText: {
    fontSize: 12,
    lineHeight: 16,
    flex: 1,
    fontWeight: '500',
  },
  fullLogBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    backgroundColor: 'rgba(255, 79, 163, 0.05)',
  },
  fullLogBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  disclaimerText: {
    fontSize: 10.5,
    textAlign: 'center',
    lineHeight: 14,
    paddingHorizontal: 16,
    marginTop: 4,
  },
});
