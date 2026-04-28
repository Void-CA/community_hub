import type { ScheduleEntry } from './types';

const collator = new Intl.Collator('es', { sensitivity: 'base' });

const uniqueSorted = (values: string[]) => [...new Set(values)].sort(collator.compare);

export function getScheduleSummary(entries: ScheduleEntry[]) {
  const professors = uniqueSorted(entries.map((entry) => entry.professor));
  const subjects = uniqueSorted(entries.map((entry) => entry.subject));
  const rooms = uniqueSorted(entries.map((entry) => entry.room));
  const majorsUsed = uniqueSorted(entries.flatMap((entry) => entry.majors));

  const subjectCounts = entries.reduce((acc, entry) => {
    acc[entry.subject] = (acc[entry.subject] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const mostPopular = Object.entries(subjectCounts).sort(([, a], [, b]) => b - a)[0];

  return {
    totalEntries: entries.length,
    totalProfessors: professors.length,
    totalSubjects: subjects.length,
    totalRooms: rooms.length,
    totalMajors: majorsUsed.length,
    mostPopularSubject: mostPopular ? { name: mostPopular[0], count: mostPopular[1] } : null,
  };
}
