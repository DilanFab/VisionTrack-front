import Swal from "sweetalert2";

const colorToken = (name: string, fallback: string) => {
  if (typeof window === "undefined") return fallback;
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
};

export const confirmarEliminacion = async (
  texto = "Esta acción no se puede revertir."
): Promise<boolean> => {
  const resultado = await Swal.fire({
    title: "¿Estás seguro?",
    text: texto,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: colorToken("--error", "#ba1a1a"),
    cancelButtonColor: colorToken("--outline", "#6f858b"),
  });
  return resultado.isConfirmed;
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