import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAppTheme } from '../../context/ThemeContext';
import { PinkCard } from '../../components/common/PinkCard';
import { PinkButton } from '../../components/common/PinkButton';
import { getDatabase } from '../../db/sqlite';
import { queueOperation } from '../../db/syncEngine';
import {
  Heart,
  Smile,
  ChevronLeft,
  Sparkles,
  Zap,
  BookOpen,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { format } from 'date-fns';

const CHECKIN_MOODS = [
  { name: 'Happy', emoji: '😊', desc: 'Content and radiant' },
  { name: 'Sensitive', emoji: '🌸', desc: 'Tender & emotional' },
  { name: 'Calm', emoji: '😌', desc: 'Peaceful & grounded' },
  { name: 'Irritated', emoji: '😠', desc: 'Short fuse today' },
  { name: 'Emotional', emoji: '🥺', desc: 'Need extra cuddles' },
  { name: 'Fatigued', emoji: '😴', desc: 'Low battery mode' },
];

export default function EmotionalCheckinScreen() {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const [selectedMood, setSelectedMood] = useState<string>('Calm');
  const [energy, setEnergy] = useState<number>(7);
  const [stress, setStress] = useState<number>(3);
  const [note, setNote] = useState<string>('');
  const [history, setHistory] = useState<any[]>([]);

  const loadHistory = useCallback(async () => {
    try {
      const db = await getDatabase();
      const rows = await db.getAllAsync<any>(
        'SELECT * FROM mood_entries ORDER BY date DESC LIMIT 7'
      );
      setHistory(rows);
    } catch (err) {
      console.warn('Error loading mood history:', err);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleSaveCheckin = async () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const db = await getDatabase();
      const defaultUserId = 'local-princess-user';

      const moodPayload = {
        id: `mood_${todayStr}`,
        user_id: defaultUserId,
        date: todayStr,
        mood_type: selectedMood,
        intensity: energy,
        notes: note.trim(),
      };

      await db.runAsync(
        `INSERT INTO mood_entries (id, user_id, date, mood_type, intensity, notes)
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET mood_type = excluded.mood_type, notes = excluded.notes`,
        [moodPayload.id, moodPayload.user_id, moodPayload.date, moodPayload.mood_type, moodPayload.intensity, moodPayload.notes]
      );
      await queueOperation('mood_entries', moodPayload.id, 'INSERT', moodPayload);

      // Also update daily log with stress & energy
      await db.runAsync(
        `INSERT INTO daily_logs (id, user_id, date, energy_level, stress_level, notes)
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(user_id, date) DO UPDATE SET
          energy_level = excluded.energy_level,
          stress_level = excluded.stress_level,
          notes = excluded.notes`,
        [`log_${todayStr}`, defaultUserId, todayStr, energy, stress, note.trim()]
      );

      await loadHistory();
      Alert.alert('Checked in with Love! 💗', 'Your emotions are safe, valid, and cherished.');
      router.back();
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Could not save checkin');
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
          <View style={[styles.iconBox, { backgroundColor: '#F3E5F5' }]}>
            <Heart size={32} color="#AB47BC" />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>
            How are you feeling today, Princess? 💗
          </Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Take a gentle breath. There are no wrong feelings in your safe pink sanctuary.
          </Text>
        </View>

        {/* Mood Cards Grid */}
        <View style={styles.moodGrid}>
          {CHECKIN_MOODS.map((m) => {
            const isSelected = selectedMood === m.name;
            return (
              <TouchableOpacity
                key={m.name}
                onPress={() => {
                  try {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  } catch {}
                  setSelectedMood(m.name);
                }}
                style={[
                  styles.moodCard,
                  { borderColor: colors.border, backgroundColor: colors.surface },
                  isSelected && { borderColor: colors.primary, borderWidth: 2, backgroundColor: `${colors.primary}10` },
                ]}
              >
                <Text style={styles.moodEmoji}>{m.emoji}</Text>
                <Text style={[styles.moodName, { color: colors.text }]}>{m.name}</Text>
                <Text style={[styles.moodDesc, { color: colors.textMuted }]}>{m.desc}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Energy Scale */}
        <PinkCard style={styles.sliderCard}>
          <View style={styles.sliderHeader}>
            <Zap size={18} color="#FFB300" />
            <Text style={[styles.sliderTitle, { color: colors.text }]}>
              Current Vitality: <Text style={{ color: colors.primary, fontWeight: '800' }}>{energy}/10</Text>
            </Text>
          </View>
          <View style={styles.scaleRow}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <TouchableOpacity
                key={num}
                onPress={() => setEnergy(num)}
                style={[
                  styles.scaleBtn,
                  energy === num && { backgroundColor: colors.primary },
                ]}
              >
                <Text
                  style={[
                    styles.scaleText,
                    { color: energy === num ? '#FFFFFF' : colors.text },
                  ]}
                >
                  {num}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </PinkCard>

        {/* Private Heart-to-Heart Note */}
        <PinkCard style={styles.noteCard}>
          <Text style={[styles.noteTitle, { color: colors.text }]}>
            What's on your heart right now? 🧸
          </Text>
          <TextInput
            multiline
            numberOfLines={4}
            value={note}
            onChangeText={setNote}
            placeholder="Write freely. Anything you want to let out..."
            placeholderTextColor={colors.textLight}
            style={[styles.noteInput, { borderColor: colors.border, color: colors.text }]}
          />
        </PinkCard>

        <PinkButton
          title="Complete Check-in 💗"
          onPress={handleSaveCheckin}
          style={{ marginTop: 10, marginBottom: 20 }}
        />

        {/* Previous Reflections History */}
        {history.length > 0 && (
          <View style={styles.historySection}>
            <Text style={[styles.historyTitle, { color: colors.text }]}>
              Recent Emotional Reflections
            </Text>
            {history.map((h, i) => (
              <PinkCard key={i} style={styles.historyItem}>
                <View style={styles.historyRow}>
                  <Text style={[styles.historyDate, { color: colors.textMuted }]}>
                    {h.date ? format(new Date(h.date), 'MMM d, yyyy') : ''}
                  </Text>
                  <Text style={[styles.historyMood, { color: colors.primary }]}>
                    {h.mood_type}
                  </Text>
                </View>
                {h.notes ? (
                  <Text style={[styles.historyNote, { color: colors.text }]}>
                    "{h.notes}"
                  </Text>
                ) : null}
              </PinkCard>
            ))}
          </View>
        )}
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
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  moodCard: {
    width: '48%',
    padding: 14,
    borderRadius: 18,
    alignItems: 'center',
    borderWidth: 1,
  },
  moodEmoji: {
    fontSize: 32,
    marginBottom: 6,
  },
  moodName: {
    fontSize: 15,
    fontWeight: '800',
  },
  moodDesc: {
    fontSize: 11,
    marginTop: 2,
  },
  sliderCard: {
    padding: 16,
    marginBottom: 14,
  },
  sliderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  sliderTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  scaleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scaleBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
  },
  scaleText: {
    fontSize: 11,
    fontWeight: '700',
  },
  noteCard: {
    padding: 16,
    marginBottom: 14,
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  noteInput: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  historySection: {
    gap: 10,
    marginBottom: 20,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  historyItem: {
    padding: 12,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  historyDate: {
    fontSize: 12,
    fontWeight: '600',
  },
  historyMood: {
    fontSize: 12,
    fontWeight: '800',
  },
  historyNote: {
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 18,
  },
});
