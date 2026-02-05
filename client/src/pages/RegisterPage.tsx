import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { Eye, EyeOff, AlertCircle } from "lucide-react";

export function RegisterPage() {
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

    // Password strength calculation
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

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  const strengthColor = {
    0: "bg-neutral-200",
    1: "bg-red-500",
    2: "bg-orange-500",
    3: "bg-yellow-500",
    4: "bg-lime-500",
    5: "bg-green-500",
  };

  return (
    <div className="min-h-screen bg-neutral-bg flex items-center justify-center px-4 py-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center mb-8"
        >
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <h1 className="text-brand text-2xl font-bold">Social Network</h1>
        </motion.div>

        {/* Card */}
        <motion.div variants={containerVariants} className="card p-8">
          <h2 className="text-brand text-xl font-bold mb-2">Get started</h2>
          <p className="text-muted text-sm mb-6">
            Create an account to join our community
          </p>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6 flex gap-3"
            >
              <AlertCircle
                size={18}
                className="text-red-600 flex-shrink-0 mt-0.5"
              />
              <p className="text-red-700 text-sm">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            {/* Username */}
            <div>
              <label className="text-brand text-sm font-medium block mb-2">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="johndoe"
                className={`input ${fieldErrors.username ? "border-red-500" : ""}`}
              />
              {fieldErrors.username && (
                <p className="text-red-600 text-xs mt-1">
                  {fieldErrors.username}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="text-brand text-sm font-medium block mb-2">
                Email address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className={`input ${fieldErrors.email ? "border-red-500" : ""}`}
              />
              {fieldErrors.email && (
                <p className="text-red-600 text-xs mt-1">{fieldErrors.email}</p>
              )}
            </div>

            {/* First & Last Name */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-brand text-sm font-medium block mb-2">
                  First name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="John"
                  className={`input ${
                    fieldErrors.firstName ? "border-red-500" : ""
                  }`}
                />
                {fieldErrors.firstName && (
                  <p className="text-red-600 text-xs mt-1">
                    {fieldErrors.firstName}
                  </p>
                )}
              </div>
              <div>
                <label className="text-brand text-sm font-medium block mb-2">
                  Last name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Doe"
                  className={`input ${
                    fieldErrors.lastName ? "border-red-500" : ""
                  }`}
                />
                {fieldErrors.lastName && (
                  <p className="text-red-600 text-xs mt-1">
                    {fieldErrors.lastName}
                  </p>
                )}
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-brand text-sm font-medium block mb-2">
                Password
              </label>
              <div className="relative mb-2">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`input pr-10 ${
                    fieldErrors.password ? "border-red-500" : ""
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Password strength */}
              {formData.password && (
                <div className="flex gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((strength) => (
                    <div
                      key={strength}
                      className={`flex-1 h-1 rounded-full transition-all ${
                        strength <= passwordStrength
                          ? strengthColor[
                              strength as keyof typeof strengthColor
                            ]
                          : "bg-neutral-200"
                      }`}
                    />
                  ))}
                </div>
              )}

              {fieldErrors.password && (
                <p className="text-red-600 text-xs mt-1">
                  {fieldErrors.password}
                </p>
              )}
              <p className="text-muted text-xs">
                Must be 8+ characters with uppercase, number, and special
                character
              </p>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-2 mt-6"
            >
              {isLoading ? "Creating account..." : "Create account"}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-neutral-500">
                Already have an account?
              </span>
            </div>
          </div>

          {/* Sign in link */}
          <Link
            to="/login"
            className="block text-center text-accent-600 hover:text-accent-700 font-medium text-sm transition-colors"
          >
            Sign in instead
          </Link>
        </motion.div>

        {/* Footer */}
        <p className="text-center text-muted text-xs mt-6">
          By creating an account, you agree to our Terms of Service and Privacy
          Policy
        </p>
      </motion.div>
    </div>
  );
}
