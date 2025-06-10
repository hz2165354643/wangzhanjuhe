import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { LanguageCode } from '../i18n';

export function useLanguage() {
  const { i18n } = useTranslation();
  const [language, setLanguageState] = useState<LanguageCode>(i18n.language as LanguageCode);

  const setLanguage = useCallback((lang: string) => {
    const validLang = lang as LanguageCode;
    i18n.changeLanguage(validLang);
    setLanguageState(validLang);
    // 保存语言设置到 localStorage
    localStorage.setItem('language', validLang);
  }, [i18n]);

  return {
    language,
    setLanguage
  };
}