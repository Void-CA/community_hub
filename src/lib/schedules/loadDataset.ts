import fullSchedule from '../../data/schedules/2026/IIC/full_schedule.json';
import professorSchedulesRaw from '../../data/schedules/2026/IIC/professors_schedules.json';
import { dayNormalization, oldToNewLabel } from './constants';
import type {
  ProfessorSchedule,
  RawFullSchedule,
  RawProfessorSchedules,
  ScheduleDataset,
  ScheduleEntry,
  SchedulePeriod,
} from './types';

const collator = new Intl.Collator('es', { sensitivity: 'base' });

interface RawScheduleEntryShape {
  day: string;
  start_block: string;
  end_block: string;
  subject: string;
  majors: string[];
  group: number;
  professor: string;
  room: string;
}

function buildEntryIdentity(entry: Omit<ScheduleEntry, 'academicYear'>) {
  const day = dayNormalization[entry.day] ?? entry.day;
  const start = oldToNewLabel[entry.start_block] ?? entry.start_block;
  const end = oldToNewLabel[entry.end_block] ?? entry.end_block;
  const majors = [...entry.majors].sort(collator.compare).join('|');
  return [
    day,
    start,
    end,
    entry.subject,
    String(entry.group),
    entry.professor,
    entry.room,
    majors,
  ].join('::');
}

function normalizeScheduleEntries(rawSchedule: RawFullSchedule) {
  const normalize = (entry: RawScheduleEntryShape): ScheduleEntry => ({
    ...entry,
    day: dayNormalization[entry.day] ?? entry.day,
    start_block: oldToNewLabel[entry.start_block] ?? entry.start_block,
    end_block: oldToNewLabel[entry.end_block] ?? entry.end_block,
    academicYear: 0,
  });

  if (Array.isArray(rawSchedule)) {
    return rawSchedule.map(normalize);
  }

  const result: ScheduleEntry[] = [];

  for (const [yearKey, yearEntries] of Object.entries(rawSchedule)) {
    const academicYear = Number(yearKey);

    for (const entry of yearEntries) {
      result.push({
        ...normalize(entry),
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
  academicYearByIdentity: Map<string, number>,
): Record<string, ProfessorSchedule> {
  const result: Record<string, ProfessorSchedule> = {};

  for (const [professorName, professorSchedule] of Object.entries(
    rawSchedules,
  )) {
    const byDay: Record<string, ScheduleEntry[]> = {};

    for (const [day, dayEntries] of Object.entries(professorSchedule.by_day)) {
      const normalizedDay = dayNormalization[day] ?? day;
      const normalizedEntries: ScheduleEntry[] = dayEntries.map((entry) => {
        const nEntry = {
          ...entry,
          day: dayNormalization[entry.day] ?? entry.day,
          start_block: oldToNewLabel[entry.start_block] ?? entry.start_block,
          end_block: oldToNewLabel[entry.end_block] ?? entry.end_block,
        };
        return {
          ...nEntry,
          academicYear:
            academicYearByIdentity.get(buildEntryIdentity(nEntry)) ?? 0,
        };
      });

      byDay[normalizedDay] = normalizedEntries;
    }

    result[professorName] = { by_day: byDay };
  }

  return result;
}

export const schedulePeriodCatalog: SchedulePeriod[] = [
  {
    id: '2026-IIC',
    year: '2026',
    term: 'IIC',
    label: '2026-IIC',
  },
];

export const scheduleDatasets: Record<string, ScheduleDataset> = {
  '2026-IIC': {
    period: schedulePeriodCatalog[0],
    entries: normalizeScheduleEntries(fullSchedule),
    professorSchedules: {},
  },
};

for (const dataset of Object.values(scheduleDatasets)) {
  const academicYearByIdentity = buildAcademicYearIndex(dataset.entries);
  dataset.professorSchedules = normalizeProfessorSchedules(
    professorSchedulesRaw,
    academicYearByIdentity,
  );
}

export function getScheduleDataset(periodId?: string) {
  if (periodId && scheduleDatasets[periodId]) {
    return scheduleDatasets[periodId];
  }

  return scheduleDatasets[schedulePeriodCatalog[0]?.id ?? '2026-IIC'];
}

export function resolveScheduleDatasetByYearTerm(
  year?: string | null,
  term?: string | null,
) {
  if (!year && !term) {
    return getScheduleDataset();
  }

  const normalizedYear = (year ?? '').trim();
  const normalizedTerm = (term ?? '').trim().toUpperCase();

  return getScheduleDataset(`${normalizedYear}-${normalizedTerm}`);
}
