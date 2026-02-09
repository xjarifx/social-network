import { useEffect, useState } from "react";
import { billingAPI } from "../services/api";
import type { BillingStatus } from "../services/api";
import { Button } from "../components/ui/button";
import { Check, Sparkles } from "lucide-react";

export default function BillingPage() {
  const [status, setStatus] = useState<BillingStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

  const loadStatus = async () => {
    try {
      setIsLoading(true);
      const response = await billingAPI.getStatus();
      setStatus(response);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load billing";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const handleUpgrade = async () => {
    try {
      setIsCheckoutLoading(true);
      const response = await billingAPI.createCheckoutSession();
      if (response.url) {
        window.location.href = response.url;
      }
    } catch (err) {
      console.error("Failed to start checkout:", err);
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  const currentPlan = status?.plan || "FREE";
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
        <div className="rounded-xl border border-[#ea4335]/30 bg-[#fce8e6] px-4 py-3 text-[13px] text-[#c5221f]">
          {error}
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
              disabled={!isPro}
              className="w-full rounded-xl h-11"
            >
              {!isPro ? "Current Plan" : "Downgrade"}
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

            <Button
              className="w-full rounded-xl h-11"
              onClick={handleUpgrade}
              disabled={isPro || isCheckoutLoading}
            >
              {isPro
                ? "Current Plan"
                : isCheckoutLoading
                  ? "Redirecting..."
                  : "Upgrade to Pro"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
