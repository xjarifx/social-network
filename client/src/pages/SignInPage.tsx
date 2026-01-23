import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "../components/layout";
import { Input, Button } from "../components/ui";
import { SignInFormData } from "../types";
import { authService } from "../services/authService";

export function SignInPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<SignInFormData>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Partial<SignInFormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const validateForm = (): boolean => {
    const newErrors: Partial<SignInFormData> = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.signIn(formData);

      if (response.success) {
        // Store token if provided
        if (response.token) {
          localStorage.setItem("authToken", response.token);
        }

        // Navigate to home or dashboard
        navigate("/");
      } else {
        setServerError(response.message || "Sign in failed. Please try again.");
      }
    } catch (error) {
      setServerError("An error occurred. Please try again later.");
      console.error("Sign in error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Pick up where you left off and rejoin the conversation."
    >
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-sand/60">
          Sign in
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-sand">
          Access your account
        </h2>
        <p className="mt-2 text-sm text-sand/70">
          Enter your credentials to continue.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          {serverError && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-400">
              {serverError}
            </div>
          )}

          <Input
            type="email"
            label="Email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            error={errors.email}
            autoComplete="email"
            required
          />

          <Input
            type="password"
            label="Password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            error={errors.password}
            autoComplete="current-password"
            required
          />

          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-sm text-sand/70 hover:text-sand transition"
            >
              Forgot password?
            </Link>
          </div>

          <Button type="submit" isLoading={isLoading}>
            Sign in
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-sand/70">
          Don't have an account?{" "}
          <Link to="/signup" className="font-medium text-sand hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
