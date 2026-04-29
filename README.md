📘 ULSA Community Hub

Plataforma web estática orientada a centralizar herramientas, datos y recursos útiles para la comunidad estudiantil de ULSA.

El objetivo del hub es transformar información académica dispersa (horarios, planes de estudio, datos institucionales) en interfaces accesibles, estructuradas y reutilizables.

🎯 Propósito

El proyecto busca resolver un problema común dentro de la universidad: la información existe, pero no está pensada para ser utilizada.

ULSA Community Hub propone una capa intermedia que:

Estructura datos académicos en formatos navegables
Centraliza herramientas desarrolladas por estudiantes
Facilita la consulta de información relevante
Abre la puerta a análisis académicos y visualización de datos
🧩 Módulos principales
🛠️ Herramientas

Utilidades diseñadas para resolver problemas concretos del día a día académico.

Ejemplo:

Parser de horarios (convierte PDFs institucionales en datos estructurados)
📅 Schedules (Horarios)

Sistema de visualización y exploración de horarios académicos.

Filtros por carrera y año
Vista estructurada por bloques de tiempo
Soporte para múltiples datasets por periodo académico
Diferentes perspectivas (estudiantes / profesores)
📊 Insights (en desarrollo)

Sección orientada a análisis de datos académicos agregados.

Distribución de estudiantes
Uso de aulas
Métricas generales del campus
🤝 Comunidad

Espacio para visibilizar iniciativas estudiantiles:

Clubes (programación, electrónica, emprendimiento, etc.)
Actividades y eventos
Proyectos relevantes
📚 Recursos

Contenido útil para estudiantes:

Guías académicas
Herramientas externas
Material de apoyo
🏗️ Arquitectura

El proyecto sigue una arquitectura modular orientada a dominio:

src/
├── data/          # Datos estáticos versionados (JSON)
├── lib/           # Lógica de dominio (procesamiento, filtros, engine)
├── features/      # Módulos funcionales (schedules, etc.)
├── components/    # UI reutilizable (atoms + componentes globales)
├── layouts/       # Estructura de páginas
├── pages/         # Rutas del sitio
└── styles/        # Design system (tokens, global)
🔍 Capas del sistema
Data Layer → datasets derivados de fuentes oficiales
Domain Layer (lib/) → lógica de negocio (normalización, filtros, métricas)
Feature Layer (features/) → composición de funcionalidades por dominio
UI Layer (components/) → componentes reutilizables
Layout Layer → estructura global del sitio
🧠 Filosofía del proyecto
Data-driven UI: la interfaz se genera a partir de datos estructurados
Separación de responsabilidades: dominio ≠ UI
Modularidad: cada feature es independiente
Evolución progresiva: el sistema crece por iteración, no por diseño rígido
Simplicidad visual, complejidad controlada en el dominio
🚀 Deployment

El proyecto está construido con Astro y puede desplegarse como sitio estático.

Opciones recomendadas:

Vercel
Netlify
GitHub Pages

No requiere backend.

📦 Estado actual

El proyecto se encuentra en desarrollo activo.

✔ Base arquitectónica definida
✔ Sistema de horarios funcional (en iteración)
✔ Primera herramienta integrada (parser)
🔄 Insights en exploración
🔄 Expansión hacia comunidad y recursos
🌱 Visión a futuro

ULSA Community Hub busca evolucionar hacia una plataforma académica abierta donde:

Los estudiantes contribuyan con herramientas y análisis
La información institucional sea más accesible y útil
Se desarrollen visualizaciones avanzadas (grafos, métricas, simulaciones)
Se fomente una cultura data-driven dentro de la universidad
🤝 Contribución

El proyecto está pensado como una base abierta para la comunidad estudiantil.

Posibles formas de contribuir:

Nuevas herramientas
Mejoras en visualización
Análisis de datos académicos
Feedback de uso
📄 Licencia

Por definir.