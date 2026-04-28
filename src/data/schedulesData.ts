import fullSchedule from './schedules/2026/IIC/full_schedule.json';
import professorSchedulesRaw from './schedules/2026/IIC/professors_schedules.json';

export interface ScheduleEntry {
  day: string;
  start_block: string;
  end_block: string;
  subject: string;
  majors: string[];
  group: number;
  professor: string;
  room: string;
}

export interface ProfessorSchedule {
  by_day: Record<string, ScheduleEntry[]>;
}

const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const dayLabels: Record<string, string> = {
  Monday: 'Lunes',
  Tuesday: 'Martes',
  Wednesday: 'Miércoles',
  Thursday: 'Jueves',
  Friday: 'Viernes',
  Saturday: 'Sábado',
  Sunday: 'Domingo',
};

const blockOrder = [
  'Morning1',
  'Morning2',
  'Morning3',
  'Morning4',
  'Afternoon1',
  'Afternoon2',
  'Afternoon3',
  'Afternoon4',
  'Evening1',
  'Evening2',
  'Evening3',
  'Evening4',
];

const blockLabels: Record<string, string> = {
  Morning1: 'Mañana 1',
  Morning2: 'Mañana 2',
  Morning3: 'Mañana 3',
  Morning4: 'Mañana 4',
  Afternoon1: 'Tarde 1',
  Afternoon2: 'Tarde 2',
  Afternoon3: 'Tarde 3',
  Afternoon4: 'Tarde 4',
  Evening1: 'Noche 1',
  Evening2: 'Noche 2',
  Evening3: 'Noche 3',
  Evening4: 'Noche 4',
};

const majorAccents = ['#4f46e5', '#0f766e', '#b45309', '#be123c', '#7c3aed', '#0284c7', '#15803d', '#c2410c'];
const collator = new Intl.Collator('es', { sensitivity: 'base' });

export const semesterLabel = '2026-IIC';
export const scheduleEntries = fullSchedule as ScheduleEntry[];
export const professorSchedules = professorSchedulesRaw as Record<string, ProfessorSchedule>;

const uniqueSorted = (values: string[]) => [...new Set(values)].sort(collator.compare);

export const dayCodes = dayOrder;
export const dayNames = dayOrder.map((day) => ({ code: day, label: dayLabels[day] ?? day }));
export const majors = uniqueSorted(scheduleEntries.flatMap((entry) => entry.majors));
export const groups = [...new Set(scheduleEntries.map((entry) => entry.group))].sort((left, right) => left - right);
export const professorNames = Object.keys(professorSchedules).sort(collator.compare);
export const subjectNames = uniqueSorted(scheduleEntries.map((entry) => entry.subject));
export const roomNames = uniqueSorted(scheduleEntries.map((entry) => entry.room));

export function formatDay(day: string) {
  return dayLabels[day] ?? day;
}

export function formatBlock(block: string) {
  return blockLabels[block] ?? block.replace(/([a-z]+)(\d+)/i, '$1 $2');
}

export function getBlockIndex(block: string) {
  const index = blockOrder.indexOf(block);

  return index === -1 ? blockOrder.length : index;
}

export function getEntrySortKey(entry: ScheduleEntry): [number, number, number, number, string] {
  return [dayOrder.indexOf(entry.day), getBlockIndex(entry.start_block), getBlockIndex(entry.end_block), entry.group, entry.subject];
}

export function sortEntries(entries: ScheduleEntry[]) {
  return [...entries].sort((left, right) => {
    const [leftDay, leftStart, leftEnd, leftGroup, leftSubject] = getEntrySortKey(left);
    const [rightDay, rightStart, rightEnd, rightGroup, rightSubject] = getEntrySortKey(right);

    if (leftDay !== rightDay) return leftDay - rightDay;
    if (leftStart !== rightStart) return leftStart - rightStart;
    if (leftEnd !== rightEnd) return leftEnd - rightEnd;
    if (leftGroup !== rightGroup) return leftGroup - rightGroup;

    return collator.compare(leftSubject, rightSubject);
  });
}

export function groupEntriesByDay(entries: ScheduleEntry[]) {
  return dayOrder
    .map((day) => ({ day, entries: sortEntries(entries.filter((entry) => entry.day === day)) }))
    .filter((group) => group.entries.length > 0);
}

export function getEntryDuration(entry: ScheduleEntry) {
  const start = getBlockIndex(entry.start_block);
  const end = getBlockIndex(entry.end_block);

  return Math.max(1, end - start + 1);
}

export function getProfessorEntries(professorName: string) {
  const professor = professorSchedules[professorName];

  if (!professor) {
    return [];
  }

  return dayOrder.flatMap((day) => sortEntries(professor.by_day[day] ?? []));
}

export function groupProfessorEntriesByDay(professorName: string) {
  const professor = professorSchedules[professorName];

  if (!professor) {
    return [];
  }

  return dayOrder
    .map((day) => ({ day, entries: sortEntries(professor.by_day[day] ?? []) }))
    .filter((group) => group.entries.length > 0);
}

export function getMajorAccent(major: string) {
  const normalized = major.trim().toLowerCase();
  let hash = 0;

  for (const character of normalized) {
    hash = (hash * 31 + character.charCodeAt(0)) % majorAccents.length;
  }

  return majorAccents[Math.abs(hash) % majorAccents.length];
}

export function filterEntries(entries: ScheduleEntry[], filters: { major?: string; group?: string; day?: string }) {
  return entries.filter((entry) => {
    const matchesMajor = !filters.major || filters.major === 'all' || entry.majors.some((major) => major === filters.major);
    const matchesGroup = !filters.group || filters.group === 'all' || String(entry.group) === filters.group;
    const matchesDay = !filters.day || filters.day === 'all' || entry.day === filters.day;

    return matchesMajor && matchesGroup && matchesDay;
  });
}

export function getScheduleSummary(entries: ScheduleEntry[]) {
  const professors = uniqueSorted(entries.map((entry) => entry.professor));
  const subjects = uniqueSorted(entries.map((entry) => entry.subject));
  const rooms = uniqueSorted(entries.map((entry) => entry.room));
  const majorsUsed = uniqueSorted(entries.flatMap((entry) => entry.majors));

  return {
    totalEntries: entries.length,
    totalProfessors: professors.length,
    totalSubjects: subjects.length,
    totalRooms: rooms.length,
    totalMajors: majorsUsed.length,
  };
}
