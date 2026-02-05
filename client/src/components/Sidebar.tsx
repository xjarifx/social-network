import { motion } from "framer-motion";
import { Search, Sparkles } from "lucide-react";

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

export function Sidebar({ trends = [], showSearch = true }: SidebarProps) {
  const containerVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: 10 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        delay: i * 0.05,
        ease: "easeOut",
      },
    }),
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {/* Search */}
      {showSearch && (
        <div className="card p-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search..."
              className="input pl-10 bg-neutral-50 border-0"
            />
          </div>
        </div>
      )}

      {/* What's happening */}
      <div className="card overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <Sparkles size={20} className="text-accent-500" />
            <h2 className="text-brand font-bold text-base sm:text-lg">
              What's happening
            </h2>
          </div>
        </div>

        {/* Trends list */}
        <motion.div className="divide-y divide-neutral-100">
          {trends.length > 0 ? (
            trends.map((item, idx) => (
              <motion.button
                key={item.id}
                custom={idx}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                whileHover={{
                  backgroundColor: "#f5f5f5",
                }}
                className="w-full p-4 sm:p-5 text-left transition-colors duration-200 hover:bg-neutral-50"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-muted text-xs sm:text-sm">
                      {item.category}
                    </p>
                    <h3 className="text-brand font-bold text-sm sm:text-base truncate">
                      {item.title}
                    </h3>
                    <p className="text-muted text-xs sm:text-sm">
                      {item.count.toLocaleString()} posts
                    </p>
                  </div>
                  {item.trend === "up" && (
                    <div className="text-accent-500 text-xs font-semibold">
                      +
                    </div>
                  )}
                </div>
              </motion.button>
            ))
          ) : (
            <div className="p-4 sm:p-5 text-center">
              <p className="text-muted text-sm">No trends available</p>
            </div>
          )}
        </motion.div>

        {/* View more button */}
        {trends.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-neutral-100">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-2 text-accent-500 hover:text-accent-600 font-semibold text-sm transition-colors duration-200"
            >
              View More
            </motion.button>
          </div>
        )}
      </div>

      {/* Footer note */}
      <div className="text-center text-muted text-xs">
        <p>© 2026 Social. All rights reserved.</p>
      </div>
    </motion.div>
  );
}
