import { useMemo } from 'react';
import { formatBlock, getBlockIndex, getProfessorAlias, getSubjectColor } from '@/lib/schedules';
import type { ScheduleSection, ScheduleEntry } from '@/lib/schedules/types';
import styles from './ScheduleListView.module.css';

interface ScheduleListViewProps {
  selectedSections: ScheduleSection[];
  activeDays: { code: string; label: string }[];
}

interface GroupedDay {
  code: string;
  label: string;
  entries: Array<{
    section: ScheduleSection;
    entry: ScheduleEntry;
    hasConflict: boolean;
  }>;
}

/**
 * Two sections only conflict if they share at least one major AND at least one
 * academic year — otherwise they serve different audiences and a student would
 * never need to take both.
 */
function sharesAudience(a: ScheduleSection, b: ScheduleSection): boolean {
  return (
    a.majors.some((m) => b.majors.includes(m)) &&
    a.academicYears.some((y) => b.academicYears.includes(y))
  );
}

/**
 * Checks if a SINGLE entry overlaps with any entry from OTHER sections
 * that share the same audience (major + academic year).
 * Same-subject sections are never conflicts.
 */
function entryHasConflict(
  entry: ScheduleEntry,
  section: ScheduleSection,
  allSections: ScheduleSection[],
): boolean {
  const startA = getBlockIndex(entry.start_block);
  const endA = getBlockIndex(entry.end_block);

  for (const other of allSections) {
    if (other.id === section.id) continue;
    if (other.subject.toLowerCase() === section.subject.toLowerCase()) continue;
    if (!sharesAudience(section, other)) continue;

    for (const entryB of other.entries) {
      if (entryB.day !== entry.day) continue;

      const startB = getBlockIndex(entryB.start_block);
      const endB = getBlockIndex(entryB.end_block);

      if (Math.max(startA, startB) <= Math.min(endA, endB)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Deduplication key for entries within the same section on the same day+block slot.
 */
function entrySlotKey(e: ScheduleEntry): string {
  return `${e.day}-${e.start_block}-${e.end_block}`;
}

/**
 * Groups selected section entries by day for the mobile list view.
 * Deduplicates entries within a section that share the same day+block slot.
 */
function groupByDay(
  sections: ScheduleSection[],
  dayOrder: { code: string; label: string }[],
): GroupedDay[] {
  const dayMap = new Map<string, GroupedDay>();

  for (const section of sections) {
    const seen = new Set<string>();

    for (const entry of section.entries) {
      const slotKey = entrySlotKey(entry);
      if (seen.has(slotKey)) continue;
      seen.add(slotKey);

      let group = dayMap.get(entry.day);
      if (!group) {
        const dayInfo = dayOrder.find((d) => d.code === entry.day);
        group = {
          code: entry.day,
          label: dayInfo?.label ?? entry.day,
          entries: [],
        };
        dayMap.set(entry.day, group);
      }

      group.entries.push({
        section,
        entry,
        hasConflict: entryHasConflict(entry, section, sections),
      });
    }
  }

  // Sort by day order, then by start_block within each day
  const sorted: GroupedDay[] = [];
  for (const day of dayOrder) {
    const group = dayMap.get(day.code);
    if (group) {
      group.entries.sort(
        (a, b) =>
          Number(a.entry.start_block) - Number(b.entry.start_block),
      );
      sorted.push(group);
    }
  }

  return sorted;
}

function formatTimeRange(entry: ScheduleEntry): string {
  const start = formatBlock(entry.start_block).split(' - ')[0];
  const end =
    formatBlock(entry.end_block).split(' - ')[1] ??
    formatBlock(entry.end_block).split(' - ')[0];
  return `${start} — ${end}`;
}

export function ScheduleListView({
  selectedSections,
  activeDays,
}: ScheduleListViewProps) {
  const groupedDays = useMemo(
    () => groupByDay(selectedSections, activeDays),
    [selectedSections, activeDays],
  );

  if (groupedDays.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No hay clases seleccionadas.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {groupedDays.map((day) => (
        <div key={day.code} className={styles.dayGroup}>
          <h3 className={styles.dayHeader}>{day.label}</h3>
          <div className={styles.entries}>
            {day.entries.map((item) => {
              const accent = getSubjectColor(item.entry.subject);
              const professor = getProfessorAlias(item.entry.professor);

              return (
                <article
                  key={`${item.section.id}-${item.entry.day}-${item.entry.start_block}`}
                  className={`${styles.card} ${item.hasConflict ? styles.hasConflict : ''}`}
                  style={{ '--card-accent': accent } as React.CSSProperties}
                >
                  <div className={styles.cardTime}>
                    {formatTimeRange(item.entry)}
                  </div>
                  <div className={styles.cardBody}>
                    <h4 className={styles.cardSubject}>
                      {item.entry.subject}
                    </h4>
                    <div className={styles.cardMeta}>
                      <span>G{item.entry.group}</span>
                      <span className={styles.metaSep}>·</span>
                      <span>Aula {item.entry.room}</span>
                      <span className={styles.metaSep}>·</span>
                      <span className={styles.cardProfessor}>{professor}</span>
                    </div>
                  </div>
                  {item.hasConflict && (
                    <span className={styles.conflictBadge}>CONFLICTO</span>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
