import { SignInFormData, SignUpFormData, AuthResponse } from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

class AuthService {
  async signIn(data: SignInFormData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/api/auth/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: result.message || "Sign in failed",
        };
      }

      return {
        success: true,
        user: result.user,
        token: result.token,
      };
    } catch (error) {
      console.error("Sign in error:", error);
      return {
        success: false,
        message: "Network error. Please try again.",
      };
    }
  }

  async signUp(data: SignUpFormData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          name: data.name,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: result.message || "Sign up failed",
        };
      }

      return {
        success: true,
        user: result.user,
        token: result.token,
      };
    } catch (error) {
      console.error("Sign up error:", error);
      return {
        success: false,
        message: "Network error. Please try again.",
      };
    }
  }

  async signOut(): Promise<void> {
    try {
      const token = localStorage.getItem("authToken");

      if (token) {
        await fetch(`${API_URL}/api/auth/signout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error("Sign out error:", error);
    } finally {
      localStorage.removeItem("authToken");
    }
  }

  getToken(): string | null {
    return localStorage.getItem("authToken");
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const authService = new AuthService();
