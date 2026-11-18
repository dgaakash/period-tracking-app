import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../context/ThemeContext';
import { PinkCard } from '../../components/common/PinkCard';
import { PinkButton } from '../../components/common/PinkButton';
import { getDatabase } from '../../db/sqlite';
import { exportDataAsCSV, exportDataAsJSON } from '../../services/dataExport';
import {
  CycleRecord,
  calculateCycleAverages,
} from '../../services/cycleEngine';
import Svg, { Rect, Line, Circle, Text as SvgText } from 'react-native-svg';
import {
  BarChart2,
  TrendingUp,
  Download,
  Share2,
  Calendar,
  Sparkles,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

type FilterRange = '1M' | '3M' | '6M' | '12M' | 'ALL';

export default function InsightsScreen() {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<FilterRange>('6M');

  const [cycles, setCycles] = useState<CycleRecord[]>([]);
  const [moodCounts, setMoodCounts] = useState<Record<string, number>>({});
  const [crampsTrend, setCrampsTrend] = useState<{ date: string; severity: number }[]>([]);
  const [sleepAvg, setSleepAvg] = useState<number>(0);
  const [energyAvg, setEnergyAvg] = useState<number>(0);

  const loadAnalytics = useCallback(async () => {
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

      // Mood frequency
      const moods = await db.getAllAsync<{ mood_type: string; count: number }>(
        'SELECT mood_type, count(*) as count FROM mood_entries GROUP BY mood_type ORDER BY count DESC LIMIT 5'
      );
      const mMap: Record<string, number> = {};
      for (const m of moods) {
        mMap[m.mood_type] = m.count;
      }
      setMoodCounts(mMap);

      // Cramps trend
      const cramps = await db.getAllAsync<{ date: string; severity: number }>(
        `SELECT date, severity FROM symptoms WHERE symptom_name = 'Cramps' ORDER BY date ASC LIMIT 7`
      );
      setCrampsTrend(cramps);

      // Sleep & Energy averages
      const avgRow = await db.getFirstAsync<{ avg_sleep: number; avg_energy: number }>(
        'SELECT avg(sleep_hours) as avg_sleep, avg(energy_level) as avg_energy FROM daily_logs'
      );
      if (avgRow) {
        setSleepAvg(Math.round((avgRow.avg_sleep || 0) * 10) / 10);
        setEnergyAvg(Math.round((avgRow.avg_energy || 0) * 10) / 10);
      }
    } catch (err) {
      console.warn('Error loading insights data:', err);
    }
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const { averageCycleLength, averagePeriodLength, isIrregular, standardDeviation } =
    calculateCycleAverages(cycles);

  // Cycle extremes
  const validLengths = cycles
    .map((c) => c.cycleLength)
    .filter((l): l is number => typeof l === 'number' && l > 0);
  const shortestCycle = validLengths.length > 0 ? Math.min(...validLengths) : averageCycleLength;
  const longestCycle = validLengths.length > 0 ? Math.max(...validLengths) : averageCycleLength;

  const handleExportCSV = async () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const csvData = await exportDataAsCSV();
      await Share.share({
        title: 'Barbie Period Tracker - Health Export (CSV)',
        message: csvData,
      });
    } catch (err: any) {
      Alert.alert('Export Error', err?.message || 'Could not export CSV');
    }
  };

  const handleExportJSON = async () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const jsonData = await exportDataAsJSON();
      await Share.share({
        title: 'Barbie Period Tracker - Full Backup (JSON)',
        message: jsonData,
      });
    } catch (err: any) {
      Alert.alert('Export Error', err?.message || 'Could not export backup');
    }
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
        <Text style={[styles.screenTitle, { color: colors.text }]}>
          Analytics & Health Insights 📊
        </Text>
        <Text style={[styles.screenSubtitle, { color: colors.textMuted }]}>
          Biological patterns calculated directly from your logged cycles
        </Text>

        {/* Date Filter Pills */}
        <View style={styles.filterRow}>
          {(['1M', '3M', '6M', '12M', 'ALL'] as FilterRange[]).map((f) => (
            <TouchableOpacity
              key={f}
              onPress={() => {
                try {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                } catch {}
                setFilter(f);
              }}
              style={[
                styles.filterBtn,
                filter === f && { backgroundColor: colors.primary },
              ]}
            >
              <Text
                style={[
                  styles.filterBtnText,
                  { color: filter === f ? '#FFFFFF' : colors.textMuted },
                ]}
              >
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Key Cycle Metrics Cards */}
        <View style={styles.statGrid}>
          <PinkCard style={styles.statCard}>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Average Cycle</Text>
            <Text style={[styles.statValue, { color: colors.primary }]}>{averageCycleLength} days</Text>
            <Text style={[styles.statSub, { color: colors.textLight }]}>
              {isIrregular ? 'Variation > 7 days' : 'Regular rhythm'}
            </Text>
          </PinkCard>

          <PinkCard style={styles.statCard}>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Avg. Period</Text>
            <Text style={[styles.statValue, { color: colors.secondary }]}>{averagePeriodLength} days</Text>
            <Text style={[styles.statSub, { color: colors.textLight }]}>Bleeding duration</Text>
          </PinkCard>
        </View>

        <View style={styles.statGrid}>
          <PinkCard style={styles.statCard}>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Shortest Cycle</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{shortestCycle} days</Text>
            <Text style={[styles.statSub, { color: colors.textLight }]}>Recorded minimum</Text>
          </PinkCard>

          <PinkCard style={styles.statCard}>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Longest Cycle</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{longestCycle} days</Text>
            <Text style={[styles.statSub, { color: colors.textLight }]}>Recorded maximum</Text>
          </PinkCard>
        </View>

        {/* Cycle Length History SVG Chart */}
        <PinkCard style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <BarChart2 size={18} color={colors.primary} />
            <Text style={[styles.chartTitle, { color: colors.text }]}>
              Cycle Lengths (Recent Cycles)
            </Text>
          </View>

          {cycles.length > 0 ? (
            <View style={styles.svgContainer}>
              <Svg width={300} height={140}>
                {/* Horizontal guide lines */}
                <Line x1={20} y1={20} x2={280} y2={20} stroke="#FFE0ED" strokeDasharray="4 4" />
                <Line x1={20} y1={70} x2={280} y2={70} stroke="#FFE0ED" strokeDasharray="4 4" />
                <Line x1={20} y1={120} x2={280} y2={120} stroke="#FFE0ED" strokeDasharray="4 4" />

                {/* Bars for recent cycles */}
                {cycles.slice(0, 5).map((c, idx) => {
                  const len = c.cycleLength || averageCycleLength;
                  const barHeight = Math.min(100, Math.max(20, (len / 45) * 100));
                  const x = 40 + idx * 50;
                  const y = 120 - barHeight;

                  return (
                    <React.Fragment key={idx}>
                      <Rect
                        x={x}
                        y={y}
                        width={28}
                        height={barHeight}
                        rx={6}
                        fill={idx === 0 ? colors.primary : colors.secondary}
                      />
                      <SvgText
                        x={x + 14}
                        y={y - 6}
                        fontSize={10}
                        fontWeight="bold"
                        fill={colors.text}
                        textAnchor="middle"
                      >
                        {len}d
                      </SvgText>
                      <SvgText
                        x={x + 14}
                        y={134}
                        fontSize={9}
                        fill={colors.textMuted}
                        textAnchor="middle"
                      >
                        C{cycles.length - idx}
                      </SvgText>
                    </React.Fragment>
                  );
                })}
              </Svg>
            </View>
          ) : (
            <Text style={[styles.emptyChartText, { color: colors.textMuted }]}>
              Log at least 2 complete cycles to visualize your custom cycle length trends! 🌸
            </Text>
          )}
        </PinkCard>

        {/* Cramp Severity Pattern Chart */}
        <PinkCard style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <TrendingUp size={18} color="#FF6B8B" />
            <Text style={[styles.chartTitle, { color: colors.text }]}>
              Cramps Severity Trend (1-10)
            </Text>
          </View>

          {crampsTrend.length > 0 ? (
            <View style={styles.svgContainer}>
              <Svg width={300} height={120}>
                {crampsTrend.map((c, idx) => {
                  const x = 30 + idx * 40;
                  const y = 100 - (c.severity / 10) * 80;
                  return (
                    <React.Fragment key={idx}>
                      <Circle cx={x} cy={y} r={5} fill="#FF6B8B" />
                      <SvgText
                        x={x}
                        y={y - 8}
                        fontSize={10}
                        fontWeight="bold"
                        fill="#FF6B8B"
                        textAnchor="middle"
                      >
                        {c.severity}
                      </SvgText>
                    </React.Fragment>
                  );
                })}
              </Svg>
            </View>
          ) : (
            <Text style={[styles.emptyChartText, { color: colors.textMuted }]}>
              No cramps logged yet. When cramps occur, log severity in the Track tab! ✨
            </Text>
          )}
        </PinkCard>

        {/* Mood Distribution */}
        <PinkCard style={styles.chartCard}>
          <Text style={[styles.chartTitle, { color: colors.text, marginBottom: 12 }]}>
            Top Emotional Moods Logged
          </Text>
          {Object.keys(moodCounts).length > 0 ? (
            <View style={styles.moodRows}>
              {Object.entries(moodCounts).map(([mood, count]) => (
                <View key={mood} style={styles.moodRow}>
                  <Text style={[styles.moodName, { color: colors.text }]}>{mood}</Text>
                  <View style={styles.moodBarTrack}>
                    <View
                      style={[
                        styles.moodBarFill,
                        {
                          backgroundColor: colors.primary,
                          width: `${Math.min(100, count * 25)}%`,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.moodCount, { color: colors.textMuted }]}>
                    {count} {count === 1 ? 'time' : 'times'}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={[styles.emptyChartText, { color: colors.textMuted }]}>
              Log your mood daily to see your emotional pattern distribution! 💗
            </Text>
          )}
        </PinkCard>

        {/* Sleep & Energy Averages */}
        <PinkCard style={styles.statCardWide}>
          <View style={styles.statWideRow}>
            <View>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Average Sleep</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {sleepAvg > 0 ? `${sleepAvg} hours/night` : 'Not logged yet'}
              </Text>
            </View>
            <View>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Average Energy</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {energyAvg > 0 ? `${energyAvg} / 10` : 'Not logged yet'}
              </Text>
            </View>
          </View>
        </PinkCard>

        {/* Report Export Buttons */}
        <Text style={[styles.chartTitle, { color: colors.text, marginTop: 14, marginBottom: 10 }]}>
          Data & Doctor's Reports Export
        </Text>

        <View style={styles.exportButtons}>
          <PinkButton
            title="Export CSV Health Report"
            onPress={handleExportCSV}
            icon={<Download size={18} color="#FFFFFF" />}
            style={{ flex: 1 }}
          />
          <PinkButton
            title="Full Backup (JSON)"
            onPress={handleExportJSON}
            variant="outline"
            icon={<Share2 size={18} color={colors.primary} />}
            style={{ flex: 1 }}
          />
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
  screenTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  screenSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 16,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 4,
    borderWidth: 1,
    borderColor: '#FFE0ED',
  },
  filterBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  filterBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    padding: 14,
  },
  statCardWide: {
    padding: 16,
    marginBottom: 14,
  },
  statWideRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 4,
  },
  statSub: {
    fontSize: 11,
    marginTop: 2,
  },
  chartCard: {
    padding: 16,
    marginBottom: 14,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  chartTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  svgContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 6,
  },
  emptyChartText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    paddingVertical: 14,
  },
  moodRows: {
    gap: 10,
  },
  moodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  moodName: {
    width: 80,
    fontSize: 13,
    fontWeight: '600',
  },
  moodBarTrack: {
    flex: 1,
    height: 10,
    backgroundColor: '#FFE4EE',
    borderRadius: 5,
    overflow: 'hidden',
  },
  moodBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  moodCount: {
    width: 60,
    fontSize: 11,
    textAlign: 'right',
  },
  exportButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
    marginBottom: 16,
  },
});
