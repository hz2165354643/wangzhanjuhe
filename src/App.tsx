import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Star, 
  Settings, 
  Download, 
  Upload, 
  X,
  Menu,
  Filter,
  AlertTriangle,
  Eye
} from 'lucide-react';
import { Website, AppSettings, SearchHistory } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { websitesData, defaultSettings } from './data/websites';
import { useTranslation } from 'react-i18next';
import Icon from './assets/icon';

// 导出图标组件以供其他地方使用
export const AppIcon = Icon;

function App() {
  const { i18n } = useTranslation();
  const [darkMode, setDarkMode] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const generateRandomViews = () => {
    return Math.floor(Math.random() * (9000 - 500 + 1) + 500) + 'w';
  };

  // 设置默认语言为中文
  useEffect(() => {
    i18n.changeLanguage('zh-CN');
  }, [i18n]);

  // 状态管理
  const [websites, setWebsites] = useLocalStorage<Website[]>('websites', websitesData);
  const [settings, setSettings] = useLocalStorage<AppSettings>('settings', defaultSettings);
  const [searchHistory, setSearchHistory] = useLocalStorage<SearchHistory[]>('searchHistory', []);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('全部');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
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
  const categories = ['全部', ...Array.from(new Set(websites.map(w => w.category).filter(Boolean) as string[]))];

  // 过滤网站
  const filteredWebsites = websites.filter(website => {
    const matchesSearch = website.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         website.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (website.tags && website.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
    const matchesCategory = selectedCategory === '全部' || website.category === selectedCategory;
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
        category: newWebsite.category || '未分类',
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
    if (confirm('确定要删除这个网站吗？')) {
      setWebsites(prev => prev.filter(w => w.id !== id));
    }
  };

  // 导出数据
  const exportData = () => {
    try {
      const exportData = {
        websites,
        settings,
        searchHistory,
        exportDate: new Date().toISOString(),
        version: '1.0.0'
      };
      
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `网站聚合器备份-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      
      setImportExportStatus('success');
      setImportExportMessage('数据导出成功！');
      
      // 3秒后重置状态
      setTimeout(() => {
        setImportExportStatus('idle');
        setImportExportMessage('');
      }, 3000);
    } catch (error) {
      console.error('导出数据失败:', error);
      setImportExportStatus('error');
      setImportExportMessage('导出失败，请重试');
    }
  };

  // 在 useEffect 中为每个网站生成随机访问量
  useEffect(() => {
    const updatedWebsites = websites.map(website => {
      // 如果已有随机点击数，则保留
      if (website.randomClicks) return website;
      
      // 生成一个不含0的四位随机数
      let randomNum;
      do {
        // 生成1000-9999之间的随机数
        randomNum = Math.floor(Math.random() * (9999 - 1000 + 1) + 1000);
        // 检查数字中是否包含0
      } while (randomNum.toString().includes('0'));
      
      return {
        ...website,
        randomClicks: randomNum
      };
    });
    setWebsites(updatedWebsites);
  }, []);

  // 下面添加实际的界面渲染
  return (
    <div className="full-app-container">
      {/* 顶部导航栏 */}
      <div className="top-navbar">
        <div className="logo-container">
          <div className="logo-icon">
            <AlertTriangle size={24} className="age-restricted-icon" color="#ff3a3a" />
          </div>
          <div className="logo-text">
            <span className="premium-title">Global Free Adult web Top List<span className="highlight-text"></span></span>
            <div className="subtitle">全球免费成人网站top榜</div>
          </div>
        </div>
        
        <div className="top-controls">
          <div className="search-container">
            <Search size={16} />
            <input 
              type="text" 
              placeholder="搜索网站..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="category-filter" onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}>
            <div className="selected-category">
              <Filter size={16} />
              <span>{selectedCategory}</span>
            </div>
            
            {showCategoryDropdown && (
              <div className="category-dropdown">
                <div 
                  className={`category-item ${selectedCategory === '全部' ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedCategory('全部');
                    setShowCategoryDropdown(false);
                  }}
                >
                  全部 <span className="count">{websites.length}</span>
                </div>
                <div 
                  className={`category-item ${showFavoritesOnly ? 'active' : ''}`}
                  onClick={() => {
                    setShowFavoritesOnly(!showFavoritesOnly);
                    setShowCategoryDropdown(false);
                  }}
                >
                  收藏 <span className="count">{websites.filter(w => w.isFavorite).length}</span>
                </div>
                {categories.filter(c => c !== '全部').map(category => (
                  <div 
                    key={category}
                    className={`category-item ${selectedCategory === category ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedCategory(category);
                      setShowCategoryDropdown(false);
                    }}
                  >
                    {category} <span className="count">{websites.filter(w => w.category === category).length}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <button className="add-button" onClick={() => setIsAddingWebsite(true)}>
            <Plus size={20} />
          </button>
          
          <div className="actions-menu">
            <Settings size={16} onClick={() => setOpenDropdown(openDropdown ? null : 'settings')} />
            
            {openDropdown === 'settings' && (
              <div className="dropdown-menu">
                <div className="dropdown-item" onClick={exportData}>
                  <Download size={16} />
                  <span>导出数据</span>
                </div>
                <div className="dropdown-item">
                  <Upload size={16} />
                  <span>导入数据</span>
                </div>
                <div className="dropdown-item">
                  <Settings size={16} />
                  <span>设置</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="main-content-full">
        <div className="website-grid">
          {filteredWebsites.map(website => (
            <div 
              key={website.id} 
              className="website-card"
              onClick={() => visitWebsite(website)}
            >
              <div className="website-card-header">
                <div className="website-icon">
                  {website.favicon ? (
                    <img src={website.favicon} alt="" onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }} />
                  ) : (
                    <div style={{ fontSize: '16px' }}>{website.name.charAt(0)}</div>
                  )}
                </div>
                <div>
                  <div className="website-name">{website.name}</div>
                  <div className="website-url">{website.url}</div>
                </div>
              </div>
              <div className="website-card-body">
                <div className="website-description">{website.description}</div>
              </div>
              <div className="website-card-footer">
                <div className="category-tag">{website.category || '未分类'}</div>
                <div className="website-views">
                  <Eye size={12} className="view-icon" />
                  <span>{(website.randomClicks || 0)}w</span>
                </div>
                <div>
                  <button 
                    className={`favorite-button ${website.isFavorite ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(website.id);
                    }}
                  >
                    <Star size={16} fill={website.isFavorite ? '#f8c732' : 'none'} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 添加网站对话框 */}
      {isAddingWebsite && (
        <div className="modal-overlay" onClick={() => setIsAddingWebsite(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>添加新网站</h2>
              <button className="close-button" onClick={() => setIsAddingWebsite(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>网站名称</label>
                <input
                  type="text"
                  value={newWebsite.name}
                  onChange={e => setNewWebsite({ ...newWebsite, name: e.target.value })}
                  placeholder="例如：Google"
                />
              </div>
              <div className="form-group">
                <label>网站地址</label>
                <input
                  type="text"
                  value={newWebsite.url}
                  onChange={e => setNewWebsite({ ...newWebsite, url: e.target.value })}
                  placeholder="例如：https://google.com"
                />
              </div>
              <div className="form-group">
                <label>分类</label>
                <input
                  type="text"
                  value={newWebsite.category}
                  onChange={e => setNewWebsite({ ...newWebsite, category: e.target.value })}
                  placeholder="例如：搜索引擎"
                />
              </div>
              <div className="form-group">
                <label>描述</label>
                <textarea
                  value={newWebsite.description}
                  onChange={e => setNewWebsite({ ...newWebsite, description: e.target.value })}
                  placeholder="简单描述这个网站..."
                />
              </div>
              <div className="form-group">
                <label>标签</label>
                <input
                  type="text"
                  value={newWebsite.tags}
                  onChange={e => setNewWebsite({ ...newWebsite, tags: e.target.value })}
                  placeholder="用逗号分隔，例如：搜索,工具,资讯"
                />
              </div>
              <div className="form-group">
                <label>主题色</label>
                <input
                  type="color"
                  value={newWebsite.color}
                  onChange={e => setNewWebsite({ ...newWebsite, color: e.target.value })}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-button" onClick={() => setIsAddingWebsite(false)}>
                取消
              </button>
              <button className="submit-button" onClick={handleAddWebsite}>
                添加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;