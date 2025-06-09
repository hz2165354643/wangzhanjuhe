import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  CloudOff, 
  Wifi, 
  WifiOff, 
  Download, 
  Upload, 
  RefreshCw, 
  Check, 
  X, 
  AlertTriangle,
  Globe,
  Users,
  Share2,
  Link,
  Copy,
  QrCode
} from 'lucide-react';
import { Website, AppSettings } from '../types';

interface CloudSyncProps {
  websites: Website[];
  setWebsites: (websites: Website[]) => void;
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;
  isOpen: boolean;
  onToggle: () => void;
}

interface SyncConfig {
  enabled: boolean;
  syncUrl: string;
  syncKey: string;
  autoSync: boolean;
  syncInterval: number; // 分钟
  lastSync: Date | null;
}

export function CloudSync({ 
  websites, 
  setWebsites, 
  settings, 
  updateSettings, 
  isOpen, 
  onToggle 
}: CloudSyncProps) {
  const [syncConfig, setSyncConfig] = useState<SyncConfig>(() => {
    const saved = localStorage.getItem('cloudSyncConfig');
    return saved ? JSON.parse(saved) : {
      enabled: false,
      syncUrl: '',
      syncKey: '',
      autoSync: false,
      syncInterval: 5,
      lastSync: null
    };
  });

  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [syncMessage, setSyncMessage] = useState('');
  const [showConfig, setShowConfig] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [showQR, setShowQR] = useState(false);

  // 保存同步配置
  useEffect(() => {
    localStorage.setItem('cloudSyncConfig', JSON.stringify(syncConfig));
  }, [syncConfig]);

  // 自动同步
  useEffect(() => {
    if (!syncConfig.enabled || !syncConfig.autoSync) return;

    const interval = setInterval(() => {
      handleSync();
    }, syncConfig.syncInterval * 60 * 1000);

    return () => clearInterval(interval);
  }, [syncConfig.enabled, syncConfig.autoSync, syncConfig.syncInterval]);

  // 生成分享链接
  const generateShareUrl = () => {
    const data = {
      websites,
      settings,
      timestamp: new Date().toISOString()
    };
    
    const encodedData = btoa(JSON.stringify(data));
    const baseUrl = window.location.origin + window.location.pathname;
    const url = `${baseUrl}?import=${encodedData}`;
    setShareUrl(url);
    return url;
  };

  // 通过 GitHub Gist 同步
  const syncViaGithub = async (action: 'upload' | 'download') => {
    if (!syncConfig.syncKey) {
      setSyncMessage('请先配置 GitHub Token');
      setSyncStatus('error');
      return;
    }

    setSyncStatus('syncing');
    
    try {
      const data = {
        websites,
        settings,
        lastUpdate: new Date().toISOString()
      };

      if (action === 'upload') {
        // 上传到 GitHub Gist
        const response = await fetch('https://api.github.com/gists', {
          method: 'POST',
          headers: {
            'Authorization': `token ${syncConfig.syncKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            description: '网站聚合器数据同步',
            public: false,
            files: {
              'website-aggregator-data.json': {
                content: JSON.stringify(data, null, 2)
              }
            }
          })
        });

        if (response.ok) {
          const result = await response.json();
          setSyncConfig(prev => ({ ...prev, syncUrl: result.id, lastSync: new Date() }));
          setSyncMessage('数据上传成功！');
          setSyncStatus('success');
        } else {
          throw new Error('上传失败');
        }
      } else {
        // 从 GitHub Gist 下载
        if (!syncConfig.syncUrl) {
          throw new Error('请先配置同步 ID');
        }

        const response = await fetch(`https://api.github.com/gists/${syncConfig.syncUrl}`, {
          headers: {
            'Authorization': `token ${syncConfig.syncKey}`,
          }
        });

        if (response.ok) {
          const gist = await response.json();
          const fileContent = gist.files['website-aggregator-data.json']?.content;
          
          if (fileContent) {
            const syncedData = JSON.parse(fileContent);
            setWebsites(syncedData.websites || []);
            updateSettings(syncedData.settings || {});
            setSyncConfig(prev => ({ ...prev, lastSync: new Date() }));
            setSyncMessage('数据同步成功！');
            setSyncStatus('success');
          } else {
            throw new Error('未找到同步数据');
          }
        } else {
          throw new Error('下载失败');
        }
      }
    } catch (error) {
      setSyncMessage(error instanceof Error ? error.message : '同步失败');
      setSyncStatus('error');
    }

    setTimeout(() => {
      setSyncStatus('idle');
      setSyncMessage('');
    }, 3000);
  };

  // 通过 JSON Bin 同步
  const syncViaJsonBin = async (action: 'upload' | 'download') => {
    setSyncStatus('syncing');
    
    try {
      const data = {
        websites,
        settings,
        lastUpdate: new Date().toISOString()
      };

      if (action === 'upload') {
        const response = await fetch('https://api.jsonbin.io/v3/b', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Master-Key': syncConfig.syncKey || '$2a$10$example-key-replace-with-real'
          },
          body: JSON.stringify(data)
        });

        if (response.ok) {
          const result = await response.json();
          setSyncConfig(prev => ({ ...prev, syncUrl: result.metadata.id, lastSync: new Date() }));
          setSyncMessage('数据上传成功！');
          setSyncStatus('success');
        } else {
          throw new Error('上传失败');
        }
      } else {
        if (!syncConfig.syncUrl) {
          throw new Error('请先配置同步 ID');
        }

        const response = await fetch(`https://api.jsonbin.io/v3/b/${syncConfig.syncUrl}/latest`, {
          headers: {
            'X-Master-Key': syncConfig.syncKey || '$2a$10$example-key-replace-with-real'
          }
        });

        if (response.ok) {
          const result = await response.json();
          setWebsites(result.record.websites || []);
          updateSettings(result.record.settings || {});
          setSyncConfig(prev => ({ ...prev, lastSync: new Date() }));
          setSyncMessage('数据同步成功！');
          setSyncStatus('success');
        } else {
          throw new Error('下载失败');
        }
      }
    } catch (error) {
      setSyncMessage(error instanceof Error ? error.message : '同步失败');
      setSyncStatus('error');
    }

    setTimeout(() => {
      setSyncStatus('idle');
      setSyncMessage('');
    }, 3000);
  };

  const handleSync = () => {
    if (syncConfig.syncKey.startsWith('ghp_')) {
      syncViaGithub('download');
    } else {
      syncViaJsonBin('download');
    }
  };

  const handleUpload = () => {
    if (syncConfig.syncKey.startsWith('ghp_')) {
      syncViaGithub('upload');
    } else {
      syncViaJsonBin('upload');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSyncMessage('已复制到剪贴板');
    setSyncStatus('success');
    setTimeout(() => {
      setSyncStatus('idle');
      setSyncMessage('');
    }, 2000);
  };

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className={`p-3 backdrop-blur-xl text-white/70 hover:text-white hover:bg-white/20 transition-all duration-300 rounded-xl transform hover:scale-105 ${
          syncConfig.enabled ? 'bg-green-500/20 border border-green-500/30' : 'bg-white/10'
        }`}
        title="云同步"
      >
        {syncConfig.enabled ? <Cloud className="w-5 h-5" /> : <CloudOff className="w-5 h-5" />}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-96 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl p-6 shadow-2xl z-50 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-bold flex items-center gap-2">
              <Cloud className="w-5 h-5" />
              云同步
            </h3>
            <div className="flex items-center gap-2">
              {syncStatus === 'syncing' && <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />}
              {syncStatus === 'success' && <Check className="w-4 h-4 text-green-400" />}
              {syncStatus === 'error' && <X className="w-4 h-4 text-red-400" />}
            </div>
          </div>

          {/* 状态消息 */}
          {syncMessage && (
            <div className={`mb-4 p-3 rounded-xl text-sm ${
              syncStatus === 'success' ? 'bg-green-500/20 border border-green-500/30 text-green-200' :
              syncStatus === 'error' ? 'bg-red-500/20 border border-red-500/30 text-red-200' :
              'bg-blue-500/20 border border-blue-500/30 text-blue-200'
            }`}>
              {syncMessage}
            </div>
          )}

          {/* 快速操作 */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              onClick={handleUpload}
              disabled={!syncConfig.enabled || syncStatus === 'syncing'}
              className="flex items-center gap-2 p-3 bg-gradient-to-r from-blue-500/20 to-purple-600/20 hover:from-blue-500/30 hover:to-purple-600/30 text-white rounded-xl transition-all duration-300 border border-white/10 disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              <span className="text-sm">上传数据</span>
            </button>

            <button
              onClick={handleSync}
              disabled={!syncConfig.enabled || syncStatus === 'syncing'}
              className="flex items-center gap-2 p-3 bg-gradient-to-r from-green-500/20 to-emerald-600/20 hover:from-green-500/30 hover:to-emerald-600/30 text-white rounded-xl transition-all duration-300 border border-white/10 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span className="text-sm">同步数据</span>
            </button>
          </div>

          {/* 分享功能 */}
          <div className="mb-6">
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              快速分享
            </h4>
            <div className="space-y-2">
              <button
                onClick={() => {
                  const url = generateShareUrl();
                  copyToClipboard(url);
                }}
                className="w-full flex items-center gap-2 p-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all duration-300"
              >
                <Link className="w-4 h-4" />
                <span className="text-sm">生成分享链接</span>
              </button>
              
              {shareUrl && (
                <div className="p-3 bg-white/5 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-white/70 text-xs">分享链接:</span>
                    <button
                      onClick={() => copyToClipboard(shareUrl)}
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="text-white/60 text-xs break-all">
                    {shareUrl.substring(0, 50)}...
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 同步配置 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-white text-sm font-medium">启用云同步</span>
              <button
                onClick={() => setSyncConfig(prev => ({ ...prev, enabled: !prev.enabled }))}
                className={`w-10 h-5 rounded-full transition-all duration-300 ${
                  syncConfig.enabled ? 'bg-green-500' : 'bg-white/20'
                }`}
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
                  syncConfig.enabled ? 'translate-x-5' : 'translate-x-0.5'
                }`} />
              </button>
            </div>

            {syncConfig.enabled && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-white text-sm font-medium">自动同步</span>
                  <button
                    onClick={() => setSyncConfig(prev => ({ ...prev, autoSync: !prev.autoSync }))}
                    className={`w-10 h-5 rounded-full transition-all duration-300 ${
                      syncConfig.autoSync ? 'bg-green-500' : 'bg-white/20'
                    }`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
                      syncConfig.autoSync ? 'translate-x-5' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>

                <button
                  onClick={() => setShowConfig(!showConfig)}
                  className="w-full flex items-center gap-2 p-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all duration-300"
                >
                  <Globe className="w-4 h-4" />
                  <span className="text-sm">同步设置</span>
                </button>
              </>
            )}
          </div>

          {/* 同步状态信息 */}
          {syncConfig.enabled && syncConfig.lastSync && (
            <div className="mt-4 p-3 bg-white/5 rounded-xl">
              <div className="text-white/70 text-xs">
                上次同步: {new Date(syncConfig.lastSync).toLocaleString()}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 同步配置弹窗 */}
      {showConfig && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-60 p-4">
          <div className="bg-white/10 backdrop-blur-2xl rounded-2xl p-6 w-full max-w-md border border-white/20 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                同步设置
              </h3>
              <button
                onClick={() => setShowConfig(false)}
                className="text-white/60 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  同步服务
                </label>
                <div className="text-white/60 text-xs mb-2">
                  支持 GitHub Gist 或 JSONBin
                </div>
                <input
                  type="text"
                  value={syncConfig.syncKey}
                  onChange={(e) => setSyncConfig(prev => ({ ...prev, syncKey: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-blue-400/50"
                  placeholder="GitHub Token 或 JSONBin API Key"
                />
              </div>

              {syncConfig.syncUrl && (
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">
                    同步 ID
                  </label>
                  <input
                    type="text"
                    value={syncConfig.syncUrl}
                    onChange={(e) => setSyncConfig(prev => ({ ...prev, syncUrl: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-blue-400/50"
                    placeholder="Gist ID 或 Bin ID"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  同步间隔 (分钟)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={syncConfig.syncInterval}
                  onChange={(e) => setSyncConfig(prev => ({ ...prev, syncInterval: parseInt(e.target.value) || 5 }))}
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-blue-400/50"
                />
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                <h5 className="text-blue-200 font-medium mb-2">使用说明</h5>
                <ul className="text-blue-200/80 text-sm space-y-1">
                  <li>• GitHub: 需要创建 Personal Access Token</li>
                  <li>• JSONBin: 注册账号获取 API Key</li>
                  <li>• 首次使用请先上传数据获取同步 ID</li>
                  <li>• 其他设备使用相同配置即可同步</li>
                </ul>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowConfig(false)}
                className="flex-1 px-4 py-3 bg-white/10 text-white/80 rounded-xl hover:bg-white/20 transition-all duration-300 font-medium"
              >
                取消
              </button>
              <button
                onClick={() => setShowConfig(false)}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 font-medium"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}