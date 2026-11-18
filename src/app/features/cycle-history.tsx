import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAppTheme } from '../../context/ThemeContext';
import { PinkCard } from '../../components/common/PinkCard';
import { getDatabase } from '../../db/sqlite';
import {
  History,
  ChevronLeft,
  Calendar,
  Trash2,
  Sparkles,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { format } from 'date-fns';

interface CycleHistoryItem {
  id: string;
  start_date: string;
  end_date?: string;
  cycle_length?: number;
  period_length?: number;
  notes?: string;
}

export default function CycleHistoryScreen() {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  const [history, setHistory] = useState<CycleHistoryItem[]>([]);

  const loadHistory = useCallback(async () => {
    try {
      const db = await getDatabase();
      const rows = await db.getAllAsync<CycleHistoryItem>(
        'SELECT * FROM menstrual_cycles ORDER BY start_date DESC'
      );
      setHistory(rows);
    } catch (err) {
      console.warn('Error loading history:', err);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleDelete = (id: string) => {
    Alert.alert('Delete Cycle?', 'Are you sure you want to remove this cycle entry?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            const db = await getDatabase();
            await db.runAsync('DELETE FROM menstrual_cycles WHERE id = ?', [id]);
            await loadHistory();
          } catch (err) {
            console.warn('Error deleting cycle:', err);
          }
        },
      },
    ]);
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
          <View style={[styles.iconBox, { backgroundColor: '#FCE4EC' }]}>
            <History size={32} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>
            Menstrual Cycle History 🌸
          </Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            All past recorded cycles, bleeding durations, and historical notes
          </Text>
        </View>

        {/* History List */}
        <View style={styles.list}>
          {history.length > 0 ? (
            history.map((c, i) => (
              <PinkCard key={c.id} style={styles.cycleCard}>
                <View style={styles.cycleTop}>
                  <View>
                    <Text style={[styles.cycleStart, { color: colors.text }]}>
                      {c.start_date ? format(new Date(c.start_date), 'MMMM d, yyyy') : ''}
                    </Text>
                    <Text style={[styles.cycleEnd, { color: colors.textMuted }]}>
                      {c.end_date ? `Ended: ${format(new Date(c.end_date), 'MMMM d, yyyy')}` : 'Ongoing Cycle'}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => handleDelete(c.id)}>
                    <Trash2 size={16} color="#FF6B8B" />
                  </TouchableOpacity>
                </View>

                <View style={styles.badgeRow}>
                  {c.cycle_length ? (
                    <Text style={[styles.badge, { backgroundColor: '#FFF0F6', color: colors.primary }]}>
                      Cycle: {c.cycle_length} Days
                    </Text>
                  ) : null}
                  {c.period_length ? (
                    <Text style={[styles.badge, { backgroundColor: '#F3E5F5', color: '#AB47BC' }]}>
                      Period: {c.period_length} Days
                    </Text>
                  ) : null}
                </View>

                {c.notes ? (
                  <Text style={[styles.cycleNotes, { color: colors.text }]}>
                    "{c.notes}"
                  </Text>
                ) : null}
              </PinkCard>
            ))
          ) : (
            <PinkCard style={styles.emptyCard}>
              <Sparkles size={28} color={colors.primary} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                No Past Cycles Logged Yet
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
                As you log periods in the Calendar and Track tab, your full menstrual timeline will appear here.
              </Text>
            </PinkCard>
          )}
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
  list: {
    gap: 12,
    marginBottom: 20,
  },
  cycleCard: {
    padding: 16,
  },
  cycleTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cycleStart: {
    fontSize: 16,
    fontWeight: '800',
  },
  cycleEnd: {
    fontSize: 12,
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  badge: {
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  cycleNotes: {
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 6,
    lineHeight: 18,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 30,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});
