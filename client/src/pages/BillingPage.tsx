import { useEffect, useState } from "react";
import { billingAPI } from "../services/api";
import type { BillingStatus } from "../services/api";
import { Button } from "../components/ui/button";

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
    <div className="py-4">
      <div className="text-center mb-6">
        <h1 className="text-[22px] font-normal text-[#202124]">
          Choose Your Plan
        </h1>
        <p className="mt-1 text-[14px] text-[#5f6368]">
          Select the plan that works best for you
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-[#ea4335]/30 bg-[#fce8e6] px-4 py-3 text-[13px] text-[#c5221f]">
          {error}
        </div>
      )}

      {isLoading ? (
        <p className="text-center text-[13px] text-[#5f6368]">
          Loading plans...
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <div
            className={`rounded-lg border bg-white p-6 ${
              !isPro
                ? "border-[#1a73e8] ring-1 ring-[#1a73e8]"
                : "border-[#dadce0]"
            }`}
          >
            <h3 className="text-[16px] font-medium text-[#202124]">Free</h3>
            <p className="mt-1 text-[28px] font-normal text-[#202124]">$0</p>
            <p className="text-[13px] text-[#5f6368]">Forever free</p>
            <div className="mt-4 space-y-2">
              <p className="text-[13px] text-[#5f6368]">
                Posts up to 20 characters
              </p>
            </div>
            <Button
              variant="secondary"
              disabled={!isPro}
              className="mt-6 w-full"
            >
              {!isPro ? "Current Plan" : "Downgrade"}
            </Button>
          </div>

          <div
            className={`rounded-lg border bg-white p-6 ${
              isPro
                ? "border-[#1a73e8] ring-1 ring-[#1a73e8]"
                : "border-[#dadce0]"
            }`}
          >
            <h3 className="text-[16px] font-medium text-[#202124]">Pro</h3>
            <p className="mt-1 text-[28px] font-normal text-[#202124]">$9.99</p>
            <p className="text-[13px] text-[#5f6368]">per month</p>
            <div className="mt-4 space-y-2">
              <p className="text-[13px] text-[#5f6368]">
                Posts up to 100 characters
              </p>
              <p className="text-[13px] text-[#5f6368]">
                Pro badge beside your name
              </p>
            </div>
            <Button
              className="mt-6 w-full"
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
