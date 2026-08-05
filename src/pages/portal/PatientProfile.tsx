import React from "react";
import { useAuth } from "../../context/useAuth";

const PatientProfile: React.FC = () => {
  const { user } = useAuth();

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs uppercase tracking-widest text-outline font-bold mb-2">Portal del paciente</p>
        <h2 className="text-3xl font-bold text-on-surface">Mi perfil</h2>
        <p className="text-on-surface-variant text-sm mt-1">Revisa los datos asociados a tu acceso y mantén tu información clínica identificable.</p>
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 vt-surface-card rounded-2xl p-6">
          <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold mb-4">
            {(user?.persona?.nombre || user?.usuario_nombre || "P").charAt(0).toUpperCase()}
          </div>
          <h3 className="text-xl font-bold text-on-surface">{user?.persona?.nombre}</h3>
          <p className="text-sm text-on-surface-variant mt-1">{user?.usuario_nombre}</p>
          <div className="flex flex-wrap gap-2 mt-4">
            {user?.roles.map((role) => (
              <span key={role} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
                {role}
              </span>
            ))}
          </div>
        </div>

        <div className="lg:col-span-8 vt-surface-card rounded-2xl p-6">
          <h3 className="text-lg font-bold text-on-surface mb-5">Información básica</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="rounded-xl bg-surface border border-outline-variant p-4">
              <p className="text-xs uppercase text-outline font-bold">Cédula</p>
              <p className="font-semibold text-on-surface mt-1">{user?.persona?.cedula || "No registrado"}</p>
            </div>
            <div className="rounded-xl bg-surface border border-outline-variant p-4">
              <p className="text-xs uppercase text-outline font-bold">Correo</p>
              <p className="font-semibold text-on-surface mt-1">{user?.persona?.correo || "No registrado"}</p>
            </div>
            <div className="rounded-xl bg-surface border border-outline-variant p-4">
              <p className="text-xs uppercase text-outline font-bold">Usuario</p>
              <p className="font-semibold text-on-surface mt-1">{user?.usuario_nombre || "No registrado"}</p>
            </div>
            <div className="rounded-xl bg-surface border border-outline-variant p-4">
              <p className="text-xs uppercase text-outline font-bold">Estado</p>
              <p className="font-semibold text-secondary mt-1">Activo</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PatientProfile;
