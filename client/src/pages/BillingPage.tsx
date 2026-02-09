import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { billingAPI } from "../services/api";
import type { BillingStatus } from "../services/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="min-h-screen"
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-semibold mb-2 text-center">
          Choose Your Plan
        </h1>
        <p className="text-muted-foreground text-center mb-8">
          Select the plan that works best for you
        </p>

        {error && (
          <div className="mb-6 rounded-2xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive max-w-2xl mx-auto">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="text-muted text-center">Loading plans...</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            <Card className={isPro ? "opacity-70" : "ring-2 ring-primary/40"}>
              <CardHeader>
                <CardTitle>Free</CardTitle>
                <p className="text-3xl font-semibold">$0</p>
                <p className="text-sm text-muted-foreground">Forever free</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Posts up to 20 characters
                </div>
                <Button
                  variant="secondary"
                  disabled={!isPro}
                  className="w-full"
                >
                  {!isPro ? "Your Current Plan" : "Downgrade"}
                </Button>
              </CardContent>
            </Card>

            <Card className={isPro ? "ring-2 ring-primary/40" : ""}>
              <CardHeader>
                <CardTitle>Pro</CardTitle>
                <p className="text-3xl font-semibold">$9.99</p>
                <p className="text-sm text-muted-foreground">per month</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Posts up to 100 characters
                </div>
                <div className="text-sm text-muted-foreground">
                  Pro badge beside your name
                </div>
                <Button
                  className="w-full"
                  onClick={handleUpgrade}
                  disabled={isPro || isCheckoutLoading}
                >
                  {isPro
                    ? "Your Current Plan"
                    : isCheckoutLoading
                      ? "Redirecting..."
                      : "Upgrade to Pro"}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </motion.div>
  );
}
