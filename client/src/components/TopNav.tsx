import { useNavigate, useLocation } from "react-router-dom";
import { Home, Bell, Search, User, CreditCard, LogOut } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/auth-context";
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

interface TopNavProps {
  onOpenPostComposer?: () => void;
}

export function TopNav({ onOpenPostComposer }: TopNavProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const navItems = [
    { icon: Home, label: "Home", to: "/" },
    { icon: Bell, label: "Notifications", to: "/notifications" },
    { icon: CreditCard, label: "Subscription", to: "/billing" },
    { icon: User, label: "Profile", to: "/profile" },
  ];

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
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 bg-black px-3 py-2 lg:flex lg:flex-col">
        <button
          onClick={() => navigate("/")}
          className="mb-3 flex h-12 w-12 items-center justify-center rounded-full text-left transition hover:bg-white/10 cursor-pointer"
        >
          <img src="/fire.png" alt="Social Network logo" className="h-7 w-7" />
        </button>

        <nav className="space-y-0.5">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <button
                key={item.to}
                onClick={() => navigate(item.to)}
                className={cn(
                  "flex w-fit items-center gap-3 rounded-full px-4 py-3 text-left transition cursor-pointer",
                  isActive
                    ? "font-semibold text-white"
                    : "font-normal text-white hover:bg-white/10",
                )}
              >
                <item.icon className="h-6 w-6" />
                <span className="text-[21px] leading-none">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <button
          onClick={() =>
            onOpenPostComposer ? onOpenPostComposer() : navigate("/compose")
          }
          className="mt-4 w-full rounded-full bg-[#ffffff] px-6 py-3 text-[18px] font-semibold text-black transition hover:bg-[#f2f2f2] cursor-pointer"
        >
          Post
        </button>

        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="mt-auto flex items-center gap-3 rounded-full px-3 py-3 text-left text-[17px] text-white transition hover:bg-white/10 cursor-pointer"
          title="Sign Out"
        >
          <LogOut className="h-5 w-5" />
          <span>Sign Out</span>
        </button>
      </aside>

      <header className="fixed left-0 right-0 top-0 z-50 border-b border-[#1a73e8]/35 bg-black/95 px-4 py-3 backdrop-blur-sm lg:hidden">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <img
              src="/fire.png"
              alt="Social Network logo"
              className="h-8 w-8"
            />
            <span className="text-[16px] font-medium text-white">
              Social Network
            </span>
          </button>

          <button
            onClick={() => navigate("/search")}
            className="ml-auto flex h-9 w-9 items-center justify-center rounded-full bg-[#1a73e8]/25 text-[#4da3ff] transition hover:bg-[#1a73e8]/35 cursor-pointer"
            title="Search"
          >
            <Search className="h-5 w-5" />
          </button>

          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-white transition hover:bg-[#1a73e8]/15 cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="h-4.5 w-4.5" />
          </button>
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
