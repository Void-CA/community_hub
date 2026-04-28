import type { ScheduleSection, OverlapConflict, ScheduleEntry } from './types';
import { getBlockIndex } from './index';

/**
 * Detects overlaps between a list of sections.
 * Returns a map where keys are section IDs and values are the conflicts they have.
 */
export function detectConflicts(sections: ScheduleSection[]): Map<string, OverlapConflict[]> {
  const conflicts = new Map<string, OverlapConflict[]>();
  
  for (let i = 0; i < sections.length; i++) {
    for (let j = i + 1; j < sections.length; j++) {
      const sectionA = sections[i]!;
      const sectionB = sections[j]!;
      
      const sharedBlocks = findOverlap(sectionA, sectionB);
      
      if (sharedBlocks.length > 0) {
        const conflict: OverlapConflict = {
          type: 'COLLISION',
          groups: [sectionA.id, sectionB.id],
          sharedBlocks
        };
        
        const listA = conflicts.get(sectionA.id) || [];
        listA.push(conflict);
        conflicts.set(sectionA.id, listA);
        
        const listB = conflicts.get(sectionB.id) || [];
        listB.push(conflict);
        conflicts.set(sectionB.id, listB);
      }
    }
  }
  
  return conflicts;
}

/**
 * Checks if two sections overlap in any day and block.
 */
function findOverlap(a: ScheduleSection, b: ScheduleSection): string[] {
  const shared: string[] = [];
  
  for (const entryA of a.entries) {
    for (const entryB of b.entries) {
      if (entryA.day !== entryB.day) continue;
      
      const startA = getBlockIndex(entryA.start_block);
      const endA = getBlockIndex(entryA.end_block);
      const startB = getBlockIndex(entryB.start_block);
      const endB = getBlockIndex(entryB.end_block);
      
      // Check for overlap [startA, endA] and [startB, endB]
      const overlapStart = Math.max(startA, startB);
      const overlapEnd = Math.min(endA, endB);
      
      if (overlapStart <= overlapEnd) {
        // Collect shared block labels (labels, not indices)
        // We'll need to map indices back to labels if needed, 
        // but for now let's just flag the collision.
        shared.push(`${entryA.day}::overlap`);
      }
    }
  }
  
  return shared;
}

/**
 * A basic CSP-like solver to find if a valid (conflict-free) path exists.
 */
export function findValidPath(sections: ScheduleSection[]): ScheduleSection[] | null {
  const subjects = [...new Set(sections.map(s => s.subject))];
  const sectionsBySubject = subjects.map(sub => sections.filter(s => s.subject === sub));
  
  const path: ScheduleSection[] = [];
  
  function solve(subjectIndex: number): boolean {
    if (subjectIndex === subjects.length) return true;
    
    const options = sectionsBySubject[subjectIndex]!;
    for (const option of options) {
      // Check if 'option' conflicts with any section already in 'path'
      const hasConflict = path.some(p => findOverlap(p, option).length > 0);
      
      if (!hasConflict) {
        path.push(option);
        if (solve(subjectIndex + 1)) return true;
        path.pop();
      }
    }
    
    return false;
  }
  
  if (solve(0)) return path;
  return null;
}
