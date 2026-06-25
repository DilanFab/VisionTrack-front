import React, { createContext, useContext, useState, useEffect } from "react";
import * as authService from "../api/authService";

interface User {
  usuario_id: number;
  usuario_nombre: string;
  usuario_imagen: string;
  persona: {
    cedula: string;
    nombre: string;
    correo: string;
  };
  roles: string[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: authService.RegisterPayload) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (roleName: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if token and user exist in localStorage
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (savedToken && savedUser) {
      setToken(savedToken);
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Error parsing saved user details:", e);
        // Clear corrupt storage
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login(email, password);
      setToken(response.token);
      setUser(response.usuario);
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.usuario));
    } catch (error: any) {
      // Clear credentials on failure
      setToken(null);
      setUser(null);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      throw error;
    }
  };

  const register = async (payload: authService.RegisterPayload) => {
    try {
      const response = await authService.register(payload);
      setToken(response.token);
      setUser(response.usuario);
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.usuario));
    } catch (error: any) {
      setToken(null);
      setUser(null);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
