import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { useAppTheme } from '../../context/ThemeContext';
import { MenstrualPhase } from '../../services/cycleEngine';

interface CircularPhaseIndicatorProps {
  cycleDay: number;
  totalCycleDays: number;
  phase: MenstrualPhase;
  phaseName: string;
  daysUntilPeriod: number;
  size?: number;
}

export const CircularPhaseIndicator: React.FC<CircularPhaseIndicatorProps> = ({
  cycleDay,
  totalCycleDays,
  phase,
  phaseName,
  daysUntilPeriod,
  size = 230,
}) => {
  const { colors } = useAppTheme();

  const strokeWidth = 14;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(1, Math.max(0.05, cycleDay / Math.max(1, totalCycleDays)));
  const strokeDashoffset = circumference - progress * circumference;

  const phaseColor = colors.phases[phase] || colors.primary;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Defs>
          <SvgGradient id="phaseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={phaseColor} />
            <Stop offset="100%" stopColor={colors.secondary} />
          </SvgGradient>
        </Defs>

        {/* Background track circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.highlight}
          strokeWidth={strokeWidth}
          fill="none"
          strokeOpacity={0.6}
        />

        {/* Progress arc */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#phaseGrad)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>

      {/* Center content */}
      <View style={styles.innerContent}>
        <Text style={[styles.phaseBadge, { color: phaseColor, backgroundColor: `${phaseColor}20` }]}>
          {phaseName.toUpperCase()}
        </Text>
        <Text style={[styles.dayNumber, { color: colors.text }]}>
          Day {cycleDay}
        </Text>
        <Text style={[styles.countdownText, { color: colors.textMuted }]}>
          {daysUntilPeriod > 0
            ? `Period in ${daysUntilPeriod} ${daysUntilPeriod === 1 ? 'day' : 'days'}`
            : daysUntilPeriod === 0
            ? 'Period expected today 💗'
            : `${Math.abs(daysUntilPeriod)} ${Math.abs(daysUntilPeriod) === 1 ? 'day' : 'days'} overdue 🌸`}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginVertical: 12,
  },
  innerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  phaseBadge: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 6,
  },
  dayNumber: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  countdownText: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
});
