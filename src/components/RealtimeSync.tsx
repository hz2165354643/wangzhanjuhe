import React, { useState, useEffect, useRef } from 'react';
import { Wifi, WifiOff, Globe, Users, Zap, RefreshCw, Check, X, AlertTriangle, Podcast as Broadcast, Eye, Settings, Clock, Activity } from 'lucide-react';
import { Website, AppSettings } from '../types';

interface RealtimeSyncProps {
  websites: Website[];
  setWebsites: (websites: Website[]) => void;
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;
  isOpen: boolean;
  onToggle: () => void;
  isAdmin: boolean;
}

interface SyncEvent {
  id: string;
  type: 'add' | 'update' | 'delete' | 'reorder';
  data: any;
  timestamp: number;
  adminId: string;
}

interface OnlineUser {
  id: string;
  lastSeen: number;
  isAdmin: boolean;
}

export function RealtimeSync({ 
  websites, 
  setWebsites, 
  settings, 
  updateSettings, 
  isOpen, 
  onToggle,
  isAdmin 
}: RealtimeSyncProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [syncEvents, setSyncEvents] = useState<SyncEvent[]>([]);
  const [broadcastChannel, setBroadcastChannel] = useState<string>('');
  const [autoSync, setAutoSync] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [showConfig, setShowConfig] = useState(false);
  
  const websocketRef = useRef<WebSocket | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const userIdRef = useRef(Math.random().toString(36).substr(2, 9));

  // 实时同步配置
  const [syncConfig, setSyncConfig] = useState(() => {
    const saved = localStorage.getItem('realtimeSyncConfig');
    return saved ? JSON.parse(saved) : {
      enabled: false,
      broadcastUrl: 'wss://api.websocket.org/echo', // 示例WebSocket服务
      fallbackUrl: 'https://api.github.com/gists', // GitHub Gist作为备用
      syncKey: '',
      channelId: 'website-aggregator-global',
      updateInterval: 1000 // 1秒检查一次
    };
  });

  // 保存配置
  useEffect(() => {
    localStorage.setItem('realtimeSyncConfig', JSON.stringify(syncConfig));
  }, [syncConfig]);

  // 初始化实时连接
  useEffect(() => {
    if (syncConfig.enabled && autoSync) {
      initializeRealtimeConnection();
    } else {
      disconnectRealtime();
    }

    return () => disconnectRealtime();
  }, [syncConfig.enabled, autoSync]);

  // 监听网站数据变化（仅管理员推送）
  useEffect(() => {
    if (isAdmin && isConnected && syncConfig.enabled) {
      broadcastUpdate('bulk_update', { websites, settings });
    }
  }, [websites, settings, isAdmin, isConnected]);

  // 初始化实时连接
  const initializeRealtimeConnection = async () => {
    try {
      // 方法1: 使用 WebSocket 进行实时通信
      await connectWebSocket();
      
      // 方法2: 使用 Server-Sent Events 作为备用
      if (!websocketRef.current) {
        connectServerSentEvents();
      }
      
      // 方法3: 使用轮询作为最后备用
      if (!websocketRef.current && !eventSourceRef.current) {
        startPolling();
      }
      
      setIsConnected(true);
      setSyncStatus('success');
      
      // 注册用户在线状态
      registerUserOnline();
      
    } catch (error) {
      console.error('实时连接失败:', error);
      setSyncStatus('error');
      // 降级到轮询模式
      startPolling();
    }
  };

  // WebSocket 连接
  const connectWebSocket = async () => {
    return new Promise((resolve, reject) => {
      try {
        const ws = new WebSocket(syncConfig.broadcastUrl);
        
        ws.onopen = () => {
          console.log('WebSocket 连接成功');
          websocketRef.current = ws;
          
          // 加入频道
          ws.send(JSON.stringify({
            type: 'join',
            channel: syncConfig.channelId,
            userId: userIdRef.current,
            isAdmin
          }));
          
          resolve(ws);
        };
        
        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            handleRealtimeMessage(message);
          } catch (error) {
            console.error('消息解析失败:', error);
          }
        };
        
        ws.onerror = (error) => {
          console.error('WebSocket 错误:', error);
          reject(error);
        };
        
        ws.onclose = () => {
          console.log('WebSocket 连接关闭');
          websocketRef.current = null;
          setIsConnected(false);
          
          // 自动重连
          if (syncConfig.enabled && autoSync) {
            setTimeout(initializeRealtimeConnection, 5000);
          }
        };
        
      } catch (error) {
        reject(error);
      }
    });
  };

  // Server-Sent Events 连接
  const connectServerSentEvents = () => {
    try {
      const eventSource = new EventSource(`${syncConfig.fallbackUrl}?channel=${syncConfig.channelId}`);
      
      eventSource.onopen = () => {
        console.log('SSE 连接成功');
        eventSourceRef.current = eventSource;
        setIsConnected(true);
      };
      
      eventSource.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          handleRealtimeMessage(message);
        } catch (error) {
          console.error('SSE 消息解析失败:', error);
        }
      };
      
      eventSource.onerror = (error) => {
        console.error('SSE 错误:', error);
        eventSource.close();
        eventSourceRef.current = null;
      };
      
    } catch (error) {
      console.error('SSE 连接失败:', error);
    }
  };

  // 轮询模式
  const startPolling = () => {
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
    }
    
    syncIntervalRef.current = setInterval(async () => {
      await pollForUpdates();
    }, syncConfig.updateInterval);
    
    setIsConnected(true);
    console.log('启动轮询模式');
  };

  // 轮询检查更新
  const pollForUpdates = async () => {
    try {
      // 使用 GitHub Gist 作为数据存储
      const response = await fetch(`https://api.github.com/gists/${syncConfig.channelId}`, {
        headers: syncConfig.syncKey ? {
          'Authorization': `token ${syncConfig.syncKey}`
        } : {}
      });
      
      if (response.ok) {
        const gist = await response.json();
        const content = gist.files['realtime-data.json']?.content;
        
        if (content) {
          const data = JSON.parse(content);
          
          // 检查是否有新的更新
          if (data.lastUpdate && (!lastSyncTime || new Date(data.lastUpdate) > lastSyncTime)) {
            handleRealtimeMessage({
              type: 'bulk_update',
              data: data,
              timestamp: Date.now(),
              adminId: data.adminId || 'unknown'
            });
            setLastSyncTime(new Date(data.lastUpdate));
          }
        }
      }
    } catch (error) {
      console.error('轮询更新失败:', error);
    }
  };

  // 处理实时消息
  const handleRealtimeMessage = (message: any) => {
    // 忽略自己发送的消息
    if (message.userId === userIdRef.current) return;
    
    setSyncStatus('syncing');
    
    try {
      switch (message.type) {
        case 'bulk_update':
          if (message.data.websites) {
            setWebsites(message.data.websites);
          }
          if (message.data.settings) {
            updateSettings(message.data.settings);
          }
          break;
          
        case 'website_add':
          setWebsites(prev => [...prev, message.data]);
          break;
          
        case 'website_update':
          setWebsites(prev => prev.map(w => 
            w.id === message.data.id ? { ...w, ...message.data } : w
          ));
          break;
          
        case 'website_delete':
          setWebsites(prev => prev.filter(w => w.id !== message.data.id));
          break;
          
        case 'website_reorder':
          setWebsites(message.data.websites);
          break;
          
        case 'user_online':
          setOnlineUsers(prev => {
            const filtered = prev.filter(u => u.id !== message.userId);
            return [...filtered, {
              id: message.userId,
              lastSeen: Date.now(),
              isAdmin: message.isAdmin || false
            }];
          });
          break;
          
        case 'user_offline':
          setOnlineUsers(prev => prev.filter(u => u.id !== message.userId));
          break;
      }
      
      // 记录同步事件
      const event: SyncEvent = {
        id: Math.random().toString(36).substr(2, 9),
        type: message.type,
        data: message.data,
        timestamp: Date.now(),
        adminId: message.adminId || message.userId || 'unknown'
      };
      
      setSyncEvents(prev => [event, ...prev.slice(0, 49)]); // 保留最近50条
      setSyncStatus('success');
      setLastSyncTime(new Date());
      
    } catch (error) {
      console.error('处理实时消息失败:', error);
      setSyncStatus('error');
    }
    
    setTimeout(() => setSyncStatus('idle'), 1000);
  };

  // 广播更新（仅管理员）
  const broadcastUpdate = async (type: string, data: any) => {
    if (!isAdmin || !syncConfig.enabled) return;
    
    const message = {
      type,
      data: {
        ...data,
        lastUpdate: new Date().toISOString(),
        adminId: userIdRef.current
      },
      timestamp: Date.now(),
      userId: userIdRef.current,
      isAdmin: true
    };
    
    try {
      // WebSocket 广播
      if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
        websocketRef.current.send(JSON.stringify(message));
      }
      
      // 同时更新到 GitHub Gist 作为持久化存储
      if (syncConfig.syncKey) {
        await updateGistData(message.data);
      }
      
    } catch (error) {
      console.error('广播更新失败:', error);
    }
  };

  // 更新 Gist 数据
  const updateGistData = async (data: any) => {
    try {
      const response = await fetch(`https://api.github.com/gists/${syncConfig.channelId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `token ${syncConfig.syncKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          files: {
            'realtime-data.json': {
              content: JSON.stringify(data, null, 2)
            }
          }
        })
      });
      
      if (!response.ok) {
        throw new Error('更新 Gist 失败');
      }
    } catch (error) {
      console.error('更新 Gist 数据失败:', error);
    }
  };

  // 注册用户在线状态
  const registerUserOnline = () => {
    const message = {
      type: 'user_online',
      userId: userIdRef.current,
      isAdmin,
      timestamp: Date.now()
    };
    
    if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
      websocketRef.current.send(JSON.stringify(message));
    }
    
    // 定期发送心跳
    const heartbeat = setInterval(() => {
      if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
        websocketRef.current.send(JSON.stringify({
          type: 'heartbeat',
          userId: userIdRef.current,
          timestamp: Date.now()
        }));
      } else {
        clearInterval(heartbeat);
      }
    }, 30000); // 30秒心跳
  };

  // 断开实时连接
  const disconnectRealtime = () => {
    if (websocketRef.current) {
      websocketRef.current.close();
      websocketRef.current = null;
    }
    
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
      syncIntervalRef.current = null;
    }
    
    setIsConnected(false);
  };

  // 手动同步
  const manualSync = async () => {
    setSyncStatus('syncing');
    try {
      await pollForUpdates();
      setSyncStatus('success');
    } catch (error) {
      setSyncStatus('error');
    }
    setTimeout(() => setSyncStatus('idle'), 2000);
  };

  // 清理在线用户列表
  useEffect(() => {
    const cleanup = setInterval(() => {
      const now = Date.now();
      setOnlineUsers(prev => prev.filter(user => now - user.lastSeen < 60000)); // 1分钟超时
    }, 30000);
    
    return () => clearInterval(cleanup);
  }, []);

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className={`p-3 backdrop-blur-xl text-white/70 hover:text-white hover:bg-white/20 transition-all duration-300 rounded-xl transform hover:scale-105 relative ${
          isConnected ? 'bg-green-500/20 border border-green-500/30' : 'bg-white/10'
        }`}
        title="实时同步"
      >
        {isConnected ? <Broadcast className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
        
        {/* 在线指示器 */}
        {isConnected && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
        )}
        
        {/* 在线用户数 */}
        {onlineUsers.length > 0 && (
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
            {onlineUsers.length}
          </div>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-96 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl p-6 shadow-2xl z-50 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-bold flex items-center gap-2">
              <Broadcast className="w-5 h-5" />
              实时全球同步
            </h3>
            <div className="flex items-center gap-2">
              {syncStatus === 'syncing' && <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />}
              {syncStatus === 'success' && <Check className="w-4 h-4 text-green-400" />}
              {syncStatus === 'error' && <X className="w-4 h-4 text-red-400" />}
              {isConnected && <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>}
            </div>
          </div>

          {/* 连接状态 */}
          <div className={`mb-4 p-3 rounded-xl text-sm ${
            isConnected 
              ? 'bg-green-500/20 border border-green-500/30 text-green-200' 
              : 'bg-red-500/20 border border-red-500/30 text-red-200'
          }`}>
            <div className="flex items-center gap-2">
              {isConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
              <span>
                {isConnected ? '已连接到全球同步网络' : '未连接到同步网络'}
              </span>
            </div>
            {lastSyncTime && (
              <div className="text-xs mt-1 opacity-80">
                最后同步: {lastSyncTime.toLocaleTimeString()}
              </div>
            )}
          </div>

          {/* 管理员状态 */}
          {isAdmin && (
            <div className="mb-4 p-3 bg-purple-500/20 border border-purple-500/30 rounded-xl">
              <div className="flex items-center gap-2 text-purple-200 text-sm">
                <Zap className="w-4 h-4" />
                <span>管理员模式 - 您的更改将实时推送到全球</span>
              </div>
            </div>
          )}

          {/* 在线用户 */}
          <div className="mb-4">
            <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
              <Users className="w-4 h-4" />
              在线用户 ({onlineUsers.length + 1})
            </h4>
            <div className="space-y-1 max-h-20 overflow-y-auto">
              <div className="flex items-center gap-2 text-sm text-white/80">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>您 {isAdmin ? '(管理员)' : '(访客)'}</span>
              </div>
              {onlineUsers.map(user => (
                <div key={user.id} className="flex items-center gap-2 text-sm text-white/60">
                  <div className={`w-2 h-2 rounded-full ${user.isAdmin ? 'bg-purple-400' : 'bg-green-400'}`}></div>
                  <span>用户 {user.id.substring(0, 6)} {user.isAdmin ? '(管理员)' : '(访客)'}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 同步控制 */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-white text-sm font-medium">启用实时同步</span>
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

            <div className="flex items-center justify-between">
              <span className="text-white text-sm font-medium">自动同步</span>
              <button
                onClick={() => setAutoSync(!autoSync)}
                className={`w-10 h-5 rounded-full transition-all duration-300 ${
                  autoSync ? 'bg-green-500' : 'bg-white/20'
                }`}
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
                  autoSync ? 'translate-x-5' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <button
              onClick={manualSync}
              disabled={syncStatus === 'syncing'}
              className="flex items-center gap-2 p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 rounded-lg transition-all duration-300 disabled:opacity-50 text-sm"
            >
              <RefreshCw className={`w-4 h-4 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
              手动同步
            </button>

            <button
              onClick={() => setShowConfig(true)}
              className="flex items-center gap-2 p-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 rounded-lg transition-all duration-300 text-sm"
            >
              <Settings className="w-4 h-4" />
              设置
            </button>
          </div>

          {/* 最近同步事件 */}
          {syncEvents.length > 0 && (
            <div>
              <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                最近活动
              </h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {syncEvents.slice(0, 5).map(event => (
                  <div key={event.id} className="text-xs text-white/60 p-2 bg-white/5 rounded">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(event.timestamp).toLocaleTimeString()}</span>
                      <span className="text-white/40">|</span>
                      <span>{event.type}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 配置弹窗 */}
      {showConfig && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-60 p-4">
          <div className="bg-white/10 backdrop-blur-2xl rounded-2xl p-6 w-full max-w-md border border-white/20 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold bg-gradient-to-r from-white to-green-200 bg-clip-text text-transparent">
                实时同步设置
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
                  WebSocket 服务器
                </label>
                <input
                  type="text"
                  value={syncConfig.broadcastUrl}
                  onChange={(e) => setSyncConfig(prev => ({ ...prev, broadcastUrl: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-green-400/50"
                  placeholder="wss://your-websocket-server.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  GitHub Token (备用存储)
                </label>
                <input
                  type="password"
                  value={syncConfig.syncKey}
                  onChange={(e) => setSyncConfig(prev => ({ ...prev, syncKey: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-green-400/50"
                  placeholder="ghp_xxxxxxxxxxxx"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  频道 ID
                </label>
                <input
                  type="text"
                  value={syncConfig.channelId}
                  onChange={(e) => setSyncConfig(prev => ({ ...prev, channelId: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-green-400/50"
                  placeholder="全球同步频道ID"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  更新间隔 (毫秒)
                </label>
                <input
                  type="number"
                  min="500"
                  max="10000"
                  value={syncConfig.updateInterval}
                  onChange={(e) => setSyncConfig(prev => ({ ...prev, updateInterval: parseInt(e.target.value) || 1000 }))}
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-green-400/50"
                />
              </div>

              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                <h5 className="text-green-200 font-medium mb-2">实时同步说明</h5>
                <ul className="text-green-200/80 text-sm space-y-1">
                  <li>• 管理员的更改会实时推送到全球所有用户</li>
                  <li>• 支持 WebSocket、SSE 和轮询三种连接方式</li>
                  <li>• 自动降级确保连接稳定性</li>
                  <li>• 显示在线用户数量和活动状态</li>
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
                onClick={() => {
                  setShowConfig(false);
                  if (syncConfig.enabled) {
                    disconnectRealtime();
                    setTimeout(initializeRealtimeConnection, 1000);
                  }
                }}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 font-medium"
              >
                保存并重连
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}