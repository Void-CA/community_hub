import type { ScheduleSection, ScheduleEntry, TimelineCellTile } from './types';

export function buildTimelineCellIndex(sections: ScheduleSection[]) {
  const index = new Map<string, TimelineCellTile[]>();

  for (const section of sections) {
    for (const entry of section.entries) {
      const key = `${entry.day}::${entry.start_block}`;
      const bucket = index.get(key) ?? [];
      bucket.push({ entry, sectionId: section.id });
      index.set(key, bucket);
    }
  }

  return index;
}
