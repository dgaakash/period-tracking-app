export type ThemeName =
  | 'barbie_pink'
  | 'rose_quartz'
  | 'lavender_dreams'
  | 'strawberry_milk'
  | 'cherry_blossom'
  | 'midnight_pink'
  | 'champagne_rose'
  | 'cotton_candy';

export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  surfaceGlass: string;
  accent: string;
  highlight: string;
  text: string;
  textMuted: string;
  textLight: string;
  border: string;
  cardBorder: string;
  success: string;
  error: string;
  shadow: string;
  gradient: [string, string];
  isDark?: boolean;
  phases: {
    menstrual: string;
    follicular: string;
    ovulation: string;
    luteal: string;
  };
}

export interface ThemeDefinition {
  name: string;
  tagline: string;
  emoji: string;
  isDark?: boolean;
  colors: ThemeColors;
}

export const THEMES: Record<ThemeName, ThemeDefinition> = {
  barbie_pink: {
    name: 'Haute Barbie (Signature)',
    tagline: 'Iconic runway glamour, cotton-candy blush & amethyst glow',
    emoji: '💖',
    isDark: false,
    colors: {
      primary: '#FF2E93',
      secondary: '#FF75B5',
      background: '#FFF0F6',
      surface: '#FFFFFF',
      surfaceGlass: 'rgba(255, 255, 255, 0.90)',
      accent: '#A855F7',
      highlight: '#FFE2EE',
      text: '#2B0C1E',
      textMuted: '#6E3755',
      textLight: '#A36B89',
      border: '#FFD1E3',
      cardBorder: 'rgba(255, 46, 147, 0.14)',
      success: '#10B981',
      error: '#F43F5E',
      shadow: '#FF2E93',
      gradient: ['#FF2E93', '#FF75B5'],
      isDark: false,
      phases: {
        menstrual: '#FF2E93',
        follicular: '#FF8577',
        ovulation: '#8B5CF6',
        luteal: '#C084FC',
      },
    },
  },
  rose_quartz: {
    name: 'Rose Quartz (Quiet Luxury)',
    tagline: 'Cashmere rose, dusty mineral quartz & warm pearl silk',
    emoji: '💎',
    isDark: false,
    colors: {
      primary: '#C95374',
      secondary: '#E88FA6',
      background: '#FBF4F6',
      surface: '#FFFFFF',
      surfaceGlass: 'rgba(255, 255, 255, 0.92)',
      accent: '#A57BB0',
      highlight: '#F7E1E7',
      text: '#321620',
      textMuted: '#734756',
      textLight: '#A67888',
      border: '#F0CAD4',
      cardBorder: 'rgba(201, 83, 116, 0.14)',
      success: '#10B981',
      error: '#E11D48',
      shadow: '#C95374',
      gradient: ['#C95374', '#E88FA6'],
      isDark: false,
      phases: {
        menstrual: '#C95374',
        follicular: '#E59882',
        ovulation: '#906AA8',
        luteal: '#C49EBC',
      },
    },
  },
  lavender_dreams: {
    name: 'Lavender Dreams (Zen Sanctuary)',
    tagline: 'Calming wisteria, soothing lilac & evening twilight serenity',
    emoji: '🪻',
    isDark: false,
    colors: {
      primary: '#8B5CF6',
      secondary: '#B48AFE',
      background: '#F7F4FD',
      surface: '#FFFFFF',
      surfaceGlass: 'rgba(255, 255, 255, 0.90)',
      accent: '#EC4899',
      highlight: '#EDE5FC',
      text: '#1D0E39',
      textMuted: '#594379',
      textLight: '#8E76B0',
      border: '#DCCFFB',
      cardBorder: 'rgba(139, 92, 246, 0.14)',
      success: '#10B981',
      error: '#F43F5E',
      shadow: '#8B5CF6',
      gradient: ['#8B5CF6', '#C084FC'],
      isDark: false,
      phases: {
        menstrual: '#F43F5E',
        follicular: '#FB923C',
        ovulation: '#7C3AED',
        luteal: '#A78BFA',
      },
    },
  },
  strawberry_milk: {
    name: 'Strawberry Milk (Kawaii Cream)',
    tagline: 'Sweet ripe strawberries, coral blush & whipped milk foam',
    emoji: '🍓',
    isDark: false,
    colors: {
      primary: '#FF5277',
      secondary: '#FF8CA4',
      background: '#FFF5F7',
      surface: '#FFFFFF',
      surfaceGlass: 'rgba(255, 255, 255, 0.92)',
      accent: '#F472B6',
      highlight: '#FFE3E9',
      text: '#320B15',
      textMuted: '#7C3444',
      textLight: '#B06D7D',
      border: '#FFCAD4',
      cardBorder: 'rgba(255, 82, 119, 0.14)',
      success: '#10B981',
      error: '#E11D48',
      shadow: '#FF5277',
      gradient: ['#FF5277', '#FF94A8'],
      isDark: false,
      phases: {
        menstrual: '#FF5277',
        follicular: '#FF9B71',
        ovulation: '#C084FC',
        luteal: '#FF8CA4',
      },
    },
  },
  cherry_blossom: {
    name: 'Cherry Blossom (Sakura Bloom)',
    tagline: 'Delicate Japanese sakura petals & morning spring dew',
    emoji: '🌸',
    isDark: false,
    colors: {
      primary: '#E34975',
      secondary: '#F58CA8',
      background: '#FFF4F7',
      surface: '#FFFFFF',
      surfaceGlass: 'rgba(255, 255, 255, 0.92)',
      accent: '#A855F7',
      highlight: '#FDE1EA',
      text: '#300F1A',
      textMuted: '#78374D',
      textLight: '#A8687F',
      border: '#FAC2D3',
      cardBorder: 'rgba(227, 73, 117, 0.14)',
      success: '#10B981',
      error: '#E11D48',
      shadow: '#E34975',
      gradient: ['#E34975', '#F596B0'],
      isDark: false,
      phases: {
        menstrual: '#E34975',
        follicular: '#FCA5A5',
        ovulation: '#9333EA',
        luteal: '#E879F9',
      },
    },
  },
  midnight_pink: {
    name: 'Midnight Velvet (Cyber Glam)',
    tagline: 'Deep obsidian plum, luminous neon magenta & starry night',
    emoji: '🌙',
    isDark: true,
    colors: {
      primary: '#FF2D8D',
      secondary: '#D81B6D',
      background: '#0F0611',
      surface: '#1C0E1E',
      surfaceGlass: 'rgba(28, 14, 30, 0.92)',
      accent: '#C084FC',
      highlight: '#2E1631',
      text: '#FFF0F7',
      textMuted: '#E2A5C7',
      textLight: '#9B6282',
      border: '#3F1D40',
      cardBorder: 'rgba(255, 45, 141, 0.32)',
      success: '#34D399',
      error: '#FB7185',
      shadow: '#FF2D8D',
      gradient: ['#FF2D8D', '#9333EA'],
      isDark: true,
      phases: {
        menstrual: '#FF2D8D',
        follicular: '#FB923C',
        ovulation: '#A855F7',
        luteal: '#EC4899',
      },
    },
  },
  champagne_rose: {
    name: 'Champagne Rosé (Golden Luxe)',
    tagline: 'Warm gilded rose gold, champagne shimmer & peach satin',
    emoji: '🥂',
    isDark: false,
    colors: {
      primary: '#E06B78',
      secondary: '#F3A78A',
      background: '#FFF8F5',
      surface: '#FFFFFF',
      surfaceGlass: 'rgba(255, 255, 255, 0.92)',
      accent: '#D97706',
      highlight: '#FFEADB',
      text: '#36160F',
      textMuted: '#7C4435',
      textLight: '#AF7969',
      border: '#FEDAC2',
      cardBorder: 'rgba(224, 107, 120, 0.16)',
      success: '#10B981',
      error: '#E11D48',
      shadow: '#E06B78',
      gradient: ['#E06B78', '#F3A78A'],
      isDark: false,
      phases: {
        menstrual: '#E06B78',
        follicular: '#FB923C',
        ovulation: '#B45309',
        luteal: '#F472B6',
      },
    },
  },
  cotton_candy: {
    name: 'Cotton Candy (Pastel Dream)',
    tagline: 'Whimsical blend of baby sky blue & spun sugar pink',
    emoji: '🍭',
    isDark: false,
    colors: {
      primary: '#EC4899',
      secondary: '#60A5FA',
      background: '#F6F8FE',
      surface: '#FFFFFF',
      surfaceGlass: 'rgba(255, 255, 255, 0.92)',
      accent: '#8B5CF6',
      highlight: '#E5EDFE',
      text: '#15193B',
      textMuted: '#4B5282',
      textLight: '#7C83B5',
      border: '#CFDCFA',
      cardBorder: 'rgba(236, 72, 153, 0.16)',
      success: '#10B981',
      error: '#F43F5E',
      shadow: '#EC4899',
      gradient: ['#EC4899', '#60A5FA'],
      isDark: false,
      phases: {
        menstrual: '#EC4899',
        follicular: '#38BDF8',
        ovulation: '#8B5CF6',
        luteal: '#F472B6',
      },
    },
  },
};

export const defaultTheme = THEMES.barbie_pink;

export const themeDimensions = {
  radius: {
    xs: 8,
    sm: 14,
    md: 20,
    lg: 28,
    xl: 36,
    full: 9999,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
  },
};
