import { useState, useMemo, useCallback } from 'react';
import type { ScheduleSection, OverlapConflict } from '@/lib/schedules/types';
import { getBlockIndex, filterScheduleSections } from '@/lib/schedules';

/**
 * Computes the auto-selection when major or year changes:
 * picks the FIRST section for each subject that matches the current filters.
 */
function computePresetSelection(
  major: string,
  year: string,
  sections: ScheduleSection[],
): Set<string> {
  if (major === 'all' && year === '0') return new Set();

  const subjectSelected = new Set<string>();
  const selected = new Set<string>();

  for (const section of sections) {
    const matchesMajor =
      major === 'all' ||
      section.majors.some((m) => m.toLowerCase() === major.toLowerCase());
    const matchesYear =
      year === '0' ||
      section.academicYears.some((y) => String(y) === year);

    if (!matchesMajor || !matchesYear) continue;
    if (subjectSelected.has(section.subject)) continue;

    subjectSelected.add(section.subject);
    selected.add(section.id);
  }

  return selected;
}

/**
 * Detects overlaps between selected sections.
 * Sections of the same subject are NOT conflicts (different groups = mutually exclusive).
 */
function detectConflicts(
  sections: ScheduleSection[],
): Map<string, OverlapConflict[]> {
  const conflicts = new Map<string, OverlapConflict[]>();

  for (let i = 0; i < sections.length; i++) {
    for (let j = i + 1; j < sections.length; j++) {
      const a = sections[i];
      const b = sections[j];

      // Same subject → different groups, NOT a conflict
      if (a.subject.toLowerCase() === b.subject.toLowerCase()) continue;

      const sharedBlocks = findOverlap(a, b);

      if (sharedBlocks.length > 0) {
        const conflict: OverlapConflict = {
          type: 'COLLISION',
          groups: [a.id, b.id],
          sharedBlocks,
        };

        const listA = conflicts.get(a.id) ?? [];
        listA.push(conflict);
        conflicts.set(a.id, listA);

        const listB = conflicts.get(b.id) ?? [];
        listB.push(conflict);
        conflicts.set(b.id, listB);
      }
    }
  }

  return conflicts;
}

function findOverlap(a: ScheduleSection, b: ScheduleSection): string[] {
  const shared: string[] = [];

  for (const entryA of a.entries) {
    for (const entryB of b.entries) {
      if (entryA.day !== entryB.day) continue;

      const startA = getBlockIndex(entryA.start_block);
      const endA = getBlockIndex(entryA.end_block);
      const startB = getBlockIndex(entryB.start_block);
      const endB = getBlockIndex(entryB.end_block);

      const overlapStart = Math.max(startA, startB);
      const overlapEnd = Math.min(endA, endB);

      if (overlapStart <= overlapEnd) {
        shared.push(`${entryA.day}::overlap`);
      }
    }
  }

  return shared;
}

/**
 * Computes the set of section IDs that would conflict with the current selection
 * (i.e., they should be "ghosted" / dimmed in the catalog).
 */
function computeGhostedSections(
  selectedIds: Set<string>,
  allSections: ScheduleSection[],
): Set<string> {
  const occupiedSlots = new Set<string>();

  // Build set of (day-block) from selected entries
  for (const section of allSections) {
    if (!selectedIds.has(section.id)) continue;
    for (const entry of section.entries) {
      const start = getBlockIndex(entry.start_block);
      const end = getBlockIndex(entry.end_block);
      for (let b = start; b <= end; b++) {
        occupiedSlots.add(`${entry.day}-${b}`);
      }
    }
  }

  if (occupiedSlots.size === 0) return new Set();

  const ghosted = new Set<string>();

  for (const section of allSections) {
    if (selectedIds.has(section.id)) continue;

    const conflicts = section.entries.some((entry) => {
      const start = getBlockIndex(entry.start_block);
      const end = getBlockIndex(entry.end_block);
      for (let b = start; b <= end; b++) {
        if (occupiedSlots.has(`${entry.day}-${b}`)) return true;
      }
      return false;
    });

    if (conflicts) ghosted.add(section.id);
  }

  return ghosted;
}

export function useScheduleState(
  allSections: ScheduleSection[],
  initialMajor?: string,
  initialYear?: number,
) {
  const initMajor = initialMajor ?? 'all';
  const initYear = initialYear != null ? String(initialYear) : '0';
  const [major, setMajor] = useState<string>(initMajor);
  const [year, setYear] = useState<string>(initYear);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => computePresetSelection(initMajor, initYear, allSections),
  );
  // ── Derived: sections filtered by major + year (search is local to catalog) ──
  const visibleSections = useMemo(
    () => filterScheduleSections(allSections, { major, year }),
    [allSections, major, year],
  );

  // ── Derived: selected sections ──
  const selectedSections = useMemo(
    () => allSections.filter((s) => selectedIds.has(s.id)),
    [allSections, selectedIds],
  );

  // ── Derived: conflicts among selected sections ──
  const conflicts = useMemo(
    () => detectConflicts(selectedSections),
    [selectedSections],
  );

  // ── Derived: ghosted (incompatible) sections in catalog ──
  const ghostedSections = useMemo(
    () => computeGhostedSections(selectedIds, allSections),
    [selectedIds, allSections],
  );

  // ── Derived: stats ──
  const sessionCount = useMemo(
    () => selectedSections.reduce((sum, s) => sum + s.entries.length, 0),
    [selectedSections],
  );

  // ── Handlers ──

  const handleMajorChange = useCallback(
    (newMajor: string) => {
      setMajor(newMajor);
      setSelectedIds(computePresetSelection(newMajor, year, allSections));
    },
    [year, allSections],
  );

  const handleYearChange = useCallback(
    (newYear: string) => {
      setYear(newYear);
      setSelectedIds(computePresetSelection(major, newYear, allSections));
    },
    [major, allSections],
  );

  const toggleSection = useCallback(
    (sectionId: string, subject: string) => {
      setSelectedIds((prev) => {
        const next = new Set(prev);

        if (next.has(sectionId)) {
          next.delete(sectionId);
        } else {
          // Deselect other groups of the same subject
          for (const id of prev) {
            const section = allSections.find((s) => s.id === id);
            if (section && section.subject === subject && id !== sectionId) {
              next.delete(id);
            }
          }
          next.add(sectionId);
        }

        return next;
      });
    },
    [allSections],
  );

  return {
    // State
    major,
    year,
    selectedIds,
    // Derived
    visibleSections,
    selectedSections,
    conflicts,
    ghostedSections,
    sessionCount,
    // Handlers
    setMajor: handleMajorChange,
    setYear: handleYearChange,
    toggleSection,
  };
}
