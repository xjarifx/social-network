import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { billingAPI } from "../services/api";
import { Button } from "../components/ui/button";
import { Check } from "lucide-react";
import { useAuth } from "../context/auth-context";

export default function BillingSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshUserProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [plan, setPlan] = useState<string>("FREE");
  const hasRunRef = useRef(false);

  useEffect(() => {
    // Prevent running multiple times in strict mode
    if (hasRunRef.current) return;
    hasRunRef.current = true;

    const checkPayment = async () => {
      try {
        setIsLoading(true);
        const sessionId = searchParams.get("session_id");
        const piId = searchParams.get("payment_intent_id");

        console.log("\n" + "=".repeat(60));
        console.log("🔄 BillingSuccessPage: Checking payment");
        console.log("=".repeat(60));
        console.log("URL Parameters:");
        console.log("  session_id:", sessionId);
        console.log("  payment_intent_id:", piId);

        if (!sessionId && !piId) {
          throw new Error("Missing payment information");
        }

        // Check payment status with Stripe
        console.log("\n📞 Calling confirmPayment API...");
        const result = await billingAPI.confirmPayment(
          sessionId || undefined,
          piId || undefined,
        );

        console.log("\n✅ confirmPayment Response:");
        console.log("  paymentStatus:", result.paymentStatus);
        console.log("  amount:", result.amount);
        console.log("  currency:", result.currency);
        console.log("  plan:", result.plan);

        setPaymentStatus(result.paymentStatus);
        setPlan(result.plan);

        // If webhook hasn't processed yet, poll a few times
        if (
          (result.paymentStatus === "succeeded" ||
            result.paymentStatus === "paid") &&
          result.plan !== "PRO"
        ) {
          console.log(
            "\n⏳ Payment succeeded but plan not updated. Polling for webhook...",
          );
          for (let i = 0; i < 5; i++) {
            console.log(`  Poll ${i + 1}/5...`);
            await new Promise((r) => setTimeout(r, 1500));
            const retry = await billingAPI.confirmPayment(
              sessionId || undefined,
              piId || undefined,
            );
            console.log(
              `    Response - plan: ${retry.plan}, status: ${retry.paymentStatus}`,
            );
            setPlan(retry.plan);
            if (retry.plan === "PRO") {
              console.log("  ✅ Plan updated to PRO!");
              break;
            }
          }
        }

        // Refresh user profile once after checking payment
        console.log("\n🔄 Refreshing user profile...");
        await refreshUserProfile();
        console.log("✅ User profile refreshed after payment");

        console.log("=".repeat(60) + "\n");
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to confirm payment";
        console.error("❌ Payment confirmation error:", err);
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    checkPayment();
  }, []); // Empty dependency array - run only once

  if (isLoading) {
    return (
      <div className="space-y-6 min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-[15px] text-[#5f6368]">
            Confirming your payment...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-8 text-center">
        {error ? (
          <>
            <div className="mb-4 flex justify-center">
              <div className="h-16 w-16 rounded-full bg-[#fce8e6] flex items-center justify-center">
                <span className="text-2xl">⚠️</span>
              </div>
            </div>
            <h1 className="text-[24px] font-medium text-[#202124] mb-2">
              Payment Error
            </h1>
            <p className="text-[15px] text-[#5f6368] mb-6">{error}</p>
            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => navigate("/billing")}
                className="rounded-xl h-11"
              >
                Back to Billing
              </Button>
            </div>
          </>
        ) : paymentStatus === "succeeded" || paymentStatus === "paid" ? (
          <>
            <div className="mb-4 flex justify-center">
              <div className="h-16 w-16 rounded-full bg-[#e6f4ea] flex items-center justify-center">
                <Check className="h-8 w-8 text-[#0d9488]" />
              </div>
            </div>
            <h1 className="text-[24px] font-medium text-[#202124] mb-2">
              {plan === "PRO" ? "Welcome to Pro!" : "Payment Received!"}
            </h1>
            <p className="text-[15px] text-[#5f6368] mb-6">
              {plan === "PRO"
                ? "Your subscription is now active. Enjoy all the premium features!"
                : "Your payment was successful. Your account will be upgraded shortly."}
            </p>
            <Button
              onClick={() => navigate("/billing")}
              className="rounded-xl h-11"
            >
              View Billing Details
            </Button>
          </>
        ) : (
          <>
            <div className="mb-4 flex justify-center">
              <div className="h-16 w-16 rounded-full bg-[#fce8e6] flex items-center justify-center">
                <span className="text-2xl">⚠️</span>
              </div>
            </div>
            <h1 className="text-[24px] font-medium text-[#202124] mb-2">
              Payment Incomplete
            </h1>
            <p className="text-[15px] text-[#5f6368] mb-6">
              Your payment could not be completed. Please try again.
            </p>
            <Button
              onClick={() => navigate("/billing")}
              className="rounded-xl h-11"
            >
              Try Again
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
