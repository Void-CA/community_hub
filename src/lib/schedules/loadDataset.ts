import fullSchedule from '../../data/schedules/2026/IIC/full_schedule.json';
import professorSchedulesRaw from '../../data/schedules/2026/IIC/professors_schedules.json';
import type {
  ProfessorSchedule,
  RawFullSchedule,
  RawProfessorSchedules,
  ScheduleDataset,
  ScheduleEntry,
  SchedulePeriod,
} from './types';

const collator = new Intl.Collator('es', { sensitivity: 'base' });

function buildEntryIdentity(entry: Omit<ScheduleEntry, 'academicYear'>) {
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
          const normalizedEntries = dayEntries.map((entry) => ({
            ...entry,
            academicYear: academicYearByIdentity.get(buildEntryIdentity(entry)) ?? 0,
          }));

          return [day, normalizedEntries];
        })
      );

      return [professorName, { by_day: byDay } as ProfessorSchedule];
    })
  ) as Record<string, ProfessorSchedule>;
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
    entries: normalizeScheduleEntries(fullSchedule as RawFullSchedule),
    professorSchedules: {},
  },
};

for (const dataset of Object.values(scheduleDatasets)) {
  const academicYearByIdentity = buildAcademicYearIndex(dataset.entries);
  dataset.professorSchedules = normalizeProfessorSchedules(
    professorSchedulesRaw as RawProfessorSchedules,
    academicYearByIdentity
  );
}

export function getScheduleDataset(periodId?: string) {
  if (periodId && scheduleDatasets[periodId]) {
    return scheduleDatasets[periodId];
  }

  return scheduleDatasets[schedulePeriodCatalog[0]?.id ?? '2026-IIC'];
}

export function resolveScheduleDatasetByYearTerm(year?: string | null, term?: string | null) {
  if (!year && !term) {
    return getScheduleDataset();
  }

  const normalizedYear = (year ?? '').trim();
  const normalizedTerm = (term ?? '').trim().toUpperCase();

  return getScheduleDataset(`${normalizedYear}-${normalizedTerm}`);
}
