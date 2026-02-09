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
import {
  useEffect,
  useRef,
  useState,
  useCallback,
  lazy,
  Suspense,
} from "react";
const Lottie = lazy(() => import("lottie-react"));
import globeAnimation from "../../assets/Earth globe rotating with Seamless loop animation.json";
import { useAuth } from "../context/AuthContext";
import { usersAPI, type User as UserType } from "../services/api";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Separator } from "./ui/separator";
import { ThemeToggle } from "./ThemeToggle";
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
      className="fixed left-0 top-0 hidden h-screen w-72 px-4 py-6 lg:block"
    >
      <div className="flex h-full flex-col rounded-[28px] border border-border/60 bg-card/80 p-4 shadow-glass backdrop-blur-xl">
        <div className="flex items-center justify-between gap-2 px-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-3"
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
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
              <Suspense fallback={<div className="h-8 w-8" />}>
                <Lottie animationData={globeAnimation} loop autoplay />
              </Suspense>
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground">
                Social Network
              </div>
              <div className="text-xs text-muted-foreground">Your orbit</div>
            </div>
          </motion.button>
          <ThemeToggle />
        </div>

        <Separator className="my-4" />

        <div className="relative px-2" ref={searchRef}>
          <form onSubmit={handleSearchSubmit}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search users"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() =>
                  searchQuery.trim().length >= 2 && setShowSuggestions(true)
                }
                className="h-11 rounded-2xl bg-background/70 pl-9"
              />
            </div>
          </form>

          {showSuggestions && (
            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute left-6 right-6 z-50 mt-3 rounded-2xl border border-border/60 bg-popover/90 p-2 shadow-glass backdrop-blur-xl"
            >
              {isLoadingSuggestions ? (
                <div className="px-4 py-5 text-center text-sm text-muted-foreground">
                  Searching...
                </div>
              ) : suggestions.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                  No users found
                </div>
              ) : (
                <div className="space-y-1">
                  {suggestions.map((foundUser) => (
                    <button
                      key={foundUser.id}
                      type="button"
                      onClick={() => handleSuggestionClick(foundUser.id)}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition hover:bg-muted/60"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-xs font-semibold text-primary">
                        {foundUser.firstName[0]}
                        {foundUser.lastName[0]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-foreground">
                          {foundUser.firstName} {foundUser.lastName}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">
                          @{foundUser.username}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </div>

        <nav className="mt-6 flex-1 space-y-2 px-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Button
                key={item.label}
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start rounded-2xl px-4 py-3 text-sm",
                  !isActive && "text-muted-foreground",
                )}
                onClick={() => navigate(item.to)}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Button>
            );
          })}
        </nav>

        <Separator className="my-4" />

        <div className="space-y-3 px-2">
          {user && (
            <div className="rounded-2xl border border-border/60 bg-background/60 px-4 py-3">
              <p className="text-sm font-semibold text-foreground truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                @{user.username}
              </p>
            </div>
          )}
          <Button
            variant="outline"
            className="w-full justify-start rounded-2xl"
            onClick={() => logout()}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </motion.aside>
  );
}
