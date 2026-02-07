import { motion } from "framer-motion";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  CreditCard,
  Home,
  LogOut,
  Settings,
  User,
  Search,
} from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { usersAPI, type User as UserType } from "../services/api";

export function Navigation() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<UserType[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLDivElement | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const navItems = [
    { icon: Home, label: "Home", to: "/" },
    { icon: Bell, label: "Notifications", to: "/notifications" },
  ];

  // Debounced search for live suggestions
  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      setIsLoadingSuggestions(true);
      const response = await usersAPI.search(query, 5, 0);
      setSuggestions(response.results);
      setShowSuggestions(true);
    } catch (err) {
      console.error("Failed to fetch suggestions:", err);
      setSuggestions([]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer for debounced search
    if (value.trim()) {
      debounceTimerRef.current = setTimeout(() => {
        fetchSuggestions(value);
      }, 300);
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (userId: string, userName: string) => {
    navigate(`/users/${userId}`);
    setSearchQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
  };

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

  // Close suggestions on outside click
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent | TouchEvent) => {
      if (!searchRef.current) {
        return;
      }
      if (!searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    if (showSuggestions) {
      document.addEventListener("mousedown", handleOutsideClick);
      document.addEventListener("touchstart", handleOutsideClick);

      return () => {
        document.removeEventListener("mousedown", handleOutsideClick);
        document.removeEventListener("touchstart", handleOutsideClick);
      };
    }
  }, [showSuggestions]);

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

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex-1 mx-8">
            <div className="relative" ref={searchRef}>
              <input
                type="text"
                placeholder="Search users by name..."
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() =>
                  searchQuery.trim().length >= 2 && setShowSuggestions(true)
                }
                className="w-full px-4 py-2 rounded-lg border border-neutral-200 bg-neutral-50 text-sm placeholder-neutral-500 focus:bg-white focus:border-accent-500 focus:ring-1 focus:ring-accent-500 transition-colors"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-accent-600 transition-colors"
                aria-label="Search"
              >
                <Search size={18} />
              </button>

              {/* Suggestions dropdown */}
              {showSuggestions && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white border border-neutral-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto"
                >
                  {isLoadingSuggestions ? (
                    <div className="px-4 py-3 text-center text-sm text-neutral-500">
                      Searching...
                    </div>
                  ) : suggestions.length === 0 ? (
                    <div className="px-4 py-3 text-center text-sm text-neutral-500">
                      No users found
                    </div>
                  ) : (
                    <div className="py-1">
                      {suggestions.map((user) => (
                        <motion.button
                          key={user.id}
                          type="button"
                          whileHover={{ backgroundColor: "#f5f5f5" }}
                          onClick={() =>
                            handleSuggestionClick(user.id, user.username)
                          }
                          className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-neutral-50 transition-colors"
                        >
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {user.firstName[0]}
                            {user.lastName[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-neutral-900 truncate">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-xs text-neutral-500 truncate">
                              @{user.username}
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </form>

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
