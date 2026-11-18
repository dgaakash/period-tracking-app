import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAppTheme } from '../../context/ThemeContext';
import { PinkCard } from '../../components/common/PinkCard';
import { PinkButton } from '../../components/common/PinkButton';
import { getDatabase } from '../../db/sqlite';
import { queueOperation } from '../../db/syncEngine';
import {
  Image as ImageIcon,
  ChevronLeft,
  Plus,
  Trash2,
  Calendar,
  Search,
  Sparkles,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { format } from 'date-fns';

interface MemoryItem {
  id: string;
  title: string;
  description: string;
  photo_url?: string;
  event_date: string;
  created_at: string;
}

export default function MemoriesScrapbookScreen() {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // New memory form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const loadMemories = useCallback(async () => {
    try {
      const db = await getDatabase();
      const rows = await db.getAllAsync<MemoryItem>(
        'SELECT * FROM memories ORDER BY event_date DESC'
      );
      setMemories(rows);
    } catch (err) {
      console.warn('Error loading memories:', err);
    }
  }, []);

  useEffect(() => {
    loadMemories();
  }, [loadMemories]);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]?.uri) {
        setSelectedPhoto(result.assets[0].uri);
      }
    } catch (err) {
      Alert.alert('Permission Denied', 'Please allow gallery access to attach sweet photos.');
    }
  };

  const handleSaveMemory = async () => {
    if (!title.trim()) {
      Alert.alert('Required', 'Please enter a title for your memory.');
      return;
    }

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const db = await getDatabase();
      const newId = `mem_${Date.now()}`;
      const defaultUserId = 'local-princess-user';
      const eventDate = format(new Date(), 'yyyy-MM-dd');

      const payload = {
        id: newId,
        user_id: defaultUserId,
        title: title.trim(),
        description: description.trim(),
        photo_url: selectedPhoto,
        event_date: eventDate,
        created_at: new Date().toISOString(),
      };

      await db.runAsync(
        `INSERT INTO memories (id, user_id, title, description, photo_url, event_date, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [payload.id, payload.user_id, payload.title, payload.description, payload.photo_url, payload.event_date, payload.created_at]
      );
      await queueOperation('memories', newId, 'INSERT', payload);

      setTitle('');
      setDescription('');
      setSelectedPhoto(null);
      setIsAdding(false);
      await loadMemories();
      Alert.alert('Memory Saved! 💖', 'Added to your private scrapbook forever.');
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Could not save memory');
    }
  };

  const handleDeleteMemory = async (id: string) => {
    Alert.alert('Delete Memory?', 'Are you sure you want to remove this sweet memory?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const db = await getDatabase();
            await db.runAsync('DELETE FROM memories WHERE id = ?', [id]);
            await loadMemories();
          } catch (err) {
            console.warn('Error deleting memory:', err);
          }
        },
      },
    ]);
  };

  const filtered = memories.filter((m) =>
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <View style={[styles.iconBox, { backgroundColor: '#FFF3E0' }]}>
            <ImageIcon size={32} color="#FB8C00" />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>
            Our Little Memories Scrapbook 📸
          </Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            A private treasure box of romantic dates, special milestones, and warm moments
          </Text>
        </View>

        {/* Add Memory Toggle Button */}
        {!isAdding && (
          <PinkButton
            title="+ Add Sweet New Memory 💖"
            onPress={() => setIsAdding(true)}
            icon={<Plus size={18} color="#FFFFFF" />}
            style={{ marginBottom: 16 }}
          />
        )}

        {/* New Memory Form */}
        {isAdding && (
          <PinkCard style={styles.formCard}>
            <Text style={[styles.formTitle, { color: colors.text }]}>
              Capture a Beautiful Moment ✨
            </Text>

            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Title (e.g. Our First Stargazing Date) 🌸"
              placeholderTextColor={colors.textLight}
              style={[styles.input, { borderColor: colors.border, color: colors.text }]}
            />

            <TextInput
              multiline
              numberOfLines={3}
              value={description}
              onChangeText={setDescription}
              placeholder="What made this moment so special?"
              placeholderTextColor={colors.textLight}
              style={[styles.input, styles.textArea, { borderColor: colors.border, color: colors.text }]}
            />

            {/* Photo Preview / Picker */}
            {selectedPhoto ? (
              <View style={styles.photoPreviewBox}>
                <Image source={{ uri: selectedPhoto }} style={styles.previewImage} />
                <TouchableOpacity
                  onPress={() => setSelectedPhoto(null)}
                  style={styles.removePhotoBtn}
                >
                  <Text style={styles.removePhotoText}>Remove Photo</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={pickImage}
                style={[styles.photoPickerBtn, { borderColor: colors.primary }]}
              >
                <ImageIcon size={20} color={colors.primary} />
                <Text style={[styles.photoPickerText, { color: colors.primary }]}>
                  Attach Photo from Gallery
                </Text>
              </TouchableOpacity>
            )}

            <View style={styles.formButtons}>
              <PinkButton
                title="Save Memory 💖"
                onPress={handleSaveMemory}
                style={{ flex: 1 }}
              />
              <PinkButton
                title="Cancel"
                variant="outline"
                onPress={() => {
                  setIsAdding(false);
                  setSelectedPhoto(null);
                }}
                style={{ flex: 1 }}
              />
            </View>
          </PinkCard>
        )}

        {/* Search Bar */}
        <View style={[styles.searchBox, { borderColor: colors.border, backgroundColor: colors.surface }]}>
          <Search size={18} color={colors.textLight} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search scrapbook memories..."
            placeholderTextColor={colors.textLight}
            style={[styles.searchInput, { color: colors.text }]}
          />
        </View>

        {/* Memories Timeline */}
        <View style={styles.timelineList}>
          {filtered.length > 0 ? (
            filtered.map((m) => (
              <PinkCard key={m.id} style={styles.memoryCard}>
                {m.photo_url && (
                  <Image source={{ uri: m.photo_url }} style={styles.memoryImage} />
                )}
                <View style={styles.memoryContent}>
                  <View style={styles.memoryHeader}>
                    <Text style={[styles.memoryTitle, { color: colors.text }]}>
                      {m.title}
                    </Text>
                    <TouchableOpacity onPress={() => handleDeleteMemory(m.id)}>
                      <Trash2 size={16} color="#FF6B8B" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.dateRow}>
                    <Calendar size={13} color={colors.primary} />
                    <Text style={[styles.memoryDate, { color: colors.textMuted }]}>
                      {m.event_date ? format(new Date(m.event_date), 'MMMM d, yyyy') : ''}
                    </Text>
                  </View>

                  {m.description ? (
                    <Text style={[styles.memoryDesc, { color: colors.text }]}>
                      {m.description}
                    </Text>
                  ) : null}
                </View>
              </PinkCard>
            ))
          ) : (
            <PinkCard style={styles.emptyCard}>
              <Sparkles size={28} color={colors.primary} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                Your Scrapbook is Waiting
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
                Add photos, anniversaries, and sweet little memories to build your romantic story!
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
  formCard: {
    padding: 16,
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 10,
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  photoPickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 14,
    paddingVertical: 14,
    marginBottom: 12,
  },
  photoPickerText: {
    fontSize: 13,
    fontWeight: '700',
  },
  photoPreviewBox: {
    alignItems: 'center',
    marginBottom: 12,
  },
  previewImage: {
    width: '100%',
    height: 180,
    borderRadius: 14,
  },
  removePhotoBtn: {
    marginTop: 6,
  },
  removePhotoText: {
    color: '#FF6B8B',
    fontSize: 12,
    fontWeight: '700',
  },
  formButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  timelineList: {
    gap: 14,
    marginBottom: 20,
  },
  memoryCard: {
    padding: 0,
    overflow: 'hidden',
  },
  memoryImage: {
    width: '100%',
    height: 200,
  },
  memoryContent: {
    padding: 16,
  },
  memoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  memoryTitle: {
    fontSize: 17,
    fontWeight: '800',
    flex: 1,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  memoryDate: {
    fontSize: 12,
    fontWeight: '600',
  },
  memoryDesc: {
    fontSize: 14,
    lineHeight: 20,
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
