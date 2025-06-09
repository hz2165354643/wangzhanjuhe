export interface Website {
  id: string;
  name: string;
  url: string;
  favicon?: string;
  category?: string;
  isFavorite?: boolean;
  color?: string;
  visitCount?: number;
  lastVisited?: Date;
  tags?: string[];
  description?: string;
  groupId?: string;
  randomClicks?: number; // 新增：随机点击次数
}

export interface WebsiteGroup {
  id: string;
  name: string;
  color: string;
  icon: string;
  websites: string[];
}

export interface SearchHistory {
  id: string;
  query: string;
  timestamp: Date;
  resultCount: number;
}

export interface AppSettings {
  theme: 'cosmic' | 'ocean' | 'forest' | 'sunset';
  defaultView: 'list' | 'grid';
  autoSave: boolean;
  showVisitCount: boolean;
  enableAnimations: boolean;
}