import {
  GraduationCap,
  Users,
  AlertTriangle,
  MapPin,
  Clock,
  ArrowRight,
  Search,
  Info,
} from '@lucide/astro';

export const dayOrder = ['L', 'M', 'X', 'J', 'V', 'S'];

export const dayLabels: Record<string, string> = {
  L: 'Lunes',
  M: 'Martes',
  X: 'Miércoles',
  J: 'Jueves',
  V: 'Viernes',
  S: 'Sábado',
};

export const dayNormalization: Record<string, string> = {
  Monday: 'L',
  Tuesday: 'M',
  Wednesday: 'X',
  Thursday: 'J',
  Friday: 'V',
  Saturday: 'S',
  Lunes: 'L',
  Martes: 'M',
  Miércoles: 'X',
  Jueves: 'J',
  Viernes: 'V',
  Sábado: 'S',
};

export const scheduleSlots = [
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
] as const;

export const oldToNewLabel: Record<string, string> = {
  mañana1: '1',
  mañana2: '2',
  receso1: 'Receso',
  mañana3: '3',
  mañana4: '4',
  almuerzo: 'Almuerzo',
  tarde1: '5',
  tarde2: '6',
  receso2: 'Receso',
  tarde3: '7',
  tarde4: '8',
  Morning1: '1',
  Morning2: '2',
  Morning3: '3',
  Morning4: '4',
  Afternoon1: '5',
  Afternoon2: '6',
  Afternoon3: '7',
  Afternoon4: '8',
  Break1: 'Receso',
  Break2: 'Receso',
  Lunch: 'Almuerzo',
};

export const ICON_MAP = {
  student: GraduationCap,
  professor: Users,
  conflict: AlertTriangle,
  room: MapPin,
  time: Clock,
  arrow: ArrowRight,
  search: Search,
  info: Info,
} as const;

export const majorAccents = [
  'hsl(215, 70%, 55%)', // Blue
  'hsl(160, 60%, 45%)', // Emerald
  'hsl(35, 80%, 50%)', // Amber
  'hsl(0, 70%, 55%)', // Red
  'hsl(260, 60%, 60%)', // Violet
  'hsl(330, 70%, 60%)', // Pink
  'hsl(190, 70%, 45%)', // Cyan
  'hsl(20, 80%, 55%)', // Orange
];
