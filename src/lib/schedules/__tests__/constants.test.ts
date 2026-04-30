import { describe, it, expect } from 'vitest';
import {
  dayNormalization,
  oldToNewLabel,
  dayOrder,
  dayLabels,
  scheduleSlots,
} from '../constants';
import { formatDay, formatBlock, getBlockIndex } from '../index';

describe('dayNormalization', () => {
  it('normalizes English day names', () => {
    expect(dayNormalization['Monday']).toBe('L');
    expect(dayNormalization['Friday']).toBe('V');
    expect(dayNormalization['Saturday']).toBe('S');
  });

  it('normalizes Spanish day names', () => {
    expect(dayNormalization['Lunes']).toBe('L');
    expect(dayNormalization['Miércoles']).toBe('X');
  });

  it('returns undefined for unknown keys', () => {
    expect(dayNormalization['Domingo']).toBeUndefined();
  });
});

describe('dayOrder & dayLabels', () => {
  it('has 6 days Monday to Saturday', () => {
    expect(dayOrder).toEqual(['L', 'M', 'X', 'J', 'V', 'S']);
    expect(dayOrder).toHaveLength(6);
  });

  it('has labels for all day codes', () => {
    for (const code of dayOrder) {
      expect(dayLabels[code]).toBeDefined();
      expect(typeof dayLabels[code]).toBe('string');
    }
  });
});

describe('oldToNewLabel', () => {
  it('maps old Morning/Afternoon labels to numeric blocks', () => {
    expect(oldToNewLabel['Morning1']).toBe('1');
    expect(oldToNewLabel['Morning4']).toBe('4');
    expect(oldToNewLabel['Afternoon1']).toBe('5');
    expect(oldToNewLabel['Afternoon4']).toBe('8');
  });

  it('maps break and lunch labels', () => {
    expect(oldToNewLabel['Break1']).toBe('Receso');
    expect(oldToNewLabel['Lunch']).toBe('Almuerzo');
  });

  it('maps lowercase legacy labels', () => {
    expect(oldToNewLabel['mañana1']).toBe('1');
    expect(oldToNewLabel['tarde3']).toBe('7');
  });
});

describe('scheduleSlots', () => {
  it('has 11 slots (8 academic + 3 breaks)', () => {
    expect(scheduleSlots).toHaveLength(11);
  });

  it('academic slots have numeric labels', () => {
    const academic = scheduleSlots.filter((s) => s.type === 'academic');
    for (const slot of academic) {
      expect(slot.label).toMatch(/^\d$/);
    }
  });

  it('break slots have descriptive labels', () => {
    const breaks = scheduleSlots.filter((s) => s.type === 'break');
    expect(breaks.some((b) => b.label === 'Receso')).toBe(true);
    expect(breaks.some((b) => b.label === 'Almuerzo')).toBe(true);
  });
});

describe('formatDay', () => {
  it('formats short codes to full Spanish names', () => {
    expect(formatDay('L')).toBe('Lunes');
    expect(formatDay('X')).toBe('Miércoles');
    expect(formatDay('V')).toBe('Viernes');
  });

  it('returns input for unknown codes', () => {
    expect(formatDay('Z')).toBe('Z');
  });
});

describe('formatBlock', () => {
  it('formats numeric blocks to time ranges', () => {
    expect(formatBlock('1')).toBe('08:00 - 08:50 am');
    expect(formatBlock('3')).toBe('10:00 - 10:50 am');
    expect(formatBlock('7')).toBe('03:00 - 03:50 pm');
  });

  it('normalizes old labels before formatting', () => {
    expect(formatBlock('Morning1')).toBe('08:00 - 08:50 am');
    expect(formatBlock('Afternoon3')).toBe('03:00 - 03:50 pm');
  });

  it('returns input for unknown blocks', () => {
    expect(formatBlock('BloqueX')).toBe('BloqueX');
  });
});

describe('getBlockIndex', () => {
  it('returns position in scheduleSlots array for numeric blocks', () => {
    // Index is based on full scheduleSlots array (including breaks)
    expect(getBlockIndex('1')).toBe(0);
    expect(getBlockIndex('3')).toBe(3); // After Receso at index 2
    expect(getBlockIndex('8')).toBe(10);
  });

  it('normalizes old labels before indexing', () => {
    expect(getBlockIndex('Morning1')).toBe(0);
    expect(getBlockIndex('Afternoon1')).toBe(6); // After Almuerzo at index 5
  });

  it('returns slot count for unknown blocks', () => {
    expect(getBlockIndex('Unknown')).toBe(scheduleSlots.length);
  });

  it('skip break slots in academic indexing', () => {
    // "Receso" is at index 2 in scheduleSlots
    expect(getBlockIndex('Receso')).toBe(2);
    // "Almuerzo" is at index 5 in scheduleSlots
    expect(getBlockIndex('Almuerzo')).toBe(5);
  });
});
