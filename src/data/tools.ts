import type { Tool } from '../lib/models';

export const tools: Tool[] = [
  {
    id: 'parser-horarios',
    title: 'Parser de Horarios',
    description: 'Convierte el texto de tus horarios del SIGA en una vista estructurada y exportable.',
    status: 'active',
    href: '/tools/parser-horarios',
    category: 'Académicas',
    featured: true
  },
  {
    id: 'calculadora-promedio',
    title: 'Calculadora de Promedio',
    description: 'Gestiona tus calificaciones y proyecta tu promedio final de semestre de forma sencilla.',
    status: 'inactive',
    label: 'Próximamente',
    category: 'Académicas',
    featured: true
  },
  {
    id: 'guias-rapidas',
    title: 'Guías Rápidas',
    description: 'Explicaciones prácticas para trámites y herramientas académicas esenciales.',
    status: 'inactive',
    label: 'Próximamente',
    category: 'Recursos',
    featured: true
  },
  {
    id: 'calendario-2026',
    title: 'Calendario 2026',
    description: 'Fechas clave, exámenes y eventos del campus actualizados para este semestre.',
    status: 'inactive',
    label: 'Próximamente',
    category: 'Campus',
    featured: true
  },
  {
    id: 'api-docs',
    title: 'Documentación API',
    description: 'Acceso a los endpoints y modelos de datos para desarrolladores de la comunidad.',
    status: 'inactive',
    label: 'Próximamente',
    category: 'Técnicas'
  },
  {
    id: 'laboratorio-beta',
    title: 'Laboratorio Beta',
    description: 'Prueba nuevas ideas y herramientas en desarrollo temprano de la comunidad.',
    status: 'experimental',
    href: '/lab',
    label: 'Lab',
    category: 'Experimental',
    featured: true
  }
];
