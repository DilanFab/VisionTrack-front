import api from "../axios";
import type { Genero } from "../../types/usuarios/Genero";

const BASE_URL = "/api/generos";

export const getGeneros = async (): Promise<Genero[]> => {
  const { data } = await api.get<Genero[]>(BASE_URL);
  return data;
};

export const createGenero = async (
  payload: Omit<Genero, "genero_id">
): Promise<Genero> => {
  const { data } = await api.post<Genero>(BASE_URL, payload);
  return data;
};

export const updateGenero = async (
  id: number,
  payload: Omit<Genero, "genero_id">
): Promise<Genero> => {
  const { data } = await api.put<Genero>(`${BASE_URL}/${id}`, payload);
  return data;
};

export const deleteGenero = async (id: number): Promise<void> => {
  await api.delete(`${BASE_URL}/${id}`);
};