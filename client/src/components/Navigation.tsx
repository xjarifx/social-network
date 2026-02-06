import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";
import {
  Home,
  Bell,
  CreditCard,
  Shield,
  User,
  MoreHorizontal,
  LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function Navigation() {
  const { logout, user } = useAuth();
  const navItems = [
    { icon: Home, label: "Home", to: "/" },
    { icon: Bell, label: "Notifications", to: "/notifications" },
    { icon: User, label: "Profile", to: "/profile" },
    { icon: CreditCard, label: "Billing", to: "/billing" },
    { icon: Shield, label: "Blocks", to: "/blocks" },
  ];

  return (
    <motion.nav
      initial={{ y: -8, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="sticky top-0 z-40 border-b border-neutral-100 bg-white/80 backdrop-blur-xl"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
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
              <motion.div
                key={item.label}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
                      isActive
                        ? "text-accent-600 bg-accent-50"
                        : "text-neutral-600 hover:bg-neutral-50"
                    }`
                  }
                >
                  <item.icon size={20} />
                  <span className="font-medium text-sm">{item.label}</span>
                </NavLink>
              </motion.div>
            ))}
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {user && (
              <div className="hidden sm:flex items-center gap-2 rounded-full bg-neutral-50 px-3 py-1 text-xs text-neutral-600">
                <User size={14} />
                <span>{user.username}</span>
              </div>
            )}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="icon-btn"
              onClick={() => logout()}
              aria-label="Logout"
            >
              <LogOut size={20} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
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
