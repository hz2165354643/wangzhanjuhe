import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { DEFAULT_LANGUAGE, LanguageCode } from './index';

const resources = {
  'zh-CN': {
    translation: {
      // 中文翻译
      appTitle: '全球成人网站聚合',
      appSubtitle: '发现 · 收藏 · 分享',
      // ... 其他翻译
    }
  },
  'en': {
    translation: {
      // 英文翻译
      appTitle: 'Global Website Aggregator',
      appSubtitle: 'Discover · Collect · Share',
      // ... 其他翻译
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: DEFAULT_LANGUAGE,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n; 