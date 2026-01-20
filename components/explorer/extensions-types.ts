export interface Extension {
  id: string;
  name: string;
  description: string;
  author: string;
  version: string;
  installed: boolean;
  downloads: number;
  rating: number;
  tags: string[];
  icon?: string;
  homepage?: string;
}

export type ExtensionCategory = 'all' | 'installed' | 'popular' | 'boards' | 'tools' | 'themes';