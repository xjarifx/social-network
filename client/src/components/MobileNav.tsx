import { useLocation, useNavigate } from "react-router-dom";
import { Home, Bell, User, PenSquare, CreditCard } from "lucide-react";
import { cn } from "../lib/utils";

const navItems = [
  { icon: Home, label: "Home", to: "/" },
  { icon: PenSquare, label: "Post", to: "/compose" },
  { icon: Bell, label: "Alerts", to: "/notifications" },
  { icon: CreditCard, label: "Billing", to: "/billing" },
  { icon: User, label: "Profile", to: "/profile" },
];

export function MobileNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="fixed bottom-4 left-4 right-4 z-40 lg:hidden">
      <div className="mx-auto max-w-[400px] flex items-center justify-around rounded-2xl bg-white px-2 py-2 shadow-[0_2px_8px_0_rgba(60,64,67,.25),0_1px_3px_0_rgba(60,64,67,.15)]">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <button
              key={item.to}
              onClick={() => navigate(item.to)}
              className={cn(
                "relative flex h-10 w-10 items-center justify-center rounded-xl transition cursor-pointer",
                isActive
                  ? "text-[#1a73e8] bg-[#e8f0fe]"
                  : "text-[#5f6368] hover:text-[#202124] hover:bg-[#f1f3f4]",
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
