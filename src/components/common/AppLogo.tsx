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
  Filter,
  FeGaussianBlur,
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
      <Svg width={size} height={size} viewBox="0 0 200 200">
        <Defs>
          {/* Main Barbie Gradient */}
          <LinearGradient id="barbieHeartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FF6BB5" />
            <Stop offset="45%" stopColor="#FF4FA3" />
            <Stop offset="100%" stopColor="#D81B60" />
          </LinearGradient>

          {/* Lotus / Wellness Petal Gradient */}
          <LinearGradient id="lotusPetalGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <Stop offset="0%" stopColor="#FFF0F6" />
            <Stop offset="40%" stopColor="#FFD6E7" />
            <Stop offset="100%" stopColor="#C8A2FF" />
          </LinearGradient>

          {/* Golden Crown Accent */}
          <LinearGradient id="crownGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FFF3B0" />
            <Stop offset="50%" stopColor="#FFD54F" />
            <Stop offset="100%" stopColor="#FFA000" />
          </LinearGradient>

          {/* Soft Glow Radial Gradient */}
          <RadialGradient id="pinkAura" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#FF4FA3" stopOpacity="0.35" />
            <Stop offset="65%" stopColor="#FF8FC7" stopOpacity="0.15" />
            <Stop offset="100%" stopColor="#FFF0F6" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* Ambient Soft Glow Circle */}
        {showGlow && (
          <Circle cx="100" cy="100" r="92" fill="url(#pinkAura)" />
        )}

        {/* Circular Medallion Background */}
        <Circle
          cx="100"
          cy="100"
          r="80"
          fill="#FFFFFF"
          stroke="#FFE0ED"
          strokeWidth="3"
        />

        {/* Subtle decorative inner ring */}
        <Circle
          cx="100"
          cy="100"
          r="74"
          fill="none"
          stroke="#FFF0F6"
          strokeWidth="2"
          strokeDasharray="4 4"
        />

        {/* Main Radiant Barbie Heart Shape */}
        <Path
          d="M 100,160 
             C 70,135 34,106 34,72 
             C 34,48 52,32 74,32 
             C 88,32 96,39 100,46 
             C 104,39 112,32 126,32 
             C 148,32 166,48 166,72 
             C 166,106 130,135 100,160 Z"
          fill="url(#barbieHeartGrad)"
        />

        {/* Organic Blooming Wellness Lotus Inside the Heart */}
        <G transform="translate(0, 10)">
          {/* Central Lotus Petal */}
          <Path
            d="M 100,126 
               C 88,102 88,74 100,56 
               C 112,74 112,102 100,126 Z"
            fill="url(#lotusPetalGrad)"
          />

          {/* Left Blossom Wing */}
          <Path
            d="M 96,122 
               C 76,104 68,82 78,68 
               C 88,76 96,96 96,122 Z"
            fill="#FFFFFF"
            fillOpacity="0.9"
          />

          {/* Right Blossom Wing */}
          <Path
            d="M 104,122 
               C 124,104 132,82 122,68 
               C 112,76 104,96 104,122 Z"
            fill="#FFFFFF"
            fillOpacity="0.9"
          />
        </G>

        {/* Delicate Golden Sparkle Crown / Diadem at the Crest */}
        <G transform="translate(0, -6)">
          <Path
            d="M 86,30 L 92,38 L 100,22 L 108,38 L 114,30 L 110,42 L 90,42 Z"
            fill="url(#crownGrad)"
          />
          {/* Little Crown Jewels */}
          <Circle cx="86" cy="28" r="2.5" fill="#FFE082" />
          <Circle cx="100" cy="20" r="3.2" fill="#FFF8E1" />
          <Circle cx="114" cy="28" r="2.5" fill="#FFE082" />
        </G>

        {/* Floating Sparkle Micro-accents */}
        {/* Top-Right Sparkle */}
        <Path
          d="M 154,42 Q 154,48 160,48 Q 154,48 154,54 Q 154,48 148,48 Q 154,48 154,42 Z"
          fill="#FF8FC7"
        />
        {/* Bottom-Left Sparkle */}
        <Path
          d="M 46,128 Q 46,133 51,133 Q 46,133 46,138 Q 46,133 41,133 Q 46,133 46,128 Z"
          fill="#C8A2FF"
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
