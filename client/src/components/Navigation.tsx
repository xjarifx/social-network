import { motion } from "framer-motion";
import { NavLink, useLocation } from "react-router-dom";
import { Bell, CreditCard, Home, LogOut, Settings, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";

export function Navigation() {
  const { logout } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const navItems = [
    { icon: Home, label: "Home", to: "/" },
    { icon: Bell, label: "Notifications", to: "/notifications" },
  ];

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const handleOutsideClick = (event: MouseEvent | TouchEvent) => {
      if (!menuRef.current) {
        return;
      }
      if (!menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [isMenuOpen]);

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
            </div>
          </motion.div>

          {/* Center nav items */}
          <div className="flex items-center gap-12">
            {navItems.map((item) => (
              <motion.div
                key={item.label}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <NavLink
                  to={item.to}
                  aria-label={item.label}
                  className={({ isActive }) =>
                    `relative flex items-center justify-center px-4 py-3 transition-colors duration-200 group ${
                      isActive
                        ? "text-accent-600"
                        : "text-neutral-600 hover:text-neutral-900"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <div className="relative flex items-center">
                      <item.icon size={20} />
                      {isActive && (
                        <motion.div
                          layoutId={`underline-${item.label}`}
                          className="absolute -bottom-3 left-1/2 -translate-x-1/2 h-1 w-12 rounded-full bg-accent-600"
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                        />
                      )}
                    </div>
                  )}
                </NavLink>
              </motion.div>
            ))}
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2" ref={menuRef}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="icon-btn"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              aria-label="Open settings"
              aria-haspopup="menu"
              aria-expanded={isMenuOpen}
            >
              <Settings size={20} />
            </motion.button>

            {isMenuOpen && (
              <div className="absolute right-4 top-14 w-44 rounded-lg border border-neutral-200 bg-white shadow-lg z-30 overflow-hidden">
                <NavLink
                  to="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                      isActive
                        ? "text-accent-600 bg-accent-50"
                        : "text-neutral-700 hover:bg-neutral-50"
                    }`
                  }
                >
                  <User size={16} />
                  <span>Profile</span>
                </NavLink>
                <NavLink
                  to="/billing"
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                      isActive
                        ? "text-accent-600 bg-accent-50"
                        : "text-neutral-700 hover:bg-neutral-50"
                    }`
                  }
                >
                  <CreditCard size={16} />
                  <span>Billing</span>
                </NavLink>
                <button
                  onClick={() => logout()}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
