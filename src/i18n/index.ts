// 支持的语言类型
export type LanguageCode = 
  | 'zh-CN' 
  | 'en' 
  | 'ja' 
  | 'ko' 
  | 'fr' 
  | 'de' 
  | 'es' 
  | 'it' 
  | 'ru' 
  | 'pt' 
  | 'ar' 
  | 'hi' 
  | 'th' 
  | 'vi' 
  | 'id' 
  | 'ms' 
  | 'tr' 
  | 'pl' 
  | 'uk' 
  | 'nl';

// 默认语言
export const DEFAULT_LANGUAGE: LanguageCode = 'en';

// 中文翻译
const chineseTranslations = {
  // 应用标题
  appTitle: '全球成人网站聚合',
  appSubtitle: '发现 · 收藏 · 分享',
  
  // 基础操作
  all: '全部',
  add: '添加',
  edit: '编辑',
  delete: '删除',
  save: '保存',
  cancel: '取消',
  confirm: '确认',
  close: '关闭',
  
  // 网站相关
  websites: '个网站',
  totalWebsites: '总网站',
  allWebsites: '所有网站',
  myFavorites: '我的收藏',
  favorites: '收藏',
  addWebsite: '添加网站',
  addNewWebsite: '添加新网站',
  editWebsite: '编辑网站',
  websiteName: '网站名称',
  websiteUrl: '网站地址',
  category: '分类',
  description: '描述',
  tags: '标签 (用逗号分隔)',
  themeColor: '主题色',
  visits: '次访问',
  
  // 占位符
  websiteNamePlaceholder: '例如：石头割草模拟器',
  websiteUrlPlaceholder: '例如：https://example.com',
  categoryPlaceholder: '例如：游戏娱乐',
  descriptionPlaceholder: '简单描述这个网站...',
  tagsPlaceholder: '例如：游戏, 模拟器, 休闲',
  
  // 搜索
  searchWebsites: '搜索网站...',
  searchResults: '搜索',
  found: '找到',
  results: '个结果',
  total: '共',
  
  // 视图
  gridView: '网格视图',
  listView: '列表视图',
  
  // 收藏
  addFavorite: '添加收藏',
  removeFavorite: '取消收藏',
  favoritesOnly: '只看收藏',
  
  // 数据管理
  dataManagement: '数据管理',
  exportBackup: '导出备份',
  importBackup: '导入备份',
  downloadJson: '下载JSON文件',
  restoreFromJson: '从JSON文件恢复',
  exportSuccess: '数据导出成功！',
  exportFailed: '导出失败，请重试',
  importSuccess: '数据导入成功！导入了',
  importFailed: '导入失败，请检查文件格式',
  importTip: '导入数据时可选择替换或合并现有数据',
  
  // 确认对话框
  confirmDelete: '确定要删除这个网站吗？',
  replaceData: '是否替换现有数据？点击"确定"替换，点击"取消"合并数据。',
  detectSharedData: '检测到分享的网站数据，是否导入？',
  
  // 空状态
  noWebsites: '暂无网站',
  noWebsitesFound: '未找到相关网站',
  tryOtherKeywords: '尝试使用其他关键词搜索',
  addFirstWebsite: '点击添加按钮开始收藏你喜欢的网站',
  addFirstWebsiteButton: '添加第一个网站',
  
  // 管理员
  adminPanel: '管理后台',
  incorrectPassword: '密码错误，请重试',
  
  // 其他
  uncategorized: '未分类'
};

// 英文翻译
const englishTranslations = {
  // App title
  appTitle: 'Global Website Aggregator',
  appSubtitle: 'Discover · Collect · Share',
  
  // Basic operations
  all: 'All',
  add: 'Add',
  edit: 'Edit',
  delete: 'Delete',
  save: 'Save',
  cancel: 'Cancel',
  confirm: 'Confirm',
  close: 'Close',
  
  // Website related
  websites: 'websites',
  totalWebsites: 'Total Websites',
  allWebsites: 'All Websites',
  myFavorites: 'My Favorites',
  favorites: 'Favorites',
  addWebsite: 'Add Website',
  addNewWebsite: 'Add New Website',
  editWebsite: 'Edit Website',
  websiteName: 'Website Name',
  websiteUrl: 'Website URL',
  category: 'Category',
  description: 'Description',
  tags: 'Tags (comma separated)',
  themeColor: 'Theme Color',
  visits: 'visits',
  
  // Placeholders
  websiteNamePlaceholder: 'e.g.: Stone Grass Simulator',
  websiteUrlPlaceholder: 'e.g.: https://example.com',
  categoryPlaceholder: 'e.g.: Games',
  descriptionPlaceholder: 'Brief description of this website...',
  tagsPlaceholder: 'e.g.: game, simulator, casual',
  
  // Search
  searchWebsites: 'Search websites...',
  searchResults: 'Search',
  found: 'found',
  results: 'results',
  total: 'Total',
  
  // Views
  gridView: 'Grid View',
  listView: 'List View',
  
  // Favorites
  addFavorite: 'Add to Favorites',
  removeFavorite: 'Remove from Favorites',
  favoritesOnly: 'Favorites Only',
  
  // Data management
  dataManagement: 'Data Management',
  exportBackup: 'Export Backup',
  importBackup: 'Import Backup',
  downloadJson: 'Download JSON file',
  restoreFromJson: 'Restore from JSON file',
  exportSuccess: 'Data exported successfully!',
  exportFailed: 'Export failed, please try again',
  importSuccess: 'Data imported successfully! Imported',
  importFailed: 'Import failed, please check file format',
  importTip: 'You can choose to replace or merge existing data when importing',
  
  // Confirmation dialogs
  confirmDelete: 'Are you sure you want to delete this website?',
  replaceData: 'Replace existing data? Click "OK" to replace, "Cancel" to merge.',
  detectSharedData: 'Shared website data detected, import it?',
  
  // Empty states
  noWebsites: 'No websites',
  noWebsitesFound: 'No websites found',
  tryOtherKeywords: 'Try using other keywords',
  addFirstWebsite: 'Click the add button to start collecting your favorite websites',
  addFirstWebsiteButton: 'Add First Website',
  
  // Admin
  adminPanel: 'Admin Panel',
  incorrectPassword: 'Incorrect password, please try again',
  
  // Others
  uncategorized: 'Uncategorized'
};

// 日文翻译
const japaneseTranslations = {
  appTitle: 'グローバルウェブサイト集約',
  appSubtitle: '発見 · 収集 · 共有',
  all: 'すべて',
  add: '追加',
  edit: '編集',
  delete: '削除',
  save: '保存',
  cancel: 'キャンセル',
  websites: 'ウェブサイト',
  totalWebsites: '総ウェブサイト数',
  favorites: 'お気に入り',
  searchWebsites: 'ウェブサイトを検索...',
  // 其他翻译使用英文作为后备
  ...englishTranslations
};

// 韩文翻译
const koreanTranslations = {
  appTitle: '글로벌 웹사이트 집계',
  appSubtitle: '발견 · 수집 · 공유',
  all: '전체',
  add: '추가',
  edit: '편집',
  delete: '삭제',
  save: '저장',
  cancel: '취소',
  websites: '웹사이트',
  totalWebsites: '총 웹사이트',
  favorites: '즐겨찾기',
  searchWebsites: '웹사이트 검색...',
  // 其他翻译使用英文作为后备
  ...englishTranslations
};

// 翻译文本
const translations: Record<LanguageCode, Record<string, string>> = {
  'zh-CN': chineseTranslations,
  'en': englishTranslations,
  'ja': japaneseTranslations,
  'ko': koreanTranslations,
  'fr': englishTranslations,
  'de': englishTranslations,
  'es': englishTranslations,
  'it': englishTranslations,
  'ru': englishTranslations,
  'pt': englishTranslations,
  'ar': englishTranslations,
  'hi': englishTranslations,
  'th': englishTranslations,
  'vi': englishTranslations,
  'id': englishTranslations,
  'ms': englishTranslations,
  'tr': englishTranslations,
  'pl': englishTranslations,
  'uk': englishTranslations,
  'nl': englishTranslations
};

// 获取翻译文本
export function getTranslation(key: string, language: LanguageCode = DEFAULT_LANGUAGE): string {
  return translations[language]?.[key] || translations[DEFAULT_LANGUAGE]?.[key] || key;
}

// 获取所有支持的语言
export function getSupportedLanguages(): LanguageCode[] {
  return Object.keys(translations) as LanguageCode[];
}

// 检查是否支持某种语言
export function isLanguageSupported(language: string): language is LanguageCode {
  return language in translations;
}