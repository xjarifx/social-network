import { useEffect, useState } from "react";
import { billingAPI } from "../services/api";
import type { BillingStatus } from "../services/api";
import { Button } from "../components/ui/button";
import { Check, Sparkles, RefreshCw } from "lucide-react";
import { useAuth } from "../context/auth-context";

// ---------------------------------------------------------------------------
// Main billing page - redirects to Stripe Checkout
// ---------------------------------------------------------------------------

export default function BillingPage() {
  const { user } = useAuth();
  const [status, setStatus] = useState<BillingStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDowngrading, setIsDowngrading] = useState(false);

  const loadStatus = async () => {
    try {
      setIsLoading(true);
      const response = await billingAPI.getStatus();
      setStatus(response);
      setError(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load billing";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      const response = await billingAPI.getStatus();
      setStatus(response);
      setError(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to refresh billing status";
      setError(message);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadStatus();

    // Listen for visibility changes (user returning to tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        console.log("📱 Page regained focus, refreshing billing status...");
        loadStatus();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const handleUpgradeToPro = async () => {
    try {
      setIsRedirecting(true);
      setError(null);

      console.log("\n" + "=".repeat(60));
      console.log("🚀 Starting checkout flow...");
      console.log("=".repeat(60));

      // Create checkout session and redirect to Stripe
      const result = await billingAPI.createCheckoutSession();
      console.log("✅ Checkout session created:", result);

      if (!result || !result.url) {
        console.error("❌ No URL in response:", result);
        throw new Error("Failed to create checkout session - no redirect URL");
      }

      console.log("\n📍 Redirecting to Stripe:");
      console.log("  URL:", result.url);
      console.log("  Time:", new Date().toISOString());
      console.log("=".repeat(60) + "\n");

      // Redirect to Stripe's hosted checkout page
      window.location.href = result.url;
    } catch (err) {
      console.error("❌ Checkout error:", err);
      const message =
        err instanceof Error ? err.message : "Failed to start checkout";
      setError(message);
      setIsRedirecting(false);
    }
  };

  const handleDowngradeToFree = async () => {
    try {
      setIsDowngrading(true);
      setError(null);

      console.log("🔄 Starting downgrade to FREE...");
      const result = await billingAPI.downgrade();
      console.log("✅ Downgraded successfully:", result);

      // Refresh status to reflect the change
      await loadStatus();
    } catch (err) {
      console.error("❌ Downgrade error:", err);
      const message =
        err instanceof Error ? err.message : "Failed to downgrade";
      setError(message);
    } finally {
      setIsDowngrading(false);
    }
  };

  // Use auth context user plan as source of truth when available
  const currentPlan = user?.plan || status?.plan || "FREE";
  const isPro = currentPlan === "PRO";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-[24px] font-normal text-[#202124]">
          Choose Your Plan
        </h1>
        <p className="mt-2 text-[15px] text-[#5f6368]">
          Select the plan that works best for you
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-[#ea4335]/30 bg-[#fce8e6] px-4 py-3 text-[13px] text-[#c5221f] flex items-center justify-between">
          <span>{error}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-6 w-6 p-0"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2">
          {[0, 1].map((i) => (
            <div key={i} className="rounded-2xl bg-white p-8">
              <div className="space-y-3">
                <div className="h-4 w-16 rounded-lg bg-[#f1f3f4] animate-pulse" />
                <div className="h-8 w-20 rounded-lg bg-[#f1f3f4] animate-pulse" />
                <div className="h-3 w-28 rounded-lg bg-[#f1f3f4] animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {/* Free Plan */}
          <div
            className={`relative overflow-hidden rounded-2xl bg-white p-7 transition-shadow ${
              !isPro
                ? "ring-2 ring-[#1a73e8] shadow-[0_1px_3px_0_rgba(60,64,67,.3),0_4px_8px_3px_rgba(60,64,67,.15)]"
                : "hover:shadow-[0_1px_3px_0_rgba(60,64,67,.3),0_4px_8px_3px_rgba(60,64,67,.15)]"
            }`}
          >
            {!isPro && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#1a73e8]" />
            )}
            <div className="mb-6">
              <h3 className="text-[18px] font-medium text-[#202124]">Free</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-[36px] font-normal text-[#202124]">
                  $0
                </span>
                <span className="text-[14px] text-[#5f6368]">/forever</span>
              </div>
            </div>

            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-2.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#e8f0fe]">
                  <Check className="h-3.5 w-3.5 text-[#1a73e8]" />
                </div>
                <p className="text-[14px] text-[#3c4043]">
                  Posts up to 20 characters
                </p>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#e8f0fe]">
                  <Check className="h-3.5 w-3.5 text-[#1a73e8]" />
                </div>
                <p className="text-[14px] text-[#3c4043]">Unlimited follows</p>
              </div>
            </div>

            <Button
              variant="secondary"
              disabled={!isPro || isDowngrading}
              onClick={isPro ? handleDowngradeToFree : undefined}
              className="w-full rounded-xl h-11"
            >
              {!isPro ? "Current Plan" : isDowngrading ? "Downgrading..." : "Downgrade"}
            </Button>
          </div>

          {/* Pro Plan */}
          <div
            className={`relative overflow-hidden rounded-2xl bg-white p-7 transition-shadow ${
              isPro
                ? "ring-2 ring-[#1a73e8] shadow-[0_1px_3px_0_rgba(60,64,67,.3),0_4px_8px_3px_rgba(60,64,67,.15)]"
                : "hover:shadow-[0_1px_3px_0_rgba(60,64,67,.3),0_4px_8px_3px_rgba(60,64,67,.15)]"
            }`}
          >
            {isPro && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#1a73e8] to-[#8ab4f8]" />
            )}
            {/* Popular badge */}
            {!isPro && (
              <div className="absolute top-4 right-4">
                <div className="inline-flex items-center gap-1 rounded-full bg-[#e8f0fe] px-3 py-1 text-[11px] font-medium text-[#1a73e8]">
                  <Sparkles className="h-3 w-3" />
                  Popular
                </div>
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-[18px] font-medium text-[#202124]">Pro</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-[36px] font-normal text-[#202124]">
                  $9.99
                </span>
                <span className="text-[14px] text-[#5f6368]">/month</span>
              </div>
            </div>

            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-2.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#e8f0fe]">
                  <Check className="h-3.5 w-3.5 text-[#1a73e8]" />
                </div>
                <p className="text-[14px] text-[#3c4043]">
                  Posts up to 100 characters
                </p>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#e8f0fe]">
                  <Check className="h-3.5 w-3.5 text-[#1a73e8]" />
                </div>
                <p className="text-[14px] text-[#3c4043]">
                  Pro badge beside your name
                </p>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#e8f0fe]">
                  <Check className="h-3.5 w-3.5 text-[#1a73e8]" />
                </div>
                <p className="text-[14px] text-[#3c4043]">Priority support</p>
              </div>
            </div>

            {isPro ? (
              <Button disabled className="w-full rounded-xl h-11">
                Current Plan
              </Button>
            ) : (
              <Button
                className="w-full rounded-xl h-11"
                onClick={handleUpgradeToPro}
                disabled={isRedirecting}
              >
                {isRedirecting ? "Redirecting to Stripe..." : "Pay $9.99"}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
