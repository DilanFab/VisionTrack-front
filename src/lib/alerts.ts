import Swal from "sweetalert2";

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
    confirmButtonColor: "#d33",
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