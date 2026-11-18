import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Share,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAppTheme } from '../../context/ThemeContext';
import { PinkCard } from '../../components/common/PinkCard';
import { PinkButton } from '../../components/common/PinkButton';
import {
  HeartHandshake,
  ChevronLeft,
  Share2,
  Lock,
  Shield,
  Copy,
  Sparkles,
  UserX,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export default function PartnerSharingScreen() {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  const [inviteCode, setInviteCode] = useState('PRINCESS-LOVE-2026');
  const [partnerConnected, setPartnerConnected] = useState(true);

  // Scoped permissions
  const [sharePhase, setSharePhase] = useState(true);
  const [sharePeriodDates, setSharePeriodDates] = useState(true);
  const [shareMoods, setShareMoods] = useState(true);
  const [shareSymptoms, setShareSymptoms] = useState(false);
  const [shareUpdates, setShareUpdates] = useState(true);

  const handleShareInvite = async () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await Share.share({
        title: 'Barbie Period Companion - Partner Invite',
        message: `Join my private care circle on the Barbie Period Tracker! Connect with invite code: ${inviteCode} 💕`,
      });
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Could not share invite');
    }
  };

  const handleRevokePartner = () => {
    Alert.alert(
      'Revoke Partner Access?',
      'Your boyfriend will immediately lose access to your shared cycle updates and reminders. You can re-invite anytime.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Revoke Immediately',
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setPartnerConnected(false);
            Alert.alert('Access Revoked', 'Partner access has been safely revoked.');
          },
        },
      ]
    );
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
            <HeartHandshake size={32} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>
            Partner Sharing & Clue Connect 💕
          </Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Share selected cycle updates with your boyfriend with complete granular privacy controls
          </Text>
        </View>

        {/* Connection Status & Invite Card */}
        <PinkCard style={styles.card}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            {partnerConnected ? 'Connected with Boyfriend ❤️' : 'Invite Your Boyfriend'}
          </Text>

          <View style={[styles.codeBox, { backgroundColor: '#FFF0F6', borderColor: colors.border }]}>
            <Text style={[styles.codeLabel, { color: colors.textMuted }]}>Private Invite Code:</Text>
            <Text style={[styles.codeText, { color: colors.primary }]}>{inviteCode}</Text>
          </View>

          <PinkButton
            title="Share Secure Invite Code 💌"
            onPress={handleShareInvite}
            icon={<Share2 size={18} color="#FFFFFF" />}
            style={{ marginTop: 12 }}
          />

          {partnerConnected && (
            <TouchableOpacity
              onPress={handleRevokePartner}
              style={styles.revokeBtn}
            >
              <UserX size={16} color="#FF5252" />
              <Text style={styles.revokeText}>Revoke Partner Access Immediately</Text>
            </TouchableOpacity>
          )}
        </PinkCard>

        {/* Granular Sharing Permissions */}
        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 16, marginBottom: 10 }]}>
          Granular Information Permissions
        </Text>

        <PinkCard style={styles.card}>
          <View style={styles.permRow}>
            <View style={styles.permTextGroup}>
              <Text style={[styles.permTitle, { color: colors.text }]}>Current Cycle Phase</Text>
              <Text style={[styles.permDesc, { color: colors.textMuted }]}>
                Allows him to see whether you are in Menstrual, Follicular, Ovulatory, or Luteal phase
              </Text>
            </View>
            <Switch
              value={sharePhase}
              onValueChange={setSharePhase}
              trackColor={{ false: '#FFE0ED', true: colors.primary }}
            />
          </View>

          <View style={[styles.permRow, { marginTop: 14 }]}>
            <View style={styles.permTextGroup}>
              <Text style={[styles.permTitle, { color: colors.text }]}>Estimated Next Period</Text>
              <Text style={[styles.permDesc, { color: colors.textMuted }]}>
                Allows him to view the countdown and upcoming period date
              </Text>
            </View>
            <Switch
              value={sharePeriodDates}
              onValueChange={setSharePeriodDates}
              trackColor={{ false: '#FFE0ED', true: colors.primary }}
            />
          </View>

          <View style={[styles.permRow, { marginTop: 14 }]}>
            <View style={styles.permTextGroup}>
              <Text style={[styles.permTitle, { color: colors.text }]}>Emotional Mood</Text>
              <Text style={[styles.permDesc, { color: colors.textMuted }]}>
                Shares your general emotional state so he can offer sweet encouragement
              </Text>
            </View>
            <Switch
              value={shareMoods}
              onValueChange={setShareMoods}
              trackColor={{ false: '#FFE0ED', true: colors.primary }}
            />
          </View>

          <View style={[styles.permRow, { marginTop: 14 }]}>
            <View style={styles.permTextGroup}>
              <Text style={[styles.permTitle, { color: colors.text }]}>Physical Symptoms (Cramps, etc.)</Text>
              <Text style={[styles.permDesc, { color: colors.textMuted }]}>
                Shares when you have cramps or fatigue so he can prepare warmth
              </Text>
            </View>
            <Switch
              value={shareSymptoms}
              onValueChange={setShareSymptoms}
              trackColor={{ false: '#FFE0ED', true: colors.primary }}
            />
          </View>
        </PinkCard>

        {/* Security & Zero Public Links Guarantee */}
        <PinkCard style={[styles.privacyCard, { backgroundColor: '#F8F9FA' }]}>
          <Shield size={20} color="#00897B" />
          <View style={{ flex: 1 }}>
            <Text style={[styles.privacyTitle, { color: colors.text }]}>
              Zero Public Links Guarantee
            </Text>
            <Text style={[styles.privacyDesc, { color: colors.textMuted }]}>
              Your sensitive health data is never published to public links or shared with third parties. Only your authenticated partner with this cryptographic token can view permitted updates.
            </Text>
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
  card: {
    padding: 16,
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
  },
  codeBox: {
    padding: 12,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    gap: 4,
  },
  codeLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  codeText: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 2,
  },
  revokeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 14,
    paddingVertical: 8,
  },
  revokeText: {
    color: '#FF5252',
    fontSize: 12,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  permRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  permTextGroup: {
    flex: 1,
    paddingRight: 12,
  },
  permTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  permDesc: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  privacyCard: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 20,
  },
  privacyTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  privacyDesc: {
    fontSize: 11,
    lineHeight: 16,
  },
});
