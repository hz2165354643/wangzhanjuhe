import React, { useState } from 'react';
import { Shield, Eye, EyeOff, Lock, AlertTriangle } from 'lucide-react';

interface AdminLoginProps {
  onLogin: (password: string) => void;
  isOpen: boolean;
  onClose: () => void;
  error?: string;
}

export function AdminLogin({ onLogin, isOpen, onClose, error }: AdminLoginProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim()) {
      onLogin(password);
      setAttempts(prev => prev + 1);
    }
  };

  const handleClose = () => {
    setPassword('');
    setShowPassword(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-2xl rounded-2xl w-full max-w-md border border-white/20 shadow-2xl">
        {/* 头部 */}
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold bg-gradient-to-r from-white to-red-200 bg-clip-text text-transparent">
                管理员验证
              </h2>
              <p className="text-white/60 text-sm">请输入管理密码</p>
            </div>
          </div>
        </div>

        {/* 表单 */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-white/90 mb-3">
              管理密码
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-red-400/50 focus:border-red-400/50 transition-all duration-300"
                placeholder="请输入管理密码"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="mb-4 flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/30 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span className="text-red-200 text-sm">{error}</span>
            </div>
          )}

          {/* 尝试次数警告 */}
          {attempts >= 3 && (
            <div className="mb-4 flex items-center gap-2 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
              <span className="text-yellow-200 text-sm">
                多次尝试失败，请确认密码是否正确
              </span>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 bg-white/10 text-white/80 rounded-xl hover:bg-white/20 transition-all duration-300 font-medium"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={!password.trim()}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl hover:from-red-600 hover:to-pink-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              验证
            </button>
          </div>
        </form>

        {/* 底部提示 */}
        <div className="px-6 pb-6">
          <div className="text-center text-xs text-white/40">
            忘记密码？请联系系统管理员
          </div>
        </div>
      </div>
    </div>
  );
}