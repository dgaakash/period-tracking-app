import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  Path,
  Circle,
  G,
  Rect,
} from 'react-native-svg';

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
  return (
    <View style={[{ width: size, height: size }, styles.container, style]}>
      <Svg width={size} height={size} viewBox="0 0 512 512">
        <Defs>
          {/* Background Gradient */}
          <LinearGradient id="appBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FFF0F5" />
            <Stop offset="50%" stopColor="#FFE4EE" />
            <Stop offset="100%" stopColor="#FFD1E3" />
          </LinearGradient>

          {/* Barbie Heart Gradient */}
          <LinearGradient id="appHeartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FF63B0" />
            <Stop offset="40%" stopColor="#FF2E93" />
            <Stop offset="100%" stopColor="#C2185B" />
          </LinearGradient>

          {/* Lotus / Wellness Petal Gradient */}
          <LinearGradient id="appLotusGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <Stop offset="0%" stopColor="#FFFFFF" />
            <Stop offset="50%" stopColor="#FFE8F3" />
            <Stop offset="100%" stopColor="#D8B4FE" />
          </LinearGradient>

          {/* Golden Crown Accent */}
          <LinearGradient id="appCrownGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FFF9C4" />
            <Stop offset="45%" stopColor="#FFD54F" />
            <Stop offset="100%" stopColor="#FF8F00" />
          </LinearGradient>

          {/* Soft Glow Radial Gradient */}
          <RadialGradient id="appAura" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#FF2E93" stopOpacity="0.3" />
            <Stop offset="70%" stopColor="#FF77B9" stopOpacity="0.1" />
            <Stop offset="100%" stopColor="#FFF0F5" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* Ambient Glow */}
        {showGlow && (
          <Circle cx="256" cy="256" r="240" fill="url(#appAura)" />
        )}

        {/* Squircle Surface */}
        <Rect width="512" height="512" rx="115" fill="url(#appBgGrad)" />

        {/* Decorative Rings */}
        <Circle cx="256" cy="256" r="218" fill="none" stroke="#FFA4CF" strokeWidth="4" strokeOpacity="0.6" />
        <Circle cx="256" cy="256" r="208" fill="#FFFFFF" fillOpacity="0.5" stroke="#FF77B9" strokeWidth="2" strokeDasharray="6 6" />

        {/* Main Radiant Barbie Heart */}
        <Path
          d="M 256,410 
             C 176,340 76,252 76,154 
             C 76,88 126,44 190,44 
             C 226,44 246,64 256,80 
             C 266,64 286,44 322,44 
             C 386,44 436,88 436,154 
             C 436,252 336,340 256,410 Z"
          fill="url(#appHeartGrad)"
        />

        {/* Left Lobule Highlight */}
        <Path
          d="M 120,130 C 120,95 145,72 180,68 C 160,76 135,100 135,130 C 135,145 140,158 145,170 C 130,158 120,145 120,130 Z"
          fill="#FFFFFF"
          fillOpacity="0.4"
        />

        {/* Blooming Wellness Lotus Inside the Heart */}
        <G transform="translate(0, 24)">
          {/* Central Lotus Petal */}
          <Path
            d="M 256,325 
               C 216,250 216,165 256,110 
               C 296,165 296,250 256,325 Z"
            fill="url(#appLotusGrad)"
          />

          {/* Left Blossom Petal */}
          <Path
            d="M 246,315 
               C 188,262 162,192 198,150 
               C 224,180 246,245 246,315 Z"
            fill="#FFFFFF"
            fillOpacity="0.92"
          />

          {/* Right Blossom Petal */}
          <Path
            d="M 266,315 
               C 324,262 350,192 314,150 
               C 288,180 266,245 266,315 Z"
            fill="#FFFFFF"
            fillOpacity="0.92"
          />

          {/* Central Wellness Pearl */}
          <Circle cx="256" cy="225" r="14" fill="#FFFFFF" />
          <Circle cx="256" cy="225" r="9" fill="#FF2E93" fillOpacity="0.8" />
        </G>

        {/* Princess Tiara / Golden Diadem Crest */}
        <G>
          <Path
            d="M 216,46 L 232,74 L 256,22 L 280,74 L 296,46 L 282,88 L 230,88 Z"
            fill="url(#appCrownGrad)"
          />
          <Circle cx="216" cy="42" r="6" fill="#FFF59D" />
          <Circle cx="256" cy="18" r="9" fill="#FFFFFF" stroke="#FFA000" strokeWidth="2.5" />
          <Circle cx="296" cy="42" r="6" fill="#FFF59D" />
        </G>

        {/* Sparkle Micro-accents */}
        <Path
          d="M 390,70 Q 390,95 415,95 Q 390,95 390,120 Q 390,95 365,95 Q 390,95 390,70 Z"
          fill="#FFD54F"
        />
        <Circle cx="390" cy="95" r="4" fill="#FFFFFF" />

        <Path
          d="M 105,335 Q 105,352 122,352 Q 105,352 105,369 Q 105,352 88,352 Q 105,352 105,335 Z"
          fill="#C8A2FF"
        />
        <Path
          d="M 395,310 Q 395,320 405,320 Q 395,320 395,330 Q 395,320 385,320 Q 395,320 395,310 Z"
          fill="#FF8FC7"
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
