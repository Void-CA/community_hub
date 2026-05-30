import { useState, useMemo } from 'react';
import { groupSectionsBySubject } from '@/lib/schedules';
import type { ScheduleCatalogProps } from '../shared/types';
import styles from './StudentCatalog.module.css';

export function StudentCatalog({
  visibleSections,
  selectedIds,
  ghostedSections,
  onToggleSection,
}: ScheduleCatalogProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const groupedSubjects = useMemo(
    () => groupSectionsBySubject(visibleSections),
    [visibleSections],
  );

  // Local search filter (over the already-visibility-filtered sections from the dashboard)
  const filteredSubjects = useMemo(() => {
    if (!searchQuery.trim()) return groupedSubjects;

    const q = searchQuery.toLowerCase().trim();
    return groupedSubjects.filter((subject) =>
      subject.options.some((opt) => {
        const s = opt.section;
        return (
          s.subject.toLowerCase().includes(q) ||
          s.professor.toLowerCase().includes(q) ||
          s.room.toLowerCase().includes(q) ||
          String(s.group).includes(q)
        );
      }),
    );
  }, [groupedSubjects, searchQuery]);

  return (
    <aside className={styles.catalog}>
      <div className={styles.head}>
        <div>
          <p className={styles.eyebrow}>Explorador</p>
          <h2>Asignaturas</h2>
        </div>
      </div>

      <label className={styles.searchBox}>
        <span className={styles.srOnly}>Buscar</span>
        <input
          type="search"
          placeholder="Buscar materia o profesor"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </label>

      <div className={styles.list}>
        {filteredSubjects.map((subject) => (
          <div key={subject.subject} className={styles.subjectGroup}>
            <div className={styles.subjectInfo}>
              <h3>{subject.subject}</h3>
              <span className={styles.optionCount}>
                {subject.options.length}{' '}
                {subject.options.length === 1 ? 'grupo' : 'grupos'}
              </span>
            </div>

            <div className={styles.groupSelector}>
              {subject.options.map((option) => {
                const section = option.section;
                const isSelected = selectedIds.has(section.id);
                const isGhosted = ghostedSections.has(section.id);
                const isCompatible = !isGhosted && selectedIds.size > 0;

                return (
                  <button
                    key={section.id}
                    type="button"
                    className={`${styles.groupButton} ${
                      isSelected ? styles.isSelected : ''
                    } ${isGhosted ? styles.isGhosted : ''} ${
                      isCompatible && !isSelected ? styles.isCompatible : ''
                    }`}
                    data-section-toggle
                    data-section-id={section.id}
                    data-subject={section.subject}
                    aria-pressed={isSelected}
                    title={`${section.professor} · ${section.room}`}
                    onClick={() => onToggleSection(section.id, section.subject)}
                  >
                    G{section.group}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
