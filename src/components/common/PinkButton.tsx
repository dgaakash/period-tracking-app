import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useAppTheme } from '../../context/ThemeContext';
import { themeDimensions } from '../../constants/theme';

interface PinkButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
  loading?: boolean;
}

export const PinkButton: React.FC<PinkButtonProps> = ({
  title,
  onPress,
  style,
  textStyle,
  icon,
  variant = 'primary',
  disabled = false,
  loading = false,
}) => {
  const { colors } = useAppTheme();

  const handlePress = () => {
    if (disabled || loading) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    onPress();
  };

  if (variant === 'outline') {
    return (
      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled || loading}
        activeOpacity={0.7}
        style={[
          styles.button,
          styles.outlineButton,
          { borderColor: colors.primary, backgroundColor: 'transparent' },
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <>
            {icon && <>{icon}</>}
            <Text style={[styles.text, { color: colors.primary }, textStyle]}>{title}</Text>
          </>
        )}
      </TouchableOpacity>
    );
  }

  const gradientColors: [string, string] =
    variant === 'secondary'
      ? [colors.secondary, colors.highlight]
      : (colors.gradient || [colors.primary, colors.secondary]);

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.85}
      style={[
        styles.container,
        { shadowColor: colors.shadow || colors.primary },
        style,
      ]}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.button, disabled && { opacity: 0.6 }]}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <>
            {icon && <>{icon}</>}
            <Text style={[styles.text, textStyle]}>{title}</Text>
          </>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: themeDimensions.radius.full,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.26,
    shadowRadius: 12,
    elevation: 4,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: themeDimensions.radius.full,
    gap: 8,
  },
  outlineButton: {
    borderWidth: 1.5,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
