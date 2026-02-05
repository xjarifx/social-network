import { motion } from "framer-motion";
import {
  Home,
  Search,
  Heart,
  Mail,
  Bookmark,
  Users,
  MoreHorizontal,
} from "lucide-react";

export function Navigation() {
  const navItems = [
    { icon: Home, label: "Home", active: true },
    { icon: Search, label: "Explore" },
    { icon: Heart, label: "Activity" },
    { icon: Mail, label: "Messages" },
    { icon: Bookmark, label: "Saved" },
    { icon: Users, label: "Community" },
  ];

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="sticky top-0 z-40 border-b border-neutral-100 bg-white/80 backdrop-blur-xl"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-shrink-0"
          >
            <div className="flex items-center gap-2 cursor-pointer group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="font-bold text-neutral-900 text-lg hidden sm:inline">
                Social
              </span>
            </div>
          </motion.div>

          {/* Center nav items - hidden on mobile */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <motion.button
                key={item.label}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
                  item.active
                    ? "text-accent-600 bg-accent-50"
                    : "text-neutral-600 hover:bg-neutral-50"
                }`}
              >
                <item.icon size={20} />
                <span className="font-medium text-sm">{item.label}</span>
              </motion.button>
            ))}
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="icon-btn"
            >
              <Search size={20} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="icon-btn md:hidden"
            >
              <MoreHorizontal size={20} />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
