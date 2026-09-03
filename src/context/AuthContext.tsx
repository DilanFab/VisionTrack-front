import React, { useEffect, useState } from "react";
import * as authService from "../api/authService";
import { AUTH_SESSION_EXPIRED_EVENT } from "../api/axios";
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
    clearStoredAuth();
    return { token: null, user: null };
  }

  try {
    const parsedUser = JSON.parse(savedUser) as User;
    if (!parsedUser || typeof parsedUser !== "object" || !Array.isArray(parsedUser.roles) || parsedUser.roles.length === 0) {
      console.warn("Sesión inválida o sin roles reconocidos en el almacenamiento local. Limpiando datos...");
      clearStoredAuth();
      return { token: null, user: null };
    }
    return { token: savedToken, user: parsedUser };
  } catch (error: unknown) {
    console.error("Error al leer los datos de autenticación guardados:", error);
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

  useEffect(() => {
    const handleSessionExpired = () => {
      setToken(null);
      setUser(null);
      clearStoredAuth();
    };

    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, handleSessionExpired);
    return () => {
      window.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, handleSessionExpired);
    };
  }, []);

  const logout = () => {
    setToken(null);
    setUser(null);
    clearStoredAuth();
  };

  const isAuthenticated = !!token;

  const hasRole = (roleName: string) => {
    return user && Array.isArray(user.roles) ? user.roles.includes(roleName) : false;
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

export { useAuth } from "./useAuth";
