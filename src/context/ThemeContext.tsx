import React, { createContext, useContext, useState, useEffect } from 'react';
import { THEMES, ThemeName, ThemeColors, defaultTheme } from '../constants/theme';
import { getDatabase } from '../db/sqlite';

interface ThemeContextType {
  themeName: ThemeName;
  colors: ThemeColors;
  setTheme: (name: ThemeName) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType>({
  themeName: 'barbie_pink',
  colors: defaultTheme.colors,
  setTheme: async () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeName, setThemeName] = useState<ThemeName>('barbie_pink');

  useEffect(() => {
    async function loadSavedTheme() {
      try {
        const db = await getDatabase();
        const row = await db.getFirstAsync<{ theme: string }>(
          'SELECT theme FROM user_preferences LIMIT 1'
        );
        if (row?.theme && THEMES[row.theme as ThemeName]) {
          setThemeName(row.theme as ThemeName);
        }
      } catch (err) {
        console.warn('Failed to load theme:', err);
      }
    }
    loadSavedTheme();
  }, []);

  const setTheme = async (name: ThemeName) => {
    setThemeName(name);
    try {
      const db = await getDatabase();
      await db.runAsync('UPDATE user_preferences SET theme = ?', [name]);
    } catch (err) {
      console.warn('Failed to persist theme:', err);
    }
  };

  const currentTheme = THEMES[themeName] || defaultTheme;

  return (
    <ThemeContext.Provider value={{ themeName, colors: currentTheme.colors, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useAppTheme = () => useContext(ThemeContext);
