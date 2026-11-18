export type ThemeName =
  | 'barbie_pink'
  | 'rose_quartz'
  | 'lavender_dreams'
  | 'strawberry_milk'
  | 'cherry_blossom'
  | 'midnight_pink';

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
  phases: {
    menstrual: string;
    follicular: string;
    ovulation: string;
    luteal: string;
  };
}

export const THEMES: Record<ThemeName, { name: string; colors: ThemeColors }> = {
  barbie_pink: {
    name: 'Barbie Pink (Classic)',
    colors: {
      primary: '#FF4FA3',
      secondary: '#FF8FC7',
      background: '#FFF0F6',
      surface: '#FFFFFF',
      surfaceGlass: 'rgba(255, 255, 255, 0.88)',
      accent: '#C8A2FF',
      highlight: '#FFD6E7',
      text: '#51243D',
      textMuted: '#8D5272',
      textLight: '#B8849E',
      border: '#FFD6E7',
      cardBorder: 'rgba(255, 79, 163, 0.15)',
      success: '#A8E6CF',
      error: '#FF6B8B',
      phases: {
        menstrual: '#FF4FA3',
        follicular: '#FFAE9E',
        ovulation: '#9B51E0',
        luteal: '#C8A2FF',
      },
    },
  },
  rose_quartz: {
    name: 'Rose Quartz',
    colors: {
      primary: '#E06D8C',
      secondary: '#F4A7BA',
      background: '#FAF0F2',
      surface: '#FFFFFF',
      surfaceGlass: 'rgba(255, 255, 255, 0.90)',
      accent: '#D4B2D8',
      highlight: '#FCE4EC',
      text: '#4A2834',
      textMuted: '#7D5765',
      textLight: '#B3919D',
      border: '#F8BBD0',
      cardBorder: 'rgba(224, 109, 140, 0.15)',
      success: '#A3D9C9',
      error: '#E57373',
      phases: {
        menstrual: '#E06D8C',
        follicular: '#F8B195',
        ovulation: '#967BB6',
        luteal: '#D4B2D8',
      },
    },
  },
  lavender_dreams: {
    name: 'Lavender Dreams',
    colors: {
      primary: '#B388FF',
      secondary: '#D1C4E9',
      background: '#F8F4FD',
      surface: '#FFFFFF',
      surfaceGlass: 'rgba(255, 255, 255, 0.88)',
      accent: '#FF80AB',
      highlight: '#EDE7F6',
      text: '#311B92',
      textMuted: '#674E9B',
      textLight: '#9E88CA',
      border: '#E1BEE7',
      cardBorder: 'rgba(179, 136, 255, 0.18)',
      success: '#B9F6CA',
      error: '#FF80AB',
      phases: {
        menstrual: '#FF4081',
        follicular: '#FFAB91',
        ovulation: '#7C4DFF',
        luteal: '#B388FF',
      },
    },
  },
  strawberry_milk: {
    name: 'Strawberry Milk',
    colors: {
      primary: '#FF6584',
      secondary: '#FFA3B5',
      background: '#FFF5F7',
      surface: '#FFFFFF',
      surfaceGlass: 'rgba(255, 255, 255, 0.92)',
      accent: '#FFB6C1',
      highlight: '#FFE4E8',
      text: '#4A1521',
      textMuted: '#8C4858',
      textLight: '#C48A96',
      border: '#FFCDD2',
      cardBorder: 'rgba(255, 101, 132, 0.15)',
      success: '#A7E8BD',
      error: '#FF5252',
      phases: {
        menstrual: '#FF6584',
        follicular: '#FFB085',
        ovulation: '#AB47BC',
        luteal: '#FFA3B5',
      },
    },
  },
  cherry_blossom: {
    name: 'Cherry Blossom',
    colors: {
      primary: '#F06292',
      secondary: '#F8BBD0',
      background: '#FFF8FA',
      surface: '#FFFFFF',
      surfaceGlass: 'rgba(255, 255, 255, 0.90)',
      accent: '#CE93D8',
      highlight: '#FCE4EC',
      text: '#4E2135',
      textMuted: '#88506C',
      textLight: '#B8829C',
      border: '#F48FB1',
      cardBorder: 'rgba(240, 98, 146, 0.15)',
      success: '#C8E6C9',
      error: '#E57373',
      phases: {
        menstrual: '#F06292',
        follicular: '#FFCCBC',
        ovulation: '#8E24AA',
        luteal: '#CE93D8',
      },
    },
  },
  midnight_pink: {
    name: 'Midnight Pink (Night Theme)',
    colors: {
      primary: '#FF5C9D',
      secondary: '#D04E85',
      background: '#1F121C',
      surface: '#2C1827',
      surfaceGlass: 'rgba(44, 24, 39, 0.90)',
      accent: '#B388FF',
      highlight: '#3D2036',
      text: '#FFF0F6',
      textMuted: '#E0A6C4',
      textLight: '#A36888',
      border: '#532344',
      cardBorder: 'rgba(255, 92, 157, 0.25)',
      success: '#81C784',
      error: '#E57373',
      phases: {
        menstrual: '#FF5C9D',
        follicular: '#FFAB91',
        ovulation: '#BA68C8',
        luteal: '#7E57C2',
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
