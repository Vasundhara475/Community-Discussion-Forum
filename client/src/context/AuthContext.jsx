// client/src/context/AuthContext.jsx

/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from "react";

import axios from "axios";

// Create Context
const AuthContext = createContext();

// API Base URL
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
});

// Attach token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check login on refresh
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setLoading(false);
          return;
        }

        const res = await api.get("/auth/me");

        if (res.data.success) {
          setUser(res.data.user);
        }
      } catch (err) {
        console.log("Auth check failed", err);

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login
  const login = (token, userData) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));

    setUser(userData);
  };

  // Logout
  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom Hook
export const useAuth = () => {
  return useContext(AuthContext);
};
