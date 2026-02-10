import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { billingAPI } from "../services/api";
import { Button } from "../components/ui/button";
import { Check } from "lucide-react";

export default function BillingSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionSucceeded, setSessionSucceeded] = useState(false);

  useEffect(() => {
    const confirmPayment = async () => {
      try {
        setIsLoading(true);
        const sessionId = searchParams.get("session_id");

        if (!sessionId) {
          throw new Error("Missing session ID");
        }

        // Confirm the session on the backend; it syncs subscription status.
        await billingAPI.confirmCheckoutSuccess(sessionId);
        setSessionSucceeded(true);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to confirm payment";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    confirmPayment();
  }, [searchParams]);

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
        ) : sessionSucceeded ? (
          <>
            <div className="mb-4 flex justify-center">
              <div className="h-16 w-16 rounded-full bg-[#e6f4ea] flex items-center justify-center">
                <Check className="h-8 w-8 text-[#0d9488]" />
              </div>
            </div>
            <h1 className="text-[24px] font-medium text-[#202124] mb-2">
              Welcome to Pro!
            </h1>
            <p className="text-[15px] text-[#5f6368] mb-6">
              Your subscription is now active. Enjoy all the premium features!
            </p>
            <Button
              onClick={() => navigate("/billing")}
              className="rounded-xl h-11"
            >
              View Billing Details
            </Button>
          </>
        ) : null}
      </div>
    </div>
  );
}
