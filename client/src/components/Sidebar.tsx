export interface TrendingItem {
  id: string;
  category: string;
  title: string;
  count: number;
  trend?: "up" | "down";
}

export interface SidebarProps {
  trends?: TrendingItem[];
  showSearch?: boolean;
}

export function Sidebar({ trends = [] }: SidebarProps) {
  return <div className="space-y-4"></div>;
}
