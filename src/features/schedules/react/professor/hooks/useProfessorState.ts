import { useState, useMemo, useCallback } from 'react';
import { sortEntries } from '@/lib/schedules';
import { dayOrder } from '@/lib/schedules/constants';
import type { ScheduleEntry } from '@/lib/schedules/types';

const PAGE_SIZE = 6;

export function useProfessorState(
  professorNames: string[],
  professorSchedules: Record<string, { by_day: Record<string, ScheduleEntry[]> }>,
  initialProfessor: string,
) {
  const [selectedProfessor, setSelectedProfessor] = useState(initialProfessor);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);

  // Filtered + paginated professor names
  const filteredNames = useMemo(() => {
    if (!searchQuery.trim()) return professorNames;
    const q = searchQuery.toLowerCase().trim();
    return professorNames.filter((name) =>
      name.toLowerCase().includes(q),
    );
  }, [professorNames, searchQuery]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredNames.length / PAGE_SIZE)),
    [filteredNames],
  );

  const visibleNames = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredNames.slice(start, start + PAGE_SIZE);
  }, [filteredNames, currentPage]);

  // Entries for the currently selected professor
  const currentEntries: ScheduleEntry[] = useMemo(() => {
    if (!selectedProfessor) return [];
    const schedule = professorSchedules[selectedProfessor];
    if (!schedule) return [];
    return dayOrder.flatMap(
      (day) => sortEntries(schedule.by_day[day] ?? []),
    );
  }, [selectedProfessor, professorSchedules]);

  const sessionCount = currentEntries.length;

  // Total entries across all professors
  const totalEntries = useMemo(
    () =>
      Object.values(professorSchedules).reduce(
        (sum, schedule) =>
          sum +
          Object.values(schedule.by_day).reduce(
            (daySum, entries) => daySum + entries.length,
            0,
          ),
        0,
      ),
    [professorSchedules],
  );

  // Reset page when search changes
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, []);

  const selectProfessor = useCallback((name: string) => {
    setSelectedProfessor(name);
    setIsCatalogOpen(false);
  }, []);

  const openCatalog = useCallback(() => setIsCatalogOpen(true), []);
  const closeCatalog = useCallback(() => setIsCatalogOpen(false), []);
  const toggleCatalog = useCallback(
    () => setIsCatalogOpen((prev) => !prev),
    [],
  );

  return {
    selectedProfessor,
    searchQuery,
    currentPage,
    totalPages,
    visibleNames,
    totalEntries,
    sessionCount,
    currentEntries,
    isCatalogOpen,
    selectProfessor,
    setSearchQuery: handleSearchChange,
    setCurrentPage,
    openCatalog,
    closeCatalog,
    toggleCatalog,
  };
}
