export interface Website {
  id: string;
  name: string;
  url: string;
  favicon: string;
  category: string;
  description: string;
  tags: string[];
  isFavorite: boolean;
  color: string;
  visitCount: number;
  lastVisited?: Date;
  randomClicks?: number;
} 