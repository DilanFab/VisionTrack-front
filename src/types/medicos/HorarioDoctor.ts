export type DiaSemana = "Lunes" | "Martes" | "Miercoles" | "Jueves" | "Viernes";

export interface HorarioDoctor {
  horario_doctor_id: number;
  doctor_id: number;
  horario_doctor_dia: DiaSemana;
  horario_doctor_inicio: string;
  horario_doctor_fin: string;
  horario_doctor_estado: string; // 'A' | 'I'
}

export interface HorarioDoctorSlot {
  horario_doctor_dia: DiaSemana;
  horario_doctor_inicio: string; // "HH:mm:ss"
  horario_doctor_fin: string; // "HH:mm:ss"
}
