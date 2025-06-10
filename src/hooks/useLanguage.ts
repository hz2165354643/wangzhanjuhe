import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { LanguageCode } from '../i18n';

export function useLanguage() {
  const { i18n } = useTranslation();
  const [language, setLanguageState] = useState<LanguageCode>(i18n.language as LanguageCode);

  const setLanguage = useCallback((lang: LanguageCode) => {
    i18n.changeLanguage(lang);
    setLanguageState(lang);
    // 保存语言设置到 localStorage
    localStorage.setItem('language', lang);
  }, [i18n]);

  return {
    language,
    setLanguage
  };
}