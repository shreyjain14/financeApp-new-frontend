"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { User, AuthTokens } from "../types/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface AuthContextType {
  user: User | null;
  tokens: AuthTokens | null;
  login: (email: string, password: string) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function parseJwt(token: string) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch (e) {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored tokens
    const storedTokens = localStorage.getItem("auth_tokens");
    if (storedTokens) {
      try {
        const parsedTokens: AuthTokens = JSON.parse(storedTokens);
        setTokens(parsedTokens);
        const payload = parseJwt(parsedTokens.accessToken);
        if (payload) {
          setUser({
            id: payload.sub || "unknown",
            email: payload.email || "unknown",
            username: payload.username || payload.email || "unknown",
            role: payload.role || "user",
            verified: true,
          });
        }
      } catch (error) {
        console.error("Error parsing stored tokens:", error);
        localStorage.removeItem("auth_tokens");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      if (!response.ok) throw new Error("Login failed");

      const tokens: AuthTokens = await response.json();
      localStorage.setItem("auth_tokens", JSON.stringify(tokens));
      setTokens(tokens);

      const payload = parseJwt(tokens.accessToken);
      if (payload) {
        setUser({
          id: payload.sub || "unknown",
          email: payload.email || "unknown",
          username: payload.username || payload.email || "unknown",
          role: payload.role || "user",
          verified: true,
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) throw new Error("Registration failed");

      const userData: User = await response.json();
      // After registration, log the user in
      await login(credentials.email, credentials.password);
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Clear tokens from localStorage
      localStorage.removeItem("auth_tokens");
      // Clear user and tokens from state
      setUser(null);
      setTokens(null);
      // You might want to make an API call to invalidate the token on the server
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, tokens, login, register, logout, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
