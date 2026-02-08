import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  Bell,
  Search,
  User,
  CreditCard,
  LogOut,
  PenSquare,
} from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import Lottie from "lottie-react";
import globeAnimation from "../../assets/Earth globe rotating with Seamless loop animation.json";
import { useAuth } from "../context/AuthContext";
import { usersAPI, type User as UserType } from "../services/api";

export function LeftSidebar() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<UserType[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchRef = useRef<HTMLDivElement | null>(null);

  const navItems = [
    { icon: Home, label: "News Feed", to: "/" },
    { icon: PenSquare, label: "Create Post", to: "/compose" },
    { icon: Bell, label: "Notifications", to: "/notifications" },
    { icon: User, label: "Profile", to: "/profile" },
    { icon: CreditCard, label: "Billing", to: "/billing" },
  ];

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

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (value.trim()) {
      debounceTimerRef.current = setTimeout(() => {
        fetchSuggestions(value);
      }, 300);
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (userId: string) => {
    navigate(`/users/${userId}`);
    setSearchQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

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
    <motion.aside
      initial={{ x: -304, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="fixed left-0 top-0 h-screen w-72 bg-gradient-to-b from-[#fffef9] to-[#fef5bd] border-r border-[#f5d580] flex flex-col z-40 overflow-y-auto"
    >
      {/* Logo/Header */}
      <div className="p-6 border-b border-[#f5d580]">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="cursor-pointer"
          onClick={() => navigate("/")}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              navigate("/");
            }
          }}
        >
          <div className="w-16 mx-auto">
            <Lottie animationData={globeAnimation} loop autoplay />
          </div>
        </motion.div>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-[#f5d580]">
        <form onSubmit={handleSearchSubmit}>
          <div className="relative" ref={searchRef}>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
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
                className="w-full pl-9 pr-3 py-2 rounded-full border border-[#edc560] bg-white text-sm text-[#5a412f] placeholder-[#c99820] focus:bg-white focus:border-[#ff7000] focus:shadow-lg focus:shadow-[#ff7000]/20 focus:outline-none transition-all duration-200"
              />
            </div>

            {/* Suggestions dropdown */}
            {showSuggestions && (
              <motion.div
                initial={{ opacity: 0, y: -12, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-[#fce8a0] rounded-xl shadow-xl z-50 max-h-80 overflow-y-auto"
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
                      className="w-5 h-5 border-2 border-[#ff7000] border-t-transparent rounded-full mx-auto"
                    />
                    <p className="text-sm text-[#a87d1a] mt-2">Searching...</p>
                  </div>
                ) : suggestions.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <div className="w-12 h-12 rounded-full bg-[#fce8a0] flex items-center justify-center mx-auto mb-2">
                      <Search size={20} className="text-[#a87d1a]" />
                    </div>
                    <p className="text-sm font-medium text-[#5a412f]">
                      No users found
                    </p>
                  </div>
                ) : (
                  <div className="py-2">
                    {suggestions.map((foundUser, index) => (
                      <motion.button
                        key={foundUser.id}
                        type="button"
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.15, delay: index * 0.03 }}
                        whileHover={{ backgroundColor: "#fef5bd" }}
                        onClick={() => handleSuggestionClick(foundUser.id)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[#fef5bd]"
                      >
                        <motion.div
                          className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ff7000] to-[#ff8e3a] flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-md"
                          whileHover={{ scale: 1.1 }}
                        >
                          {foundUser.firstName[0]}
                          {foundUser.lastName[0]}
                        </motion.div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-[#5a412f] truncate">
                            {foundUser.firstName} {foundUser.lastName}
                          </div>
                          <div className="text-xs text-[#a87d1a] truncate">
                            @{foundUser.username}
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
      </div>

      {/* Navigation items */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <motion.button
              key={item.label}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(item.to)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-colors duration-150 ${
                isActive
                  ? "bg-[#ff7000] text-white font-semibold border-l-4 border-[#ff8e3a] shadow-md"
                  : "text-[#5a412f] hover:bg-[#fce8a0] hover:text-[#3d2b1f]"
              }`}
            >
              <item.icon size={20} />
              <span className="text-base font-medium">{item.label}</span>
            </motion.button>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-[#f5d580] p-4 space-y-2">
        {user && (
          <div className="px-4 py-3 rounded-lg bg-[#fce8a0] mb-2">
            <p className="text-sm font-bold text-[#5a412f] truncate">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs text-[#a87d1a] truncate">@{user.username}</p>
          </div>
        )}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => logout()}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-lg text-[#5a412f] hover:bg-[#ff7000] hover:text-white transition-colors duration-150"
        >
          <LogOut size={20} />
          <span className="text-base font-medium">Logout</span>
        </motion.button>
      </div>
    </motion.aside>
  );
}
