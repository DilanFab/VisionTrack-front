// `usuario_imagen` del paciente se guarda como una ruta relativa dentro del
// propio `public/` del frontend (ej. "/pacientes/xxx.jpg"), así que se puede
// usar directamente como src sin anteponer la URL de la API.
export const resolvePacienteImagenUrl = (imagen: string | null | undefined): string | null => {
  if (!imagen || imagen === "default.png") return null;
  return imagen;
};
