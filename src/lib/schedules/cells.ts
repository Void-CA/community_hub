import type { ScheduleSection, ScheduleEntry, TimelineCellTile, OverlapConflict } from './types';
import { scheduleSlots, oldToNewLabel } from './constants';

export function buildTimelineCellIndex(sections: ScheduleSection[], conflicts?: Map<string, OverlapConflict[]>) {
  const index = new Map<string, TimelineCellTile[]>();
  const academicLabels = scheduleSlots.filter(s => s.type === 'academic').map(s => s.label);

  for (const section of sections) {
    const sectionConflicts = conflicts?.get(section.id) || [];
    
    for (const entry of section.entries) {
      const startLabel = oldToNewLabel[entry.start_block] ?? entry.start_block;
      const endLabel = oldToNewLabel[entry.end_block] ?? entry.end_block;

      const startIndex = academicLabels.indexOf(startLabel);
      const endIndex = academicLabels.indexOf(endLabel);

      if (startIndex === -1) continue;

      const rangeEnd = endIndex === -1 ? startIndex : endIndex;
      const rowSpan = rangeEnd - startIndex + 1;

      for (let i = startIndex; i <= rangeEnd; i++) {
        const label = academicLabels[i];
        if (!label) continue;

        const key = `${entry.day}::${label}`;
        const bucket = index.get(key) ?? [];
        
        // Only add the tile data if it's the first block of the range
        // This allows the UI to use 'grid-row: span N'
        if (i === startIndex) {
          bucket.push({ 
            entry, 
            sectionId: section.id,
            hasConflict: sectionConflicts.length > 0,
            conflictWith: sectionConflicts.map(c => c.groups.find(id => id !== section.id)!),
            rowSpan
          });
        }
        
        index.set(key, bucket);
      }
    }
  }

  return index;
}
