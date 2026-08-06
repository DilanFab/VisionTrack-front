import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getPacientesCompletos } from "../../api/citas/pacienteCompletoService";
import { getCitas } from "../../api/citas/citaService";
import type { Paciente } from "../../types/citas/Paciente";
import type { Cita } from "../../types/citas/Cita";
import { useAuth } from "../../context/useAuth";
import { canReadClinicalSupervision, hasDoctorRole } from "../../lib/roleCapabilities";
import { getApiErrorMessage } from "../../lib/apiError";
import { SymbolIcon } from "../../components/SymbolIcon";
import { doctorUsuarioIdFromCita, formatFechaClinica, nombreCompletoPersona } from "./historiaUtils";

export default function HistoriasClinicas() {
  const { user } = useAuth();
  const [historias, setHistorias] = useState<Paciente[]>([]);
  const [citas, setCitas] = useState<Cita[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiFilterWarning, setApiFilterWarning] = useState<string | null>(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        setLoading(true);
        setError(null);
        const [historiasData, citasData] = await Promise.all([getPacientesCompletos(), getCitas()]);
        setHistorias(historiasData);
        setCitas(citasData);
        if (hasDoctorRole(user?.roles) && citasData.some((cita) => doctorUsuarioIdFromCita(cita) === undefined)) {
          setApiFilterWarning("La API de citas no confirma el usuario del Doctor/Optómetra; se requiere filtro backend para seguridad completa.");
        }
      } catch (err: unknown) {
        setError(getApiErrorMessage(err, "No se pudieron cargar las historias clínicas."));
      } finally {
        setLoading(false);
      }
    };
    void Promise.resolve().then(cargar);
  }, [user?.roles]);

  const historiasPermitidas = useMemo(() => {
    if (!hasDoctorRole(user?.roles)) return historias;
    const historiaIds = new Set(
      citas
        .filter((cita) => doctorUsuarioIdFromCita(cita) === user?.usuario_id)
        .map((cita) => cita.historia_clinica_id)
    );
    return historias.filter((historia) => historiaIds.has(historia.historia_clinica_id));
  }, [citas, historias, user?.roles, user?.usuario_id]);

  const historiasFiltradas = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return historiasPermitidas;
    return historiasPermitidas.filter((historia) => {
      const persona = historia.perfil.usuario.persona;
      return (
        historia.historia_clinica_numero.toLowerCase().includes(term) ||
        persona.persona_cedula.toLowerCase().includes(term) ||
        nombreCompletoPersona(persona).toLowerCase().includes(term)
      );
    });
  }, [historiasPermitidas, query]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-outline font-bold mb-2">Atención clínica</p>
          <h2 className="text-3xl font-bold text-on-surface">Historias clínicas</h2>
          <p className="text-on-surface-variant text-sm mt-1">
            {canReadClinicalSupervision(user?.roles)
              ? "Vista de supervisión clínica en solo lectura para administración."
              : "Consulta las historias relacionadas con tus citas y exámenes optométricos."}
          </p>
        </div>
        <div className="relative w-full lg:max-w-md">
          <SymbolIcon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
          <input
            className="w-full rounded-full border border-outline-variant bg-surface-container-lowest py-3 pl-10 pr-4 text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            placeholder="Buscar por paciente, cédula o historia..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
      </header>

      {apiFilterWarning && (
        <div className="rounded-2xl border border-warning/30 bg-warning/10 p-4 text-sm text-on-surface">
          <strong>Advertencia de seguridad:</strong> {apiFilterWarning}
        </div>
      )}
      {error && <div className="rounded-2xl border border-error/30 bg-error/10 p-4 text-sm text-error">{error}</div>}

      {loading ? (
        <div className="vt-surface-card rounded-2xl p-8 text-center text-on-surface-variant">Cargando historias clínicas...</div>
      ) : historiasFiltradas.length === 0 ? (
        <div className="vt-surface-card rounded-2xl p-10 text-center">
          <SymbolIcon name="history_edu" className="text-4xl text-primary mb-3" />
          <h3 className="text-xl font-bold text-on-surface">Sin historias disponibles</h3>
          <p className="text-on-surface-variant mt-2">No se encontraron historias clínicas para el rol y búsqueda actual.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {historiasFiltradas.map((historia) => {
            const persona = historia.perfil.usuario.persona;
            return (
              <article key={historia.historia_clinica_id} className="vt-surface-card rounded-2xl p-5 flex flex-col gap-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-outline font-bold">Historia {historia.historia_clinica_numero}</p>
                    <h3 className="text-xl font-bold text-on-surface mt-1">{nombreCompletoPersona(persona)}</h3>
                    <p className="text-sm text-on-surface-variant">CI {persona.persona_cedula} · Apertura {formatFechaClinica(historia.historia_clinica_fecha_apertura)}</p>
                  </div>
                  <span className="rounded-full border border-secondary/30 bg-secondary/10 px-3 py-1 text-xs font-bold text-secondary">
                    {historia.historia_clinica_estado === "A" ? "Activa" : "Inactiva"}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-on-surface-variant">
                  <span>Correo: {persona.persona_correo || "No registrado"}</span>
                  <span>Teléfono: {persona.persona_telefono || "No registrado"}</span>
                </div>
                <div className="flex justify-end">
                  <Link to={`/admin/historial/${historia.historia_clinica_id}`} className="vt-primary-action inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold no-underline">
                    <SymbolIcon name="visibility" /> Ver historia
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
