import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeId, themes } from '../lib/themes';

interface ThemeContextType {
  currentTheme: ThemeId;
  setTheme: (theme: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<ThemeId>('big-muddy');

  useEffect(() => {
    const root = document.documentElement;
    const theme = themes[currentTheme];

    // Set CSS variables
    root.style.setProperty('--bg-color', theme.colors.background);
    root.style.setProperty('--fg-color', theme.colors.foreground);
    root.style.setProperty('--primary-color', theme.colors.primary);
    root.style.setProperty('--secondary-color', theme.colors.secondary);
    root.style.setProperty('--accent-color', theme.colors.accent);
    root.style.setProperty('--muted-color', theme.colors.muted);
    root.style.setProperty('--border-color', theme.colors.border);
    
    root.style.setProperty('--font-heading', theme.typography.heading);
    root.style.setProperty('--font-body', theme.typography.body);
    root.style.setProperty('--font-mono', theme.typography.mono);

    // Set data attribute for Tailwind or other styling hooks
    root.setAttribute('data-theme', currentTheme);
  }, [currentTheme]);

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme: setCurrentTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
