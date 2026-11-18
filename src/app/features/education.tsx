import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAppTheme } from '../../context/ThemeContext';
import { PinkCard } from '../../components/common/PinkCard';
import { getDatabase } from '../../db/sqlite';
import {
  BookOpen,
  ChevronLeft,
  Search,
  Clock,
  Sparkles,
  ChevronRight,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

interface ArticleItem {
  id: string;
  category: string;
  title: string;
  summary: string;
  content: string;
  medical_references: string;
  last_reviewed: string;
  read_time_minutes: number;
}

export default function EducationScreen() {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const loadArticles = useCallback(async () => {
    try {
      const db = await getDatabase();
      const rows = await db.getAllAsync<ArticleItem>(
        'SELECT * FROM educational_articles ORDER BY title ASC'
      );
      setArticles(rows);
    } catch (err) {
      console.warn('Error loading articles:', err);
    }
  }, []);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  const categories = ['All', ...Array.from(new Set(articles.map((a) => a.category)))];

  const filtered = articles.filter((a) => {
    const matchesCategory = selectedCategory === 'All' || a.category === selectedCategory;
    const matchesSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
            <BookOpen size={32} color="#AB47BC" />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>
            Women's Health Library 📚
          </Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Medically referenced, accessible guides across all 17 menstrual & wellness topics
          </Text>
        </View>

        {/* Search Bar */}
        <View style={[styles.searchBox, { borderColor: colors.border, backgroundColor: colors.surface }]}>
          <Search size={18} color={colors.textLight} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search symptoms, hormones, phases..."
            placeholderTextColor={colors.textLight}
            style={[styles.searchInput, { color: colors.text }]}
          />
        </View>

        {/* Category Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryRow}
        >
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => {
                  try {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  } catch {}
                  setSelectedCategory(cat);
                }}
                style={[
                  styles.catPill,
                  { borderColor: colors.primary },
                  isSelected && { backgroundColor: colors.primary },
                ]}
              >
                <Text
                  style={[
                    styles.catPillText,
                    { color: isSelected ? '#FFFFFF' : colors.primary },
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Articles List */}
        <View style={styles.articleList}>
          {filtered.map((item) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.8}
              onPress={() =>
                router.push({
                  pathname: '/features/article/[id]',
                  params: { id: item.id },
                })
              }
            >
              <PinkCard style={styles.articleCard}>
                <View style={styles.articleHeader}>
                  <Text style={[styles.categoryTag, { color: colors.primary, backgroundColor: `${colors.primary}18` }]}>
                    {item.category}
                  </Text>
                  <View style={styles.timeRow}>
                    <Clock size={12} color={colors.textLight} />
                    <Text style={[styles.readTime, { color: colors.textLight }]}>
                      {item.read_time_minutes} min read
                    </Text>
                  </View>
                </View>

                <Text style={[styles.articleTitle, { color: colors.text }]}>
                  {item.title}
                </Text>

                <Text style={[styles.articleSummary, { color: colors.textMuted }]}>
                  {item.summary}
                </Text>

                <View style={styles.readMoreRow}>
                  <Text style={[styles.readMoreText, { color: colors.primary }]}>
                    Read Article →
                  </Text>
                  <ChevronRight size={16} color={colors.primary} />
                </View>
              </PinkCard>
            </TouchableOpacity>
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
    marginBottom: 18,
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
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  categoryRow: {
    gap: 8,
    paddingBottom: 12,
  },
  catPill: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: 1.5,
  },
  catPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  articleList: {
    gap: 12,
    marginTop: 6,
    marginBottom: 20,
  },
  articleCard: {
    padding: 16,
  },
  articleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryTag: {
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  readTime: {
    fontSize: 11,
    fontWeight: '600',
  },
  articleTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },
  articleSummary: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  readMoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  readMoreText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
