import type { ScheduleEntry } from './types';

const collator = new Intl.Collator('es', { sensitivity: 'base' });

const uniqueSorted = (values: string[]) => [...new Set(values)].sort(collator.compare);

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
