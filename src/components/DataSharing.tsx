import React, { useState, FC } from 'react';
import { 
  Upload, 
  Download, 
  Globe, 
  Share2, 
  Copy, 
  Check, 
  RefreshCw, 
  AlertCircle,
  FileText,
  Cloud,
  Users,
  Link,
  X
} from 'lucide-react';
import { Website, AppSettings } from '../types';

interface DataSharingProps {
  websites: Website[];
  setWebsites: (websites: Website[]) => void;
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const DataSharing: FC<DataSharingProps> = ({ websites, setWebsites, settings, updateSettings, isOpen, onToggle }) => {
  const [shareStatus, setShareStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [shareMessage, setShareMessage] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadConfig, setUploadConfig] = useState({
    gistToken: '',
    gistId: '',
    autoUpdate: false
  });

  // 生成分享数据
  const generateShareData = () => {
    return {
      websites,
      settings,
      metadata: {
        totalWebsites: websites.length,
        totalCategories: Array.from(new Set(websites.map(w => w.category).filter(Boolean))).length,
        favoriteCount: websites.filter(w => w.isFavorite).length,
        lastUpdate: new Date().toISOString(),
        version: '1.0.0'
      }
    };
  };

  // 导出JSON文件
  const exportToFile = () => {
    const data = generateShareData();
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `网站聚合器-共享数据-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    setShareMessage('数据已导出到本地文件！');
    setShareStatus('success');
    setTimeout(() => {
      setShareStatus('idle');
      setShareMessage('');
    }, 3000);
  };

  // 上传到GitHub Gist
  const uploadToGist = async () => {
    if (!uploadConfig.gistToken) {
      setShareMessage('请先配置GitHub Token');
      setShareStatus('error');
      return;
    }

    setShareStatus('uploading');
    
    try {
      const data = generateShareData();
      const gistData = {
        description: '网站聚合器 - 全球共享数据',
        public: true,
        files: {
          'website-aggregator-data.json': {
            content: JSON.stringify(data, null, 2)
          },
          'README.md': {
            content: `# 网站聚合器 - 共享数据

## 数据统计
- 总网站数: ${data.metadata.totalWebsites}
- 分类数: ${data.metadata.totalCategories}
- 收藏数: ${data.metadata.favoriteCount}
- 最后更新: ${data.metadata.lastUpdate}

## 使用方法
1. 复制此Gist的原始JSON文件链接
2. 在网站聚合器中使用"从URL导入"功能
3. 粘贴链接即可同步数据

## 自动同步
此数据会定期更新，您可以设置自动同步以获取最新内容。
`
          }
        }
      };

      let response;
      if (uploadConfig.gistId) {
        // 更新现有Gist
        response = await fetch(`https://api.github.com/gists/${uploadConfig.gistId}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `token ${uploadConfig.gistToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(gistData)
        });
      } else {
        // 创建新Gist
        response = await fetch('https://api.github.com/gists', {
          method: 'POST',
          headers: {
            'Authorization': `token ${uploadConfig.gistToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(gistData)
        });
      }

      if (response.ok) {
        const result = await response.json();
        const rawUrl = result.files['website-aggregator-data.json'].raw_url;
        
        setUploadConfig(prev => ({ ...prev, gistId: result.id }));
        setShareUrl(rawUrl);
        setShareMessage('数据已成功上传到GitHub Gist！');
        setShareStatus('success');
        
        // 保存配置
        localStorage.setItem('dataSharingConfig', JSON.stringify({
          ...uploadConfig,
          gistId: result.id
        }));
      } else {
        throw new Error('上传失败');
      }
    } catch (error) {
      setShareMessage(error instanceof Error ? error.message : '上传失败');
      setShareStatus('error');
    }

    setTimeout(() => {
      setShareStatus('idle');
      setShareMessage('');
    }, 5000);
  };

  // 从URL导入数据
  const importFromUrl = async (url: string) => {
    setShareStatus('uploading');
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('无法获取数据');
      }
      
      const data = await response.json();
      
      if (data.websites && Array.isArray(data.websites)) {
        const shouldReplace = confirm('是否替换现有数据？点击"确定"替换，点击"取消"合并数据。');
        
        if (shouldReplace) {
          setWebsites(data.websites);
          if (data.settings) updateSettings(data.settings);
        } else {
          const existingIds = new Set(websites.map(w => w.id));
          const newWebsites = data.websites.filter((w: Website) => !existingIds.has(w.id));
          setWebsites(prev => [...prev, ...newWebsites]);
        }
        
        setShareMessage(`数据导入成功！导入了 ${data.websites.length} 个网站`);
        setShareStatus('success');
      } else {
        throw new Error('数据格式不正确');
      }
    } catch (error) {
      setShareMessage(error instanceof Error ? error.message : '导入失败');
      setShareStatus('error');
    }

    setTimeout(() => {
      setShareStatus('idle');
      setShareMessage('');
    }, 3000);
  };

  // 复制到剪贴板
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setShareMessage('已复制到剪贴板！');
    setShareStatus('success');
    setTimeout(() => {
      setShareStatus('idle');
      setShareMessage('');
    }, 2000);
  };

  // 加载保存的配置
  React.useEffect(() => {
    const saved = localStorage.getItem('dataSharingConfig');
    if (saved) {
      setUploadConfig(JSON.parse(saved));
    }
  }, []);

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="p-2 rounded-lg glass-morphism text-white hover:opacity-80 transition-opacity"
        aria-label="Share data"
      >
        <Share2 className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 p-4 glass-morphism rounded-lg z-50">
          <div className="space-y-2">
            <button
              onClick={exportToFile}
              className="w-full p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
            >
              导出数据
            </button>
            <label className="block w-full p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors cursor-pointer">
              导入数据
              <input
                type="file"
                className="hidden"
                accept=".json"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      try {
                        const data = JSON.parse(event.target?.result as string);
                        setWebsites(data.websites);
                        updateSettings(data.settings);
                      } catch (error) {
                        console.error('导入数据失败:', error);
                      }
                    };
                    reader.readAsText(file);
                  }
                }}
              />
            </label>
          </div>
        </div>
      )}

      {/* GitHub配置弹窗 */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-60 p-4">
          <div className="bg-white/10 backdrop-blur-2xl rounded-2xl p-6 w-full max-w-md border border-white/20 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold bg-gradient-to-r from-white to-green-200 bg-clip-text text-transparent">
                GitHub Gist 配置
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-white/60 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  GitHub Personal Access Token
                </label>
                <input
                  type="password"
                  value={uploadConfig.gistToken}
                  onChange={(e) => setUploadConfig(prev => ({ ...prev, gistToken: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-green-400/50"
                  placeholder="ghp_xxxxxxxxxxxx"
                />
                <div className="text-xs text-white/60 mt-1">
                  需要 'gist' 权限，在 GitHub Settings → Developer settings → Personal access tokens 创建
                </div>
              </div>

              {uploadConfig.gistId && (
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">
                    Gist ID (自动生成)
                  </label>
                  <input
                    type="text"
                    value={uploadConfig.gistId}
                    readOnly
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white/70"
                  />
                </div>
              )}

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                <h5 className="text-blue-200 font-medium mb-2">操作步骤</h5>
                <ol className="text-blue-200/80 text-sm space-y-1 list-decimal list-inside">
                  <li>在GitHub创建Personal Access Token</li>
                  <li>输入Token并点击上传</li>
                  <li>系统自动创建Gist并生成分享链接</li>
                  <li>将链接分享给其他用户即可</li>
                </ol>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowUploadModal(false)}
                className="flex-1 px-4 py-3 bg-white/10 text-white/80 rounded-xl hover:bg-white/20 transition-all duration-300 font-medium"
              >
                取消
              </button>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  uploadToGist();
                }}
                disabled={!uploadConfig.gistToken}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                上传数据
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};