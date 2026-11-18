import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAppTheme } from '../../context/ThemeContext';
import { PinkCard } from '../../components/common/PinkCard';
import {
  WEARABLE_PROVIDERS,
  WearableProviderId,
  getConnectedWearables,
  toggleWearableConnection,
} from '../../services/wearables';
import {
  Watch,
  ChevronLeft,
  Activity,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export default function WearablesScreen() {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  const [connectedMap, setConnectedMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function load() {
      const map = await getConnectedWearables();
      setConnectedMap(map);
    }
    load();
  }, []);

  const handleToggle = async (providerId: WearableProviderId, value: boolean) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const res = await toggleWearableConnection(providerId, value);
      if (res.success) {
        setConnectedMap((prev) => ({ ...prev, [providerId]: value }));
        Alert.alert('Integration Status', res.message);
      } else {
        Alert.alert('Platform Notice', res.message);
      }
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Could not toggle wearable');
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
          <View style={[styles.iconBox, { backgroundColor: '#E0F2F1' }]}>
            <Watch size={32} color="#00897B" />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>
            Wearable & Sensor Integrations ⌚
          </Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Official health APIs for automatic sleep, basal temperature, and activity syncing
          </Text>
        </View>

        {/* Wearables List */}
        <View style={styles.list}>
          {WEARABLE_PROVIDERS.map((p) => {
            const isConnected = Boolean(connectedMap[p.id]);
            return (
              <PinkCard key={p.id} style={styles.providerCard}>
                <View style={styles.cardTop}>
                  <View style={styles.titleGroup}>
                    <Text style={[styles.providerName, { color: colors.text }]}>
                      {p.name}
                    </Text>
                    <Text style={[styles.categoryBadge, { color: colors.primary, backgroundColor: `${colors.primary}15` }]}>
                      {p.category}
                    </Text>
                  </View>
                  <Switch
                    value={isConnected}
                    onValueChange={(val) => handleToggle(p.id, val)}
                    trackColor={{ false: '#FFE0ED', true: colors.primary }}
                  />
                </View>

                <Text style={[styles.providerDesc, { color: colors.textMuted }]}>
                  {p.description}
                </Text>

                <View style={styles.metricsRow}>
                  <Text style={[styles.metricsLabel, { color: colors.textLight }]}>
                    Supported Metrics:
                  </Text>
                  <Text style={[styles.metricsList, { color: colors.text }]}>
                    {p.supportedMetrics.join(' • ')}
                  </Text>
                </View>
              </PinkCard>
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
  list: {
    gap: 12,
    marginBottom: 20,
  },
  providerCard: {
    padding: 16,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    flexWrap: 'wrap',
  },
  providerName: {
    fontSize: 16,
    fontWeight: '800',
  },
  categoryBadge: {
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  providerDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: '#FFE0ED',
    paddingTop: 8,
    flexWrap: 'wrap',
  },
  metricsLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  metricsList: {
    fontSize: 11,
    fontWeight: '700',
  },
});
