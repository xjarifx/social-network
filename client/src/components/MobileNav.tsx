import { useLocation, useNavigate } from "react-router-dom";
import { Home, Bell, User, CreditCard } from "lucide-react";
import { cn } from "../lib/utils";

const navItems = [
  { icon: Home, label: "Home", to: "/" },
  { icon: Bell, label: "Alerts", to: "/notifications" },
  { icon: CreditCard, label: "Subscription", to: "/billing" },
  { icon: User, label: "Profile", to: "/profile" },
];

export function MobileNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="fixed right-4 bottom-4 left-4 z-40 lg:hidden">
      <div className="mx-auto flex max-w-105 items-center justify-around rounded-2xl border border-[#1a73e8]/35 bg-black px-2 py-2 shadow-[0_0_0_1px_rgba(26,115,232,.12)]">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <button
              key={item.to}
              onClick={() => navigate(item.to)}
              className={cn(
                "relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl transition",
                isActive
                  ? "bg-[#1a73e8]/25 text-[#4da3ff]"
                  : "text-white hover:bg-[#1a73e8]/15",
              )}
              title={item.label}
            >
              <item.icon className="h-5 w-5" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
