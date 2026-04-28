import { scheduleDatasets, schedulePeriodCatalog, getScheduleDataset, resolveScheduleDatasetByYearTerm } from './loadDataset';
import { filterEntries } from './filters';
import { buildTimelineCellIndex } from './cells';
import { getScheduleSummary } from './summary';
import type {
  ProfessorSchedule,
  RawFullSchedule,
  RawProfessorSchedules,
  RawProfessorSchedule,
  RawScheduleEntry,
  ScheduleDataset,
  ScheduleEntry,
  SchedulePeriod,
  ScheduleSection,
} from './types';

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

const uniqueSorted = (values: string[]) => [...new Set(values)].sort(collator.compare);

export {
  buildTimelineCellIndex,
  filterEntries,
  getScheduleSummary,
  getScheduleDataset,
  resolveScheduleDatasetByYearTerm,
  scheduleDatasets,
  schedulePeriodCatalog,
};

export type {
  ProfessorSchedule,
  RawFullSchedule,
  RawProfessorSchedules,
  RawProfessorSchedule,
  RawScheduleEntry,
  ScheduleDataset,
  ScheduleEntry,
  SchedulePeriod,
  ScheduleSection,
};

export const dayCodes = dayOrder;
export const dayNames = dayOrder.map((day) => ({ code: day, label: dayLabels[day] ?? day }));
export const scheduleBlocks = blockOrder;
export const schedulePeriods = schedulePeriodCatalog;
export const defaultSchedulePeriodId = schedulePeriods[0]?.id ?? '2026-IIC';

const defaultDataset = getScheduleDataset();

export const semesterLabel = defaultDataset.period.label;
export const scheduleEntries = defaultDataset.entries;
export const professorSchedules = defaultDataset.professorSchedules;
export const majors = uniqueSorted(scheduleEntries.flatMap((entry) => entry.majors));
export const groups = [...new Set(scheduleEntries.map((entry) => entry.group))].sort((left, right) => left - right);
export const professorNames = Object.keys(professorSchedules).sort(collator.compare);
export const subjectNames = uniqueSorted(scheduleEntries.map((entry) => entry.subject));
export const roomNames = uniqueSorted(scheduleEntries.map((entry) => entry.room));
export const academicYears = [...new Set(scheduleEntries.map((entry) => entry.academicYear).filter((year) => year > 0))].sort((left, right) => left - right);

export function formatAcademicYear(academicYear: number) {
  if (academicYear <= 0) {
    return 'Sin año';
  }

  return `${academicYear}° año`;
}

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

export function buildScheduleSections(entries: ScheduleEntry[]) {
  const sections = new Map<string, ScheduleSection>();

  for (const entry of entries) {
    const id = [entry.subject, entry.group, entry.professor, entry.room, String(entry.academicYear)].join('::');
    const existing = sections.get(id);

    if (existing) {
      existing.entries.push(entry);
      existing.days = uniqueSorted([...existing.days, entry.day]);
      existing.majors = uniqueSorted([...existing.majors, ...entry.majors]);
      existing.academicYears = [...new Set([...existing.academicYears, entry.academicYear])].sort((left, right) => left - right);
      continue;
    }

    sections.set(id, {
      id,
      subject: entry.subject,
      group: entry.group,
      professor: entry.professor,
      room: entry.room,
      majors: [...entry.majors],
      academicYears: [entry.academicYear],
      entries: [entry],
      days: [entry.day],
    });
  }

  return [...sections.values()].map((section) => ({
    ...section,
    entries: sortEntries(section.entries),
    days: uniqueSorted(section.days),
  })).sort((left, right) => {
    const [leftDay] = getEntrySortKey(left.entries[0]);
    const [rightDay] = getEntrySortKey(right.entries[0]);

    if (leftDay !== rightDay) return leftDay - rightDay;
    if (left.subject !== right.subject) return collator.compare(left.subject, right.subject);
    return left.group - right.group;
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
