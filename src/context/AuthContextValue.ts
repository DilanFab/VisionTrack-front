import { createContext } from "react";
import type * as authService from "../api/authService";

export interface User {
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

export interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: authService.RegisterPayload) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (roleName: string) => boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
