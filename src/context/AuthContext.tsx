import React, { useState } from "react";
import * as authService from "../api/authService";
import { AuthContext, type User } from "./AuthContextValue";

const clearStoredAuth = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
};

const readStoredAuth = (): { token: string | null; user: User | null } => {
  const savedToken = localStorage.getItem("token");
  const savedUser = localStorage.getItem("user");

  if (!savedToken || !savedUser) {
    return { token: null, user: null };
  }

  try {
    return { token: savedToken, user: JSON.parse(savedUser) as User };
  } catch (error: unknown) {
    console.error("Error parsing saved user details:", error);
    clearStoredAuth();
    return { token: null, user: null };
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [storedAuth] = useState(readStoredAuth);
  const [user, setUser] = useState<User | null>(() => storedAuth.user);
  const [token, setToken] = useState<string | null>(() => storedAuth.token);
  const loading = false;

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login(email, password);
      setToken(response.accessToken);
      setUser(response.usuario);
      localStorage.setItem("token", response.accessToken);
      localStorage.setItem("refreshToken", response.refreshToken);
      localStorage.setItem("user", JSON.stringify(response.usuario));
    } catch (error: unknown) {
      setToken(null);
      setUser(null);
      clearStoredAuth();
      throw error;
    }
  };

  const register = async (payload: authService.RegisterPayload) => {
    try {
      const response = await authService.register(payload);
      setToken(response.accessToken);
      setUser(response.usuario);
      localStorage.setItem("token", response.accessToken);
      localStorage.setItem("refreshToken", response.refreshToken);
      localStorage.setItem("user", JSON.stringify(response.usuario));
    } catch (error: unknown) {
      setToken(null);
      setUser(null);
      clearStoredAuth();
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    clearStoredAuth();
  };

  const isAuthenticated = !!token;

  const hasRole = (roleName: string) => {
    return user ? user.roles.includes(roleName) : false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
