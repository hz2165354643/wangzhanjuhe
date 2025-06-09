import React, { useState } from 'react';
import { 
  Settings, 
  Plus, 
  Edit3, 
  Trash2, 
  Save, 
  X, 
  FolderPlus, 
  Tag, 
  BarChart3,
  Users,
  Globe,
  Star,
  Search,
  Filter,
  Download,
  Upload,
  RefreshCw,
  Eye,
  EyeOff,
  LogOut,
  Shield,
  Key,
  Lock,
  ArrowUp,
  ArrowDown,
  Copy,
  ExternalLink,
  Heart,
  Gamepad2
} from 'lucide-react';
import { Website, AppSettings } from '../types';

interface AdminDashboardProps {
  websites: Website[];
  setWebsites: (websites: Website[]) => void;
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;
  isOpen: boolean;
  onClose: () => void;
  isAuthenticated: boolean;
  onLogout: () => void;
  adminPassword: string;
  onChangePassword: (newPassword: string) => void;
}

export function AdminDashboard({ 
  websites, 
  setWebsites, 
  settings, 
  updateSettings, 
  isOpen, 
  onClose,
  isAuthenticated,
  onLogout,
  adminPassword,
  onChangePassword
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'websites' | 'categories' | 'settings' | 'stats' | 'security'>('websites');
  const [editingWebsite, setEditingWebsite] = useState<Website | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('全部');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordChangeData, setPasswordChangeData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordChangeError, setPasswordChangeError] = useState('');
  const [newWebsite, setNewWebsite] = useState({
    name: '',
    url: '',
    category: '',
    description: '',
    tags: '',
    color: '#6366f1'
  });

  const categories = ['全部', ...Array.from(new Set(websites.map(w => w.category).filter(Boolean)))];
  
  const filteredWebsites = websites.filter(website => {
    const matchesSearch = website.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         website.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (website.tags && website.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
    const matchesCategory = selectedCategory === '全部' || website.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSaveWebsite = (website: Website) => {
    setWebsites(websites.map(w => w.id === website.id ? website : w));
    setEditingWebsite(null);
  };

  const handleDeleteWebsite = (id: string) => {
    if (confirm('确定要删除这个网站吗？')) {
      setWebsites(websites.filter(w => w.id !== id));
    }
  };

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
      
      setWebsites([...websites, website]);
      setNewWebsite({ name: '', url: '', category: '', description: '', tags: '', color: '#6366f1' });
      setShowAddForm(false);
    }
  };

  // 移动网站位置
  const moveWebsite = (id: string, direction: 'up' | 'down') => {
    const currentIndex = websites.findIndex(w => w.id === id);
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= websites.length) return;
    
    const newWebsites = [...websites];
    [newWebsites[currentIndex], newWebsites[newIndex]] = [newWebsites[newIndex], newWebsites[currentIndex]];
    setWebsites(newWebsites);
  };

  // 批量操作
  const handleBatchDelete = (categoryName: string) => {
    if (confirm(`确定要删除所有"${categoryName}"分类的网站吗？`)) {
      setWebsites(websites.filter(w => w.category !== categoryName));
    }
  };

  // 复制网站
  const duplicateWebsite = (website: Website) => {
    const duplicated: Website = {
      ...website,
      id: Date.now().toString(),
      name: `${website.name} (副本)`,
      visitCount: 0,
      lastVisited: undefined
    };
    setWebsites([...websites, duplicated]);
  };

  // 切换收藏状态
  const toggleFavorite = (id: string) => {
    setWebsites(websites.map(w => 
      w.id === id ? { ...w, isFavorite: !w.isFavorite } : w
    ));
  };

  const handlePasswordChange = () => {
    const { currentPassword, newPassword, confirmPassword } = passwordChangeData;
    
    // 验证当前密码
    if (currentPassword !== adminPassword) {
      setPasswordChangeError('当前密码错误');
      return;
    }
    
    // 验证新密码
    if (newPassword.length < 6) {
      setPasswordChangeError('新密码长度至少6位');
      return;
    }
    
    // 验证密码确认
    if (newPassword !== confirmPassword) {
      setPasswordChangeError('两次输入的密码不一致');
      return;
    }
    
    // 更新密码
    onChangePassword(newPassword);
    setPasswordChangeData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setPasswordChangeError('');
    setShowPasswordChange(false);
    alert('密码修改成功！');
  };

  const exportData = () => {
    const data = {
      websites,
      settings,
      exportDate: new Date().toISOString()
    };
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `网站聚合器-完整备份-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const categoryStats = websites.reduce((acc, website) => {
    const category = website.category || '未分类';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const isGameWebsite = (website: Website) => {
    return website.category === '游戏娱乐' && 
           (website.tags?.includes('游戏') || website.url.includes('game'));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-2xl rounded-2xl w-full max-w-6xl h-[90vh] border border-white/20 shadow-2xl flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-red-200 bg-clip-text text-transparent">
                管理后台
              </h2>
              <p className="text-white/60 text-sm">网站信息与系统设置管理</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all duration-300"
              title="退出登录"
            >
              <LogOut className="w-4 h-4" />
              退出
            </button>
            
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* 标签页导航 */}
        <div className="flex border-b border-white/20">
          {[
            { id: 'websites', label: '网站管理', icon: Globe },
            { id: 'categories', label: '分类管理', icon: FolderPlus },
            { id: 'settings', label: '系统设置', icon: Settings },
            { id: 'security', label: '安全设置', icon: Lock },
            { id: 'stats', label: '数据统计', icon: BarChart3 }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-4 transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-red-500/20 to-pink-600/20 text-white border-b-2 border-red-400'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* 内容区域 */}
        <div className="flex-1 overflow-hidden">
          {/* 网站管理 */}
          {activeTab === 'websites' && (
            <div className="h-full flex flex-col">
              {/* 工具栏 */}
              <div className="p-6 border-b border-white/20">
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-red-400/50"
                      placeholder="搜索网站..."
                    />
                  </div>
                  
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-red-400/50"
                  >
                    {categories.map(category => (
                      <option key={category} value={category} className="bg-gray-800">
                        {category}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => setShowAddForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300"
                  >
                    <Plus className="w-4 h-4" />
                    添加网站
                  </button>

                  <button
                    onClick={exportData}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
                  >
                    <Download className="w-4 h-4" />
                    导出数据
                  </button>
                </div>

                <div className="text-white/60 text-sm">
                  共 {websites.length} 个网站，当前显示 {filteredWebsites.length} 个
                </div>
              </div>

              {/* 网站列表 */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid gap-4">
                  {filteredWebsites.map((website, index) => (
                    <div key={website.id} className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl p-4">
                      {editingWebsite?.id === website.id ? (
                        <EditWebsiteForm
                          website={editingWebsite}
                          onSave={handleSaveWebsite}
                          onCancel={() => setEditingWebsite(null)}
                        />
                      ) : (
                        <div className="flex items-center gap-4">
                          <div 
                            className="w-12 h-12 rounded-lg shadow-lg flex items-center justify-center overflow-hidden"
                            style={{ backgroundColor: website.color || '#6366f1' }}
                          >
                            {isGameWebsite(website) ? (
                              <Gamepad2 className="w-8 h-8 text-white" />
                            ) : (
                              <img
                                src={website.favicon}
                                alt=""
                                className="w-8 h-8 rounded"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>';
                                }}
                              />
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-white truncate">{website.name}</h3>
                              {website.isFavorite && <Star className="w-4 h-4 text-yellow-400 fill-current" />}
                            </div>
                            <p className="text-white/60 text-sm truncate">{website.url}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="px-2 py-1 bg-white/10 rounded text-xs text-white/80">
                                {website.category}
                              </span>
                              <span className="text-white/50 text-xs">
                                访问 {website.visitCount || 0} 次
                              </span>
                              <span className="text-white/50 text-xs">
                                位置: {index + 1}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* 位置调整 */}
                            <div className="flex flex-col gap-1">
                              <button
                                onClick={() => moveWebsite(website.id, 'up')}
                                disabled={index === 0}
                                className="p-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300"
                                title="上移"
                              >
                                <ArrowUp className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => moveWebsite(website.id, 'down')}
                                disabled={index === filteredWebsites.length - 1}
                                className="p-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300"
                                title="下移"
                              >
                                <ArrowDown className="w-3 h-3" />
                              </button>
                            </div>

                            {/* 收藏切换 */}
                            <button
                              onClick={() => toggleFavorite(website.id)}
                              className={`p-2 rounded-lg transition-all duration-300 ${
                                website.isFavorite
                                  ? 'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400'
                                  : 'bg-white/10 hover:bg-white/20 text-white/60'
                              }`}
                              title={website.isFavorite ? '取消收藏' : '添加收藏'}
                            >
                              <Heart className={`w-4 h-4 ${website.isFavorite ? 'fill-current' : ''}`} />
                            </button>

                            {/* 复制 */}
                            <button
                              onClick={() => duplicateWebsite(website)}
                              className="p-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-all duration-300"
                              title="复制网站"
                            >
                              <Copy className="w-4 h-4" />
                            </button>

                            {/* 访问 */}
                            <button
                              onClick={() => window.open(website.url, '_blank')}
                              className="p-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-all duration-300"
                              title="访问网站"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </button>

                            {/* 编辑 */}
                            <button
                              onClick={() => setEditingWebsite(website)}
                              className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-all duration-300"
                              title="编辑"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            {/* 删除 */}
                            <button
                              onClick={() => handleDeleteWebsite(website.id)}
                              className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all duration-300"
                              title="删除"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 分类管理 */}
          {activeTab === 'categories' && (
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-6">分类管理</h3>
              <div className="grid gap-4">
                {Object.entries(categoryStats).map(([category, count]) => (
                  <div key={category} className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                          <FolderPlus className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">{category}</h4>
                          <p className="text-white/60 text-sm">{count} 个网站</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-2xl font-bold text-white">{count}</div>
                        {category !== '未分类' && (
                          <button
                            onClick={() => handleBatchDelete(category)}
                            className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all duration-300"
                            title="删除此分类所有网站"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 系统设置 */}
          {activeTab === 'settings' && (
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-6">系统设置</h3>
              <div className="space-y-6">
                <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl p-6">
                  <h4 className="font-semibold text-white mb-4">界面设置</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-white/90 mb-2">默认视图</label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateSettings({ defaultView: 'grid' })}
                          className={`flex-1 p-2 rounded-lg transition-all duration-300 text-sm ${
                            settings.defaultView === 'grid'
                              ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white'
                              : 'bg-white/10 text-white/70 hover:bg-white/20'
                          }`}
                        >
                          网格视图
                        </button>
                        <button
                          onClick={() => updateSettings({ defaultView: 'list' })}
                          className={`flex-1 p-2 rounded-lg transition-all duration-300 text-sm ${
                            settings.defaultView === 'list'
                              ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white'
                              : 'bg-white/10 text-white/70 hover:bg-white/20'
                          }`}
                        >
                          列表视图
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-white text-sm font-medium">显示访问次数</span>
                      <button
                        onClick={() => updateSettings({ showVisitCount: !settings.showVisitCount })}
                        className={`w-10 h-5 rounded-full transition-all duration-300 ${
                          settings.showVisitCount ? 'bg-green-500' : 'bg-white/20'
                        }`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
                          settings.showVisitCount ? 'translate-x-5' : 'translate-x-0.5'
                        }`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-white text-sm font-medium">启用动画效果</span>
                      <button
                        onClick={() => updateSettings({ enableAnimations: !settings.enableAnimations })}
                        className={`w-10 h-5 rounded-full transition-all duration-300 ${
                          settings.enableAnimations ? 'bg-green-500' : 'bg-white/20'
                        }`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
                          settings.enableAnimations ? 'translate-x-5' : 'translate-x-0.5'
                        }`} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 安全设置 */}
          {activeTab === 'security' && (
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-6">安全设置</h3>
              <div className="space-y-6">
                {/* 密码管理 */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl p-6">
                  <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <Key className="w-5 h-5" />
                    密码管理
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-white text-sm font-medium">管理员密码</span>
                        <p className="text-white/60 text-xs">用于访问管理后台的密码</p>
                      </div>
                      <button
                        onClick={() => setShowPasswordChange(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
                      >
                        <Key className="w-4 h-4" />
                        修改密码
                      </button>
                    </div>
                  </div>
                </div>

                {/* 会话管理 */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl p-6">
                  <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    会话管理
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-white text-sm font-medium">当前会话状态</span>
                        <p className="text-white/60 text-xs">30分钟后自动退出</p>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-2 bg-green-500/20 border border-green-500/30 rounded-lg">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-green-200 text-sm">活跃</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-white text-sm font-medium">手动退出</span>
                        <p className="text-white/60 text-xs">立即结束当前管理会话</p>
                      </div>
                      <button
                        onClick={onLogout}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all duration-300"
                      >
                        <LogOut className="w-4 h-4" />
                        退出登录
                      </button>
                    </div>
                  </div>
                </div>

                {/* 安全提示 */}
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                  <h5 className="text-yellow-200 font-medium mb-2">安全建议</h5>
                  <ul className="text-yellow-200/80 text-sm space-y-1">
                    <li>• 定期更改管理密码，建议使用强密码</li>
                    <li>• 不要在公共场所使用管理功能</li>
                    <li>• 使用完毕后及时退出登录</li>
                    <li>• 保护好您的密码信息，不要与他人分享</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* 数据统计 */}
          {activeTab === 'stats' && (
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-6">数据统计</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-500/20 to-purple-600/20 p-6 rounded-xl border border-white/10">
                  <div className="flex items-center gap-3 mb-2">
                    <Globe className="w-6 h-6 text-blue-400" />
                    <span className="text-white/70">总网站数</span>
                  </div>
                  <div className="text-3xl font-bold text-white">{websites.length}</div>
                </div>
                
                <div className="bg-gradient-to-br from-pink-500/20 to-red-600/20 p-6 rounded-xl border border-white/10">
                  <div className="flex items-center gap-3 mb-2">
                    <Star className="w-6 h-6 text-pink-400" />
                    <span className="text-white/70">收藏数</span>
                  </div>
                  <div className="text-3xl font-bold text-white">
                    {websites.filter(w => w.isFavorite).length}
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 p-6 rounded-xl border border-white/10">
                  <div className="flex items-center gap-3 mb-2">
                    <BarChart3 className="w-6 h-6 text-green-400" />
                    <span className="text-white/70">总访问</span>
                  </div>
                  <div className="text-3xl font-bold text-white">
                    {websites.reduce((sum, w) => sum + (w.visitCount || 0), 0)}
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-yellow-500/20 to-orange-600/20 p-6 rounded-xl border border-white/10">
                  <div className="flex items-center gap-3 mb-2">
                    <FolderPlus className="w-6 h-6 text-yellow-400" />
                    <span className="text-white/70">分类数</span>
                  </div>
                  <div className="text-3xl font-bold text-white">
                    {Object.keys(categoryStats).length}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 添加网站弹窗 */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-60 p-4">
          <div className="bg-white/10 backdrop-blur-2xl rounded-2xl p-6 w-full max-w-md border border-white/20 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                添加新网站
              </h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-white/60 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">网站名称 *</label>
                <input
                  type="text"
                  value={newWebsite.name}
                  onChange={(e) => setNewWebsite({ ...newWebsite, name: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-purple-400/50"
                  placeholder="例如：石头割草模拟器"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">网站地址 *</label>
                <input
                  type="url"
                  value={newWebsite.url}
                  onChange={(e) => setNewWebsite({ ...newWebsite, url: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-purple-400/50"
                  placeholder="例如：www.example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">分类</label>
                <input
                  type="text"
                  value={newWebsite.category}
                  onChange={(e) => setNewWebsite({ ...newWebsite, category: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-purple-400/50"
                  placeholder="例如：游戏娱乐"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">标签 (用逗号分隔)</label>
                <input
                  type="text"
                  value={newWebsite.tags}
                  onChange={(e) => setNewWebsite({ ...newWebsite, tags: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-purple-400/50"
                  placeholder="例如：游戏, 模拟器"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">主题色</label>
                <input
                  type="color"
                  value={newWebsite.color}
                  onChange={(e) => setNewWebsite({ ...newWebsite, color: e.target.value })}
                  className="w-full h-12 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddForm(false)}
                className="flex-1 px-4 py-3 bg-white/10 text-white/80 rounded-xl hover:bg-white/20 transition-all duration-300 font-medium"
              >
                取消
              </button>
              <button
                onClick={handleAddWebsite}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                disabled={!newWebsite.name || !newWebsite.url}
              >
                添加
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 修改密码弹窗 */}
      {showPasswordChange && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-60 p-4">
          <div className="bg-white/10 backdrop-blur-2xl rounded-2xl p-6 w-full max-w-md border border-white/20 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold bg-gradient-to-r from-white to-red-200 bg-clip-text text-transparent">
                修改管理密码
              </h3>
              <button
                onClick={() => {
                  setShowPasswordChange(false);
                  setPasswordChangeData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  setPasswordChangeError('');
                }}
                className="text-white/60 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">当前密码 *</label>
                <input
                  type="password"
                  value={passwordChangeData.currentPassword}
                  onChange={(e) => setPasswordChangeData({ ...passwordChangeData, currentPassword: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-red-400/50"
                  placeholder="请输入当前密码"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">新密码 *</label>
                <input
                  type="password"
                  value={passwordChangeData.newPassword}
                  onChange={(e) => setPasswordChangeData({ ...passwordChangeData, newPassword: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-red-400/50"
                  placeholder="请输入新密码（至少6位）"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">确认新密码 *</label>
                <input
                  type="password"
                  value={passwordChangeData.confirmPassword}
                  onChange={(e) => setPasswordChangeData({ ...passwordChangeData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-red-400/50"
                  placeholder="请再次输入新密码"
                />
              </div>

              {passwordChangeError && (
                <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-xl">
                  <span className="text-red-200 text-sm">{passwordChangeError}</span>
                </div>
              )}
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowPasswordChange(false);
                  setPasswordChangeData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  setPasswordChangeError('');
                }}
                className="flex-1 px-4 py-3 bg-white/10 text-white/80 rounded-xl hover:bg-white/20 transition-all duration-300 font-medium"
              >
                取消
              </button>
              <button
                onClick={handlePasswordChange}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl hover:from-red-600 hover:to-pink-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                disabled={!passwordChangeData.currentPassword || !passwordChangeData.newPassword || !passwordChangeData.confirmPassword}
              >
                确认修改
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 编辑网站表单组件
function EditWebsiteForm({ 
  website, 
  onSave, 
  onCancel 
}: { 
  website: Website; 
  onSave: (website: Website) => void; 
  onCancel: () => void; 
}) {
  const [editData, setEditData] = useState({
    ...website,
    tags: website.tags?.join(', ') || ''
  });

  const handleSave = () => {
    const updatedWebsite = {
      ...editData,
      tags: editData.tags ? editData.tags.split(',').map(tag => tag.trim()) : []
    };
    onSave(updatedWebsite);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-white/90 mb-1">网站名称</label>
          <input
            type="text"
            value={editData.name}
            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
            className="w-full px-3 py-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-blue-400/50"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-white/90 mb-1">分类</label>
          <input
            type="text"
            value={editData.category || ''}
            onChange={(e) => setEditData({ ...editData, category: e.target.value })}
            className="w-full px-3 py-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-blue-400/50"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-white/90 mb-1">网站地址</label>
        <input
          type="url"
          value={editData.url}
          onChange={(e) => setEditData({ ...editData, url: e.target.value })}
          className="w-full px-3 py-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-blue-400/50"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-white/90 mb-1">标签 (用逗号分隔)</label>
        <input
          type="text"
          value={editData.tags}
          onChange={(e) => setEditData({ ...editData, tags: e.target.value })}
          className="w-full px-3 py-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-blue-400/50"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-white/90 mb-1">主题色</label>
        <input
          type="color"
          value={editData.color || '#6366f1'}
          onChange={(e) => setEditData({ ...editData, color: e.target.value })}
          className="w-full h-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg"
        />
      </div>

      <div className="flex gap-2 pt-2">
        <button
          onClick={onCancel}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white/80 rounded-lg hover:bg-white/20 transition-all duration-300"
        >
          <X className="w-4 h-4" />
          取消
        </button>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300"
        >
          <Save className="w-4 h-4" />
          保存
        </button>
      </div>
    </div>
  );
}