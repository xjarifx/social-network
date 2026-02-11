import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  Bell,
  Search,
  User,
  CreditCard,
  LogOut,
  PenSquare,
  X,
} from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { usersAPI, type User as UserType } from "../services/api";
import { cn } from "../lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";

export function TopNav() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<UserType[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showMobileSearchModal, setShowMobileSearchModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchRef = useRef<HTMLDivElement | null>(null);

  const navItems = [
    { icon: Home, label: "Home", to: "/" },
    { icon: PenSquare, label: "Create", to: "/compose" },
    { icon: Bell, label: "Notifications", to: "/notifications" },
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
      setShowMobileSearchModal(false);
    }
  };

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent | TouchEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, []);

  const handleCloseMobileSearch = () => {
    setShowMobileSearchModal(false);
    setSearchQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleConfirmLogout = async () => {
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (err) {
      console.error("Failed to logout:", err);
    } finally {
      setShowLogoutConfirm(false);
    }
  };

  return (
    <>
      {/* Desktop Header */}
      <header className="fixed top-0 left-0 right-0 z-50 hidden lg:block">
        <div className="h-16 bg-white border-b border-[#e8eaed] px-4">
          <div className="flex h-full items-center gap-2 max-w-[1400px] mx-auto">
            {/* Logo */}
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2.5 px-2 shrink-0 cursor-pointer"
            >
              <img
                src="/cloud.png"
                alt="Social Network logo"
                className="h-9 w-9"
              />
              <span className="text-[18px] font-medium text-[#202124]">
                Social Network
              </span>
            </button>

            {/* Center Search */}
            <div
              className="flex-1 flex justify-center max-w-[720px] mx-auto"
              ref={searchRef}
            >
              <form
                onSubmit={handleSearchSubmit}
                className="w-full max-w-[540px]"
              >
                <div className="relative flex items-center bg-[#f1f3f4] rounded-full overflow-hidden">
                  <input
                    type="text"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onFocus={() =>
                      searchQuery.trim().length >= 2 && setShowSuggestions(true)
                    }
                    className="h-11 w-full border-none bg-transparent pl-5 pr-14 text-[14px] text-[#202124] placeholder:text-[#80868b] outline-none focus:ring-0"
                  />
                  <button
                    type="submit"
                    className="absolute right-1 flex h-9 w-9 items-center justify-center rounded-full bg-white hover:bg-gray-100 transition-colors cursor-pointer shadow-sm"
                  >
                    <Search className="h-[18px] w-[18px] text-[#5f6368]" />
                  </button>
                </div>

                {showSuggestions && (
                  <div className="absolute left-1/2 -translate-x-1/2 z-50 mt-1 w-full max-w-[540px] rounded-2xl bg-white py-2 shadow-[0_4px_12px_0_rgba(60,64,67,.15),0_1px_4px_0_rgba(60,64,67,.3)]">
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
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-[#f1f3f4]"
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
              </form>
            </div>

            {/* Right: Nav Icons + User */}
            <div className="flex items-center gap-1 shrink-0">
              {navItems.map((item) => {
                const isActive = location.pathname === item.to;
                return (
                  <button
                    key={item.label}
                    onClick={() => navigate(item.to)}
                    className={cn(
                      "relative flex h-10 w-10 items-center justify-center rounded-full transition-colors cursor-pointer",
                      isActive
                        ? "text-[#1a73e8] bg-[#e8f0fe]"
                        : "text-[#5f6368] hover:bg-[#f1f3f4]",
                    )}
                    title={item.label}
                  >
                    <item.icon className="h-[20px] w-[20px]" />
                  </button>
                );
              })}

              {/* Divider */}
              <div className="mx-2 h-6 w-px bg-[#e8eaed]" />

              {/* Profile Button */}
              <button
                onClick={() => navigate("/profile")}
                className={cn(
                  "relative flex h-10 w-10 items-center justify-center rounded-full transition-colors cursor-pointer",
                  location.pathname === "/profile"
                    ? "text-[#1a73e8] bg-[#e8f0fe]"
                    : "text-[#5f6368] hover:bg-[#f1f3f4]",
                )}
                title="My Profile"
              >
                <User className="h-[20px] w-[20px]" />
              </button>

              {/* Sign Out Button */}
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="flex h-10 w-10 items-center justify-center rounded-full text-[#5f6368] hover:bg-[#f1f3f4] transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="h-[20px] w-[20px]" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 z-50 lg:hidden">
        <div className="bg-white border-b border-[#e8eaed] px-4 py-3">
          <div className="flex items-center gap-2">
            {/* Logo */}
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <img
                src="/cloud.png"
                alt="Social Network logo"
                className="h-8 w-8"
              />
              <span className="text-[16px] font-medium text-[#202124]">
                Social Network
              </span>
            </button>

            {/* Search Icon - Mobile Only */}
            <button
              onClick={() => setShowMobileSearchModal(true)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e8f0fe] hover:bg-[#d8e1f8] transition cursor-pointer text-[#1a73e8] ml-auto"
              title="Search"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Sign Out Button */}
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-[#5f6368] hover:bg-[#f1f3f4] transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="h-[18px] w-[18px]" />
            </button>
          </div>

          {/* Mobile Search Modal - Full screen overlay */}
          {showMobileSearchModal && (
            <div
              className="fixed inset-0 z-50 bg-black/20"
              onClick={handleCloseMobileSearch}
            >
              <div
                className="absolute inset-x-0 top-0 bg-white border-b border-[#e8eaed]"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-4 py-3">
                  <form
                    onSubmit={handleSearchSubmit}
                    className="relative flex items-center gap-2"
                  >
                    <button
                      type="button"
                      onClick={handleCloseMobileSearch}
                      className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[#f1f3f4] transition cursor-pointer text-[#5f6368]"
                    >
                      <X className="h-5 w-5" />
                    </button>
                    <div className="relative flex-1 flex items-center bg-[#f1f3f4] rounded-full overflow-hidden">
                      <input
                        autoFocus
                        type="text"
                        placeholder="Search people"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        onFocus={() =>
                          searchQuery.trim().length >= 2 &&
                          setShowSuggestions(true)
                        }
                        className="h-10 w-full border-none bg-transparent pl-4 pr-12 text-[13px] text-[#202124] placeholder:text-[#80868b] outline-none focus:ring-0"
                      />
                      <button
                        type="submit"
                        className="absolute right-1 flex h-8 w-8 items-center justify-center rounded-full bg-white hover:bg-gray-100 transition-colors cursor-pointer shadow-sm"
                      >
                        <Search className="h-[16px] w-[16px] text-[#5f6368]" />
                      </button>
                    </div>
                  </form>

                  {/* Suggestions Dropdown */}
                  {showSuggestions && (
                    <div className="mt-3 max-h-[60vh] overflow-y-auto rounded-2xl bg-white border border-[#e8eaed] shadow-[0_4px_12px_0_rgba(60,64,67,.15)]">
                      {isLoadingSuggestions ? (
                        <div className="px-4 py-4 text-center text-[13px] text-[#5f6368]">
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
                            onClick={() => {
                              handleSuggestionClick(foundUser.id);
                              handleCloseMobileSearch();
                            }}
                            className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-[#f1f3f4] border-b border-[#e8eaed] last:border-b-0"
                          >
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e8f0fe] text-[12px] font-medium text-[#1a73e8] shrink-0">
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
              </div>
            </div>
          )}
        </div>
      </header>

      <Dialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Sign out?</DialogTitle>
            <DialogDescription>
              You will need to log in again to access your account.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowLogoutConfirm(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmLogout}>
              Sign out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
