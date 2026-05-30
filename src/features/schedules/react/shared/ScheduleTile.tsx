import { getSubjectColor, getProfessorAlias, formatBlock, formatAcademicYear } from '@/lib/schedules';
import type { ScheduleTileProps } from './types';
import styles from './ScheduleTile.module.css';

export function ScheduleTile({
  entry,
  sectionId,
  label,
  hasConflict = false,
  variant = 'student',
  isCompact = false,
}: ScheduleTileProps) {
  const accentColor = getSubjectColor(entry.subject);
  const title = label ?? entry.subject;
  const professorAlias = getProfessorAlias(entry.professor);

  const startTime = formatBlock(entry.start_block).split(' - ')[0];
  const endTime =
    formatBlock(entry.end_block).split(' - ')[1] ??
    formatBlock(entry.end_block).split(' - ')[0];

  const academicYearLabel = entry.academicYear
    ? ` · ${formatAcademicYear(entry.academicYear)}`
    : '';

  return (
    <article
      className={`${styles.tile} ${hasConflict ? styles.hasConflict : ''} ${isCompact ? styles.isCompact : ''}`}
      data-schedule-tile
      data-section-id={sectionId}
      style={{ '--tile-accent': accentColor } as React.CSSProperties}
    >
      <div className={styles.content}>
        <header className={styles.header}>
          <div className={styles.time}>
            {startTime} — {endTime}
          </div>
          <span className={styles.groupBadge}>G{entry.group}</span>
        </header>

        <div className={styles.body}>
          <h4 className={styles.subject} title={title}>
            {title}
          </h4>
          <div className={styles.roomRow}>
            <svg
              className={styles.roomIcon}
              viewBox="0 0 16 16"
              fill="none"
              width="12"
              height="12"
              aria-hidden="true"
            >
              <path
                d="M8 1C5.24 1 3 3.24 3 6c0 3.75 5 9 5 9s5-5.25 5-9c0-2.76-2.24-5-5-5z"
                fill="currentColor"
              />
              <circle cx="8" cy="6" r="2" fill="var(--color-surface)" />
            </svg>
            <span className={styles.roomLabel}>Aula</span>
            <span className={styles.roomValue}>{entry.room}</span>
          </div>
        </div>

        <footer className={styles.footer}>
          {variant === 'student' && (
            <p className={styles.professor}>{professorAlias}</p>
          )}
          {variant === 'professor' && entry.majors.length > 0 && (
            <span className={styles.majorBadge}>
              {entry.majors.join(' · ')}
              {academicYearLabel}
            </span>
          )}
        </footer>
      </div>

      {hasConflict && <div className={styles.conflictBadge}>CONFLICTO</div>}
    </article>
  );
}
