import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface HeartParticle {
  id: number;
  emoji: string;
  startX: number;
  startY: number;
  delay: number;
  size: number;
}

const PARTICLES: HeartParticle[] = [
  { id: 1, emoji: '💗', startX: 20, startY: 40, delay: 0, size: 22 },
  { id: 2, emoji: '✨', startX: SCREEN_WIDTH - 60, startY: 60, delay: 400, size: 18 },
  { id: 3, emoji: '💕', startX: 70, startY: 120, delay: 800, size: 20 },
  { id: 4, emoji: '🌸', startX: SCREEN_WIDTH - 90, startY: 140, delay: 200, size: 24 },
  { id: 5, emoji: '✨', startX: 40, startY: 200, delay: 600, size: 16 },
  { id: 6, emoji: '🎀', startX: SCREEN_WIDTH - 45, startY: 220, delay: 900, size: 20 },
];

const FloatingItem: React.FC<{ item: HeartParticle }> = ({ item }) => {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0.4);
  const scale = useSharedValue(0.9);

  useEffect(() => {
    translateY.value = withDelay(
      item.delay,
      withRepeat(
        withSequence(
          withTiming(-18, { duration: 2400, easing: Easing.inOut(Easing.quad) }),
          withTiming(0, { duration: 2400, easing: Easing.inOut(Easing.quad) })
        ),
        -1,
        true
      )
    );

    opacity.value = withDelay(
      item.delay,
      withRepeat(
        withSequence(
          withTiming(0.9, { duration: 2000 }),
          withTiming(0.4, { duration: 2000 })
        ),
        -1,
        true
      )
    );

    scale.value = withDelay(
      item.delay,
      withRepeat(
        withSequence(
          withTiming(1.15, { duration: 2200 }),
          withTiming(0.9, { duration: 2200 })
        ),
        -1,
        true
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.Text
      style={[
        styles.particle,
        { left: item.startX, top: item.startY, fontSize: item.size },
        animatedStyle,
      ]}
    >
      {item.emoji}
    </Animated.Text>
  );
};

export const AnimatedHearts: React.FC<{ pointerEvents?: 'none' | 'auto' }> = ({
  pointerEvents = 'none',
}) => {
  return (
    <View style={styles.container} pointerEvents={pointerEvents}>
      {PARTICLES.map((item) => (
        <FloatingItem key={item.id} item={item} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    zIndex: 0,
  },
  particle: {
    position: 'absolute',
  },
});
