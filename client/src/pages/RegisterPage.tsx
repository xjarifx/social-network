import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [passwordStrength, setPasswordStrength] = useState(0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: "" });
    }

    if (name === "password") {
      let strength = 0;
      if (value.length >= 8) strength++;
      if (/[A-Z]/.test(value)) strength++;
      if (/[a-z]/.test(value)) strength++;
      if (/[0-9]/.test(value)) strength++;
      if (/[^A-Za-z0-9]/.test(value)) strength++;
      setPasswordStrength(strength);
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.username || formData.username.length < 2) {
      errors.username = "Username must be at least 2 characters";
    }
    if (!formData.email || !formData.email.includes("@")) {
      errors.email = "Please enter a valid email";
    }
    if (!formData.firstName) {
      errors.firstName = "First name is required";
    }
    if (!formData.lastName) {
      errors.lastName = "Last name is required";
    }
    if (!formData.password || formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }
    if (!/[A-Z]/.test(formData.password)) {
      errors.password = "Password must contain an uppercase letter";
    }
    if (!/[0-9]/.test(formData.password)) {
      errors.password = "Password must contain a number";
    }
    if (!/[^A-Za-z0-9]/.test(formData.password)) {
      errors.password = "Password must contain a special character";
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
      await register(formData);
      navigate("/");
    } catch (err) {
      console.error("Registration failed:", err);
    }
  };

  const strengthColor: Record<number, string> = {
    0: "bg-[#dadce0]",
    1: "bg-[#ea4335]",
    2: "bg-[#fa7b17]",
    3: "bg-[#f9ab00]",
    4: "bg-[#34a853]",
    5: "bg-[#188038]",
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 py-10">
      <div className="w-full max-w-[440px]">
        <div className="rounded-lg border border-[#dadce0] bg-white px-10 py-10">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-[#1a73e8]">
              <span className="text-[16px] font-bold text-white">S</span>
            </div>
            <h1 className="text-[24px] font-normal text-[#202124]">
              Create your account
            </h1>
            <p className="mt-1 text-[14px] text-[#5f6368]">
              Join the Social Network
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-[#ea4335]/30 bg-[#fce8e6] px-4 py-3 text-[13px] text-[#c5221f]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-[12px] font-medium text-[#5f6368]">
                Username
              </label>
              <Input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="johndoe"
                className={fieldErrors.username ? "border-[#ea4335]" : ""}
              />
              {fieldErrors.username && (
                <p className="mt-1 text-[12px] text-[#ea4335]">
                  {fieldErrors.username}
                </p>
              )}
            </div>

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

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-[12px] font-medium text-[#5f6368]">
                  First name
                </label>
                <Input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="John"
                  className={fieldErrors.firstName ? "border-[#ea4335]" : ""}
                />
                {fieldErrors.firstName && (
                  <p className="mt-1 text-[12px] text-[#ea4335]">
                    {fieldErrors.firstName}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-[12px] font-medium text-[#5f6368]">
                  Last name
                </label>
                <Input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Doe"
                  className={fieldErrors.lastName ? "border-[#ea4335]" : ""}
                />
                {fieldErrors.lastName && (
                  <p className="mt-1 text-[12px] text-[#ea4335]">
                    {fieldErrors.lastName}
                  </p>
                )}
              </div>
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
                  placeholder="Create a password"
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

              {formData.password && (
                <div className="mt-2 flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <div
                      key={s}
                      className={`h-1 flex-1 rounded-full transition-all ${
                        s <= passwordStrength
                          ? strengthColor[s]
                          : "bg-[#e8eaed]"
                      }`}
                    />
                  ))}
                </div>
              )}

              {fieldErrors.password && (
                <p className="mt-1 text-[12px] text-[#ea4335]">
                  {fieldErrors.password}
                </p>
              )}
              <p className="mt-1 text-[11px] text-[#80868b]">
                Must be 8+ characters with uppercase, number, and special
                character
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Link
                to="/login"
                className="text-[14px] font-medium text-[#1a73e8] hover:underline"
              >
                Sign in instead
              </Link>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create account"}
              </Button>
            </div>
          </form>
        </div>

        <p className="mt-6 text-center text-[11px] text-[#80868b]">
          By creating an account, you agree to our Terms of Service and Privacy
          Policy
        </p>
      </div>
    </div>
  );
}
