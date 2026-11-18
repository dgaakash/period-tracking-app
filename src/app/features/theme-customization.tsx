import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAppTheme } from '../../context/ThemeContext';
import { PinkCard } from '../../components/common/PinkCard';
import { THEMES, ThemeName } from '../../constants/theme';
import { Palette, ChevronLeft, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export default function ThemeCustomizationScreen() {
  const { colors, themeName, setTheme } = useAppTheme();
  const insets = useSafeAreaInsets();

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
            <Palette size={32} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>
            Princess Color Themes 🎨
          </Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Select your favorite palette: sweet Barbie pink, calming lavender, or night glam
          </Text>
        </View>

        {/* Theme List */}
        <View style={styles.themeList}>
          {(Object.keys(THEMES) as ThemeName[]).map((tKey) => {
            const t = THEMES[tKey];
            const isSelected = themeName === tKey;

            return (
              <TouchableOpacity
                key={tKey}
                activeOpacity={0.8}
                onPress={() => {
                  try {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  } catch {}
                  setTheme(tKey);
                }}
              >
                <PinkCard
                  style={[
                    styles.themeCard,
                    isSelected && { borderColor: t.colors.primary, borderWidth: 2 },
                  ]}
                >
                  <View style={styles.themeCardLeft}>
                    <View style={styles.swatchRow}>
                      <View style={[styles.swatch, { backgroundColor: t.colors.primary }]} />
                      <View style={[styles.swatch, { backgroundColor: t.colors.secondary }]} />
                      <View style={[styles.swatch, { backgroundColor: t.colors.highlight }]} />
                      <View style={[styles.swatch, { backgroundColor: t.colors.phases.ovulation }]} />
                    </View>
                    <Text style={[styles.themeTitle, { color: colors.text }]}>
                      {t.name}
                    </Text>
                  </View>

                  {isSelected && (
                    <View style={[styles.checkCircle, { backgroundColor: t.colors.primary }]}>
                      <Check size={16} color="#FFFFFF" />
                    </View>
                  )}
                </PinkCard>
              </TouchableOpacity>
            );
          })}
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
  themeList: {
    gap: 12,
  },
  themeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  themeCardLeft: {
    flex: 1,
    gap: 8,
  },
  swatchRow: {
    flexDirection: 'row',
    gap: 8,
  },
  swatch: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  themeTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
