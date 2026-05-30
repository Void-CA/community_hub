import { useMemo } from 'react';
import { formatBlock, getSubjectColor } from '@/lib/schedules';
import type { ScheduleEntry } from '@/lib/schedules/types';
import styles from './ProfessorScheduleListView.module.css';

interface ProfessorScheduleListViewProps {
  entries: ScheduleEntry[];
  activeDays: { code: string; label: string }[];
}

interface GroupedDay {
  code: string;
  label: string;
  entries: ScheduleEntry[];
}

function groupByDay(
  entries: ScheduleEntry[],
  dayOrder: { code: string; label: string }[],
): GroupedDay[] {
  const dayMap = new Map<string, ScheduleEntry[]>();

  for (const entry of entries) {
    const group = dayMap.get(entry.day);
    if (group) {
      group.push(entry);
    } else {
      dayMap.set(entry.day, [entry]);
    }
  }

  const sorted: GroupedDay[] = [];
  for (const day of dayOrder) {
    const dayEntries = dayMap.get(day.code);
    if (dayEntries) {
      dayEntries.sort(
        (a, b) => Number(a.start_block) - Number(b.start_block),
      );
      const dayInfo = dayOrder.find((d) => d.code === day.code);
      sorted.push({
        code: day.code,
        label: dayInfo?.label ?? day.code,
        entries: dayEntries,
      });
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

function formatMajors(majors: string[]): string {
  return majors.join(', ');
}

export function ProfessorScheduleListView({
  entries,
  activeDays,
}: ProfessorScheduleListViewProps) {
  const groupedDays = useMemo(
    () => groupByDay(entries, activeDays),
    [entries, activeDays],
  );

  if (groupedDays.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No hay horarios para mostrar.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {groupedDays.map((day) => (
        <div key={day.code} className={styles.dayGroup}>
          <h3 className={styles.dayHeader}>{day.label}</h3>
          <div className={styles.entries}>
            {day.entries.map((entry, idx) => {
              const accent = getSubjectColor(entry.subject);

              return (
                <article
                  key={`${entry.day}-${entry.start_block}-${entry.end_block}-${idx}`}
                  className={styles.card}
                  style={{ '--card-accent': accent } as React.CSSProperties}
                >
                  <div className={styles.cardTime}>
                    {formatTimeRange(entry)}
                  </div>
                  <div className={styles.cardBody}>
                    <h4 className={styles.cardSubject}>
                      {entry.subject}
                    </h4>
                    <div className={styles.cardMeta}>
                      <span>{formatMajors(entry.majors)}</span>
                      <span className={styles.metaSep}>·</span>
                      <span>G{entry.group}</span>
                    </div>
                  </div>
                  <div className={styles.cardRight}>
                    <svg
                      className={styles.cardRoomIcon}
                      viewBox="0 0 16 16"
                      fill="none"
                      width="10"
                      height="10"
                      aria-hidden="true"
                    >
                      <path
                        d="M8 1C5.24 1 3 3.24 3 6c0 3.75 5 9 5 9s5-5.25 5-9c0-2.76-2.24-5-5-5z"
                        fill="currentColor"
                      />
                      <circle
                        cx="8"
                        cy="6"
                        r="2"
                        fill="var(--color-surface)"
                      />
                    </svg>
                    <span className={styles.cardRoomLabel}>Aula</span>
                    <span className={styles.cardRoomValue}>
                      {entry.room}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
