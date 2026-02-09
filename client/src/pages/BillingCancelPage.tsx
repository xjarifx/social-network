import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { X } from "lucide-react";

export default function BillingCancelPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-8 text-center">
        <div className="mb-4 flex justify-center">
          <div className="h-16 w-16 rounded-full bg-[#fce8e6] flex items-center justify-center">
            <X className="h-8 w-8 text-[#d33b27]" />
          </div>
        </div>
        <h1 className="text-[24px] font-medium text-[#202124] mb-2">
          Checkout Cancelled
        </h1>
        <p className="text-[15px] text-[#5f6368] mb-6">
          Your checkout was cancelled. No charges have been made to your
          account.
        </p>
        <div className="flex gap-3 justify-center">
          <Button
            variant="secondary"
            onClick={() => navigate("/")}
            className="rounded-xl h-11"
          >
            Back to Home
          </Button>
          <Button
            onClick={() => navigate("/billing")}
            className="rounded-xl h-11"
          >
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}
