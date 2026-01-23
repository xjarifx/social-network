import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "../components/layout";
import { Input, Button } from "../components/ui";
import { SignUpFormData } from "../types";
import { authService } from "../services/authService";

export function SignUpPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<SignUpFormData>({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
  });
  const [errors, setErrors] = useState<Partial<SignUpFormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const validateForm = (): boolean => {
    const newErrors: Partial<SignUpFormData> = {};

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

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
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
      const response = await authService.signUp(formData);

      if (response.success) {
        // Store token if provided
        if (response.token) {
          localStorage.setItem("authToken", response.token);
        }

        // Navigate to home or dashboard
        navigate("/");
      } else {
        setServerError(response.message || "Sign up failed. Please try again.");
      }
    } catch (error) {
      setServerError("An error occurred. Please try again later.");
      console.error("Sign up error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Join the network"
      subtitle="Create your profile and discover new connections."
    >
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-sand/60">
          Create account
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-sand">
          Get started today
        </h2>
        <p className="mt-2 text-sm text-sand/70">
          Sign up to start connecting with others.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          {serverError && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-400">
              {serverError}
            </div>
          )}

          <Input
            type="text"
            label="Name (Optional)"
            placeholder="Your name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            autoComplete="name"
          />

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
            autoComplete="new-password"
            required
          />

          <Input
            type="password"
            label="Confirm Password"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={(e) =>
              setFormData({ ...formData, confirmPassword: e.target.value })
            }
            error={errors.confirmPassword}
            autoComplete="new-password"
            required
          />

          <Button type="submit" isLoading={isLoading}>
            Create account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-sand/70">
          Already have an account?{" "}
          <Link to="/signin" className="font-medium text-sand hover:underline">
            Sign in
          </Link>
        </p>

        <p className="mt-6 text-xs leading-relaxed text-sand/60">
          By creating an account, you agree to our Terms of Service and Privacy
          Policy. We'll keep your information secure and never share it without
          your permission.
        </p>
      </div>
    </AuthLayout>
  );
}
