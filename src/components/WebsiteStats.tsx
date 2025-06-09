import { FC } from 'react';
import { BarChart3, TrendingUp, Clock, Star } from 'lucide-react';
import { Website } from '../types';

interface WebsiteStatsProps {
  websites: Website[];
  isOpen: boolean;
  onToggle: () => void;
}

export const WebsiteStats: FC<WebsiteStatsProps> = ({ websites, isOpen, onToggle }) => {
  const totalWebsites = websites.length;
  const favoriteWebsites = websites.filter(w => w.isFavorite).length;
  const totalVisits = websites.reduce((sum, w) => sum + (w.visitCount || 0), 0);
  const mostVisited = websites
    .filter(w => w.visitCount && w.visitCount > 0)
    .sort((a, b) => (b.visitCount || 0) - (a.visitCount || 0))
    .slice(0, 5);

  const categories = websites.reduce((acc, website) => {
    const category = website.category || '未分类';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="p-2 rounded-lg glass-morphism text-white hover:opacity-80 transition-opacity"
        aria-label="Website statistics"
      >
        <BarChart3 className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 p-4 glass-morphism rounded-lg z-50">
          <div className="space-y-2">
            <p>总网站数: {totalWebsites}</p>
            <p>总访问量: {totalVisits}</p>
            <p>收藏数量: {favoriteWebsites}</p>
          </div>
        </div>
      )}
    </div>
  );
};