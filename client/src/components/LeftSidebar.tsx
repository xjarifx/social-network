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
import { useAuth } from "../context/AuthContext";
import { usersAPI, type User as UserType } from "../services/api";
import { cn } from "../lib/utils";

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
    { icon: Home, label: "Home", to: "/" },
    { icon: PenSquare, label: "Create", to: "/compose" },
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
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    if (value.trim()) {
      debounceTimerRef.current = setTimeout(() => fetchSuggestions(value), 300);
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
      if (!searchRef.current) return;
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
    <aside className="fixed left-0 top-0 hidden h-screen w-[280px] border-r border-[#e8eaed] bg-white lg:flex lg:flex-col">
      {/* Logo / Brand */}
      <div className="flex items-center gap-3 px-6 py-5">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-3 cursor-pointer"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1a73e8]">
            <span className="text-[18px] font-bold text-white">S</span>
          </div>
          <span className="text-[18px] font-medium text-[#202124]">Social</span>
        </button>
      </div>

      {/* Search */}
      <div className="px-4 pb-2" ref={searchRef}>
        <form onSubmit={handleSearchSubmit}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#5f6368]" />
            <input
              type="text"
              placeholder="Search people"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() =>
                searchQuery.trim().length >= 2 && setShowSuggestions(true)
              }
              className="h-10 w-full rounded-full border-none bg-[#f1f3f4] pl-10 pr-4 text-[14px] text-[#202124] placeholder:text-[#80868b] outline-none focus:bg-white focus:shadow-[0_1px_2px_0_rgba(60,64,67,.3),0_1px_3px_1px_rgba(60,64,67,.15)] focus:ring-0 transition"
            />
          </div>
        </form>

        {showSuggestions && (
          <div className="absolute left-4 right-4 z-50 mt-1 rounded-lg bg-white py-2 shadow-[0_2px_6px_2px_rgba(60,64,67,.15),0_1px_2px_0_rgba(60,64,67,.3)]">
            {isLoadingSuggestions ? (
              <div className="px-4 py-3 text-center text-[13px] text-[#5f6368]">
                Searching...
              </div>
            ) : suggestions.length === 0 ? (
              <div className="px-4 py-4 text-center text-[13px] text-[#5f6368]">
                No users found
              </div>
            ) : (
              suggestions.map((foundUser) => (
                <button
                  key={foundUser.id}
                  type="button"
                  onClick={() => handleSuggestionClick(foundUser.id)}
                  className="flex w-full items-center gap-3 px-4 py-2 text-left transition hover:bg-[#f1f3f4]"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e8f0fe] text-[12px] font-medium text-[#1a73e8]">
                    {foundUser.firstName[0]}
                    {foundUser.lastName[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[14px] text-[#202124]">
                      {foundUser.firstName} {foundUser.lastName}
                    </div>
                    <div className="truncate text-[12px] text-[#5f6368]">
                      @{foundUser.username}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="mt-2 flex-1 px-3">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.to)}
              className={cn(
                "flex w-full items-center gap-4 rounded-full px-4 py-[10px] text-[14px] font-medium transition-colors mb-[2px] cursor-pointer",
                isActive
                  ? "bg-[#e8f0fe] text-[#1a73e8]"
                  : "text-[#5f6368] hover:bg-[#f1f3f4] hover:text-[#202124]",
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom user / logout */}
      <div className="border-t border-[#e8eaed] px-4 py-4">
        {user && (
          <div className="mb-3 flex items-center gap-3 rounded-lg px-2 py-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1a73e8] text-[13px] font-medium text-white">
              {user.firstName?.[0]}
              {user.lastName?.[0]}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-medium text-[#202124]">
                {user.firstName} {user.lastName}
              </p>
              <p className="truncate text-[12px] text-[#5f6368]">
                @{user.username}
              </p>
            </div>
          </div>
        )}
        <button
          onClick={() => logout()}
          className="flex w-full items-center gap-4 rounded-full px-4 py-[10px] text-[14px] font-medium text-[#5f6368] transition-colors hover:bg-[#f1f3f4] hover:text-[#202124] cursor-pointer"
        >
          <LogOut className="h-5 w-5" />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
