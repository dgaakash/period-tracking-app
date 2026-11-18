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
  MessageCircleHeart,
  ChevronLeft,
  Send,
  Trash2,
  Clock,
  Sparkles,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { format } from 'date-fns';

const PRESET_MESSAGES = [
  "I wish I could give you a hug right now ❤️",
  "You're my favourite person in the entire world. 💕",
  "Take care of yourself, Princess. You deserve all the rest today! 🌸",
  "Sending you the biggest virtual hug! 🧸",
  "You are so beautiful and loved, even when you don't feel 100%! ✨",
  "Grab your favorite snack, I'm thinking of you always! 🍫",
];

interface MessageItem {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
}

export default function LoveMessagesScreen() {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [customText, setCustomText] = useState('');
  const [isSending, setIsSending] = useState(false);

  const loadMessages = useCallback(async () => {
    try {
      const db = await getDatabase();
      const rows = await db.getAllAsync<MessageItem>(
        'SELECT * FROM love_messages ORDER BY created_at DESC'
      );
      setMessages(rows);
    } catch (err) {
      console.warn('Error loading messages:', err);
    }
  }, []);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    try {
      setIsSending(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const db = await getDatabase();
      const newId = `msg_${Date.now()}`;
      const defaultUserId = 'local-princess-user';

      const payload = {
        id: newId,
        sender_id: 'boyfriend-user',
        receiver_id: defaultUserId,
        content: textToSend.trim(),
        created_at: new Date().toISOString(),
      };

      await db.runAsync(
        `INSERT INTO love_messages (id, sender_id, receiver_id, content, created_at)
         VALUES (?, ?, ?, ?, ?)`,
        [payload.id, payload.sender_id, payload.receiver_id, payload.content, payload.created_at]
      );
      await queueOperation('love_messages', newId, 'INSERT', payload);

      setCustomText('');
      await loadMessages();
      Alert.alert('Message Sent with Love! 💌', 'Your romantic message has been delivered to her inbox.');
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Could not send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const db = await getDatabase();
      await db.runAsync('DELETE FROM love_messages WHERE id = ?', [id]);
      await loadMessages();
    } catch (err) {
      console.warn('Error deleting message:', err);
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
          <View style={[styles.iconBox, { backgroundColor: '#FFE4EE' }]}>
            <MessageCircleHeart size={32} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>
            Surprise Love Messages 💕
          </Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Send sweet romantic reminders and surprise notes that bring a smile to her face
          </Text>
        </View>

        {/* Custom Message Composer */}
        <PinkCard style={styles.composerCard}>
          <Text style={[styles.composerTitle, { color: colors.text }]}>
            Write a Surprise Message 💌
          </Text>
          <TextInput
            multiline
            numberOfLines={3}
            value={customText}
            onChangeText={setCustomText}
            placeholder="Type your romantic message here..."
            placeholderTextColor={colors.textLight}
            style={[styles.composerInput, { borderColor: colors.border, color: colors.text }]}
          />
          <PinkButton
            title="Deliver Message Now ✨"
            onPress={() => handleSendMessage(customText)}
            loading={isSending}
            disabled={!customText.trim()}
            icon={<Send size={18} color="#FFFFFF" />}
            style={{ marginTop: 10 }}
          />
        </PinkCard>

        {/* Quick Presets */}
        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 18, marginBottom: 10 }]}>
          Quick Romantic Presets
        </Text>
        <View style={styles.presetGrid}>
          {PRESET_MESSAGES.map((msg, idx) => (
            <TouchableOpacity
              key={idx}
              activeOpacity={0.8}
              onPress={() => handleSendMessage(msg)}
              style={[styles.presetCard, { borderColor: colors.border, backgroundColor: colors.surface }]}
            >
              <Text style={[styles.presetText, { color: colors.text }]}>"{msg}"</Text>
              <Text style={[styles.presetAction, { color: colors.primary }]}>Tap to Send →</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Message History */}
        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 22, marginBottom: 10 }]}>
          Love Notes History ({messages.length})
        </Text>

        <View style={styles.messageList}>
          {messages.map((m) => (
            <PinkCard key={m.id} style={styles.messageItem}>
              <View style={styles.messageHeader}>
                <View style={styles.clockRow}>
                  <Clock size={14} color={colors.textLight} />
                  <Text style={[styles.dateText, { color: colors.textLight }]}>
                    {m.created_at ? format(new Date(m.created_at), 'MMM d, h:mm a') : 'Recently'}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => handleDeleteMessage(m.id)}>
                  <Trash2 size={16} color="#FF6B8B" />
                </TouchableOpacity>
              </View>
              <Text style={[styles.messageContent, { color: colors.text }]}>
                "{m.content}"
              </Text>
            </PinkCard>
          ))}
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
  composerCard: {
    padding: 16,
  },
  composerTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
  },
  composerInput: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    fontSize: 14,
    minHeight: 70,
    textAlignVertical: 'top',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  presetGrid: {
    gap: 8,
  },
  presetCard: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  presetText: {
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 20,
    marginBottom: 6,
  },
  presetAction: {
    fontSize: 12,
    fontWeight: '700',
  },
  messageList: {
    gap: 10,
  },
  messageItem: {
    padding: 14,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  clockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 11,
    fontWeight: '600',
  },
  messageContent: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
});
