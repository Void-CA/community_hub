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
          <div className={styles.meta}>
            <span className={styles.room}>Aula {entry.room}</span>
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
