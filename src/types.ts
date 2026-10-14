export interface CopyOption {
  id: string;
  name: string;
  badge: string;
  headline: string;
  subline: string;
  cta: string;
  focusText: string;
}

export interface PodConfig {
  size: number; // 4, 5, or 6 persons
  primaryFocus: 'speed' | 'scale' | 'observability' | 'balanced';
  stack: string[];
  duration: number; // months: 3, 6, 12
  customNote?: string;
}

export interface TechStackItem {
  id: string;
  name: string;
  category: 'framework' | 'agent-framework' | 'vector-db' | 'observability' | 'devops';
  iconName: string;
}
