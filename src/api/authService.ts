import api from "./axios";

export interface LoginResponse {
  token: string;
  usuario: {
    usuario_id: number;
    usuario_nombre: string;
    usuario_imagen: string;
    persona: {
      cedula: string;
      nombre: string;
      correo: string;
    };
    roles: string[];
  };
}

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const { data } = await api.post<LoginResponse>("/api/auth/login", { email, password });
  return data;
};

export interface RegisterPayload {
  tipo: "paciente" | "doctor";
  cedula: string;
  primer_nombre: string;
  segundo_nombre?: string;
  primer_apellido: string;
  segundo_apellido?: string;
  fecha_nacimiento: string;
  direccion: string;
  telefono: string;
  correo: string;
  genero_id: number;
  usuario_nombre: string;
  usuario_contrasena: string;
  usuario_imagen?: string;
  especialidad_medica_id?: number;
}

export const register = async (payload: RegisterPayload): Promise<LoginResponse> => {
  const { data } = await api.post<LoginResponse>("/api/auth/register", payload);
  return data;
};
