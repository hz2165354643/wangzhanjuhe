import React, { useState, useEffect, FC } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { LanguageCode } from '../i18n';

interface Language {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
}

interface LanguageSelectorProps {
  currentLanguage: string;
  onLanguageChange: (lang: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

// 支持的语言列表
const languages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'zh-CN', name: '中文(简体)', nativeName: '中文(简体)', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', flag: '🇲🇾' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', flag: '🇺🇦' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
] as const;

export const LanguageSelector: FC<LanguageSelectorProps> = ({ currentLanguage, onLanguageChange, isOpen, onToggle }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredLanguages, setFilteredLanguages] = useState(languages);

  // 获取当前选择的语言
  const getCurrentLanguage = () => {
    return languages.find(lang => lang.code === currentLanguage) || languages[0];
  };

  // 当搜索条件变化时过滤语言
  useEffect(() => {
    if (searchTerm) {
      const filtered = languages.filter(
        lang => 
          lang.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
          lang.nativeName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredLanguages(filtered);
    } else {
      setFilteredLanguages(languages);
    }
  }, [searchTerm]);

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className="flex items-center gap-2 px-3 py-2 bg-white/10 backdrop-blur-xl text-white/80 hover:text-white hover:bg-white/20 transition-all duration-300 rounded-xl"
        title="切换语言"
      >
        <Globe className="w-4 h-4" />
        <span>{getCurrentLanguage().flag}</span>
        <span className="hidden md:inline">{getCurrentLanguage().nativeName}</span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl p-4 shadow-2xl z-50 max-h-96 overflow-hidden">
          <h3 className="text-white font-bold mb-3 text-center">选择语言 / Select Language</h3>
          
          {/* 搜索框 */}
          <div className="relative mb-3">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-blue-400/50"
              placeholder="搜索语言..."
              autoFocus
            />
          </div>
          
          {/* 语言列表 */}
          <div className="max-h-64 overflow-y-auto pr-1 space-y-1">
            {filteredLanguages.map((language) => (
              <button
                key={language.code}
                onClick={() => {
                  onLanguageChange(language.code);
                  onToggle();
                }}
                className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all duration-300 hover:bg-white/10 ${
                  currentLanguage === language.code ? 'bg-white/20 border border-white/30' : ''
                }`}
              >
                <span className="text-xl">{language.flag}</span>
                <div className="flex-1 text-left">
                  <div className="text-white text-sm font-medium">{language.nativeName}</div>
                  {language.name !== language.nativeName && (
                    <div className="text-white/60 text-xs">{language.name}</div>
                  )}
                </div>
                {currentLanguage === language.code && (
                  <Check className="w-4 h-4 text-green-400" />
                )}
              </button>
            ))}
            
            {filteredLanguages.length === 0 && (
              <div className="text-center py-4 text-white/60">
                未找到匹配的语言
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}