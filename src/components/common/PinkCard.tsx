import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useAppTheme } from '../../context/ThemeContext';
import { themeDimensions } from '../../constants/theme';

interface PinkCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'elevated' | 'glass' | 'outlined';
}

export const PinkCard: React.FC<PinkCardProps> = ({ children, style, variant = 'elevated' }) => {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: variant === 'glass' ? colors.surfaceGlass : colors.surface,
          borderColor: colors.cardBorder,
          shadowColor: colors.shadow || colors.primary,
        },
        variant === 'outlined' && { borderWidth: 1.5, elevation: 0, shadowOpacity: 0 },
        colors.isDark && styles.darkShadow,
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: themeDimensions.radius.lg,
    padding: themeDimensions.spacing.md,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 3,
  },
  darkShadow: {
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 5,
  },
});
