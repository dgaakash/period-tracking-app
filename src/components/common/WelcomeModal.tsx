import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useAppTheme } from '../../context/ThemeContext';
import { checkWelcomeStatus } from '../../services/greetings';
import { themeDimensions } from '../../constants/theme';
import { PinkButton } from './PinkButton';
import { AnimatedHearts } from './AnimatedHearts';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const WelcomeModal: React.FC = () => {
  const { colors } = useAppTheme();
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [isFirstLaunch, setIsFirstLaunch] = useState(false);

  useEffect(() => {
    async function evaluateGreeting() {
      const status = await checkWelcomeStatus();
      if (status.showModal) {
        setMessage(status.message);
        setIsFirstLaunch(status.isFirstLaunch);
        setVisible(true);
      }
    }
    evaluateGreeting();
  }, []);

  const handleDismiss = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setVisible(false);
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={handleDismiss}
    >
      <View style={styles.backdrop}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: colors.cardBorder,
              shadowColor: colors.primary,
            },
          ]}
        >
          <AnimatedHearts />

          <View style={styles.iconContainer}>
            <Text style={styles.crownEmoji}>{isFirstLaunch ? '👑' : '🎀'}</Text>
          </View>

          <Text style={[styles.title, { color: colors.primary }]}>
            {isFirstLaunch ? 'Welcome Princess! 💗' : 'Hello Gorgeous!'}
          </Text>

          <Text style={[styles.message, { color: colors.text }]}>
            {message}
          </Text>

          <Text style={[styles.subtext, { color: colors.textMuted }]}>
            {isFirstLaunch
              ? 'Your private, completely free pink sanctuary for cycle tracking and self-care is ready for you.'
              : 'Wishing you a comfortable, radiant, and gentle day! ✨'}
          </Text>

          <PinkButton
            title="Thank You! 💖"
            onPress={handleDismiss}
            style={styles.button}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(51, 15, 34, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: themeDimensions.spacing.lg,
  },
  card: {
    width: Math.min(SCREEN_WIDTH - 48, 380),
    borderRadius: themeDimensions.radius.xl,
    padding: themeDimensions.spacing.xl,
    alignItems: 'center',
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
    overflow: 'hidden',
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFF0F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#FFD6E7',
  },
  crownEmoji: {
    fontSize: 36,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 24,
  },
  subtext: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 18,
    paddingHorizontal: 8,
  },
  button: {
    width: '100%',
  },
});
