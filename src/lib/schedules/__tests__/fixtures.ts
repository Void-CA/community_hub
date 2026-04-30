import type { ScheduleEntry, ScheduleSection } from '../types';

/**
 * Minimal factory for a ScheduleEntry.
 */
export function entry(overrides: Partial<ScheduleEntry> & {
  day: string;
  start_block: string;
  end_block: string;
  subject: string;
  group: number;
  professor: string;
  room: string;
  majors: string[];
}): ScheduleEntry {
  return {
    academicYear: 3,
    ...overrides,
  };
}

/**
 * Build a ScheduleSection from entries.
 */
export function section(id: string, entries: ScheduleEntry[]): ScheduleSection {
  return {
    id,
    subject: entries[0]!.subject,
    group: entries[0]!.group,
    professor: entries[0]!.professor,
    room: entries[0]!.room,
    majors: [...new Set(entries.flatMap((e) => e.majors))],
    academicYears: [...new Set(entries.map((e) => e.academicYear))],
    entries,
    days: [...new Set(entries.map((e) => e.day))],
  };
}

// ── Shared fixtures ──

export const entries = {
  // Cálculo I - Grupo 1 (Lunes y Miércoles mañana)
  calculo1_L1: entry({
    day: 'L',
    start_block: '1',
    end_block: '2',
    subject: 'Cálculo I',
    group: 1,
    professor: 'Juan Pérez',
    room: 'A101',
    majors: ['ICE'],
    academicYear: 1,
  }),
  calculo1_L2: entry({
    day: 'L',
    start_block: '3',
    end_block: '4',
    subject: 'Cálculo I',
    group: 1,
    professor: 'Juan Pérez',
    room: 'A101',
    majors: ['ICE'],
    academicYear: 1,
  }),
  calculo1_X1: entry({
    day: 'X',
    start_block: '1',
    end_block: '2',
    subject: 'Cálculo I',
    group: 1,
    professor: 'Juan Pérez',
    room: 'A101',
    majors: ['ICE'],
    academicYear: 1,
  }),

  // Cálculo I - Grupo 2 (Misma hora que G1, distinto grupo → NO es conflicto)
  calculo2_L1: entry({
    day: 'L',
    start_block: '1',
    end_block: '2',
    subject: 'Cálculo I',
    group: 2,
    professor: 'María López',
    room: 'A102',
    majors: ['ICE'],
    academicYear: 1,
  }),
  calculo2_X1: entry({
    day: 'X',
    start_block: '1',
    end_block: '2',
    subject: 'Cálculo I',
    group: 2,
    professor: 'María López',
    room: 'A102',
    majors: ['ICE'],
    academicYear: 1,
  }),

  // Física I (Martes y Jueves mañana — SIN conflicto con Cálculo)
  fisica1_M1: entry({
    day: 'M',
    start_block: '1',
    end_block: '2',
    subject: 'Física I',
    group: 1,
    professor: 'Carlos Ruiz',
    room: 'B201',
    majors: ['ICE'],
    academicYear: 1,
  }),
  fisica1_J1: entry({
    day: 'J',
    start_block: '3',
    end_block: '4',
    subject: 'Física I',
    group: 1,
    professor: 'Carlos Ruiz',
    room: 'B201',
    majors: ['ICE'],
    academicYear: 1,
  }),

  // Programación I (CONFLICTO con Cálculo I G1 — mismo día L bloque 1)
  programacion1_L1: entry({
    day: 'L',
    start_block: '1',
    end_block: '2',
    subject: 'Programación I',
    group: 1,
    professor: 'Ana Torres',
    room: 'C301',
    majors: ['ICE'],
    academicYear: 1,
  }),
  programacion1_X1: entry({
    day: 'X',
    start_block: '3',
    end_block: '4',
    subject: 'Programación I',
    group: 1,
    professor: 'Ana Torres',
    room: 'C301',
    majors: ['ICE'],
    academicYear: 1,
  }),

  // Materia de otra carrera (sin conflicto con ICE)
  ingles1_L1: entry({
    day: 'L',
    start_block: '1',
    end_block: '2',
    subject: 'Inglés I',
    group: 1,
    professor: 'John Smith',
    room: 'D401',
    majors: ['LCM'],
    academicYear: 1,
  }),

  // Entrada de bloque parcial (solapamiento parcial)
  programacion2_L_partial: entry({
    day: 'L',
    start_block: '2',
    end_block: '4',
    subject: 'Programación II',
    group: 1,
    professor: 'Roberto Díaz',
    room: 'C302',
    majors: ['ICE'],
    academicYear: 2,
  }),
} as const;
