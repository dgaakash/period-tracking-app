import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppLogo } from './AppLogo';
import {
  Sparkles,
  Heart,
  RefreshCw,
  Lock,
  CalendarHeart,
  Flower2,
  Stars,
} from 'lucide-react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const ROTATING_MESSAGES = [
  { text: "Preparing your little happy space", emoji: "💗" },
  { text: "A little love is on its way...", emoji: "✨" },
  { text: "Making everything lovely for you", emoji: "🌸" },
  { text: "Getting your princess dashboard ready...", emoji: "🎀" },
  { text: "Aligning your stars & cycle harmony...", emoji: "🌙" },
];

interface DreamlandLoadingScreenProps {
  isReady: boolean;
  onAnimationComplete?: () => void;
  error?: string | null;
  onRetry?: () => void;
}

export const DreamlandLoadingScreen: React.FC<DreamlandLoadingScreenProps> = ({
  isReady,
  onAnimationComplete,
  error,
  onRetry,
}) => {
  const insets = useSafeAreaInsets();
  const [messageIndex, setMessageIndex] = useState(0);

  // Core Transitions
  const screenOpacity = useSharedValue(1);
  const cardScale = useSharedValue(0.92);
  const cardOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.85);
  const auraScale = useSharedValue(1);
  const auraOpacity = useSharedValue(0.4);
  const progressBarWidth = useSharedValue(0.18);
  const messageOpacity = useSharedValue(1);
  const badgeOpacity = useSharedValue(0);
  const bottomRowOpacity = useSharedValue(0);

  // Floating Decorative Particles (8 particles across the screen)
  const p1Y = useSharedValue(0);
  const p2Y = useSharedValue(0);
  const p3Y = useSharedValue(0);
  const p4Y = useSharedValue(0);
  const p5Y = useSharedValue(0);
  const p6Y = useSharedValue(0);

  // Shimmer sparkle rotation
  const sparkleRotate = useSharedValue(0);

  useEffect(() => {
    // 1. Entrance choreography
    cardOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
    cardScale.value = withTiming(1, { duration: 750, easing: Easing.out(Easing.back(1.4)) });
    badgeOpacity.value = withDelay(250, withTiming(1, { duration: 500 }));
    bottomRowOpacity.value = withDelay(450, withTiming(1, { duration: 600 }));

    // 2. Logo gentle breathing pulse
    logoScale.value = withTiming(1, { duration: 700 }, () => {
      logoScale.value = withRepeat(
        withSequence(
          withTiming(1.04, { duration: 2000, easing: Easing.inOut(Easing.quad) }),
          withTiming(0.98, { duration: 2000, easing: Easing.inOut(Easing.quad) })
        ),
        -1,
        true
      );
    });

    // 3. Ambient Glow Aura breathing
    auraScale.value = withRepeat(
      withSequence(
        withTiming(1.22, { duration: 2400, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.95, { duration: 2400, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );
    auraOpacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 2400, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.3, { duration: 2400, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );

    // 4. Progress bar auto-advance while loading
    progressBarWidth.value = withTiming(0.88, { duration: 2800, easing: Easing.out(Easing.quad) });

    // 5. Sparkle gentle spin
    sparkleRotate.value = withRepeat(
      withTiming(360, { duration: 8000, easing: Easing.linear }),
      -1,
      false
    );

    // 6. Floating particle drift
    p1Y.value = withRepeat(
      withSequence(
        withTiming(-22, { duration: 2200, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 2200, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );
    p2Y.value = withDelay(
      300,
      withRepeat(
        withSequence(
          withTiming(-28, { duration: 2800, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 2800, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      )
    );
    p3Y.value = withDelay(
      600,
      withRepeat(
        withSequence(
          withTiming(-20, { duration: 2400, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 2400, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      )
    );
    p4Y.value = withDelay(
      400,
      withRepeat(
        withSequence(
          withTiming(-25, { duration: 2600, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 2600, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      )
    );
    p5Y.value = withDelay(
      800,
      withRepeat(
        withSequence(
          withTiming(-18, { duration: 2100, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 2100, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      )
    );
    p6Y.value = withDelay(
      500,
      withRepeat(
        withSequence(
          withTiming(-24, { duration: 2500, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 2500, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      )
    );

    // 7. Rotating messages cycle
    const interval = setInterval(() => {
      messageOpacity.value = withSequence(
        withTiming(0, { duration: 220 }),
        withTiming(1, { duration: 320 })
      );
      setTimeout(() => {
        setMessageIndex((prev) => (prev + 1) % ROTATING_MESSAGES.length);
      }, 220);
    }, 2200);

    return () => clearInterval(interval);
  }, []);

  // When parent signals initialization is complete
  useEffect(() => {
    if (isReady && !error) {
      progressBarWidth.value = withTiming(1.0, { duration: 200 });
      screenOpacity.value = withDelay(
        150,
        withTiming(0, { duration: 380, easing: Easing.out(Easing.quad) }, (finished) => {
          if (finished && onAnimationComplete) {
            runOnJS(onAnimationComplete)();
          }
        })
      );
    }
  }, [isReady, error]);

  // Animated styles
  const animatedScreenStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
  }));

  const animatedCardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ scale: cardScale.value }],
  }));

  const animatedLogoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
  }));

  const animatedAuraStyle = useAnimatedStyle(() => ({
    transform: [{ scale: auraScale.value }],
    opacity: auraOpacity.value,
  }));

  const animatedProgressStyle = useAnimatedStyle(() => ({
    width: `${progressBarWidth.value * 100}%`,
  }));

  const animatedMessageStyle = useAnimatedStyle(() => ({
    opacity: messageOpacity.value,
  }));

  const animatedBadgeStyle = useAnimatedStyle(() => ({
    opacity: badgeOpacity.value,
  }));

  const animatedBottomRowStyle = useAnimatedStyle(() => ({
    opacity: bottomRowOpacity.value,
  }));

  const animatedSparkleStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${sparkleRotate.value}deg` }],
  }));

  const p1Style = useAnimatedStyle(() => ({ transform: [{ translateY: p1Y.value }] }));
  const p2Style = useAnimatedStyle(() => ({ transform: [{ translateY: p2Y.value }] }));
  const p3Style = useAnimatedStyle(() => ({ transform: [{ translateY: p3Y.value }] }));
  const p4Style = useAnimatedStyle(() => ({ transform: [{ translateY: p4Y.value }] }));
  const p5Style = useAnimatedStyle(() => ({ transform: [{ translateY: p5Y.value }] }));
  const p6Style = useAnimatedStyle(() => ({ transform: [{ translateY: p6Y.value }] }));

  return (
    <Animated.View
      style={[styles.absoluteFill, styles.overlay, animatedScreenStyle]}
      pointerEvents={isReady && !error ? 'none' : 'auto'}
    >
      <StatusBar style="dark" />

      {/* Rich Barbie Sunset Blush Gradient Background */}
      <LinearGradient
        colors={['#FFF0F6', '#FFE3EE', '#FFD1E3', '#FFF5F8']}
        locations={[0, 0.45, 0.8, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradient, { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 16 }]}
      >
        {/* Ambient Dreamland Glow Orbs */}
        <View style={styles.topAmbientGlow} />
        <View style={styles.bottomAmbientGlow} />

        {/* Floating Decorative Particles Field */}
        <Animated.Text style={[styles.floatingParticle, { left: 28, top: insets.top + 40, fontSize: 24 }, p1Style]}>
          🌸
        </Animated.Text>
        <Animated.Text style={[styles.floatingParticle, { right: 34, top: insets.top + 60, fontSize: 20 }, p2Style]}>
          ✨
        </Animated.Text>
        <Animated.Text style={[styles.floatingParticle, { left: 45, top: SCREEN_HEIGHT * 0.38, fontSize: 18 }, p3Style]}>
          💖
        </Animated.Text>
        <Animated.Text style={[styles.floatingParticle, { right: 38, top: SCREEN_HEIGHT * 0.42, fontSize: 22 }, p4Style]}>
          🎀
        </Animated.Text>
        <Animated.Text style={[styles.floatingParticle, { left: 32, bottom: insets.bottom + 120, fontSize: 20 }, p5Style]}>
          ✨
        </Animated.Text>
        <Animated.Text style={[styles.floatingParticle, { right: 42, bottom: insets.bottom + 140, fontSize: 22 }, p6Style]}>
          🌷
        </Animated.Text>

        {/* Top Header Badge */}
        <Animated.View style={[styles.topBadgeWrapper, animatedBadgeStyle]}>
          <View style={styles.pillBadge}>
            <Stars size={13} color="#FF4FA3" />
            <Text style={styles.pillBadgeText}>BARBIE WELLNESS SANCTUARY</Text>
            <Sparkles size={13} color="#FF4FA3" />
          </View>
        </Animated.View>

        {/* Central Hero Pedestal Card */}
        <Animated.View style={[styles.centerPedestal, animatedCardStyle]}>
          
          {/* Breathing Aura Behind Logo */}
          <Animated.View style={[styles.logoAura, animatedAuraStyle]} />

          {/* Logo Showcase with Shimmer Accents */}
          <View style={styles.logoContainer}>
            <Animated.View style={[styles.logoAnimatedBox, animatedLogoStyle]}>
              <AppLogo size={160} showGlow={false} />
            </Animated.View>

            {/* Floating Sparkle Stars around the Logo */}
            <Animated.View style={[styles.cornerSparkleTR, animatedSparkleStyle]}>
              <Sparkles size={22} color="#FFD54F" />
            </Animated.View>
            <View style={styles.cornerSparkleBL}>
              <Heart size={16} color="#FF4FA3" fill="#FF4FA3" />
            </View>
          </View>

          {/* Title & Romantic Tagline */}
          <View style={styles.titleBlock}>
            <Text style={styles.appTitle}>Barbie Period Tracker</Text>
            <View style={styles.subtitleRow}>
              <Flower2 size={13} color="#FF4FA3" />
              <Text style={styles.appSubtitle}>Feminine Wellness & Cycle Companion</Text>
              <Flower2 size={13} color="#FF4FA3" />
            </View>
          </View>

          {/* Error State or Progress Experience */}
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Unable to load local sanctuary: {error}</Text>
              {onRetry && (
                <TouchableOpacity onPress={onRetry} style={styles.retryButton} activeOpacity={0.85}>
                  <RefreshCw size={16} color="#FFFFFF" />
                  <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.progressContainer}>
              {/* Refined Glowing Shimmer Progress Bar */}
              <View style={styles.progressTrack}>
                <Animated.View style={[styles.progressBar, animatedProgressStyle]}>
                  <LinearGradient
                    colors={['#FFB3D9', '#FF4FA3', '#E0115F']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.absoluteFill}
                  />
                </Animated.View>
              </View>

              {/* Sweet Affirmation Card with Emoji */}
              <View style={styles.messageBubble}>
                <Animated.View style={[styles.messageRow, animatedMessageStyle]}>
                  <Text style={styles.messageEmoji}>
                    {ROTATING_MESSAGES[messageIndex].emoji}
                  </Text>
                  <Text style={styles.messageText}>
                    {ROTATING_MESSAGES[messageIndex].text}
                  </Text>
                </Animated.View>
              </View>
            </View>
          )}

        </Animated.View>

        {/* Bottom Feature Highlights Card Row (Fills lower screen with visual richness) */}
        <Animated.View style={[styles.bottomCardRow, animatedBottomRowStyle]}>
          <View style={styles.miniFeatureCard}>
            <View style={styles.miniIconCircle}>
              <CalendarHeart size={15} color="#FF4FA3" />
            </View>
            <Text style={styles.miniFeatureTitle}>Cycle Care</Text>
            <Text style={styles.miniFeatureDesc}>Smart rhythm</Text>
          </View>

          <View style={styles.miniFeatureCard}>
            <View style={styles.miniIconCircle}>
              <Heart size={15} color="#FF4FA3" fill="#FF8FC7" />
            </View>
            <Text style={styles.miniFeatureTitle}>Self Love</Text>
            <Text style={styles.miniFeatureDesc}>Daily comfort</Text>
          </View>

          <View style={styles.miniFeatureCard}>
            <View style={styles.miniIconCircle}>
              <Lock size={14} color="#FF4FA3" />
            </View>
            <Text style={styles.miniFeatureTitle}>100% Private</Text>
            <Text style={styles.miniFeatureDesc}>Offline first</Text>
          </View>
        </Animated.View>

      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  absoluteFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlay: {
    zIndex: 9999,
    backgroundColor: '#FFF0F6',
  },
  gradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  topAmbientGlow: {
    position: 'absolute',
    top: -80,
    left: SCREEN_WIDTH * 0.15,
    width: SCREEN_WIDTH * 0.7,
    height: SCREEN_WIDTH * 0.7,
    borderRadius: (SCREEN_WIDTH * 0.7) / 2,
    backgroundColor: 'rgba(255, 143, 199, 0.28)',
  },
  bottomAmbientGlow: {
    position: 'absolute',
    bottom: -100,
    right: -40,
    width: SCREEN_WIDTH * 0.8,
    height: SCREEN_WIDTH * 0.8,
    borderRadius: (SCREEN_WIDTH * 0.8) / 2,
    backgroundColor: 'rgba(200, 162, 255, 0.22)',
  },
  floatingParticle: {
    position: 'absolute',
    opacity: 0.85,
  },
  topBadgeWrapper: {
    marginTop: 8,
  },
  pillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 79, 163, 0.25)',
    shadowColor: '#FF4FA3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  pillBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FF2D8D',
    letterSpacing: 1.2,
  },
  centerPedestal: {
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.82)',
    borderRadius: 36,
    paddingVertical: 28,
    paddingHorizontal: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#FF4FA3',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 8,
    position: 'relative',
    marginVertical: 'auto',
  },
  logoAura: {
    position: 'absolute',
    top: 24,
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(255, 79, 163, 0.25)',
  },
  logoContainer: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 16,
  },
  logoAnimatedBox: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cornerSparkleTR: {
    position: 'absolute',
    top: -4,
    right: 4,
  },
  cornerSparkleBL: {
    position: 'absolute',
    bottom: 6,
    left: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 4,
    shadowColor: '#FF4FA3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  titleBlock: {
    alignItems: 'center',
    marginBottom: 20,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#4A152E',
    letterSpacing: -0.4,
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  appSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FF4FA3',
    letterSpacing: 0.4,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressTrack: {
    width: '100%',
    maxWidth: 240,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 79, 163, 0.14)',
    overflow: 'hidden',
    marginBottom: 14,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  messageBubble: {
    minHeight: 28,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  messageEmoji: {
    fontSize: 14,
  },
  messageText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#7A3959',
    textAlign: 'center',
  },
  bottomCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 360,
    gap: 8,
  },
  miniFeatureCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    shadowColor: '#FF4FA3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  miniIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 240, 246, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 79, 163, 0.2)',
  },
  miniFeatureTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#51243D',
    marginBottom: 2,
  },
  miniFeatureDesc: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#A06180',
  },
  errorContainer: {
    alignItems: 'center',
    marginTop: 6,
    gap: 12,
  },
  errorText: {
    color: '#D81B60',
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '600',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FF4FA3',
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 22,
    shadowColor: '#FF4FA3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
