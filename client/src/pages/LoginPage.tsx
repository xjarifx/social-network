import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: "" });
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!formData.email.includes("@")) {
      errors.email = "Please enter a valid email";
    }
    if (!formData.password) {
      errors.password = "Password is required";
    }
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateForm();

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      clearError();
      await login(formData.email, formData.password);
      navigate("/");
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 py-10">
      <div className="w-full max-w-[400px]">
        <div className="rounded-lg border border-[#dadce0] bg-white px-10 py-12">
          {/* Logo */}
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-[#1a73e8]">
              <span className="text-[16px] font-bold text-white">S</span>
            </div>
            <h1 className="text-[24px] font-normal text-[#202124]">Sign in</h1>
            <p className="mt-1 text-[14px] text-[#5f6368]">
              Use your Social Network account
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-[#ea4335]/30 bg-[#fce8e6] px-4 py-3 text-[13px] text-[#c5221f]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1 block text-[12px] font-medium text-[#5f6368]">
                Email address
              </label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className={fieldErrors.email ? "border-[#ea4335]" : ""}
              />
              {fieldErrors.email && (
                <p className="mt-1 text-[12px] text-[#ea4335]">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-[12px] font-medium text-[#5f6368]">
                Password
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className={fieldErrors.password ? "border-[#ea4335]" : ""}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5f6368] hover:text-[#202124] cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="mt-1 text-[12px] text-[#ea4335]">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <Link
                to="/register"
                className="text-[14px] font-medium text-[#1a73e8] hover:underline"
              >
                Create account
              </Link>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </div>
          </form>
        </div>

        <p className="mt-6 text-center text-[11px] text-[#80868b]">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
