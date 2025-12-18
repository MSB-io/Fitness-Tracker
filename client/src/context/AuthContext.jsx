"use client";

import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem("fittrack_token");
    if (token) {
      try {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const response = await api.get("/auth/me");
        setUser(response.data);
      } catch (err) {
        localStorage.removeItem("fittrack_token");
        delete api.defaults.headers.common["Authorization"];
      }
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await api.post("/auth/login", { email, password });
      const { token, ...userData } = response.data;

      localStorage.setItem("fittrack_token", token);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUser(userData);

      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || "Login failed";
      setError(message);
      return { success: false, error: message };
    }
  };

  const register = async (name, email, password, role = "user") => {
    try {
      setError(null);
      const response = await api.post("/auth/register", {
        name,
        email,
        password,
        role,
      });
      const { token, ...userData } = response.data;

      localStorage.setItem("fittrack_token", token);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUser(userData);

      return { success: true };
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        "Registration failed";
      setError(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem("fittrack_token");
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
  };

  const updateProfile = async (data) => {
    try {
      const response = await api.put("/auth/profile", data);
      setUser(response.data);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || "Update failed";
      return { success: false, error: message };
    }
  };

  const refreshUser = async () => {
    try {
      const response = await api.get("/auth/me");
      setUser(response.data);
      return { success: true };
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to refresh user data";
      return { success: false, error: message };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        updateProfile,
        refreshUser,
        isTrainer: user?.role === "trainer",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
