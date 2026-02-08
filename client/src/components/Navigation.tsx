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
      className="sticky top-0 z-40 border-b border-[#f5d580] bg-gradient-to-r from-[#fffef9] to-[#fef5bd]/80 backdrop-blur-xl"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <div className="flex items-center gap-2 cursor-pointer group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#ff7000] to-[#ff8e3a] flex items-center justify-center hover:shadow-lg transition-shadow duration-200">
                <span className="text-white font-bold text-sm">S</span>
              </div>
            </div>
          </div>

          {/* Center nav items */}
          <div className="flex items-center gap-12">
            {navItems.map((item) => (
              <div key={item.label}>
                <NavLink
                  to={item.to}
                  aria-label={item.label}
                  className={({ isActive }) =>
                    `relative flex items-center justify-center px-4 py-3 transition-colors duration-200 group ${
                      isActive
                        ? "text-[#ff7000]"
                        : "text-[#5a412f] hover:text-[#ff8e3a]"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <div className="relative flex items-center">
                      <item.icon size={20} />
                      {isActive && (
                        <motion.div
                          layoutId={`underline-${item.label}`}
                          className="absolute -bottom-3 left-1/2 -translate-x-1/2 h-1 w-12 rounded-full bg-[#ff7000]"
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                        />
                      )}
                    </div>
                  )}
                </NavLink>
              </div>
            ))}
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="mx-6">
            <div className="relative" ref={searchRef}>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                  <Search
                    size={16}
                    className="text-[#c99820] group-focus-within:text-[#ff7000] transition-colors"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() =>
                    searchQuery.trim().length >= 2 && setShowSuggestions(true)
                  }
                  className="w-48 pl-8 pr-3 py-1.5 rounded-full border border-[#edc560] bg-white text-xs text-[#5a412f] placeholder-[#c99820] focus:w-72 focus:bg-white focus:border-[#ff7000] focus:shadow-lg focus:shadow-[#ff7000]/20 focus:outline-none transition-all duration-200"
                />
              </div>

              {/* Suggestions dropdown */}
              {showSuggestions && (
                <motion.div
                  initial={{ opacity: 0, y: -12, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -12, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute top-full left-0 right-0 mt-3 bg-white border-2 border-[#fce8a0] rounded-xl shadow-xl z-50 max-h-96 overflow-y-auto"
                >
                  {isLoadingSuggestions ? (
                    <div className="px-4 py-6 text-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="w-5 h-5 border-2 border-accent-500 border-t-transparent rounded-full mx-auto"
                      />
                      <p className="text-sm text-neutral-500 mt-2">
                        Searching users...
                      </p>
                    </div>
                  ) : suggestions.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                      <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-2">
                        <Search size={20} className="text-neutral-400" />
                      </div>
                      <p className="text-sm font-medium text-neutral-700">
                        No users found
                      </p>
                      <p className="text-xs text-neutral-500 mt-1">
                        Try a different name
                      </p>
                    </div>
                  ) : (
                    <div className="py-2">
                      <div className="px-3 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                        People
                      </div>
                      {suggestions.map((user, index) => (
                        <motion.button
                          key={user.id}
                          type="button"
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.15, delay: index * 0.03 }}
                          whileHover={{ backgroundColor: "#f9fafb" }}
                          onClick={() =>
                            handleSuggestionClick(user.id, user.username)
                          }
                          className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-neutral-50"
                        >
                          <motion.div
                            className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-md"
                            whileHover={{ scale: 1.1 }}
                          >
                            {user.firstName[0]}
                            {user.lastName[0]}
                          </motion.div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-neutral-900 truncate">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-xs text-neutral-500 truncate">
                              @{user.username}
                            </div>
                          </div>
                          <motion.div
                            initial={{ opacity: 0 }}
                            whileHover={{ opacity: 1, x: -4 }}
                            className="text-neutral-300"
                          >
                            <Search size={16} />
                          </motion.div>
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
