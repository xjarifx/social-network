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
  return (
    <div className="space-y-3">
      {/* Trending */}
      <div className="rounded-lg border border-[#dadce0] bg-white">
        <div className="px-4 py-3">
          <h3 className="text-[14px] font-medium text-[#202124]">
            What's happening
          </h3>
        </div>
        <div className="divide-y divide-[#e8eaed]">
          {trends.length > 0 ? (
            trends.map((item) => (
              <button
                key={item.id}
                className="w-full px-4 py-3 text-left transition hover:bg-[#f8f9fa] cursor-pointer"
              >
                <p className="text-[11px] text-[#5f6368]">{item.category}</p>
                <p className="truncate text-[13px] font-medium text-[#202124]">
                  {item.title}
                </p>
                <p className="text-[11px] text-[#5f6368]">
                  {item.count.toLocaleString()} posts
                </p>
              </button>
            ))
          ) : (
            <div className="px-4 py-6 text-center">
              <p className="text-[13px] text-[#5f6368]">No trends available</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <p className="text-center text-[11px] text-[#80868b]">
        © 2026 Social. All rights reserved.
      </p>
    </div>
  );
}
