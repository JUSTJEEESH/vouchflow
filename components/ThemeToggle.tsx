'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/lib/contexts/theme';

export function ThemeToggle() {
  const { theme, toggleTheme, mounted } = useTheme();

  // Render a placeholder with same dimensions to avoid layout shift
  if (!mounted) {
    return (
      <div className="p-2 w-9 h-9" />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg transition-colors hover:bg-slate-200 dark:hover:bg-slate-700"
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <Moon className="w-5 h-5 text-slate-600" />
      ) : (
        <Sun className="w-5 h-5 text-slate-300" />
      )}
    </button>
  );
}
