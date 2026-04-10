/**
 * Dark Mode Hook
 * 
 * Manages dark mode state with localStorage and document class.
 * Returns current state and toggle function.
 * 
 * Usage:
 *   const { darkMode, setDarkMode } = useDarkMode();
 */
import { useEffect, useState } from 'react';

export function useDarkMode() {
  const [darkMode, setDarkModeState] = useState<boolean>(() => {
    // Check localStorage first
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) {
      return saved === 'true';
    }
    // Default to system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    // Apply dark class to document
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // Save to localStorage
    localStorage.setItem('darkMode', String(darkMode));
  }, [darkMode]);

  const setDarkMode = (value: boolean) => {
    setDarkModeState(value);
  };

  const toggleDarkMode = () => {
    setDarkModeState(prev => !prev);
  };

  return { darkMode, setDarkMode, toggleDarkMode };
}
