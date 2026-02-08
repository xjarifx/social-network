import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { billingAPI } from "../services/api";
import type { BillingStatus } from "../services/api";

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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="min-h-screen bg-neutral-bg"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="card p-6">
          <h1 className="text-brand text-xl font-bold mb-4">Billing</h1>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="text-muted">Loading billing status...</div>
          ) : status ? (
            <div className="space-y-4">
              <div className="text-sm text-muted">
                Plan:{" "}
                <span className="text-brand font-semibold">{status.plan}</span>
              </div>
              <div className="text-sm text-muted">
                Status: {status.planStatus || "N/A"}
              </div>
              <div className="text-sm text-muted">
                Started:{" "}
                {status.planStartedAt
                  ? new Date(status.planStartedAt).toLocaleDateString()
                  : "N/A"}
              </div>
              <div className="text-sm text-muted">
                Current period ends:{" "}
                {status.stripeCurrentPeriodEndAt
                  ? new Date(
                      status.stripeCurrentPeriodEndAt,
                    ).toLocaleDateString()
                  : "N/A"}
              </div>

              {status.plan === "FREE" && (
                <button
                  className="btn-primary px-5 py-2"
                  onClick={handleUpgrade}
                  disabled={isCheckoutLoading}
                >
                  {isCheckoutLoading ? "Redirecting..." : "Upgrade to Pro"}
                </button>
              )}
            </div>
          ) : (
            <div className="text-muted">No billing data available.</div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
