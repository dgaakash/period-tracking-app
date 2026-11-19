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
import { ChevronLeft, ChevronRight, Sparkles, Plus, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function CalendarScreen() {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [cycles, setCycles] = useState<CycleRecord[]>([]);
  const [loggedPeriodDays, setLoggedPeriodDays] = useState<string[]>([]);
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

      const periodDaysRows = await db.getAllAsync<{ date: string }>(
        'SELECT date FROM period_days'
      );
      setLoggedPeriodDays(periodDaysRows.map((p) => p.date));

      // Load details for selected date
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const periodDay = await db.getFirstAsync<{ flow: string }>(
        'SELECT flow FROM period_days WHERE date = ?',
        [dateStr]
      );
      const moodRow = await db.getFirstAsync<{ mood_type: string }>(
        'SELECT mood_type FROM mood_entries WHERE date = ?',
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

  // Calendar matrix calculation
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const daysInMatrix = eachDayOfInterval({ start: startDate, end: endDate });

  const getDayStatus = (day: Date) => {
    const dayStr = format(day, 'yyyy-MM-dd');

    // 1. Logged period (Pink/Red)
    if (loggedPeriodDays.includes(dayStr)) {
      return { type: 'logged_period', color: colors.phases.menstrual, label: 'Period' };
    }

    // 2. Future predicted periods
    for (const fp of futurePredictions) {
      if (
        isWithinInterval(day, {
          start: parseISO(fp.startDate),
          end: parseISO(fp.endDate),
        })
      ) {
        return { type: 'predicted_period', color: `${colors.phases.menstrual}80`, label: 'Predicted Period' };
      }

      // Ovulation day
      if (dayStr === fp.ovulationDate) {
        return { type: 'ovulation', color: colors.phases.ovulation, label: 'Ovulation' };
      }

      // Fertile window
      if (
        isWithinInterval(day, {
          start: parseISO(fp.fertileWindowStart),
          end: parseISO(fp.fertileWindowEnd),
        })
      ) {
        return { type: 'fertile', color: colors.phases.luteal, label: 'Fertile Window' };
      }
    }

    return null;
  };

  const isSelectedPeriod = loggedPeriodDays.includes(format(selectedDate, 'yyyy-MM-dd'));

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Month Header Navigation */}
        <View style={styles.header}>
          <TouchableOpacity onPress={prevMonth} style={styles.monthNavBtn}>
            <ChevronLeft size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.monthTitle, { color: colors.text }]}>
            {format(currentMonth, 'MMMM yyyy')}
          </Text>
          <TouchableOpacity onPress={nextMonth} style={styles.monthNavBtn}>
            <ChevronRight size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Calendar Grid Card */}
        <PinkCard style={styles.calendarCard}>
          {/* Weekday Labels */}
          <View style={styles.weekDaysRow}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((wd, i) => (
              <Text key={i} style={[styles.weekDayText, { color: colors.textMuted }]}>
                {wd}
              </Text>
            ))}
          </View>

          {/* Days Grid */}
          <View style={styles.daysGrid}>
            {daysInMatrix.map((day, idx) => {
              const status = getDayStatus(day);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isSelected = isSameDay(day, selectedDate);
              const isToday = isSameDay(day, new Date());

              return (
                <TouchableOpacity
                  key={idx}
                  onPress={() => handleSelectDate(day)}
                  style={[
                    styles.dayCell,
                    isSelected && { borderColor: colors.primary, borderWidth: 2 },
                    status?.type === 'logged_period' && { backgroundColor: colors.phases.menstrual },
                    status?.type === 'predicted_period' && { backgroundColor: `${colors.phases.menstrual}35` },
                    status?.type === 'ovulation' && { backgroundColor: `${colors.phases.ovulation}40` },
                    status?.type === 'fertile' && { backgroundColor: `${colors.phases.luteal}30` },
                  ]}
                >
                  <Text
                    style={[
                      styles.dayText,
                      { color: isCurrentMonth ? colors.text : colors.textLight },
                      status?.type === 'logged_period' && { color: '#FFFFFF', fontWeight: '800' },
                      isToday && !status && { color: colors.primary, fontWeight: '800' },
                    ]}
                  >
                    {format(day, 'd')}
                  </Text>
                  {status?.type === 'ovulation' && (
                    <View style={[styles.ovulationDot, { backgroundColor: colors.phases.ovulation }]} />
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
              <View style={[styles.legendBox, { backgroundColor: `${colors.phases.menstrual}40` }]} />
              <Text style={[styles.legendLabel, { color: colors.textMuted }]}>Predicted</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendBox, { backgroundColor: colors.phases.ovulation }]} />
              <Text style={[styles.legendLabel, { color: colors.textMuted }]}>Ovulation</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendBox, { backgroundColor: colors.phases.luteal }]} />
              <Text style={[styles.legendLabel, { color: colors.textMuted }]}>Fertile</Text>
            </View>
          </View>
        </PinkCard>

        {/* Selected Date Details Card */}
        <PinkCard style={styles.detailsCard}>
          <View style={styles.detailsHeader}>
            <View>
              <Text style={[styles.detailsDate, { color: colors.text }]}>
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </Text>
              <Text style={[styles.detailsSub, { color: colors.primary }]}>
                {isSelectedPeriod
                  ? (selectedDateDetails.periodFlow
                      ? `Period logged (${selectedDateDetails.periodFlow.charAt(0).toUpperCase() + selectedDateDetails.periodFlow.slice(1)})`
                      : 'Period bleeding logged')
                  : 'No period bleeding logged'}
              </Text>
            </View>
            <PinkButton
              title={
                isSelectedPeriod
                  ? (selectedDateDetails.periodFlow
                      ? `${selectedDateDetails.periodFlow.charAt(0).toUpperCase() + selectedDateDetails.periodFlow.slice(1)} ✏️`
                      : 'Logged ✓')
                  : '+ Log Period'
              }
              onPress={() => {
                try {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                } catch {}
                setShowFlowModal(true);
              }}
              variant={isSelectedPeriod ? 'outline' : 'primary'}
              style={{ paddingVertical: 8, paddingHorizontal: 14 }}
              textStyle={{ fontSize: 13 }}
            />
          </View>

          {/* Logged details summary */}
          <View style={styles.detailsList}>
            {selectedDateDetails.periodFlow && (
              <View style={styles.detailRow}>
                <Text style={[styles.detailKey, { color: colors.textMuted }]}>Flow Intensity:</Text>
                <Text style={[styles.detailVal, { color: colors.primary, fontWeight: '700' }]}>
                  {selectedDateDetails.periodFlow.charAt(0).toUpperCase() + selectedDateDetails.periodFlow.slice(1)}
                </Text>
              </View>
            )}
            {selectedDateDetails.mood && (
              <View style={styles.detailRow}>
                <Text style={[styles.detailKey, { color: colors.textMuted }]}>Mood:</Text>
                <Text style={[styles.detailVal, { color: colors.text }]}>{selectedDateDetails.mood}</Text>
              </View>
            )}

            {selectedDateDetails.symptoms && selectedDateDetails.symptoms.length > 0 && (
              <View style={styles.detailRow}>
                <Text style={[styles.detailKey, { color: colors.textMuted }]}>Symptoms:</Text>
                <Text style={[styles.detailVal, { color: colors.text }]}>
                  {selectedDateDetails.symptoms.join(', ')}
                </Text>
              </View>
            )}

            {selectedDateDetails.water !== undefined && (
              <View style={styles.detailRow}>
                <Text style={[styles.detailKey, { color: colors.textMuted }]}>Water:</Text>
                <Text style={[styles.detailVal, { color: colors.text }]}>{selectedDateDetails.water} ml</Text>
              </View>
            )}

            {selectedDateDetails.notes && (
              <View style={styles.detailRow}>
                <Text style={[styles.detailKey, { color: colors.textMuted }]}>Notes:</Text>
                <Text style={[styles.detailVal, { color: colors.text }]}>{selectedDateDetails.notes}</Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={[styles.fullLogBtn, { borderColor: colors.primary }]}
            onPress={() => router.push('/(tabs)/track')}
          >
            <Plus size={16} color={colors.primary} />
            <Text style={[styles.fullLogBtnText, { color: colors.primary }]}>
              Log Mood, Symptoms & Wellness for Today
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
        isAlreadyLogged={Boolean(selectedDateDetails.periodFlow)}
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
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  monthNavBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarCard: {
    padding: 16,
    marginBottom: 16,
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  weekDayText: {
    width: (SCREEN_WIDTH - 72) / 7,
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 13,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: (SCREEN_WIDTH - 72) / 7,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    marginVertical: 2,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '600',
  },
  ovulationDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 2,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#FFE0ED',
    paddingTop: 14,
    marginTop: 14,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendBox: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  detailsCard: {
    padding: 18,
    marginBottom: 16,
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  detailsDate: {
    fontSize: 16,
    fontWeight: '800',
  },
  detailsSub: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  detailsList: {
    gap: 8,
    marginBottom: 14,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailKey: {
    fontSize: 13,
    fontWeight: '600',
  },
  detailVal: {
    fontSize: 13,
    fontWeight: '700',
  },
  fullLogBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 20,
    marginTop: 4,
  },
  fullLogBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  disclaimerText: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
});
