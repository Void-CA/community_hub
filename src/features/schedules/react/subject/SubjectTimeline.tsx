import React, { useMemo } from 'react';
import { sortEntries, getBlockIndex } from '@/lib/schedules';
import { dayOrder } from '@/lib/schedules/constants';
import { ScheduleTile } from '../shared/ScheduleTile';
import { SubjectScheduleListView } from './SubjectScheduleListView';
import type { SubjectTimelineProps } from '../shared/types';
import type { ScheduleEntry } from '@/lib/schedules/types';
import styles from './SubjectTimeline.module.css';

/** Entry identity for deduplication within the same slot */
function entryKey(e: ScheduleEntry): string {
  return [
    e.day,
    e.start_block,
    e.end_block,
    e.subject,
    e.group,
    e.professor,
    e.room,
    ...e.majors,
  ].join('::');
}

interface SlotGroup {
  dayIdx: number;
  startIdx: number;
  endIdx: number;
  entries: ScheduleEntry[];
}

export function SubjectTimeline({
  selectedSubject,
  subjectSchedules,
  activeDays,
  scheduleBlocks,
  isCatalogOpen,
  onToggleCatalog,
}: SubjectTimelineProps) {
  const noSelection = !selectedSubject;

  // Get entries for the selected subject, grouped by slot
  const entries = selectedSubject
    ? subjectSchedules[selectedSubject]
    : null;

  // Build slot groups (group overlapping entries)
  const slotGroups: SlotGroup[] = useMemo(() => {
    if (!entries) return [];

    const groups: Record<string, SlotGroup> = {};

    for (const [day, dayEntries] of Object.entries(entries.by_day)) {
      const dayIdx = activeDays.findIndex((d) => d.code === day);
      if (dayIdx === -1) continue;

      for (const rawEntry of sortEntries(dayEntries)) {
        const startIdx = getBlockIndex(rawEntry.start_block);
        const endIdx = getBlockIndex(rawEntry.end_block);
        if (startIdx === -1) continue;

        const key = `${day}::${startIdx}::${endIdx}`;
        if (!groups[key]) {
          groups[key] = { dayIdx, startIdx, endIdx, entries: [] };
        }

        // Deduplicate within slot
        const exists = groups[key].entries.some(
          (e) => entryKey(e) === entryKey(rawEntry),
        );
        if (!exists) {
          groups[key].entries.push(rawEntry);
        }
      }
    }

    return Object.values(groups);
  }, [entries, activeDays]);

  // Flat entries list for mobile list view
  const allEntries = useMemo(
    () =>
      entries
        ? dayOrder.flatMap(
            (day) => sortEntries(entries.by_day[day] ?? []),
          )
        : [],
    [entries],
  );

  // Deduplicate flat entries for list view
  const dedupedEntries = useMemo(() => {
    const seen = new Set<string>();
    return allEntries.filter((e) => {
      const key = entryKey(e);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [allEntries]);

  return (
    <main className={styles.timeline}>
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Visualización</p>
          <h2>Grilla Semanal</h2>
        </div>
        <div className={styles.headerRight}>
          <button
            className={styles.catalogToggle}
            onClick={onToggleCatalog}
            title={isCatalogOpen ? 'Ocultar catálogo' : 'Mostrar catálogo'}
          >
            <span className={styles.toggleIcon}>
              {isCatalogOpen ? '\u2039' : '\u203A'}
            </span>
            <span className={styles.toggleLabel}>Catálogo</span>
          </button>
        </div>
      </div>

      {/* Desktop grid view */}
      <div className={styles.gridWrapper}>
        <div className={styles.scroll}>
          <div
            className={styles.grid}
            style={{
              gridTemplateColumns: `4rem repeat(${activeDays.length}, 1fr)`,
            }}
          >
            {/* Corner */}
            <div className={styles.corner} />

            {/* Day headers */}
            {activeDays.map((day) => (
              <div key={day.code} className={styles.dayHeader}>
                <span>{day.label}</span>
              </div>
            ))}

            {/* Time rows + bg cells */}
            {scheduleBlocks.map((block, rowIdx) => {
              const isBreak = block.type === 'break';
              const rowStart = rowIdx + 2;

              return (
                <React.Fragment key={`row-${rowIdx}`}>
                  {/* Time label */}
                  <div
                    className={`${styles.timeLabel} ${isBreak ? styles.isBreak : ''}`}
                    style={{ gridRow: rowStart, gridColumn: 1 }}
                  >
                    {isBreak ? (
                      <span className={styles.breakLabel}>{block.label}</span>
                    ) : (
                      <>
                        <span className={styles.slotRange}>{block.range}</span>
                        <span className={styles.slotLabel}>
                          Bloque {block.label}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Background cells */}
                  {activeDays.map((_, colIdx) => (
                    <div
                      key={`bg-${rowIdx}-${colIdx}`}
                      className={`${styles.bgCell} ${isBreak ? styles.isBreak : ''}`}
                      style={{
                        gridRow: rowStart,
                        gridColumn: colIdx + 2,
                      }}
                    >
                      {isBreak && colIdx === 0 && (
                        <span className={styles.breakLabelAbs}>
                          {block.label}
                        </span>
                      )}
                    </div>
                  ))}
                </React.Fragment>
              );
            })}

            {/* Selected subject slot groups */}
            {slotGroups.map((group) => {
              const count = group.entries.length;
              const rowStart = group.startIdx + 2;
              const rowSpan = group.endIdx - group.startIdx + 1;
              const hasOverlap = count > 1;

              return (
                <div
                  key={`${group.dayIdx}::${group.startIdx}::${group.endIdx}`}
                  className={`${styles.slotGroup} ${hasOverlap ? styles.hasOverlap : ''}`}
                  style={{
                    gridRow: `${rowStart} / span ${rowSpan}`,
                    gridColumn: group.dayIdx + 2,
                    zIndex: 10,
                  }}
                >
                  {group.entries.map((entry, idx) => (
                    <div
                      key={`${entry.day}-${entry.start_block}-${entry.end_block}-${entry.group}-${idx}`}
                      className={styles.slotTileWrapper}
                      style={{
                        flex: `${100 / count}%`,
                        maxWidth: `${100 / count}%`,
                      }}
                    >
                      <ScheduleTile
                        entry={entry}
                        sectionId={selectedSubject ?? ''}
                        label={selectedSubject}
                        variant="subject"
                        isCompact={rowSpan <= 1}
                      />
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className={styles.legend}>
            <p className={styles.legendTitle}>Guía de Visualización</p>
            <div className={styles.legendGrid}>
              <div className={styles.legendItem}>
                <div
                  className={styles.legendSwatch}
                  style={{ backgroundColor: 'var(--color-primary)' }}
                />
                <div className={styles.legendInfo}>
                  <span className={styles.legendLabel}>Solapamiento</span>
                  <span className={styles.legendDesc}>
                    Grupos o profesores distintos en un mismo bloque.
                  </span>
                </div>
              </div>
              <div className={styles.legendItem}>
                <div className={`${styles.legendSwatch} ${styles.legendPattern}`} />
                <div className={styles.legendInfo}>
                  <span className={styles.legendLabel}>Receso / Almuerzo</span>
                  <span className={styles.legendDesc}>
                    Espacios entre bloques académicos.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile list view ── */}
      <div className={styles.listWrapper}>
        <SubjectScheduleListView
          entries={dedupedEntries}
          activeDays={activeDays}
        />
      </div>

      {noSelection && (
        <div className={styles.emptyState}>
          <h3>No hay horarios para mostrar.</h3>
          <p className={styles.emptyText}>
            Seleccioná una asignatura del catálogo para ver su horario.
          </p>
        </div>
      )}
    </main>
  );
}
