import React, { useRef } from 'react';
import { Download, Upload, FileText, AlertCircle } from 'lucide-react';
import { Website } from '../types';

interface ImportExportProps {
  websites: Website[];
  onImport: (websites: Website[]) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function ImportExport({ websites, onImport, isOpen, onToggle }: ImportExportProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const exportData = () => {
    const dataStr = JSON.stringify(websites, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `网站聚合器-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    onToggle();
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        if (Array.isArray(importedData)) {
          onImport(importedData);
          onToggle();
        } else {
          alert('文件格式不正确');
        }
      } catch (error) {
        alert('文件解析失败');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="p-3 bg-white/10 backdrop-blur-xl text-white/70 hover:text-white hover:bg-white/20 transition-all duration-300 rounded-xl transform hover:scale-105"
        title="导入/导出"
      >
        <FileText className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl p-6 shadow-2xl z-50">
          <h3 className="text-white font-bold mb-4 text-center">数据管理</h3>
          
          <div className="space-y-4">
            <button
              onClick={exportData}
              className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-blue-500/20 to-purple-600/20 hover:from-blue-500/30 hover:to-purple-600/30 text-white rounded-xl transition-all duration-300 border border-white/10"
            >
              <Download className="w-5 h-5" />
              <div className="text-left">
                <div className="font-semibold">导出数据</div>
                <div className="text-sm text-white/70">备份你的网站收藏</div>
              </div>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-green-500/20 to-emerald-600/20 hover:from-green-500/30 hover:to-emerald-600/30 text-white rounded-xl transition-all duration-300 border border-white/10"
            >
              <Upload className="w-5 h-5" />
              <div className="text-left">
                <div className="font-semibold">导入数据</div>
                <div className="text-sm text-white/70">从备份文件恢复</div>
              </div>
            </button>

            <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
              <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-yellow-200">
                导入数据将会覆盖当前所有网站，请确保已备份重要数据
              </div>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
}