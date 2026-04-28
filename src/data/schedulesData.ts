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

type RawScheduleEntry = Omit<ScheduleEntry, 'academicYear'>;
type RawFullSchedule = Record<string, RawScheduleEntry[]> | RawScheduleEntry[];
type RawProfessorSchedule = {
  by_day: Record<string, RawScheduleEntry[]>;
};
type RawProfessorSchedules = Record<string, RawProfessorSchedule>;

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

function buildEntryIdentity(entry: RawScheduleEntry) {
  const majors = [...entry.majors].sort(collator.compare).join('|');
  return [entry.day, entry.start_block, entry.end_block, entry.subject, String(entry.group), entry.professor, entry.room, majors].join('::');
}

function normalizeScheduleEntries(rawSchedule: RawFullSchedule) {
  if (Array.isArray(rawSchedule)) {
    return rawSchedule.map((entry) => ({ ...entry, academicYear: 0 }));
  }

  const result: ScheduleEntry[] = [];

  for (const [yearKey, yearEntries] of Object.entries(rawSchedule)) {
    const academicYear = Number(yearKey);

    for (const entry of yearEntries) {
      result.push({
        ...entry,
        academicYear: Number.isNaN(academicYear) ? 0 : academicYear,
      });
    }
  }

  return result;
}

function buildAcademicYearIndex(entries: ScheduleEntry[]) {
  const index = new Map<string, number>();

  for (const entry of entries) {
    const identity = buildEntryIdentity(entry);

    if (!index.has(identity)) {
      index.set(identity, entry.academicYear);
    }
  }

  return index;
}

function normalizeProfessorSchedules(
  rawSchedules: RawProfessorSchedules,
  academicYearByIdentity: Map<string, number>
) {
  return Object.fromEntries(
    Object.entries(rawSchedules).map(([professorName, professorSchedule]) => {
      const byDay = Object.fromEntries(
        Object.entries(professorSchedule.by_day).map(([day, dayEntries]) => {
          const normalizedEntries = dayEntries.map((entry) => {
            const identity = buildEntryIdentity(entry);

            return {
              ...entry,
              academicYear: academicYearByIdentity.get(identity) ?? 0,
            };
          });

          return [day, normalizedEntries];
        })
      );

      return [professorName, { by_day: byDay }];
    })
  );
}

const datasets: Record<string, ScheduleDataset> = {
  '2026-IIC': {
    period: {
      id: '2026-IIC',
      year: '2026',
      term: 'IIC',
      label: '2026-IIC',
    },
    entries: normalizeScheduleEntries(fullSchedule as RawFullSchedule),
    professorSchedules: {},
  },
};

for (const dataset of Object.values(datasets)) {
  const academicYearByIdentity = buildAcademicYearIndex(dataset.entries);
  dataset.professorSchedules = normalizeProfessorSchedules(
    professorSchedulesRaw as RawProfessorSchedules,
    academicYearByIdentity
  );
}

export const schedulePeriods = Object.values(datasets)
  .map((dataset) => dataset.period)
  .sort((left, right) => {
    if (left.year !== right.year) {
      return Number(right.year) - Number(left.year);
    }

    return collator.compare(left.term, right.term);
  });

export const defaultSchedulePeriodId = schedulePeriods[0]?.id ?? '2026-IIC';

export function resolveScheduleDataset(periodId?: string) {
  if (periodId && datasets[periodId]) {
    return datasets[periodId];
  }

  return datasets[defaultSchedulePeriodId];
}

export function resolveScheduleDatasetByYearTerm(year?: string | null, term?: string | null) {
  if (!year && !term) {
    return resolveScheduleDataset();
  }

  const normalizedYear = (year ?? '').trim();
  const normalizedTerm = (term ?? '').trim().toUpperCase();
  const candidateId = `${normalizedYear}-${normalizedTerm}`;

  return resolveScheduleDataset(candidateId);
}

const defaultDataset = resolveScheduleDataset();

export const semesterLabel = defaultDataset.period.label;
export const scheduleEntries = defaultDataset.entries;
export const professorSchedules = defaultDataset.professorSchedules;

const uniqueSorted = (values: string[]) => [...new Set(values)].sort(collator.compare);

export const dayCodes = dayOrder;
export const dayNames = dayOrder.map((day) => ({ code: day, label: dayLabels[day] ?? day }));
export const scheduleBlocks = blockOrder;
export const majors = uniqueSorted(scheduleEntries.flatMap((entry) => entry.majors));
export const groups = [...new Set(scheduleEntries.map((entry) => entry.group))].sort((left, right) => left - right);
export const professorNames = Object.keys(professorSchedules).sort(collator.compare);
export const subjectNames = uniqueSorted(scheduleEntries.map((entry) => entry.subject));
export const roomNames = uniqueSorted(scheduleEntries.map((entry) => entry.room));
export const academicYears = [...new Set(scheduleEntries.map((entry) => entry.academicYear).filter((year) => year > 0))].sort((left, right) => left - right);

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
