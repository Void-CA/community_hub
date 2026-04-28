export interface ScheduleEntry {
  day: string;
  start_block: string;
  end_block: string;
  subject: string;
  majors: string[];
  group: number;
  professor: string;
  room: string;
  academicYear: number;
}

export interface ProfessorSchedule {
  by_day: Record<string, ScheduleEntry[]>;
}

export interface SchedulePeriod {
  id: string;
  year: string;
  term: string;
  label: string;
}

export interface ScheduleDataset {
  period: SchedulePeriod;
  entries: ScheduleEntry[];
  professorSchedules: Record<string, ProfessorSchedule>;
}

export interface ScheduleSection {
  id: string;
  subject: string;
  group: number;
  professor: string;
  room: string;
  majors: string[];
  academicYears: number[];
  entries: ScheduleEntry[];
  days: string[];
}

export type RawScheduleEntry = Omit<ScheduleEntry, 'academicYear'>;
export type RawFullSchedule = Record<string, RawScheduleEntry[]> | RawScheduleEntry[];
export type RawProfessorSchedule = {
  by_day: Record<string, RawScheduleEntry[]>;
};
export type RawProfessorSchedules = Record<string, RawProfessorSchedule>;

export interface ScheduleRouteFilters {
  year?: string | null;
  term?: string | null;
}

export interface TimelineCellTile {
  entry: ScheduleEntry;
  sectionId: string;
  hasConflict?: boolean;
  conflictWith?: string[]; // IDs of other sections causing the conflict
  rowSpan?: number;
}

export interface Encuentro {
  dia: string;
  inicio: number; // 0-indexed block index for easier calculation
  fin: number;
}

export interface OverlapConflict {
  type: 'COLLISION';
  groups: [string, string]; // IDs of the groups that collide
  sharedBlocks: string[];
}

export type ConflictMap = Map<string, OverlapConflict[]>;
