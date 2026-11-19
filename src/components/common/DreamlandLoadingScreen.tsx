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
import { Sparkles, Heart, RefreshCw } from 'lucide-react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const ROTATING_MESSAGES = [
  "Preparing your little happy space 💗",
  "A little love is on its way...",
  "Making everything lovely for you ✨",
  "Getting your princess dashboard ready...",
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

  // Animations
  const screenOpacity = useSharedValue(1);
  const logoScale = useSharedValue(0.85);
  const logoOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const progressBarWidth = useSharedValue(0.15);
  const messageOpacity = useSharedValue(1);

  // Floating particles
  const particle1Y = useSharedValue(0);
  const particle2Y = useSharedValue(0);
  const particle3Y = useSharedValue(0);
  const particle4Y = useSharedValue(0);

  useEffect(() => {
    // 1. Entrance animation
    logoOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
    logoScale.value = withTiming(1, { duration: 700, easing: Easing.out(Easing.back(1.5)) }, () => {
      // 2. Start gentle breathing pulse after entrance
      logoScale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 1800, easing: Easing.inOut(Easing.quad) }),
          withTiming(0.98, { duration: 1800, easing: Easing.inOut(Easing.quad) })
        ),
        -1,
        true
      );
    });

    textOpacity.value = withDelay(300, withTiming(1, { duration: 600 }));
    progressBarWidth.value = withTiming(0.85, { duration: 2500, easing: Easing.out(Easing.quad) });

    // Floating particles drifting
    particle1Y.value = withRepeat(
      withSequence(
        withTiming(-24, { duration: 2200, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 2200, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );
    particle2Y.value = withDelay(
      400,
      withRepeat(
        withSequence(
          withTiming(-20, { duration: 2600, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 2600, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      )
    );
    particle3Y.value = withDelay(
      800,
      withRepeat(
        withSequence(
          withTiming(-18, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      )
    );
    particle4Y.value = withDelay(
      600,
      withRepeat(
        withSequence(
          withTiming(-22, { duration: 2400, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 2400, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      )
    );

    // Rotating messages interval
    const interval = setInterval(() => {
      messageOpacity.value = withSequence(
        withTiming(0, { duration: 250 }),
        withTiming(1, { duration: 350 })
      );
      setTimeout(() => {
        setMessageIndex((prev) => (prev + 1) % ROTATING_MESSAGES.length);
      }, 250);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // When parent signals initialization is complete
  useEffect(() => {
    if (isReady && !error) {
      progressBarWidth.value = withTiming(1.0, { duration: 250 });
      screenOpacity.value = withDelay(
        200,
        withTiming(0, { duration: 400, easing: Easing.out(Easing.quad) }, (finished) => {
          if (finished && onAnimationComplete) {
            runOnJS(onAnimationComplete)();
          }
        })
      );
    }
  }, [isReady, error]);

  const animatedScreenStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
  }));

  const animatedLogoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const animatedTextStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  const animatedProgressStyle = useAnimatedStyle(() => ({
    width: `${progressBarWidth.value * 100}%`,
  }));

  const animatedMessageStyle = useAnimatedStyle(() => ({
    opacity: messageOpacity.value,
  }));

  const p1Style = useAnimatedStyle(() => ({ transform: [{ translateY: particle1Y.value }] }));
  const p2Style = useAnimatedStyle(() => ({ transform: [{ translateY: particle2Y.value }] }));
  const p3Style = useAnimatedStyle(() => ({ transform: [{ translateY: particle3Y.value }] }));
  const p4Style = useAnimatedStyle(() => ({ transform: [{ translateY: particle4Y.value }] }));

  return (
    <Animated.View
      style={[
        styles.absoluteFill,
        styles.overlay,
        animatedScreenStyle,
      ]}
      pointerEvents={isReady && !error ? 'none' : 'auto'}
    >
      <StatusBar style="dark" />
      <LinearGradient
        colors={['#FFF5F8', '#FFF0F6', '#FFE3EE']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.3, y: 1 }}
        style={[styles.gradient, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
      >
        {/* Floating Background Particles */}
        <Animated.Text style={[styles.floatingParticle, { left: 40, top: 140, fontSize: 26 }, p1Style]}>
          🌸
        </Animated.Text>
        <Animated.Text style={[styles.floatingParticle, { right: 50, top: 180, fontSize: 20 }, p2Style]}>
          ✨
        </Animated.Text>
        <Animated.Text style={[styles.floatingParticle, { left: 55, bottom: 220, fontSize: 22 }, p3Style]}>
          💗
        </Animated.Text>
        <Animated.Text style={[styles.floatingParticle, { right: 45, bottom: 240, fontSize: 24 }, p4Style]}>
          🎀
        </Animated.Text>

        {/* Central Brand Unit */}
        <View style={styles.centerBox}>
          <Animated.View style={[styles.logoWrapper, animatedLogoStyle]}>
            <AppLogo size={140} showGlow />
          </Animated.View>

          <Animated.View style={[styles.titleWrapper, animatedTextStyle]}>
            <Text style={styles.brandTitle}>Barbie Period Tracker</Text>
            <View style={styles.subtitleRow}>
              <Sparkles size={13} color="#FF4FA3" />
              <Text style={styles.brandSubtitle}>Princess Wellness Companion</Text>
              <Sparkles size={13} color="#FF4FA3" />
            </View>
          </Animated.View>

          {/* Error fallback state */}
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Unable to load local sanctuary: {error}</Text>
              {onRetry && (
                <TouchableOpacity onPress={onRetry} style={styles.retryButton}>
                  <RefreshCw size={16} color="#FFFFFF" />
                  <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <>
              {/* Refined Progress Bar */}
              <View style={styles.progressTrack}>
                <Animated.View style={[styles.progressBar, animatedProgressStyle]}>
                  <LinearGradient
                    colors={['#FF8FC7', '#FF4FA3']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.absoluteFill}
                  />
                </Animated.View>
              </View>

              {/* Rotating Comforting Messages */}
              <Animated.Text style={[styles.statusMessage, animatedMessageStyle]}>
                {ROTATING_MESSAGES[messageIndex]}
              </Animated.Text>
            </>
          )}
        </View>

        {/* Bottom Safety & Privacy Note */}
        <View style={styles.bottomNote}>
          <Heart size={12} color="#FF8FC7" />
          <Text style={styles.bottomText}>100% Free • Completely Private • Offline-First</Text>
        </View>
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
    paddingVertical: 32,
  },
  floatingParticle: {
    position: 'absolute',
    opacity: 0.7,
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    width: '100%',
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  titleWrapper: {
    alignItems: 'center',
    marginBottom: 28,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#51243D',
    letterSpacing: -0.5,
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandSubtitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FF4FA3',
    letterSpacing: 0.5,
  },
  progressTrack: {
    width: Math.min(SCREEN_WIDTH - 96, 260),
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 79, 163, 0.15)',
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  statusMessage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8D5272',
    textAlign: 'center',
    minHeight: 22,
  },
  errorContainer: {
    alignItems: 'center',
    marginTop: 10,
    gap: 12,
  },
  errorText: {
    color: '#D81B60',
    fontSize: 13,
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FF4FA3',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  bottomNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    opacity: 0.75,
  },
  bottomText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8D5272',
    letterSpacing: 0.2,
  },
});
