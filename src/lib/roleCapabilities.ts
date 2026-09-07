export const APP_ROLES = {
  ADMIN: "Administrador",
  DOCTOR: "Médico",
  DOCTOR_LEGACY: "Medico",
  RECEPTIONIST: "Recepcionista",
  PATIENT: "Paciente",
} as const;

export type AppRole = (typeof APP_ROLES)[keyof typeof APP_ROLES];

export type RoleCapability =
  | "system:configure"
  | "clinical:supervise"
  | "clinical:operate"
  | "appointments:manage"
  | "appointments:own"
  | "patients:basic-manage"
  | "patients:self-service"
  | "availability:read"
  | "exams:read"
  | "exams:create"
  | "exams:edit-draft"
  | "exams:finalize"
  | "exams:inactivate";

const normalizeRole = (role: string) =>
  role
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

export const isAdminRole = (role: string) => normalizeRole(role) === "administrador";
export const isDoctorRole = (role: string) => normalizeRole(role) === "medico";
export const isReceptionistRole = (role: string) => normalizeRole(role) === "recepcionista";
export const isPatientRole = (role: string) => normalizeRole(role) === "paciente";

export const hasRoleMatch = (roles: string[] | undefined, predicate: (role: string) => boolean) =>
  roles?.some(predicate) ?? false;

export const hasAdminRole = (roles: string[] | undefined) => hasRoleMatch(roles, isAdminRole);
export const hasDoctorRole = (roles: string[] | undefined) => hasRoleMatch(roles, isDoctorRole);
export const hasReceptionistRole = (roles: string[] | undefined) => hasRoleMatch(roles, isReceptionistRole);
export const hasPatientRole = (roles: string[] | undefined) => hasRoleMatch(roles, isPatientRole);

export const getFunctionalRoleLabel = (roles: string[] | undefined): string => {
  if (hasAdminRole(roles)) return "Administrador";
  if (hasDoctorRole(roles)) return "Doctor/Optómetra";
  if (hasReceptionistRole(roles)) return "Recepcionista";
  if (hasPatientRole(roles)) return "Paciente";
  return roles?.[0] || "Miembro del equipo";
};

export const getDefaultRouteForRoles = (roles: string[] | undefined): string => {
  if (hasPatientRole(roles) && !hasAdminRole(roles) && !hasDoctorRole(roles) && !hasReceptionistRole(roles)) {
    return "/portal/dashboard";
  }
  if (hasDoctorRole(roles)) return "/admin/citas";
  if (hasReceptionistRole(roles)) return "/admin/citas";
  if (hasAdminRole(roles)) return "/admin/dashboard";
  return "/login";
};

const CAPABILITIES_BY_ROLE: Record<string, RoleCapability[]> = {
  admin: ["system:configure", "clinical:supervise", "exams:read"],
  doctor: [
    "clinical:operate",
    "appointments:own",
    "exams:read",
    "exams:create",
    "exams:edit-draft",
    "exams:finalize",
    "exams:inactivate",
  ],
  receptionist: ["appointments:manage", "patients:basic-manage", "availability:read"],
  patient: ["patients:self-service"],
};

export const getCapabilitiesForRoles = (roles: string[] | undefined): Set<RoleCapability> => {
  const capabilities = new Set<RoleCapability>();
  if (hasAdminRole(roles)) CAPABILITIES_BY_ROLE.admin.forEach((capability) => capabilities.add(capability));
  if (hasDoctorRole(roles)) CAPABILITIES_BY_ROLE.doctor.forEach((capability) => capabilities.add(capability));
  if (hasReceptionistRole(roles)) CAPABILITIES_BY_ROLE.receptionist.forEach((capability) => capabilities.add(capability));
  if (hasPatientRole(roles)) CAPABILITIES_BY_ROLE.patient.forEach((capability) => capabilities.add(capability));
  return capabilities;
};

export const can = (roles: string[] | undefined, capability: RoleCapability): boolean =>
  getCapabilitiesForRoles(roles).has(capability);

export const canOperateExams = (roles: string[] | undefined) => can(roles, "clinical:operate");
export const canEditDraftExam = (roles: string[] | undefined, estado?: string | null) =>
  can(roles, "exams:edit-draft") && estado === "B";
export const canReadClinicalSupervision = (roles: string[] | undefined) => can(roles, "clinical:supervise");

export const isAdminPathAllowed = (path: string, roles: string[] | undefined): boolean => {
  const normalizedPath = path.toLowerCase();
  if (hasAdminRole(roles)) return true;

  if (hasDoctorRole(roles)) {
    return ["/dashboard", "/citas", "/historial", "/historias", "/examenes", "/ui-guide"].some((allowed) =>
      normalizedPath.startsWith(allowed)
    );
  }

  if (hasReceptionistRole(roles)) {
    return ["/dashboard", "/citas", "/usuarios/pacientes", "/pacientes", "/disponibilidad", "/facturacion", "/caja"].some((allowed) =>
      normalizedPath.startsWith(allowed)
    );
  }

  return false;
};
