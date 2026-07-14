import { createContext, useContext, useState, useEffect } from "react";


import api from "../services/api";
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await api.get("/auth/me");
        setUser(res.data.user);
        setIsLoggedIn(true);
      } catch (error) {
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          setUser(null);
          setIsLoggedIn(false);
        }
        // لو خطأ شبكي، اسيب التوكن
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      setUser(res.data.user);
      setIsLoggedIn(true);
      return res.data;
    } catch (error) {
      localStorage.removeItem("token");
      setUser(null);
      setIsLoggedIn(false);
      throw error;
    }
  };

  const register = async (formData) => {
    try {
      const res = await api.post("/auth/register", formData);
      localStorage.setItem("token", res.data.token);
      setUser(res.data.user);
      setIsLoggedIn(true);
      return res.data;
    } catch (error) {
      localStorage.removeItem("token");
      setUser(null);
      setIsLoggedIn(false);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, isLoading, login, register, logout }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
