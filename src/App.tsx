import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Grid3X3, 
  List, 
  Star, 
  ExternalLink, 
  Settings, 
  Palette, 
  BarChart3, 
  Download, 
  Upload, 
  FileText,
  Shield,
  Gamepad2,
  Heart,
  Eye as EyeIcon,
  EyeOff,
  Trash2,
  Edit3,
  Save,
  X,
  Check,
  AlertCircle,
  RefreshCw,
  Globe
} from 'lucide-react';
import { Website, AppSettings, SearchHistory } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useLanguage } from './hooks/useLanguage';
import { ThemeSelector } from './components/ThemeSelector';
import { WebsiteStats } from './components/WebsiteStats';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminLogin } from './components/AdminLogin';
import { CloudSync } from './components/CloudSync';
import { RealtimeSync } from './components/RealtimeSync';
import { DataSharing } from './components/DataSharing';
import { GitHubRepoSync } from './components/GitHubRepoSync';
import { DataFileManager } from './components/DataFileManager';
import { LanguageSelector } from './components/LanguageSelector';
import { websitesData, defaultSettings } from './data/websites';
import { getTranslation } from './i18n';
import LogoLady from './components/LogoLady';
import { useTranslation } from 'react-i18next';
import Icon from './assets/icon';

// 主题配置
const themeClasses = {
  cosmic: 'bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900',
  ocean: 'bg-gradient-to-br from-blue-900 via-cyan-900 to-teal-900',
  forest: 'bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900',
  sunset: 'bg-gradient-to-br from-orange-900 via-red-900 to-pink-900'
};

// 导出图标组件以供其他地方使用
export const AppIcon = Icon;

function App() {
  const { t, i18n } = useTranslation();
  const [darkMode, setDarkMode] = useState(true);
  
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const generateRandomViews = () => {
    return Math.floor(Math.random() * (9000 - 500 + 1) + 500) + 'w';
  };

  // 设置默认语言为英文
  useEffect(() => {
    i18n.changeLanguage('en');
  }, [i18n]);

  // 语言设置
  const { language, setLanguage } = useLanguage();

  // 状态管理
  const [websites, setWebsites] = useLocalStorage<Website[]>('websites', websitesData);
  const [settings, setSettings] = useLocalStorage<AppSettings>('settings', defaultSettings);
  const [searchHistory, setSearchHistory] = useLocalStorage<SearchHistory[]>('searchHistory', []);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(t('all'));
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(settings.defaultView);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [isAddingWebsite, setIsAddingWebsite] = useState(false);
  const [editingWebsite, setEditingWebsite] = useState<Website | null>(null);
  
  // UI 状态
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminLoginError, setAdminLoginError] = useState('');
  const [adminPassword, setAdminPassword] = useLocalStorage('adminPassword', 'admin123');
  
  // 导入导出状态
  const [importExportStatus, setImportExportStatus] = useState<'idle' | 'exporting' | 'importing' | 'success' | 'error'>('idle');
  const [importExportMessage, setImportExportMessage] = useState('');

  // 新网站表单
  const [newWebsite, setNewWebsite] = useState({
    name: '',
    url: '',
    category: '',
    description: '',
    tags: '',
    color: '#6366f1'
  });

  // 获取分类列表
  const categories = [t('all'), ...Array.from(new Set(websites.map(w => w.category).filter(Boolean)))];

  // 过滤网站
  const filteredWebsites = websites.filter(website => {
    const matchesSearch = website.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         website.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (website.tags && website.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
    const matchesCategory = selectedCategory === t('all') || website.category === selectedCategory;
    const matchesFavorites = !showFavoritesOnly || website.isFavorite;
    return matchesSearch && matchesCategory && matchesFavorites;
  });

  // 更新设置
  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  // 访问网站
  const visitWebsite = (website: Website) => {
    console.log('访问网站:', website.name, website.url);
    
    const updatedWebsite = {
      ...website,
      visitCount: (website.visitCount || 0) + 1,
      lastVisited: new Date()
    };
    
    setWebsites(prev => prev.map(w => w.id === website.id ? updatedWebsite : w));
    
    // 记录搜索历史
    if (searchTerm) {
      const historyEntry: SearchHistory = {
        id: Date.now().toString(),
        query: searchTerm,
        timestamp: new Date(),
        resultCount: filteredWebsites.length
      };
      setSearchHistory(prev => [historyEntry, ...prev.slice(0, 49)]);
    }
    
    // 确保URL格式正确
    let url = website.url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    
    console.log('打开URL:', url);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // 切换收藏
  const toggleFavorite = (id: string) => {
    setWebsites(prev => prev.map(w => 
      w.id === id ? { ...w, isFavorite: !w.isFavorite } : w
    ));
  };

  // 添加网站
  const handleAddWebsite = () => {
    if (newWebsite.name && newWebsite.url) {
      const website: Website = {
        id: Date.now().toString(),
        name: newWebsite.name,
        url: newWebsite.url.startsWith('http') ? newWebsite.url : `https://${newWebsite.url}`,
        favicon: `${new URL(newWebsite.url.startsWith('http') ? newWebsite.url : `https://${newWebsite.url}`).origin}/favicon.ico`,
        category: newWebsite.category || t('uncategorized'),
        description: newWebsite.description,
        tags: newWebsite.tags ? newWebsite.tags.split(',').map(tag => tag.trim()) : [],
        isFavorite: false,
        color: newWebsite.color,
        visitCount: 0
      };
      
      setWebsites(prev => [...prev, website]);
      setNewWebsite({ name: '', url: '', category: '', description: '', tags: '', color: '#6366f1' });
      setIsAddingWebsite(false);
    }
  };

  // 删除网站
  const deleteWebsite = (id: string) => {
    if (confirm(t('confirmDelete'))) {
      setWebsites(prev => prev.filter(w => w.id !== id));
    }
  };

  // 编辑网站
  const saveEditedWebsite = (updatedWebsite: Website) => {
    setWebsites(prev => prev.map(w => w.id === updatedWebsite.id ? updatedWebsite : w));
    setEditingWebsite(null);
  };

  // 管理员登录
  const handleAdminLogin = (password: string) => {
    if (password === adminPassword) {
      setIsAdminAuthenticated(true);
      setShowAdminLogin(false);
      setShowAdminDashboard(true);
      setAdminLoginError('');
    } else {
      setAdminLoginError(t('incorrectPassword'));
    }
  };

  // 管理员登出
  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    setShowAdminDashboard(false);
  };

  // 修改管理员密码
  const changeAdminPassword = (newPassword: string) => {
    setAdminPassword(newPassword);
  };

  // 导出数据
  const exportData = () => {
    setImportExportStatus('exporting');
    
    try {
      const exportData = {
        websites,
        settings,
        searchHistory,
        exportDate: new Date().toISOString(),
        version: '1.0.0',
        metadata: {
          totalWebsites: websites.length,
          totalCategories: categories.length - 1, // 减去"全部"
          totalVisits: websites.reduce((sum, w) => sum + (w.visitCount || 0), 0),
          favoriteCount: websites.filter(w => w.isFavorite).length
        }
      };
      
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `网站聚合器-完整备份-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      
      setImportExportStatus('success');
      setImportExportMessage(t('exportSuccess'));
    } catch (error) {
      setImportExportStatus('error');
      setImportExportMessage(t('exportFailed'));
    }
    
    setTimeout(() => {
      setImportExportStatus('idle');
      setImportExportMessage('');
    }, 3000);
  };

  // 导入数据
  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportExportStatus('importing');
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        
        // 验证数据格式
        if (!importedData.websites || !Array.isArray(importedData.websites)) {
          throw new Error('无效的数据格式');
        }
        
        // 询问是否替换现有数据
        const shouldReplace = confirm(t('replaceData'));
        
        if (shouldReplace) {
          // 替换所有数据
          setWebsites(importedData.websites);
          if (importedData.settings) setSettings(importedData.settings);
          if (importedData.searchHistory) setSearchHistory(importedData.searchHistory);
        } else {
          // 合并数据，避免ID冲突
          const existingIds = new Set(websites.map(w => w.id));
          const newWebsites = importedData.websites.filter((w: Website) => !existingIds.has(w.id));
          setWebsites(prev => [...prev, ...newWebsites]);
        }
        
        setImportExportStatus('success');
        setImportExportMessage(`${t('importSuccess')} ${importedData.websites.length} ${t('websites')}`);
      } catch (error) {
        setImportExportStatus('error');
        setImportExportMessage(t('importFailed'));
      }
    };
    
    reader.readAsText(file);
    
    setTimeout(() => {
      setImportExportStatus('idle');
      setImportExportMessage('');
    }, 3000);
  };

  // 键盘快捷键
  useKeyboardShortcuts([
    { key: 'k', ctrlKey: true, action: () => document.getElementById('search')?.focus() },
    { key: 'n', ctrlKey: true, action: () => setIsAddingWebsite(true) },
    { key: 'f', ctrlKey: true, action: () => setShowFavoritesOnly(!showFavoritesOnly) },
    { key: 'g', ctrlKey: true, action: () => setViewMode('grid') },
    { key: 'l', ctrlKey: true, action: () => setViewMode('list') },
    { key: 'e', ctrlKey: true, action: exportData },
    { key: 'a', ctrlKey: true, shiftKey: true, action: () => setShowAdminLogin(true) }
  ]);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = () => setOpenDropdown(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // 检查URL参数中的导入数据
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const importData = urlParams.get('import');
    
    if (importData) {
      try {
        const decodedData = JSON.parse(atob(importData));
        if (decodedData.websites && Array.isArray(decodedData.websites)) {
          const shouldImport = confirm(t('detectSharedData'));
          if (shouldImport) {
            setWebsites(decodedData.websites);
            if (decodedData.settings) setSettings(decodedData.settings);
          }
        }
      } catch (error) {
        console.error('导入分享数据失败:', error);
      }
      
      // 清除URL参数
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const isGameWebsite = (website: Website) => {
    return website.category === '游戏娱乐' && 
           (website.tags?.includes('游戏') || website.url.includes('game'));
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-primary-gradient-from to-primary-gradient-to dark:from-gray-900 dark:to-gray-800 transition-colors duration-500`}>
      <div className="container mx-auto px-4 py-8">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <LogoLady className="w-12 h-12" />
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500">
              全球top网
            </h1>
          </div>
          
          <div className="flex items-center space-x-6">
            <h2 className="text-2xl font-semibold text-white">一家免费的电影院</h2>
            <div className="flex items-center space-x-4">
              <ThemeSelector 
                currentTheme={settings.theme}
                onThemeChange={(theme) => updateSettings({ theme })}
                isOpen={openDropdown === 'theme'}
                onToggle={() => setOpenDropdown(openDropdown === 'theme' ? null : 'theme')}
                darkMode={darkMode}
                setDarkMode={setDarkMode}
              />
              <WebsiteStats websites={websites} isOpen={openDropdown === 'stats'} onToggle={() => setOpenDropdown(openDropdown === 'stats' ? null : 'stats')} />
              <DataSharing 
                websites={websites}
                setWebsites={setWebsites}
                settings={settings}
                updateSettings={updateSettings}
                isOpen={openDropdown === 'share'}
                onToggle={() => setOpenDropdown(openDropdown === 'share' ? null : 'share')}
              />
              <GitHubRepoSync 
                websites={websites}
                setWebsites={setWebsites}
                settings={settings}
                updateSettings={updateSettings}
                isOpen={openDropdown === 'github'}
                onToggle={() => setOpenDropdown(openDropdown === 'github' ? null : 'github')}
              />
              <LanguageSelector 
                currentLanguage={language}
                onLanguageChange={setLanguage}
                isOpen={openDropdown === 'language'}
                onToggle={() => setOpenDropdown(openDropdown === 'language' ? null : 'language')}
              />
            </div>
          </div>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {websites.map((site, index) => (
            <div key={site.id} 
                 className="glass-morphism rounded-xl p-4 transform hover:scale-105 transition-all duration-300 animate-fade-in"
                 style={{animationDelay: `${index * 0.1}s`}}>
              <div className="relative h-40 mb-4 overflow-hidden rounded-lg">
                <img src={site.favicon} alt={site.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black bg-opacity-30 transition-opacity duration-300 hover:bg-opacity-0" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{site.name}</h3>
              <p className="text-gray-300 mb-4">{site.description}</p>
              <div className="flex items-center justify-between">
                <a href={site.url} 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="px-4 py-2 bg-gradient-to-r from-pink-500 to-violet-500 text-white rounded-lg hover:opacity-90 transition-opacity">
                  访问
                </a>
                <div className="flex items-center text-gray-300">
                  <EyeIcon className="w-5 h-5 mr-1" />
                  <span>{generateRandomViews()}</span>
                </div>
              </div>
            </div>
          ))}
        </main>
      </div>
    </div>
  );
}

export default App;