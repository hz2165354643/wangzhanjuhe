import { useState } from 'react';

export type LanguageCode = 'en' | 'zh';

export function useLanguage() {
  const [language, setLanguage] = useState<LanguageCode>('en');

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang as LanguageCode);
  };

  return {
    language,
    setLanguage: handleLanguageChange
  };
}