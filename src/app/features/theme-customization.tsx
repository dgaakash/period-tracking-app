import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '../../context/ThemeContext';
import { PinkCard } from '../../components/common/PinkCard';
import { THEMES, ThemeName } from '../../constants/theme';
import {
  Palette,
  ChevronLeft,
  Check,
  Sparkles,
  Heart,
  Droplets,
  CalendarHeart,
  Moon,
  SunMedium,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ThemeCustomizationScreen() {
  const { colors, themeName, setTheme } = useAppTheme();
  const insets = useSafeAreaInsets();

  const activeThemeDef = THEMES[themeName];

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          { paddingTop: insets.top + 14, paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Navigation Back */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <ChevronLeft size={22} color={colors.primary} />
          <Text style={[styles.backText, { color: colors.primary }]}>Settings</Text>
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.iconBox, { backgroundColor: colors.highlight }]}>
            <Palette size={28} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>
            Theme & Palette Studio
          </Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Custom-crafted aesthetics for your personal sanctuary — from runway Barbie pink to calming wisteria and obsidian midnight glam.
          </Text>
        </View>

        {/* Interactive Live Preview Card */}
        <View style={styles.previewSection}>
          <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>
            LIVE PALETTE PREVIEW
          </Text>
          <PinkCard style={styles.liveCard}>
            <View style={styles.liveCardTop}>
              <View style={styles.liveBadgeRow}>
                <View style={[styles.liveBadge, { backgroundColor: colors.highlight }]}>
                  <Sparkles size={13} color={colors.primary} />
                  <Text style={[styles.liveBadgeText, { color: colors.primary }]}>
                    {activeThemeDef.emoji} {activeThemeDef.name}
                  </Text>
                </View>
                {colors.isDark && (
                  <View style={[styles.darkBadge, { backgroundColor: colors.surfaceGlass }]}>
                    <Moon size={11} color={colors.accent} />
                    <Text style={[styles.darkBadgeText, { color: colors.accent }]}>
                      Dark Mode
                    </Text>
                  </View>
                )}
              </View>
              <Text style={[styles.liveCycleTitle, { color: colors.text }]}>
                Cycle Day 14 • Ovulation Window
              </Text>
              <Text style={[styles.liveCycleDesc, { color: colors.textMuted }]}>
                Estrogen peaks today! High energy and glowing confidence.
              </Text>
            </View>

            {/* Live Interactive Button Preview */}
            <LinearGradient
              colors={colors.gradient || [colors.primary, colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.liveButton}
            >
              <Heart size={16} color="#FFFFFF" fill="#FFFFFF" />
              <Text style={styles.liveButtonText}>Track Today's Wellness</Text>
            </LinearGradient>

            {/* Live Phase Palette Swatches */}
            <View style={styles.phaseRibbon}>
              <View style={styles.phasePill}>
                <View style={[styles.phaseDot, { backgroundColor: colors.phases.menstrual }]} />
                <Text style={[styles.phaseLabel, { color: colors.textMuted }]}>Period</Text>
              </View>
              <View style={styles.phasePill}>
                <View style={[styles.phaseDot, { backgroundColor: colors.phases.follicular }]} />
                <Text style={[styles.phaseLabel, { color: colors.textMuted }]}>Follicular</Text>
              </View>
              <View style={styles.phasePill}>
                <View style={[styles.phaseDot, { backgroundColor: colors.phases.ovulation }]} />
                <Text style={[styles.phaseLabel, { color: colors.textMuted }]}>Ovulation</Text>
              </View>
              <View style={styles.phasePill}>
                <View style={[styles.phaseDot, { backgroundColor: colors.phases.luteal }]} />
                <Text style={[styles.phaseLabel, { color: colors.textMuted }]}>Luteal</Text>
              </View>
            </View>
          </PinkCard>
        </View>

        {/* Theme List */}
        <View style={styles.themeListContainer}>
          <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>
            CHOOSE YOUR SIGNATURE THEME ({Object.keys(THEMES).length} PALETTES)
          </Text>

          <View style={styles.themeGrid}>
            {(Object.keys(THEMES) as ThemeName[]).map((tKey) => {
              const t = THEMES[tKey];
              const isSelected = themeName === tKey;

              return (
                <TouchableOpacity
                  key={tKey}
                  activeOpacity={0.85}
                  onPress={() => {
                    try {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    } catch {}
                    setTheme(tKey);
                  }}
                  style={styles.themeCardTouchable}
                >
                  <PinkCard
                    style={[
                      styles.themeCard,
                      isSelected && [
                        styles.themeCardSelected,
                        { borderColor: t.colors.primary, shadowColor: t.colors.primary },
                      ],
                    ]}
                  >
                    <View style={styles.themeCardHeader}>
                      <View style={styles.themeTitleRow}>
                        <Text style={styles.themeEmoji}>{t.emoji}</Text>
                        <View style={{ flex: 1 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Text
                              style={[
                                styles.themeTitle,
                                { color: colors.text },
                                isSelected && { color: t.colors.primary, fontWeight: '800' },
                              ]}
                            >
                              {t.name}
                            </Text>
                            {t.isDark && (
                              <View style={styles.nightChip}>
                                <Moon size={10} color="#C084FC" />
                                <Text style={styles.nightChipText}>Dark</Text>
                              </View>
                            )}
                          </View>
                          <Text
                            style={[styles.themeTagline, { color: colors.textMuted }]}
                            numberOfLines={2}
                          >
                            {t.tagline}
                          </Text>
                        </View>
                      </View>

                      {/* Selection Radio Circle */}
                      <View
                        style={[
                          styles.radioCircle,
                          { borderColor: isSelected ? t.colors.primary : colors.border },
                          isSelected && { backgroundColor: t.colors.primary },
                        ]}
                      >
                        {isSelected && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
                      </View>
                    </View>

                    {/* Color Swatch Ribbon */}
                    <View
                      style={[
                        styles.swatchRibbon,
                        { backgroundColor: colors.highlight, borderColor: colors.border },
                      ]}
                    >
                      <View style={styles.swatchItem}>
                        <View
                          style={[styles.swatchCircle, { backgroundColor: t.colors.primary }]}
                        />
                        <Text style={[styles.swatchName, { color: colors.textMuted }]}>
                          Primary
                        </Text>
                      </View>

                      <View style={styles.swatchItem}>
                        <View
                          style={[styles.swatchCircle, { backgroundColor: t.colors.secondary }]}
                        />
                        <Text style={[styles.swatchName, { color: colors.textMuted }]}>
                          Soft
                        </Text>
                      </View>

                      <View style={styles.swatchItem}>
                        <View
                          style={[styles.swatchCircle, { backgroundColor: t.colors.accent }]}
                        />
                        <Text style={[styles.swatchName, { color: colors.textMuted }]}>
                          Accent
                        </Text>
                      </View>

                      <View style={styles.swatchItem}>
                        <View
                          style={[
                            styles.swatchCircle,
                            { backgroundColor: t.colors.phases.ovulation },
                          ]}
                        />
                        <Text style={[styles.swatchName, { color: colors.textMuted }]}>
                          Fertile
                        </Text>
                      </View>

                      <View style={styles.swatchItem}>
                        <View
                          style={[
                            styles.swatchCircle,
                            {
                              backgroundColor: t.colors.background,
                              borderWidth: 1,
                              borderColor: t.colors.border,
                            },
                          ]}
                        />
                        <Text style={[styles.swatchName, { color: colors.textMuted }]}>
                          Bg
                        </Text>
                      </View>
                    </View>
                  </PinkCard>
                </TouchableOpacity>
              );
            })}
          </View>
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
    paddingHorizontal: 18,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 14,
    alignSelf: 'flex-start',
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
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 23,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    paddingHorizontal: 8,
  },
  sectionSubtitle: {
    fontSize: 11.5,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 8,
    paddingLeft: 4,
  },
  previewSection: {
    marginBottom: 22,
  },
  liveCard: {
    padding: 16,
  },
  liveCardTop: {
    marginBottom: 14,
  },
  liveBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  liveBadgeText: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  darkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  darkBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  liveCycleTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 3,
  },
  liveCycleDesc: {
    fontSize: 12.5,
    lineHeight: 17,
  },
  liveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 24,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 14,
  },
  liveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  phaseRibbon: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 46, 147, 0.1)',
  },
  phasePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  phaseDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
  },
  phaseLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  themeListContainer: {
    gap: 10,
  },
  themeGrid: {
    gap: 12,
  },
  themeCardTouchable: {
    width: '100%',
  },
  themeCard: {
    padding: 14,
  },
  themeCardSelected: {
    borderWidth: 2,
    shadowOpacity: 0.22,
    shadowRadius: 14,
  },
  themeCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  themeTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    flex: 1,
    paddingRight: 10,
  },
  themeEmoji: {
    fontSize: 24,
    marginTop: 2,
  },
  themeTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  nightChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#2E1631',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 8,
  },
  nightChipText: {
    color: '#C084FC',
    fontSize: 9.5,
    fontWeight: '700',
  },
  themeTagline: {
    fontSize: 11.5,
    lineHeight: 16,
    marginTop: 2,
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatchRibbon: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  swatchItem: {
    alignItems: 'center',
    gap: 3,
  },
  swatchCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  swatchName: {
    fontSize: 9.5,
    fontWeight: '700',
  },
});
