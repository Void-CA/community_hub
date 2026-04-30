import type { ScheduleEntry } from './types';

export function filterEntries(
  entries: ScheduleEntry[],
  filters: { major?: string; group?: string; day?: string },
) {
  return entries.filter((entry) => {
    const matchesMajor =
      !filters.major ||
      filters.major === 'all' ||
      entry.majors.some((major) => major === filters.major);
    const matchesGroup =
      !filters.group ||
      filters.group === 'all' ||
      String(entry.group) === filters.group;
    const matchesDay =
      !filters.day || filters.day === 'all' || entry.day === filters.day;

    return matchesMajor && matchesGroup && matchesDay;
  });
}
