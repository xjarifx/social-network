import { useLocation, useNavigate } from "react-router-dom";
import { Home, Bell, User, Search } from "lucide-react";
import { cn } from "../lib/utils";

const navItems = [
  { icon: Home, label: "Home", to: "/" },
  { icon: Search, label: "Explore", to: "/search" },
  { icon: Bell, label: "Notifications", to: "/notifications" },
  { icon: User, label: "Profile", to: "/profile" },
];

export function MobileNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/90 backdrop-blur-md lg:hidden">
      <div className="flex items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <button
              key={item.to}
              onClick={() => navigate(item.to)}
              className={cn(
                "relative flex flex-1 cursor-pointer items-center justify-center py-3 transition-colors duration-base",
                isActive
                  ? "text-text-primary"
                  : "text-text-secondary"
              )}
              title={item.label}
            >
              <item.icon 
                className="h-[26px] w-[26px]" 
                strokeWidth={isActive ? 2.5 : 2}
              />
              {isActive && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-accent" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
