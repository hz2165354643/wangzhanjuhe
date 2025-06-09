import React, { FC } from 'react';
import { Palette, Check, Moon, Sun } from 'lucide-react';
import { AppSettings } from '../types';

interface ThemeSelectorProps {
  currentTheme: AppSettings['theme'];
  onThemeChange: (theme: AppSettings['theme']) => void;
  isOpen: boolean;
  onToggle: () => void;
  darkMode: boolean;
  setDarkMode: (darkMode: boolean) => void;
}

const themes = [
  {
    id: 'cosmic' as const,
    name: '宇宙星空',
    gradient: 'from-indigo-900 via-purple-900 to-pink-900',
    preview: 'bg-gradient-to-r from-indigo-500 to-purple-600'
  },
  {
    id: 'ocean' as const,
    name: '深海蓝调',
    gradient: 'from-blue-900 via-cyan-900 to-teal-900',
    preview: 'bg-gradient-to-r from-blue-500 to-cyan-600'
  },
  {
    id: 'forest' as const,
    name: '森林绿意',
    gradient: 'from-green-900 via-emerald-900 to-teal-900',
    preview: 'bg-gradient-to-r from-green-500 to-emerald-600'
  },
  {
    id: 'sunset' as const,
    name: '日落余晖',
    gradient: 'from-orange-900 via-red-900 to-pink-900',
    preview: 'bg-gradient-to-r from-orange-500 to-red-600'
  }
];

export const ThemeSelector: FC<ThemeSelectorProps> = ({ currentTheme, onThemeChange, isOpen, onToggle, darkMode, setDarkMode }) => {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="p-3 bg-white/10 backdrop-blur-xl text-white/70 hover:text-white hover:bg-white/20 transition-all duration-300 rounded-xl transform hover:scale-105"
        title="切换主题"
      >
        <Palette className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl p-4 shadow-2xl z-50">
          <h3 className="text-white font-bold mb-4 text-center">选择主题</h3>
          <div className="space-y-3">
            {themes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => {
                  onThemeChange(theme.id);
                  onToggle();
                }}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-300 hover:bg-white/10 ${
                  currentTheme === theme.id ? 'bg-white/20 border border-white/30' : ''
                }`}
              >
                <div className={`w-8 h-8 rounded-lg ${theme.preview} shadow-lg`} />
                <span className="text-white font-medium flex-1 text-left">{theme.name}</span>
                {currentTheme === theme.id && (
                  <Check className="w-5 h-5 text-green-400" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={() => setDarkMode(!darkMode)}
        className="p-2 rounded-lg glass-morphism text-white hover:opacity-80 transition-opacity"
        aria-label="Toggle theme"
      >
        {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>
    </div>
  );
}