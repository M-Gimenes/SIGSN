import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const THEME_KEY = 'sigsn-theme';
const ThemeContext = createContext(null);

function readInitial() {
  if (typeof document === 'undefined') return false;
  return document.documentElement.dataset.theme === 'dark';
}

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(readInitial);

  useEffect(() => {
    document.documentElement.dataset.theme = isDark ? 'dark' : '';
    localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
  }, [isDark]);

  const value = useMemo(
    () => ({
      isDark,
      toggle: () => setIsDark((prev) => !prev),
    }),
    [isDark],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme deve ser usado dentro de <ThemeProvider>');
  return ctx;
}
