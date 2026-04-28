export interface ScheduleSlot {
  type: 'academic' | 'break';
  range: string;
  label: string;
}

export const scheduleSlots: ScheduleSlot[] = [
  { type: 'academic', range: '08:00 - 08:50 am', label: '1' },
  { type: 'academic', range: '08:50 - 09:40 am', label: '2' },
  { type: 'break', label: 'Receso', range: '09:40 - 10:00 am' },
  { type: 'academic', range: '10:00 - 10:50 am', label: '3' },
  { type: 'academic', range: '10:50 - 11:40 am', label: '4' },
  { type: 'break', label: 'Almuerzo', range: '11:40 - 01:00 pm' },
  { type: 'academic', range: '01:00 - 01:50 pm', label: '5' },
  { type: 'academic', range: '01:50 - 02:40 pm', label: '6' },
  { type: 'break', label: 'Receso', range: '02:40 - 03:00 pm' },
  { type: 'academic', range: '03:00 - 03:50 pm', label: '7' },
  { type: 'academic', range: '03:50 - 04:40 pm', label: '8' },
];

export const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const dayLabels: Record<string, string> = {
  Monday: 'Lunes',
  Tuesday: 'Martes',
  Wednesday: 'Miércoles',
  Thursday: 'Jueves',
  Friday: 'Viernes',
  Saturday: 'Sábado',
  Sunday: 'Domingo',
};

export const oldToNewLabel: Record<string, string> = {
  'Morning1': '1', 'Morning2': '2', 'Morning3': '3', 'Morning4': '4',
  'Afternoon1': '5', 'Afternoon2': '6', 'Afternoon3': '7', 'Afternoon4': '8',
  'Evening1': '9', 'Evening2': '10', 'Evening3': '11', 'Evening4': '12'
};
