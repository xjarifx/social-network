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
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#e8eaed] bg-white px-2 py-1 lg:hidden">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <button
              key={item.to}
              onClick={() => navigate(item.to)}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-full px-4 py-2 text-[11px] font-medium transition cursor-pointer",
                isActive
                  ? "text-[#1a73e8]"
                  : "text-[#5f6368] hover:text-[#202124]",
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-center rounded-full px-4 py-[4px] transition-colors",
                  isActive ? "bg-[#e8f0fe]" : "",
                )}
              >
                <item.icon className="h-5 w-5" />
              </div>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
