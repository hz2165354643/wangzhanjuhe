import React, { useState, useEffect, FC } from 'react';
import { 
  Upload, 
  Download, 
  Github, 
  RefreshCw, 
  Check, 
  X, 
  AlertCircle,
  FileText,
  GitBranch,
  Folder,
  Settings
} from 'lucide-react';
import { Website, AppSettings } from '../types';

interface GitHubRepoSyncProps {
  websites: Website[];
  setWebsites: (websites: Website[]) => void;
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;
  isOpen: boolean;
  onToggle: () => void;
}

interface RepoConfig {
  token: string;
  owner: string;
  repo: string;
  branch: string;
  filePath: string;
  autoSync: boolean;
}

export const GitHubRepoSync: FC<GitHubRepoSyncProps> = ({ isOpen, onToggle }) => {
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [syncMessage, setSyncMessage] = useState('');
  const [showConfig, setShowConfig] = useState(false);
  const [repoConfig, setRepoConfig] = useState<RepoConfig>(() => {
    const saved = localStorage.getItem('githubRepoConfig');
    return saved ? JSON.parse(saved) : {
      token: '',
      owner: '',
      repo: '',
      branch: 'main',
      filePath: 'data/websites.json',
      autoSync: false
    };
  });

  // 保存配置
  useEffect(() => {
    localStorage.setItem('githubRepoConfig', JSON.stringify(repoConfig));
  }, [repoConfig]);

  // 生成要上传的数据
  const generateUploadData = () => {
    return {
      websites,
      settings,
      metadata: {
        totalWebsites: websites.length,
        totalCategories: Array.from(new Set(websites.map(w => w.category).filter(Boolean))).length,
        favoriteCount: websites.filter(w => w.isFavorite).length,
        lastUpdate: new Date().toISOString(),
        version: '1.0.0',
        source: 'website-aggregator'
      }
    };
  };

  // 获取文件的SHA值（用于更新文件）
  const getFileSHA = async () => {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${repoConfig.owner}/${repoConfig.repo}/contents/${repoConfig.filePath}?ref=${repoConfig.branch}`,
        {
          headers: {
            'Authorization': `token ${repoConfig.token}`,
            'Accept': 'application/vnd.github.v3+json',
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        return data.sha;
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  // 上传数据到GitHub仓库
  const uploadToRepo = async () => {
    if (!repoConfig.token || !repoConfig.owner || !repoConfig.repo) {
      setSyncMessage('请先完成GitHub仓库配置');
      setSyncStatus('error');
      return;
    }

    setSyncStatus('syncing');
    setSyncMessage('正在上传到GitHub仓库...');

    try {
      const data = generateUploadData();
      const content = JSON.stringify(data, null, 2);
      const encodedContent = btoa(unescape(encodeURIComponent(content)));

      // 获取现有文件的SHA（如果存在）
      const sha = await getFileSHA();

      const requestBody: any = {
        message: `更新网站聚合器数据 - ${new Date().toLocaleString()}`,
        content: encodedContent,
        branch: repoConfig.branch
      };

      // 如果文件已存在，需要提供SHA值
      if (sha) {
        requestBody.sha = sha;
      }

      const response = await fetch(
        `https://api.github.com/repos/${repoConfig.owner}/${repoConfig.repo}/contents/${repoConfig.filePath}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `token ${repoConfig.token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/vnd.github.v3+json',
          },
          body: JSON.stringify(requestBody)
        }
      );

      if (response.ok) {
        const result = await response.json();
        setSyncMessage(`数据已成功上传到 ${repoConfig.owner}/${repoConfig.repo}/${repoConfig.filePath}`);
        setSyncStatus('success');
        
        // 生成访问链接
        const fileUrl = `https://github.com/${repoConfig.owner}/${repoConfig.repo}/blob/${repoConfig.branch}/${repoConfig.filePath}`;
        console.log('文件访问链接:', fileUrl);
      } else {
        const error = await response.json();
        throw new Error(error.message || '上传失败');
      }
    } catch (error) {
      setSyncMessage(error instanceof Error ? error.message : '上传失败，请检查配置');
      setSyncStatus('error');
    }

    setTimeout(() => {
      setSyncStatus('idle');
      setSyncMessage('');
    }, 5000);
  };

  // 从GitHub仓库下载数据
  const downloadFromRepo = async () => {
    if (!repoConfig.token || !repoConfig.owner || !repoConfig.repo) {
      setSyncMessage('请先完成GitHub仓库配置');
      setSyncStatus('error');
      return;
    }

    setSyncStatus('syncing');
    setSyncMessage('正在从GitHub仓库下载...');

    try {
      const response = await fetch(
        `https://api.github.com/repos/${repoConfig.owner}/${repoConfig.repo}/contents/${repoConfig.filePath}?ref=${repoConfig.branch}`,
        {
          headers: {
            'Authorization': `token ${repoConfig.token}`,
            'Accept': 'application/vnd.github.v3+json',
          }
        }
      );

      if (response.ok) {
        const fileData = await response.json();
        const content = atob(fileData.content);
        const data = JSON.parse(content);

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
          
          setSyncMessage(`数据同步成功！从 ${repoConfig.owner}/${repoConfig.repo} 导入了 ${data.websites.length} 个网站`);
          setSyncStatus('success');
        } else {
          throw new Error('文件格式不正确');
        }
      } else {
        const error = await response.json();
        throw new Error(error.message || '文件不存在或无权限访问');
      }
    } catch (error) {
      setSyncMessage(error instanceof Error ? error.message : '下载失败，请检查配置');
      setSyncStatus('error');
    }

    setTimeout(() => {
      setSyncStatus('idle');
      setSyncMessage('');
    }, 5000);
  };

  // 验证仓库配置
  const validateConfig = async () => {
    if (!repoConfig.token || !repoConfig.owner || !repoConfig.repo) {
      return false;
    }

    try {
      const response = await fetch(
        `https://api.github.com/repos/${repoConfig.owner}/${repoConfig.repo}`,
        {
          headers: {
            'Authorization': `token ${repoConfig.token}`,
            'Accept': 'application/vnd.github.v3+json',
          }
        }
      );

      return response.ok;
    } catch (error) {
      return false;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className={`p-3 backdrop-blur-xl text-white/70 hover:text-white hover:bg-white/20 transition-all duration-300 rounded-xl transform hover:scale-105 ${
          repoConfig.token && repoConfig.owner && repoConfig.repo 
            ? 'bg-purple-500/20 border border-purple-500/30' 
            : 'bg-white/10'
        }`}
        title="GitHub仓库同步"
      >
        <Github className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-96 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl p-6 shadow-2xl z-50 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-bold flex items-center gap-2">
              <Github className="w-5 h-5" />
              GitHub仓库同步
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

          {/* 仓库信息 */}
          {repoConfig.owner && repoConfig.repo && (
            <div className="mb-4 p-3 bg-white/5 rounded-xl">
              <div className="flex items-center gap-2 text-white/80 text-sm">
                <Folder className="w-4 h-4" />
                <span>{repoConfig.owner}/{repoConfig.repo}</span>
              </div>
              <div className="flex items-center gap-2 text-white/60 text-xs mt-1">
                <GitBranch className="w-3 h-3" />
                <span>{repoConfig.branch}</span>
                <span>•</span>
                <FileText className="w-3 h-3" />
                <span>{repoConfig.filePath}</span>
              </div>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              onClick={uploadToRepo}
              disabled={syncStatus === 'syncing' || !repoConfig.token}
              className="flex items-center gap-2 p-3 bg-gradient-to-r from-green-500/20 to-emerald-600/20 hover:from-green-500/30 hover:to-emerald-600/30 text-white rounded-xl transition-all duration-300 border border-white/10 disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              <span className="text-sm">推送到仓库</span>
            </button>

            <button
              onClick={downloadFromRepo}
              disabled={syncStatus === 'syncing' || !repoConfig.token}
              className="flex items-center gap-2 p-3 bg-gradient-to-r from-blue-500/20 to-purple-600/20 hover:from-blue-500/30 hover:to-purple-600/30 text-white rounded-xl transition-all duration-300 border border-white/10 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span className="text-sm">拉取数据</span>
            </button>
          </div>

          {/* 配置按钮 */}
          <button
            onClick={() => setShowConfig(true)}
            className="w-full flex items-center gap-2 p-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all duration-300"
          >
            <Settings className="w-4 h-4" />
            <span className="text-sm">仓库配置</span>
          </button>

          {/* 使用说明 */}
          <div className="mt-4 p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl">
            <h5 className="text-purple-200 font-medium mb-2">功能说明</h5>
            <ul className="text-purple-200/80 text-xs space-y-1">
              <li>• 直接将数据推送到您的GitHub代码仓库</li>
              <li>• 支持自动创建和更新文件</li>
              <li>• 可以从仓库拉取最新数据</li>
              <li>• 完全控制数据存储位置</li>
            </ul>
          </div>
        </div>
      )}

      {/* 配置弹窗 */}
      {showConfig && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-60 p-4">
          <div className="bg-white/10 backdrop-blur-2xl rounded-2xl p-6 w-full max-w-md border border-white/20 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                GitHub仓库配置
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
                  GitHub Token *
                </label>
                <input
                  type="password"
                  value={repoConfig.token}
                  onChange={(e) => setRepoConfig(prev => ({ ...prev, token: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-purple-400/50"
                  placeholder="ghp_xxxxxxxxxxxx"
                />
                <div className="text-xs text-white/60 mt-1">
                  需要 'repo' 权限来访问和修改仓库文件
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">
                    用户名/组织 *
                  </label>
                  <input
                    type="text"
                    value={repoConfig.owner}
                    onChange={(e) => setRepoConfig(prev => ({ ...prev, owner: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-purple-400/50"
                    placeholder="username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">
                    仓库名 *
                  </label>
                  <input
                    type="text"
                    value={repoConfig.repo}
                    onChange={(e) => setRepoConfig(prev => ({ ...prev, repo: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-purple-400/50"
                    placeholder="my-repo"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">
                    分支名
                  </label>
                  <input
                    type="text"
                    value={repoConfig.branch}
                    onChange={(e) => setRepoConfig(prev => ({ ...prev, branch: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-purple-400/50"
                    placeholder="main"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">
                    文件路径
                  </label>
                  <input
                    type="text"
                    value={repoConfig.filePath}
                    onChange={(e) => setRepoConfig(prev => ({ ...prev, filePath: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-purple-400/50"
                    placeholder="data/websites.json"
                  />
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                <h5 className="text-blue-200 font-medium mb-2">配置说明</h5>
                <ul className="text-blue-200/80 text-sm space-y-1">
                  <li>• <strong>Token:</strong> 在GitHub Settings → Developer settings → Personal access tokens 创建</li>
                  <li>• <strong>权限:</strong> 需要勾选 'repo' 权限</li>
                  <li>• <strong>仓库:</strong> 可以是公开或私有仓库</li>
                  <li>• <strong>文件:</strong> 如果不存在会自动创建</li>
                </ul>
              </div>

              {/* 预览URL */}
              {repoConfig.owner && repoConfig.repo && repoConfig.filePath && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3">
                  <div className="text-green-200 text-sm font-medium mb-1">文件将保存到:</div>
                  <div className="text-green-200/80 text-xs break-all">
                    https://github.com/{repoConfig.owner}/{repoConfig.repo}/blob/{repoConfig.branch}/{repoConfig.filePath}
                  </div>
                </div>
              )}
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
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all duration-300 font-medium"
              >
                保存配置
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};