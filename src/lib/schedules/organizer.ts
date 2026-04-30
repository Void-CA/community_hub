import type { ScheduleSection } from './types';

export interface GroupOption {
  groupId: string;
  groupNumber: number;
  section: ScheduleSection;
}

export interface SubjectGroups {
  subject: string;
  options: GroupOption[];
}

/**
 * Transforms a flat list of schedule sections into a hierarchical structure:
 * Subject -> List of Group Options.
 */
export function groupSectionsBySubject(
  sections: ScheduleSection[],
): SubjectGroups[] {
  const subjectMap = new Map<string, GroupOption[]>();

  for (const section of sections) {
    if (!subjectMap.has(section.subject)) {
      subjectMap.set(section.subject, []);
    }

    subjectMap.get(section.subject)!.push({
      groupId: section.id,
      groupNumber: section.group,
      section: section,
    });
  }

  return Array.from(subjectMap.entries())
    .map(([subject, options]) => ({
      subject,
      options: options.sort((a, b) => a.groupNumber - b.groupNumber),
    }))
    .sort((a, b) => a.subject.localeCompare(b.subject));
}
