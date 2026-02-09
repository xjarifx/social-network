import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
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
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center mb-8"
        >
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <span className="text-lg font-bold">S</span>
          </div>
          <h1 className="text-2xl font-semibold text-hero">Social Network</h1>
          <p className="text-sm text-muted-foreground">
            Start building your space
          </p>
        </motion.div>

        <motion.div variants={containerVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Create account</CardTitle>
              <CardDescription>Join the community in minutes</CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 flex gap-3 rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
                >
                  <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
                  <p>{error}</p>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Username</label>
                  <Input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="johndoe"
                    className={fieldErrors.username ? "border-destructive" : ""}
                  />
                  {fieldErrors.username && (
                    <p className="mt-1 text-xs text-destructive">
                      {fieldErrors.username}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium">Email address</label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className={fieldErrors.email ? "border-destructive" : ""}
                  />
                  {fieldErrors.email && (
                    <p className="mt-1 text-xs text-destructive">
                      {fieldErrors.email}
                    </p>
                  )}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">First name</label>
                    <Input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="John"
                      className={
                        fieldErrors.firstName ? "border-destructive" : ""
                      }
                    />
                    {fieldErrors.firstName && (
                      <p className="mt-1 text-xs text-destructive">
                        {fieldErrors.firstName}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium">Last name</label>
                    <Input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Doe"
                      className={
                        fieldErrors.lastName ? "border-destructive" : ""
                      }
                    />
                    {fieldErrors.lastName && (
                      <p className="mt-1 text-xs text-destructive">
                        {fieldErrors.lastName}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Password</label>
                  <div className="relative mb-2">
                    <Input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className={
                        fieldErrors.password ? "border-destructive" : ""
                      }
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {formData.password && (
                    <div className="mb-2 flex gap-1">
                      {[1, 2, 3, 4, 5].map((strength) => (
                        <div
                          key={strength}
                          className={`h-1 flex-1 rounded-full transition-all ${
                            strength <= passwordStrength
                              ? strengthColor[
                                  strength as keyof typeof strengthColor
                                ]
                              : "bg-muted"
                          }`}
                        />
                      ))}
                    </div>
                  )}

                  {fieldErrors.password && (
                    <p className="mt-1 text-xs text-destructive">
                      {fieldErrors.password}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Must be 8+ characters with uppercase, number, and special
                    character
                  </p>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Create account"}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-medium text-primary hover:underline"
                >
                  Sign in
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          By creating an account, you agree to our Terms of Service and Privacy
          Policy
        </p>
      </motion.div>
    </div>
  );
}
