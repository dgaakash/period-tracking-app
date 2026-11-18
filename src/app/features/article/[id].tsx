import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useAppTheme } from '../../../context/ThemeContext';
import { PinkCard } from '../../../components/common/PinkCard';
import { getDatabase } from '../../../db/sqlite';
import {
  ChevronLeft,
  BookOpen,
  Calendar,
  CheckCircle,
  FileCheck,
} from 'lucide-react-native';
import { format } from 'date-fns';

export default function ArticleDetailScreen() {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [article, setArticle] = useState<any>(null);

  useEffect(() => {
    async function loadArticle() {
      try {
        const db = await getDatabase();
        const row = await db.getFirstAsync<any>(
          'SELECT * FROM educational_articles WHERE id = ?',
          [id]
        );
        if (row) {
          setArticle(row);
        }
      } catch (err) {
        console.warn('Error loading article:', err);
      }
    }
    loadArticle();
  }, [id]);

  if (!article) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <Text style={{ textAlign: 'center', marginTop: 100, color: colors.textMuted }}>
          Loading guide...
        </Text>
      </View>
    );
  }

  let references: string[] = [];
  try {
    references = JSON.parse(article.medical_references || '[]');
  } catch {}

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
          <Text style={[styles.backText, { color: colors.primary }]}>Back to Library</Text>
        </TouchableOpacity>

        {/* Category Badge */}
        <Text style={[styles.categoryBadge, { color: colors.primary, backgroundColor: `${colors.primary}20` }]}>
          {article.category}
        </Text>

        {/* Article Title */}
        <Text style={[styles.articleTitle, { color: colors.text }]}>
          {article.title}
        </Text>

        {/* Review metadata */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Calendar size={13} color={colors.textLight} />
            <Text style={[styles.metaText, { color: colors.textLight }]}>
              Reviewed: {article.last_reviewed ? format(new Date(article.last_reviewed), 'MMM d, yyyy') : 'Recent'}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <CheckCircle size={13} color="#00897B" />
            <Text style={[styles.metaText, { color: '#00897B' }]}>
              Medically Verified
            </Text>
          </View>
        </View>

        {/* Summary Card */}
        <PinkCard style={[styles.summaryCard, { borderLeftColor: colors.primary, borderLeftWidth: 4 }]}>
          <Text style={[styles.summaryText, { color: colors.text }]}>
            {article.summary}
          </Text>
        </PinkCard>

        {/* Full Content */}
        <PinkCard style={styles.contentCard}>
          <Text style={[styles.contentText, { color: colors.text }]}>
            {article.content}
          </Text>
        </PinkCard>

        {/* References Section */}
        {references.length > 0 && (
          <PinkCard style={styles.refCard}>
            <View style={styles.refHeader}>
              <FileCheck size={18} color={colors.primary} />
              <Text style={[styles.refTitle, { color: colors.text }]}>
                Clinical & Scientific References
              </Text>
            </View>
            <View style={styles.refList}>
              {references.map((r, i) => (
                <Text key={i} style={[styles.refItem, { color: colors.textMuted }]}>
                  • {r}
                </Text>
              ))}
            </View>
          </PinkCard>
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
  categoryBadge: {
    alignSelf: 'flex-start',
    fontSize: 12,
    fontWeight: '800',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 10,
  },
  articleTitle: {
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 30,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '600',
  },
  summaryCard: {
    padding: 16,
    marginBottom: 16,
  },
  summaryText: {
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 22,
  },
  contentCard: {
    padding: 18,
    marginBottom: 16,
  },
  contentText: {
    fontSize: 15,
    lineHeight: 24,
  },
  refCard: {
    padding: 16,
    marginBottom: 20,
  },
  refHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  refTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  refList: {
    gap: 6,
  },
  refItem: {
    fontSize: 12,
    lineHeight: 18,
  },
});
