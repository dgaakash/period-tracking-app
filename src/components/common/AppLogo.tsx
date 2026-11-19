import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { useAppTheme } from '../../context/ThemeContext';

interface AppLogoProps {
  size?: number;
  style?: ViewStyle;
  showGlow?: boolean;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  size = 120,
  style,
  showGlow = true,
}) => {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        { width: size, height: size },
        styles.container,
        showGlow && [
          styles.glowContainer,
          { shadowColor: colors.shadow || colors.primary },
        ],
        style,
      ]}
    >
      {showGlow && (
        <View
          style={[
            styles.glowAura,
            {
              width: size * 0.9,
              height: size * 0.9,
              borderRadius: (size * 0.9) / 2,
              backgroundColor: colors.primary,
              opacity: colors.isDark ? 0.35 : 0.2,
            },
          ]}
        />
      )}
      <Image
        source={require('../../../assets/images/logo.png')}
        style={{ width: size, height: size }}
        contentFit="contain"
        priority="high"
        accessibilityLabel="Barbie Period Tracker Logo"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  glowContainer: {
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
  glowAura: {
    position: 'absolute',
  },
});
