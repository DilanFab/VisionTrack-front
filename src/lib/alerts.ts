import Swal from "sweetalert2";

const colorToken = (name: string, fallback: string) => {
  if (typeof window === "undefined") return fallback;
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
};

export interface ConfirmarOpciones {
  titulo?: string;
  texto?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  confirmButtonColor?: string;
  cancelButtonColor?: string;
  icon?: "warning" | "question" | "info" | "error" | "success";
}

export const confirmarAccion = async ({
  titulo = "¿Estás seguro?",
  texto = "Esta acción requiere confirmación.",
  confirmButtonText = "Sí, confirmar",
  cancelButtonText = "Cancelar",
  confirmButtonColor,
  cancelButtonColor,
  icon = "question",
}: ConfirmarOpciones = {}): Promise<boolean> => {
  const resultado = await Swal.fire({
    title: titulo,
    text: texto,
    icon,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    confirmButtonColor: confirmButtonColor || colorToken("--primary", "#0f5d73"),
    cancelButtonColor: cancelButtonColor || colorToken("--outline", "#6f858b"),
  });
  return resultado.isConfirmed;
};

export const confirmarEliminacion = async (
  texto = "Esta acción no se puede revertir."
): Promise<boolean> => {
  return confirmarAccion({
    titulo: "¿Estás seguro?",
    texto,
    icon: "warning",
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: colorToken("--error", "#ba1a1a"),
    cancelButtonColor: colorToken("--outline", "#6f858b"),
  });
};

const toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (el) => {
    el.onmouseenter = Swal.stopTimer;
    el.onmouseleave = Swal.resumeTimer;
  },
});

export const mostrarExito = (mensaje: string) => {
  toast.fire({ icon: "success", title: mensaje });
};

export const mostrarError = (mensaje: string) => {
  toast.fire({ icon: "error", title: mensaje });
};