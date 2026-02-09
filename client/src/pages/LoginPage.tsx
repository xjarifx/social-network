import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import Lottie from "lottie-react";
import earthAnimation from "../../assets/Earth globe rotating with Seamless loop animation.json";

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
    <div className="flex min-h-screen bg-white">
      {/* Left Panel — Brand / Illustration */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[560px] shrink-0 flex-col items-center justify-center bg-[#e8f0fe] px-12">
        <div className="max-w-[340px] text-center">
          <div className="mx-auto mb-6 h-20 w-20">
            <Lottie
              animationData={earthAnimation}
              loop={true}
              autoplay={true}
            />
          </div>
          <h2 className="text-[28px] font-normal text-[#202124]">
            Welcome to Social Network
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-[#5f6368]">
            Connect with friends, share your thoughts, and discover what's
            happening in the world.
          </p>
          <div className="mt-10 flex flex-col gap-4">
            <div className="flex items-center gap-3 rounded-2xl bg-white/70 px-4 py-3 text-left">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1a73e8]/10 text-[#1a73e8]">
                <ArrowRight className="h-5 w-5" />
              </div>
              <p className="text-[13px] text-[#3c4043]">
                Share your ideas with a growing community
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-white/70 px-4 py-3 text-left">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1a73e8]/10 text-[#1a73e8]">
                <ArrowRight className="h-5 w-5" />
              </div>
              <p className="text-[13px] text-[#3c4043]">
                Follow people and stay up to date
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-[400px]">
          {/* Mobile logo */}
          <div className="mb-8 text-center lg:hidden">
            <div className="mx-auto mb-4 h-14 w-14">
              <Lottie
                animationData={earthAnimation}
                loop={true}
                autoplay={true}
              />
            </div>
          </div>

          <h1 className="text-[28px] font-normal text-[#202124]">Sign in</h1>
          <p className="mt-2 text-[15px] text-[#5f6368]">
            Use your Social Network account
          </p>

          {error && (
            <div className="mt-6 rounded-xl border border-[#ea4335]/30 bg-[#fce8e6] px-4 py-3 text-[13px] text-[#c5221f]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-[#5f6368]">
                Email address
              </label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className={`h-12 rounded-xl ${fieldErrors.email ? "border-[#ea4335]" : ""}`}
              />
              {fieldErrors.email && (
                <p className="mt-1 text-[12px] text-[#ea4335]">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-[#5f6368]">
                Password
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className={`h-12 rounded-xl ${fieldErrors.password ? "border-[#ea4335]" : ""}`}
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

            <div className="flex items-center justify-between pt-4">
              <Link
                to="/register"
                className="text-[14px] font-medium text-[#1a73e8] hover:underline"
              >
                Create account
              </Link>
              <Button
                type="submit"
                disabled={isLoading}
                className="h-11 px-8 rounded-xl"
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </div>
          </form>

          <p className="mt-10 text-[11px] text-[#80868b]">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
