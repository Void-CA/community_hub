import type { Tool } from '../lib/models';

export const tools: Tool[] = [
  {
    id: 'parser-horarios',
    title: 'Parser de Horarios',
    description:
      'Convierte el texto de tus horarios del SIGA en una vista estructurada y exportable.',
    status: 'active',
    href: '/tools/parser-horarios',
    category: 'Académicas',
    featured: true,
  },
  {
    id: 'schedules',
    title: 'Horarios Académicos',
    description:
      'Consulta y organiza los horarios de estudiantes y profesores con detección de conflictos.',
    status: 'active',
    href: '/campus/schedules',
    category: 'Campus',
    featured: true,
  },
];
