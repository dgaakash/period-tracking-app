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
import {
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  ChevronLeft,
  Sparkles,
  Heart,
  Coffee,
  Flame,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
}

export default function ComfortChecklistScreen() {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [newItemText, setNewItemText] = useState('');

  const loadChecklist = useCallback(async () => {
    try {
      const db = await getDatabase();
      const row = await db.getFirstAsync<{ items: string }>(
        'SELECT items FROM care_checklists WHERE id = ?',
        ['chk-default']
      );
      if (row?.items) {
        setItems(JSON.parse(row.items));
      }
    } catch (err) {
      console.warn('Error loading checklist:', err);
    }
  }, []);

  useEffect(() => {
    loadChecklist();
  }, [loadChecklist]);

  const saveItems = async (updated: ChecklistItem[]) => {
    setItems(updated);
    try {
      const db = await getDatabase();
      await db.runAsync(
        'UPDATE care_checklists SET items = ? WHERE id = ?',
        [JSON.stringify(updated), 'chk-default']
      );
    } catch (err) {
      console.warn('Error persisting checklist:', err);
    }
  };

  const toggleItem = (id: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    const updated = items.map((it) =>
      it.id === id ? { ...it, completed: !it.completed } : it
    );
    saveItems(updated);
  };

  const handleAddItem = () => {
    if (!newItemText.trim()) return;
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
    const newItem: ChecklistItem = {
      id: `chk_${Date.now()}`,
      label: newItemText.trim(),
      completed: false,
    };
    const updated = [...items, newItem];
    saveItems(updated);
    setNewItemText('');
  };

  const handleDeleteItem = (id: string) => {
    const updated = items.filter((it) => it.id !== id);
    saveItems(updated);
  };

  const completedCount = items.filter((i) => i.completed).length;

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
          <View style={[styles.iconBox, { backgroundColor: '#E0F2F1' }]}>
            <CheckCircle2 size={32} color="#00897B" />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>
            Period Comfort Checklist 🌸
          </Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Your cozy checklist of relaxation, warmth, and self-care essentials
          </Text>
        </View>

        {/* Progress Status Card */}
        <PinkCard style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressTitle, { color: colors.text }]}>
              Comfort Progress: {completedCount}/{items.length} Pampered
            </Text>
            <Sparkles size={18} color={colors.primary} />
          </View>
          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                {
                  backgroundColor: colors.primary,
                  width: `${items.length > 0 ? (completedCount / items.length) * 100 : 0}%`,
                },
              ]}
            />
          </View>
        </PinkCard>

        {/* Checklist Items */}
        <View style={styles.list}>
          {items.map((item) => (
            <PinkCard key={item.id} style={styles.checkCard}>
              <TouchableOpacity
                onPress={() => toggleItem(item.id)}
                style={styles.checkRow}
                activeOpacity={0.7}
              >
                {item.completed ? (
                  <CheckCircle2 size={24} color={colors.primary} />
                ) : (
                  <Circle size={24} color={colors.border} />
                )}
                <Text
                  style={[
                    styles.itemLabel,
                    { color: colors.text },
                    item.completed && {
                      textDecorationLine: 'line-through',
                      color: colors.textLight,
                    },
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleDeleteItem(item.id)}
                style={styles.deleteBtn}
              >
                <Trash2 size={16} color="#FF6B8B" />
              </TouchableOpacity>
            </PinkCard>
          ))}
        </View>

        {/* Add Custom Item */}
        <PinkCard style={styles.addCard}>
          <Text style={[styles.addTitle, { color: colors.text }]}>
            Add Custom Comfort Item
          </Text>
          <View style={styles.addRow}>
            <TextInput
              value={newItemText}
              onChangeText={setNewItemText}
              placeholder="e.g. Scented lavender candle"
              placeholderTextColor={colors.textLight}
              style={[styles.addInput, { borderColor: colors.border, color: colors.text }]}
            />
            <PinkButton
              title="Add"
              onPress={handleAddItem}
              disabled={!newItemText.trim()}
              style={{ paddingVertical: 10, paddingHorizontal: 16 }}
            />
          </View>
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
  progressCard: {
    padding: 16,
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  progressBarTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFE0ED',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  list: {
    gap: 10,
    marginBottom: 16,
  },
  checkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  itemLabel: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    lineHeight: 20,
  },
  deleteBtn: {
    padding: 4,
    marginLeft: 8,
  },
  addCard: {
    padding: 16,
    marginBottom: 20,
  },
  addTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },
  addRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  addInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
});
