import { useState, useMemo, useCallback } from 'react';
import { sortEntries } from '@/lib/schedules';
import { dayOrder } from '@/lib/schedules/constants';
import type { ScheduleEntry } from '@/lib/schedules/types';

const PAGE_SIZE = 6;

export function useSubjectState(
  subjectNames: string[],
  subjectSchedules: Record<string, { by_day: Record<string, ScheduleEntry[]> }>,
  initialSubject: string,
) {
  const [selectedSubject, setSelectedSubject] = useState(initialSubject);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);

  // Filtered + paginated subject names
  const filteredNames = useMemo(() => {
    if (!searchQuery.trim()) return subjectNames;
    const q = searchQuery.toLowerCase().trim();
    return subjectNames.filter((name) =>
      name.toLowerCase().includes(q),
    );
  }, [subjectNames, searchQuery]);

  const filteredCount = filteredNames.length;

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredCount / PAGE_SIZE)),
    [filteredCount],
  );

  const visibleNames = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredNames.slice(start, start + PAGE_SIZE);
  }, [filteredNames, currentPage]);

  // Entries for the currently selected subject
  const currentEntries: ScheduleEntry[] = useMemo(() => {
    if (!selectedSubject) return [];
    const schedule = subjectSchedules[selectedSubject];
    if (!schedule) return [];
    return dayOrder.flatMap(
      (day) => sortEntries(schedule.by_day[day] ?? []),
    );
  }, [selectedSubject, subjectSchedules]);

  const sessionCount = currentEntries.length;

  // Total entries across all subjects
  const totalEntries = useMemo(
    () =>
      Object.values(subjectSchedules).reduce(
        (sum, schedule) =>
          sum +
          Object.values(schedule.by_day).reduce(
            (daySum, entries) => daySum + entries.length,
            0,
          ),
        0,
      ),
    [subjectSchedules],
  );

  // Reset page when search changes
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, []);

  const selectSubject = useCallback((name: string) => {
    setSelectedSubject(name);
    setIsCatalogOpen(false);
  }, []);

  const openCatalog = useCallback(() => setIsCatalogOpen(true), []);
  const closeCatalog = useCallback(() => setIsCatalogOpen(false), []);
  const toggleCatalog = useCallback(
    () => setIsCatalogOpen((prev) => !prev),
    [],
  );

  return {
    selectedSubject,
    searchQuery,
    currentPage,
    totalPages,
    visibleNames,
    filteredCount,
    totalEntries,
    sessionCount,
    currentEntries,
    isCatalogOpen,
    selectSubject,
    setSearchQuery: handleSearchChange,
    setCurrentPage,
    openCatalog,
    closeCatalog,
    toggleCatalog,
  };
}
