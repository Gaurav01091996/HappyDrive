import React, { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../utils/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileCompleted, setProfileCompleted] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("hd_token");
    const saved = localStorage.getItem("hd_user");
    if (token && saved) {
      try {
        const userData = JSON.parse(saved);
        setUser(userData);
        setProfileCompleted(userData.profile_completed || false);
      } catch (_) {}
    }
    setLoading(false);
  }, []);

  const signup = async (name, email, password, phone) => {
    const data = await authAPI.signup(name, email, password, phone);
    _save(data);
    return data;
  };

  const login = async (email, password) => {
    const data = await authAPI.login(email, password);
    _save(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("hd_token");
    localStorage.removeItem("hd_user");
    setUser(null);
    setProfileCompleted(false);
  };

  const updateProfileStatus = (isCompleted) => {
    setProfileCompleted(isCompleted);
    if (user) {
      const updatedUser = { ...user, profile_completed: isCompleted };
      setUser(updatedUser);
      localStorage.setItem("hd_user", JSON.stringify(updatedUser));
    }
  };

  const _save = ({ token, user }) => {
    localStorage.setItem("hd_token", token);
    localStorage.setItem("hd_user", JSON.stringify(user));
    setUser(user);
    setProfileCompleted(user.profile_completed || false);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, profileCompleted, signup, login, logout, updateProfileStatus }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
