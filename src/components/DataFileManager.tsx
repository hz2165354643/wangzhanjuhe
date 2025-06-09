import React, { useState } from 'react';
import { FileText, Download, Upload, RefreshCw, Check, X, AlertCircle, Code, Database, FolderSync as Sync } from 'lucide-react';
import { Website, AppSettings } from '../types';
import { websitesData, defaultSettings, exportData } from '../data/websites';

interface DataFileManagerProps {
  websites: Website[];
  setWebsites: (websites: Website[]) => void;
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function DataFileManager({ 
  websites, 
  setWebsites, 
  settings, 
  updateSettings, 
  isOpen, 
  onToggle 
}: DataFileManagerProps) {
  const [operationStatus, setOperationStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [operationMessage, setOperationMessage] = useState('');

  // 重置到默认数据
  const resetToDefaultData = () => {
    if (confirm('确定要重置到默认数据吗？这将覆盖当前所有数据！')) {
      setOperationStatus('processing');
      setOperationMessage('正在重置数据...');
      
      try {
        setWebsites(websitesData);
        updateSettings(defaultSettings);
        
        setOperationStatus('success');
        setOperationMessage('数据已重置为默认配置');
      } catch (error) {
        setOperationStatus('error');
        setOperationMessage('重置失败，请重试');
      }
      
      setTimeout(() => {
        setOperationStatus('idle');
        setOperationMessage('');
      }, 3000);
    }
  };

  // 导出当前数据为代码文件格式
  const exportAsCodeFile = () => {
    setOperationStatus('processing');
    setOperationMessage('正在生成代码文件...');
    
    try {
      const codeContent = `import { Website, AppSettings } from '../types';

// 网站数据配置 - 自动生成于 ${new Date().toLocaleString()}
export const websitesData: Website[] = ${JSON.stringify(websites, null, 2)};

// 默认设置
export const defaultSettings: AppSettings = ${JSON.stringify(settings, null, 2)};

// 数据版本信息
export const dataVersion = {
  version: '1.0.0',
  lastUpdate: '${new Date().toISOString()}',
  description: '网站聚合器数据文件 - 自动导出'
};

// 导出完整数据结构（用于JSON导出）
export const exportData = () => ({
  websites: websitesData,
  settings: defaultSettings,
  metadata: {
    totalWebsites: websitesData.length,
    totalCategories: Array.from(new Set(websitesData.map(w => w.category).filter(Boolean))).length,
    favoriteCount: websitesData.filter(w => w.isFavorite).length,
    lastUpdate: dataVersion.lastUpdate,
    version: dataVersion.version
  }
});
`;

      const blob = new Blob([codeContent], { type: 'text/typescript' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `websites-${new Date().toISOString().split('T')[0]}.ts`;
      link.click();
      URL.revokeObjectURL(url);
      
      setOperationStatus('success');
      setOperationMessage('代码文件已导出！可直接替换 src/data/websites.ts');
    } catch (error) {
      setOperationStatus('error');
      setOperationMessage('导出失败，请重试');
    }
    
    setTimeout(() => {
      setOperationStatus('idle');
      setOperationMessage('');
    }, 3000);
  };

  // 导出JSON数据
  const exportJsonData = () => {
    setOperationStatus('processing');
    setOperationMessage('正在导出JSON数据...');
    
    try {
      const data = {
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
      
      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `网站数据-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      
      setOperationStatus('success');
      setOperationMessage('JSON数据已导出！');
    } catch (error) {
      setOperationStatus('error');
      setOperationMessage('导出失败，请重试');
    }
    
    setTimeout(() => {
      setOperationStatus('idle');
      setOperationMessage('');
    }, 3000);
  };

  // 从JSON文件导入数据
  const importJsonData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setOperationStatus('processing');
    setOperationMessage('正在导入数据...');
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        
        if (!importedData.websites || !Array.isArray(importedData.websites)) {
          throw new Error('无效的数据格式');
        }
        
        const shouldReplace = confirm('是否替换现有数据？点击"确定"替换，点击"取消"合并数据。');
        
        if (shouldReplace) {
          setWebsites(importedData.websites);
          if (importedData.settings) updateSettings(importedData.settings);
        } else {
          const existingIds = new Set(websites.map(w => w.id));
          const newWebsites = importedData.websites.filter((w: Website) => !existingIds.has(w.id));
          setWebsites(prev => [...prev, ...newWebsites]);
        }
        
        setOperationStatus('success');
        setOperationMessage(`数据导入成功！导入了 ${importedData.websites.length} 个网站`);
      } catch (error) {
        setOperationStatus('error');
        setOperationMessage('导入失败，请检查文件格式');
      }
    };
    
    reader.readAsText(file);
    
    setTimeout(() => {
      setOperationStatus('idle');
      setOperationMessage('');
    }, 3000);
  };

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="p-3 bg-white/10 backdrop-blur-xl text-white/70 hover:text-white hover:bg-white/20 transition-all duration-300 rounded-xl transform hover:scale-105"
        title="数据文件管理"
      >
        <Database className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-96 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl p-6 shadow-2xl z-50 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-bold flex items-center gap-2">
              <Database className="w-5 h-5" />
              数据文件管理
            </h3>
            <div className="flex items-center gap-2">
              {operationStatus === 'processing' && <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />}
              {operationStatus === 'success' && <Check className="w-4 h-4 text-green-400" />}
              {operationStatus === 'error' && <X className="w-4 h-4 text-red-400" />}
            </div>
          </div>

          {/* 状态消息 */}
          {operationMessage && (
            <div className={`mb-4 p-3 rounded-xl text-sm ${
              operationStatus === 'success' ? 'bg-green-500/20 border border-green-500/30 text-green-200' :
              operationStatus === 'error' ? 'bg-red-500/20 border border-red-500/30 text-red-200' :
              'bg-blue-500/20 border border-blue-500/30 text-blue-200'
            }`}>
              {operationMessage}
            </div>
          )}

          {/* 数据统计 */}
          <div className="mb-6 p-4 bg-white/5 rounded-xl">
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              当前数据统计
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="text-center">
                <div className="text-xl font-bold text-white">{websites.length}</div>
                <div className="text-white/60">总网站</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-white">{websites.filter(w => w.isFavorite).length}</div>
                <div className="text-white/60">收藏</div>
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="space-y-3 mb-6">
            <h4 className="text-white font-semibold flex items-center gap-2">
              <Code className="w-4 h-4" />
              代码文件操作
            </h4>
            
            <button
              onClick={exportAsCodeFile}
              disabled={operationStatus === 'processing'}
              className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-purple-500/20 to-pink-600/20 hover:from-purple-500/30 hover:to-pink-600/30 text-white rounded-xl transition-all duration-300 border border-white/10 disabled:opacity-50"
            >
              <Code className="w-4 h-4" />
              <div className="text-left flex-1">
                <div className="font-semibold text-sm">导出为代码文件</div>
                <div className="text-xs text-white/70">生成 .ts 文件，可直接替换源码</div>
              </div>
            </button>

            <button
              onClick={resetToDefaultData}
              disabled={operationStatus === 'processing'}
              className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-blue-500/20 to-cyan-600/20 hover:from-blue-500/30 hover:to-cyan-600/30 text-white rounded-xl transition-all duration-300 border border-white/10 disabled:opacity-50"
            >
              <Sync className="w-4 h-4" />
              <div className="text-left flex-1">
                <div className="font-semibold text-sm">重置为默认数据</div>
                <div className="text-xs text-white/70">恢复到初始网站配置</div>
              </div>
            </button>
          </div>

          {/* JSON操作 */}
          <div className="space-y-3 mb-6">
            <h4 className="text-white font-semibold flex items-center gap-2">
              <FileText className="w-4 h-4" />
              JSON数据操作
            </h4>
            
            <button
              onClick={exportJsonData}
              disabled={operationStatus === 'processing'}
              className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-green-500/20 to-emerald-600/20 hover:from-green-500/30 hover:to-emerald-600/30 text-white rounded-xl transition-all duration-300 border border-white/10 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <div className="text-left flex-1">
                <div className="font-semibold text-sm">导出JSON数据</div>
                <div className="text-xs text-white/70">导出为JSON格式备份</div>
              </div>
            </button>

            <label className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-orange-500/20 to-red-600/20 hover:from-orange-500/30 hover:to-red-600/30 text-white rounded-xl transition-all duration-300 border border-white/10 cursor-pointer">
              <Upload className="w-4 h-4" />
              <div className="text-left flex-1">
                <div className="font-semibold text-sm">导入JSON数据</div>
                <div className="text-xs text-white/70">从JSON文件恢复数据</div>
              </div>
              <input
                type="file"
                accept=".json"
                onChange={importJsonData}
                className="hidden"
                disabled={operationStatus === 'processing'}
              />
            </label>
          </div>

          {/* 使用说明 */}
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
            <h5 className="text-yellow-200 font-medium mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              使用说明
            </h5>
            <ul className="text-yellow-200/80 text-xs space-y-1">
              <li>• <strong>代码文件导出:</strong> 生成 .ts 文件，可直接替换 src/data/websites.ts</li>
              <li>• <strong>JSON导出:</strong> 用于备份和在不同环境间传输数据</li>
              <li>• <strong>重置默认:</strong> 恢复到初始的网站配置</li>
              <li>• <strong>数据导入:</strong> 支持合并或替换现有数据</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}