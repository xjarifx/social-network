import { useLocation, useNavigate } from "react-router-dom";
import { Home, Bell, Search, User, PenSquare } from "lucide-react";
import { cn } from "../lib/utils";

const navItems = [
  { icon: Home, label: "Home", to: "/" },
  { icon: Search, label: "Search", to: "/search" },
  { icon: PenSquare, label: "Post", to: "/compose" },
  { icon: Bell, label: "Alerts", to: "/notifications" },
  { icon: User, label: "Profile", to: "/profile" },
];

export function MobileNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="fixed bottom-4 left-4 right-4 z-40 rounded-3xl border border-border/60 bg-card/90 px-4 py-3 shadow-glass backdrop-blur-xl lg:hidden">
      <div className="flex items-center justify-between">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <button
              key={item.to}
              onClick={() => navigate(item.to)}
              className={cn(
                "flex flex-col items-center gap-1 text-xs transition",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
