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
import { useAppTheme } from '../../context/ThemeContext';
import { PinkCard } from '../../components/common/PinkCard';
import { PinkButton } from '../../components/common/PinkButton';
import { getDatabase } from '../../db/sqlite';
import { queueOperation } from '../../db/syncEngine';
import { format } from 'date-fns';
import * as Haptics from 'expo-haptics';
import {
  Smile,
  Activity,
  Droplet,
  Moon,
  Pill,
  Thermometer,
  FileText,
  Check,
  Plus,
} from 'lucide-react-native';

const MOODS = [
  { name: 'Happy', emoji: '😊' },
  { name: 'Sad', emoji: '😢' },
  { name: 'Irritated', emoji: '😠' },
  { name: 'Anxious', emoji: '😰' },
  { name: 'Emotional', emoji: '🥺' },
  { name: 'Calm', emoji: '😌' },
  { name: 'Excited', emoji: '🤩' },
  { name: 'Stressed', emoji: '😫' },
  { name: 'Sensitive', emoji: '🌸' },
  { name: 'Energetic', emoji: '⚡' },
  { name: 'Low mood', emoji: '🌧️' },
];

const PHYSICAL_SYMPTOMS = [
  { name: 'Cramps', emoji: '⚡' },
  { name: 'Headaches', emoji: '🤕' },
  { name: 'Migraines', emoji: '💥' },
  { name: 'Back pain', emoji: '🥀' },
  { name: 'Bloating', emoji: '🎈' },
  { name: 'Breast tenderness', emoji: '🎀' },
  { name: 'Acne', emoji: '✨' },
  { name: 'Nausea', emoji: '🤢' },
  { name: 'Fatigue', emoji: '😴' },
  { name: 'Dizziness', emoji: '💫' },
  { name: 'Constipation', emoji: '🪵' },
  { name: 'Diarrhea', emoji: '🌊' },
];

const CERVICAL_FLUIDS = [
  'Dry',
  'Sticky',
  'Creamy',
  'Egg-white (Fertile)',
  'Watery',
];

const FLOW_LEVELS = [
  { label: 'Spotting', value: 'spotting' },
  { label: 'Light', value: 'light' },
  { label: 'Medium', value: 'medium' },
  { label: 'Heavy', value: 'heavy' },
  { label: 'Super', value: 'super' },
];

export default function TrackScreen() {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<Record<string, number>>({});
  const [cervicalFluid, setCervicalFluid] = useState<string | null>(null);
  const [periodFlow, setPeriodFlow] = useState<string | null>(null);
  const [waterMl, setWaterMl] = useState(1500);
  const [sleepHours, setSleepHours] = useState(8);
  const [sleepQuality, setSleepQuality] = useState(4);
  const [energyLevel, setEnergyLevel] = useState(7);
  const [stressLevel, setStressLevel] = useState(3);
  const [bbt, setBbt] = useState('36.5');
  const [notes, setNotes] = useState('');
  const [medication, setMedication] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    async function loadTodayTrack() {
      try {
        const db = await getDatabase();
        const log = await db.getFirstAsync<any>(
          'SELECT * FROM daily_logs WHERE date = ?',
          [todayStr]
        );
        if (log) {
          if (log.water_intake_ml) setWaterMl(log.water_intake_ml);
          if (log.sleep_hours) setSleepHours(log.sleep_hours);
          if (log.sleep_quality) setSleepQuality(log.sleep_quality);
          if (log.energy_level) setEnergyLevel(log.energy_level);
          if (log.stress_level) setStressLevel(log.stress_level);
          if (log.bbt_celsius) setBbt(String(log.bbt_celsius));
          if (log.notes) setNotes(log.notes);
        }

        const mood = await db.getFirstAsync<any>(
          'SELECT mood_type FROM mood_entries WHERE date = ?',
          [todayStr]
        );
        if (mood) setSelectedMood(mood.mood_type);

        const period = await db.getFirstAsync<any>(
          'SELECT flow FROM period_days WHERE date = ?',
          [todayStr]
        );
        if (period) setPeriodFlow(period.flow);

        const syms = await db.getAllAsync<any>(
          'SELECT symptom_name, severity FROM symptoms WHERE date = ?',
          [todayStr]
        );
        const symMap: Record<string, number> = {};
        for (const s of syms) {
          symMap[s.symptom_name] = s.severity || 5;
        }
        setSelectedSymptoms(symMap);
      } catch (err) {
        console.warn('Error loading today log:', err);
      }
    }
    loadTodayTrack();
  }, [todayStr]);

  const toggleSymptom = (name: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setSelectedSymptoms((prev) => {
      const copy = { ...prev };
      if (copy[name]) {
        delete copy[name];
      } else {
        copy[name] = 5; // Default severity 5/10
      }
      return copy;
    });
  };

  const handleSave = async () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const db = await getDatabase();
      const defaultUserId = 'local-princess-user';

      // 1. Save daily log
      const logPayload = {
        id: `log_${todayStr}`,
        user_id: defaultUserId,
        date: todayStr,
        water_intake_ml: waterMl,
        sleep_hours: sleepHours,
        sleep_quality: sleepQuality,
        energy_level: energyLevel,
        stress_level: stressLevel,
        bbt_celsius: parseFloat(bbt) || null,
        notes: notes.trim(),
      };

      await db.runAsync(
        `INSERT INTO daily_logs (id, user_id, date, water_intake_ml, sleep_hours, sleep_quality, energy_level, stress_level, bbt_celsius, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(user_id, date) DO UPDATE SET
          water_intake_ml = excluded.water_intake_ml,
          sleep_hours = excluded.sleep_hours,
          sleep_quality = excluded.sleep_quality,
          energy_level = excluded.energy_level,
          stress_level = excluded.stress_level,
          bbt_celsius = excluded.bbt_celsius,
          notes = excluded.notes`,
        [
          logPayload.id,
          logPayload.user_id,
          logPayload.date,
          logPayload.water_intake_ml,
          logPayload.sleep_hours,
          logPayload.sleep_quality,
          logPayload.energy_level,
          logPayload.stress_level,
          logPayload.bbt_celsius,
          logPayload.notes,
        ]
      );
      await queueOperation('daily_logs', logPayload.id, 'INSERT', logPayload);

      // 2. Save mood
      if (selectedMood) {
        await db.runAsync(
          `INSERT INTO mood_entries (id, user_id, date, mood_type, intensity)
           VALUES (?, ?, ?, ?, 5)
           ON CONFLICT(id) DO UPDATE SET mood_type = excluded.mood_type, intensity = excluded.intensity`,
          [`mood_${todayStr}`, defaultUserId, todayStr, selectedMood]
        );
      } else {
        await db.runAsync('DELETE FROM mood_entries WHERE date = ?', [todayStr]);
      }

      // 3. Save period flow
      if (periodFlow) {
        await db.runAsync(
          `INSERT INTO period_days (id, user_id, date, flow)
           VALUES (?, ?, ?, ?)
           ON CONFLICT(user_id, date) DO UPDATE SET flow = excluded.flow`,
          [`p_${todayStr}`, defaultUserId, todayStr, periodFlow]
        );
      } else {
        await db.runAsync('DELETE FROM period_days WHERE date = ?', [todayStr]);
      }

      // 4. Save symptoms
      await db.runAsync('DELETE FROM symptoms WHERE date = ?', [todayStr]);
      for (const [symName, severity] of Object.entries(selectedSymptoms)) {
        const symId = `sym_${todayStr}_${symName}`;
        await db.runAsync(
          `INSERT INTO symptoms (id, user_id, date, category, symptom_name, severity)
           VALUES (?, ?, ?, 'physical', ?, ?)
           ON CONFLICT(id) DO UPDATE SET severity = excluded.severity`,
          [symId, defaultUserId, todayStr, symName, severity]
        );
      }

      // 5. Save medication
      await db.runAsync('DELETE FROM medication_logs WHERE date = ?', [todayStr]);
      if (medication.trim()) {
        await db.runAsync(
          `INSERT INTO medication_logs (id, user_id, date, medication_name)
           VALUES (?, ?, ?, ?)`,
          [`med_${todayStr}`, defaultUserId, todayStr, medication.trim()]
        );
      }

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
      Alert.alert('Saved with Love! 💖', 'Your daily wellness entries have been securely logged.');
    } catch (err: any) {
      console.warn('Error saving track:', err);
      Alert.alert('Error', err?.message || 'Could not save daily entry');
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
          Daily Wellness Log 🌸
        </Text>
        <Text style={[styles.screenSubtitle, { color: colors.textMuted }]}>
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </Text>

        {/* Period Flow Selection */}
        <PinkCard style={styles.card}>
          <View style={styles.cardHeader}>
            <Droplet size={20} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Menstrual Flow (Optional)
            </Text>
          </View>
          <View style={styles.pillsRow}>
            {FLOW_LEVELS.map((f) => {
              const active = periodFlow === f.value;
              return (
                <TouchableOpacity
                  key={f.value}
                  onPress={() => {
                    try {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    } catch {}
                    setPeriodFlow(active ? null : f.value);
                  }}
                  style={[
                    styles.pill,
                    { borderColor: colors.primary },
                    active && { backgroundColor: colors.primary },
                  ]}
                >
                  <Text
                    style={[
                      styles.pillText,
                      { color: active ? '#FFFFFF' : colors.primary },
                    ]}
                  >
                    {f.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </PinkCard>

        {/* Mood Selection (11 Moods) */}
        <PinkCard style={styles.card}>
          <View style={styles.cardHeader}>
            <Smile size={20} color="#FFB300" />
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Emotional Mood
            </Text>
          </View>
          <View style={styles.chipGrid}>
            {MOODS.map((m) => {
              const isSelected = selectedMood === m.name;
              return (
                <TouchableOpacity
                  key={m.name}
                  onPress={() => {
                    try {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    } catch {}
                    setSelectedMood(isSelected ? null : m.name);
                  }}
                  style={[
                    styles.moodChip,
                    { borderColor: colors.border },
                    isSelected && { backgroundColor: `${colors.primary}20`, borderColor: colors.primary },
                  ]}
                >
                  <Text style={styles.chipEmoji}>{m.emoji}</Text>
                  <Text style={[styles.chipText, { color: colors.text }]}>{m.name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </PinkCard>

        {/* Physical Symptoms (12 Symptoms) */}
        <PinkCard style={styles.card}>
          <View style={styles.cardHeader}>
            <Activity size={20} color="#E57373" />
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Physical Symptoms
            </Text>
          </View>
          <View style={styles.chipGrid}>
            {PHYSICAL_SYMPTOMS.map((s) => {
              const isSelected = Boolean(selectedSymptoms[s.name]);
              return (
                <TouchableOpacity
                  key={s.name}
                  onPress={() => toggleSymptom(s.name)}
                  style={[
                    styles.symptomChip,
                    { borderColor: colors.border },
                    isSelected && { backgroundColor: `${colors.primary}25`, borderColor: colors.primary },
                  ]}
                >
                  <Text style={styles.chipEmoji}>{s.emoji}</Text>
                  <Text style={[styles.chipText, { color: colors.text }]}>{s.name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </PinkCard>

        {/* Energy & Stress Sliders / Selectors (1-10) */}
        <PinkCard style={styles.card}>
          <View style={styles.cardHeader}>
            <Activity size={20} color={colors.secondary} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Energy & Stress Levels
            </Text>
          </View>
          <View style={styles.metricRow}>
            <Text style={[styles.sliderLabel, { color: colors.text }]}>
              Energy Level: <Text style={{ color: colors.primary, fontWeight: '800' }}>{energyLevel}/10</Text>
            </Text>
            <View style={styles.scaleButtons}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <TouchableOpacity
                  key={num}
                  onPress={() => setEnergyLevel(num)}
                  style={[
                    styles.scaleBtn,
                    { backgroundColor: colors.highlight },
                    energyLevel === num && { backgroundColor: colors.primary },
                  ]}
                >
                  <Text
                    style={[
                      styles.scaleBtnText,
                      { color: energyLevel === num ? '#FFFFFF' : colors.text },
                    ]}
                  >
                    {num}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={[styles.metricRow, { marginTop: 14 }]}>
            <Text style={[styles.sliderLabel, { color: colors.text }]}>
              Stress Level: <Text style={{ color: colors.error, fontWeight: '800' }}>{stressLevel}/10</Text>
            </Text>
            <View style={styles.scaleButtons}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <TouchableOpacity
                  key={num}
                  onPress={() => setStressLevel(num)}
                  style={[
                    styles.scaleBtn,
                    { backgroundColor: colors.highlight },
                    stressLevel === num && { backgroundColor: colors.error },
                  ]}
                >
                  <Text
                    style={[
                      styles.scaleBtnText,
                      { color: stressLevel === num ? '#FFFFFF' : colors.text },
                    ]}
                  >
                    {num}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </PinkCard>

        {/* Sleep & Water Details */}
        <PinkCard style={styles.card}>
          <View style={styles.cardHeader}>
            <Moon size={20} color="#9575CD" />
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Sleep & Hydration
            </Text>
          </View>

          <View style={styles.dualInputs}>
            <View style={styles.halfInput}>
              <Text style={[styles.inputLabel, { color: colors.textMuted }]}>
                Sleep (Hours)
              </Text>
              <TextInput
                keyboardType="numeric"
                value={String(sleepHours)}
                onChangeText={(t) => setSleepHours(parseFloat(t) || 0)}
                style={[styles.textInput, { borderColor: colors.border, color: colors.text }]}
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={[styles.inputLabel, { color: colors.textMuted }]}>
                Water (ml)
              </Text>
              <TextInput
                keyboardType="numeric"
                value={String(waterMl)}
                onChangeText={(t) => setWaterMl(parseInt(t, 10) || 0)}
                style={[styles.textInput, { borderColor: colors.border, color: colors.text }]}
              />
            </View>
          </View>
        </PinkCard>

        {/* Basal Body Temperature & Medication */}
        <PinkCard style={styles.card}>
          <View style={styles.cardHeader}>
            <Thermometer size={20} color="#FF7043" />
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Basal Body Temperature (BBT) & Meds
            </Text>
          </View>
          <View style={styles.dualInputs}>
            <View style={styles.halfInput}>
              <Text style={[styles.inputLabel, { color: colors.textMuted }]}>
                BBT (°C)
              </Text>
              <TextInput
                value={bbt}
                onChangeText={setBbt}
                placeholder="36.5"
                placeholderTextColor={colors.textLight}
                style={[styles.textInput, { borderColor: colors.border, color: colors.text }]}
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={[styles.inputLabel, { color: colors.textMuted }]}>
                Medication / Vitamins
              </Text>
              <TextInput
                value={medication}
                onChangeText={setMedication}
                placeholder="e.g. Magnesium"
                placeholderTextColor={colors.textLight}
                style={[styles.textInput, { borderColor: colors.border, color: colors.text }]}
              />
            </View>
          </View>
        </PinkCard>

        {/* Daily Note */}
        <PinkCard style={styles.card}>
          <View style={styles.cardHeader}>
            <FileText size={20} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Daily Private Thoughts & Notes
            </Text>
          </View>
          <TextInput
            multiline
            numberOfLines={4}
            value={notes}
            onChangeText={setNotes}
            placeholder="How did your body and heart feel today, Princess? 💗"
            placeholderTextColor={colors.textLight}
            style={[styles.textArea, { borderColor: colors.border, color: colors.text }]}
          />
        </PinkCard>

        {/* Save Button */}
        <PinkButton
          title={savedSuccess ? 'Saved with Love! 💖' : 'Save Today\'s Entry 🌸'}
          onPress={handleSave}
          style={{ marginTop: 8 }}
        />
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
  card: {
    padding: 16,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '700',
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  moodChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  symptomChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  chipEmoji: {
    fontSize: 16,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  metricRow: {
    gap: 6,
  },
  sliderLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  scaleButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  scaleBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scaleBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  dualInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: '600',
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    fontSize: 14,
    minHeight: 90,
    textAlignVertical: 'top',
  },
});
