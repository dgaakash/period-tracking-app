import { THEMES, ThemeName, defaultTheme } from '../../constants/theme';

describe('Theme and Color Palette System', () => {
  const themeKeys = Object.keys(THEMES) as ThemeName[];

  it('defines at least 8 curated themes', () => {
    expect(themeKeys.length).toBeGreaterThanOrEqual(8);
    expect(themeKeys).toContain('barbie_pink');
    expect(themeKeys).toContain('rose_quartz');
    expect(themeKeys).toContain('lavender_dreams');
    expect(themeKeys).toContain('strawberry_milk');
    expect(themeKeys).toContain('cherry_blossom');
    expect(themeKeys).toContain('midnight_pink');
    expect(themeKeys).toContain('champagne_rose');
    expect(themeKeys).toContain('cotton_candy');
  });

  it('each theme contains valid visual tokens and metadata', () => {
    for (const key of themeKeys) {
      const t = THEMES[key];
      expect(t.name).toBeTruthy();
      expect(t.tagline).toBeTruthy();
      expect(t.emoji).toBeTruthy();
      expect(typeof t.isDark === 'boolean').toBe(true);

      const c = t.colors;
      expect(c.primary).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(c.secondary).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(c.background).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(c.surface).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(c.text).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(c.border).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(c.phases.menstrual).toBeTruthy();
      expect(c.phases.ovulation).toBeTruthy();
      expect(c.gradient.length).toBe(2);
    }
  });

  it('provides default theme pointing to Haute Barbie', () => {
    expect(defaultTheme).toBe(THEMES.barbie_pink);
    expect(defaultTheme.colors.primary).toBe('#FF2E93');
  });
});
