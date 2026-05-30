import React from 'react';
import { getBlockIndex } from '@/lib/schedules';
import { ScheduleTile } from '../shared/ScheduleTile';
import type { ProfessorTimelineProps } from '../shared/types';
import styles from './ProfessorTimeline.module.css';

export function ProfessorTimeline({
  selectedProfessor,
  professorSchedules,
  activeDays,
  scheduleBlocks,
  isCatalogOpen,
  onToggleCatalog,
}: ProfessorTimelineProps) {
  const noSelection = !selectedProfessor;

  // Get entries for the selected professor
  const entries = selectedProfessor
    ? professorSchedules[selectedProfessor]
    : null;

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

            {/* Selected professor tiles */}
            {entries &&
              activeDays.map((day) =>
                (entries.by_day[day.code] ?? []).map((entry, entryIdx) => {
                  const startIdx = getBlockIndex(entry.start_block);
                  const endIdx = getBlockIndex(entry.end_block);
                  const dayIdx = activeDays.findIndex(
                    (d) => d.code === entry.day,
                  );

                  if (dayIdx === -1 || startIdx === -1) return null;

                  const rowStart = startIdx + 2;
                  const rowSpan = endIdx - startIdx + 1;
                  const colStart = dayIdx + 2;

                  return (
                    <div
                      key={`${selectedProfessor}-${entry.day}-${entry.start_block}-${entry.end_block}-${entryIdx}`}
                      className={styles.tileContainer}
                      data-section-id={selectedProfessor}
                      data-day={entry.day}
                      data-block={entry.start_block}
                      style={{
                        gridRow: `${rowStart} / span ${rowSpan}`,
                        gridColumn: colStart,
                        zIndex: 10,
                      }}
                    >
                      <ScheduleTile
                        entry={entry}
                        sectionId={selectedProfessor ?? ''}
                        label={entry.subject}
                        variant="professor"
                        isCompact={rowSpan <= 1}
                      />
                    </div>
                  );
                }),
              )}
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
                  <span className={styles.legendLabel}>Materia</span>
                  <span className={styles.legendDesc}>
                    Cada materia tiene un color único asignado automáticamente.
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

      {noSelection && (
        <div className={styles.emptyState}>
          <h3>No hay horarios para mostrar.</h3>
          <p className={styles.emptyText}>
            Seleccioná un docente del catálogo para ver su horario.
          </p>
        </div>
      )}
    </main>
  );
}
