# 📚 ÍNDICE DE DOCUMENTACIÓN - FLOWMIX v2

## 🎯 Empezar por aquí

### Para entender rápidamente el proyecto:

1. **[PROJECT_OVERVIEW.txt](PROJECT_OVERVIEW.txt)** - Resumen visual del proyecto (5 min)
2. **[README.md](README.md)** - Información general (3 min)

### Para desarrollar:

1. **[QUICK_START.md](QUICK_START.md)** - Guía rápida de inicio (10 min)
2. **[PATTERNS.md](PATTERNS.md)** - Patrones de desarrollo (15 min)

### Para entender la arquitectura:

1. **[ARCHITECTURE.md](ARCHITECTURE.md)** - Explicación detallada (20 min)
2. **[ADR.md](ADR.md)** - Decisiones arquitectónicas (15 min)
3. **[ESTRUCTURA_VISUAL.txt](ESTRUCTURA_VISUAL.txt)** - Árbol visual (5 min)

### Para un ejemplo completo:

1. **[EJEMPLO_COMPLETO.md](EJEMPLO_COMPLETO.md)** - Case study: Merchandise Store (25 min)

---

## 📖 Documentación Detallada

### [PROJECT_OVERVIEW.txt](PROJECT_OVERVIEW.txt)

**Resumen ejecutivo del proyecto**

- ✅ Lo que está completado
- 🏗️ Estructura del proyecto
- 🎯 Características clave
- 📊 Estadísticas
- 📈 Roadmap futuro

**Tiempo de lectura**: 5-10 minutos  
**Audiencia**: Todos

---

### [README.md](README.md)

**Información general del proyecto**

- 🚀 Inicio rápido (instalación, comandos)
- 📂 Estructura general
- 🎯 Características principales
- 🛠️ Stack técnico

**Tiempo de lectura**: 5 minutos  
**Audiencia**: Cualquiera que quiera empezar rápido

---

### [QUICK_START.md](QUICK_START.md)

**Guía práctica de desarrollo**

- 🚀 Instalación y configuración
- 📝 Checklist para crear un nuevo slice
- 🔑 Conceptos clave (Signals, Input/Output, Inyección)
- 🎨 Componentes shared disponibles
- 🧪 Testing
- 📱 Responsive design
- 🌐 Internacionalización
- 🚨 Errores comunes

**Tiempo de lectura**: 15 minutos  
**Audiencia**: Desarrolladores Angular

---

### [ARCHITECTURE.md](ARCHITECTURE.md)

**Explicación completa de la arquitectura**

- 🏗️ Estructura de directorios (detallada)
- 🎯 Principios de arquitectura (Vertical Slicing, Hexagonal, Screaming)
- 🔄 Flujo de datos (ejemplo: Waitlist)
- 📦 Componentes Smart vs Dumb
- 🛠️ Tecnologías utilizadas
- 🚀 Cómo usar (crear slices, inyección, servicios)
- 🧪 Testing
- 📡 Servicios Core (Theme, i18n)
- 🎨 Sistema de diseño

**Tiempo de lectura**: 20-30 minutos  
**Audiencia**: Arquitectos, leads, devs experimentados

---

### [PATTERNS.md](PATTERNS.md)

**Patrones y convenciones de código**

- 📝 Smart Components (Containers)
- 🔄 Dumb Components (Presentacionales)
- 🎯 Use Cases
- 📊 Domain Models
- 🚪 Repositories (Puertos)
- 🔌 Adapters
- 🎨 Shared Components
- ✨ Directivas
- 🔄 Pipes
- 🔗 Inyección de dependencias
- 💠 Signals y reactividad
- 📥 Input/Output
- 📚 Crear un nuevo slice
- 🧪 Testing

**Tiempo de lectura**: 20 minutos  
**Audiencia**: Desarrolladores (referencia durante desarrollo)

---

### [ADR.md](ADR.md)

**Architectural Decision Records (12 decisiones)**

1. **ADR-001**: Vertical Slicing como estructura principal
2. **ADR-002**: Arquitectura Hexagonal
3. **ADR-003**: Angular Signals en lugar de RxJS
4. **ADR-004**: Componentes Standalone sin NgModules
5. **ADR-005**: Input/Output en lugar de observables
6. **ADR-006**: Use Cases como orquestadores
7. **ADR-007**: Adapters para implementaciones concretas
8. **ADR-008**: Colores y efectos visuales (Neon + Glassmorphism)
9. **ADR-009**: Bilingüismo (EN/ES) con Signals
10. **ADR-010**: Screaming Architecture
11. **ADR-011**: Testing con Mocks del Repository
12. **ADR-012**: No usar Redux (por ahora)

Para cada decisión:

- **Contexto**: Por qué surge la necesidad
- **Decisión**: Qué se decidió
- **Justificación**: Por qué se tomó esa decisión
- **Consecuencias**: Impacto de la decisión

**Tiempo de lectura**: 20 minutos  
**Audiencia**: Arquitectos, leads

---

### [EJEMPLO_COMPLETO.md](EJEMPLO_COMPLETO.md)

**Case study: Crear slice "Merchandise Store"**

Paso a paso cómo crear un nuevo slice:

1. Crear modelo de dominio
2. Crear puerto (repository abstracto)
3. Crear adaptador concreto
4. Crear use cases
5. Crear componentes presentacionales (dumb)
6. Crear container (smart)
7. Usar en app.component.ts
8. Testing con mocks

Incluye:

- Código completo con comentarios
- Ejemplos de cada patrón
- Mock repository
- Tests unitarios

**Tiempo de lectura**: 25 minutos  
**Audiencia**: Desarrolladores (especialmente al agregar features)

---

### [ESTRUCTURA_VISUAL.txt](ESTRUCTURA_VISUAL.txt)

**Árbol de directorios visual con anotaciones**

- 📂 Estructura completa del proyecto
- 🎯 Leyenda de símbolos
- 🔄 Flujo de datos
- ✅ Ventajas de la arquitectura
- 🏗️ Patrones implementados
- 🎨 Colores y estilos
- 📊 Sistema de colores

**Tiempo de lectura**: 10 minutos  
**Audiencia**: Visuales, todos

---

## 🎯 Roadmap de Lectura

### Para Principiantes

1. PROJECT_OVERVIEW.txt
2. README.md
3. QUICK_START.md
4. EJEMPLO_COMPLETO.md

### Para Desarrolladores

1. QUICK_START.md
2. PATTERNS.md
3. ARCHITECTURE.md (cuando dudes)

### Para Arquitectos/Leads

1. PROJECT_OVERVIEW.txt
2. ARCHITECTURE.md
3. ADR.md
4. ESTRUCTURA_VISUAL.txt

### Para Code Review

1. PATTERNS.md
2. ADR.md

---

## 📚 Estructura de Documentación

```
DOCUMENTACIÓN/
├── PROJECT_OVERVIEW.txt          ← Empezar aquí
├── README.md                     ← Info general
├── QUICK_START.md                ← Guía práctica
├── ARCHITECTURE.md               ← Detallado
├── PATTERNS.md                   ← Referencia código
├── ADR.md                        ← Decisiones
├── EJEMPLO_COMPLETO.md           ← Case study
├── ESTRUCTURA_VISUAL.txt         ← Árbol visual
└── ÍNDICE_DE_DOCUMENTACIÓN.md    ← Este archivo
```

---

## 🔍 Búsqueda Rápida

### ¿Cómo crear un nuevo slice?

→ QUICK_START.md (sección "Crear un nuevo slice")  
→ PATTERNS.md (sección "Crear un nuevo slice")  
→ EJEMPLO_COMPLETO.md (paso a paso completo)

### ¿Cómo usar Signals?

→ QUICK_START.md (sección "Signals y reactividad")  
→ PATTERNS.md (comentarios en ejemplos)

### ¿Cómo testear?

→ QUICK_START.md (sección "Testing")  
→ ADR-011.md
→ EJEMPLO_COMPLETO.md (final con tests)

### ¿Cómo agregar componentes?

→ PATTERNS.md (Smart vs Dumb Components)  
→ QUICK_START.md (Componentes Shared)

### ¿Por qué se tomó tal decisión?

→ ADR.md (específicamente la decisión que preguntes)

### ¿Cuál es el flujo de datos?

→ ARCHITECTURE.md (sección "Flujo de datos")  
→ ESTRUCTURA_VISUAL.txt (Flujo de datos)  
→ EJEMPLO_COMPLETO.md (Resumen: Flujo de datos)

### ¿Cuáles son los errores comunes?

→ QUICK_START.md (sección "Errores comunes")

---

## 💡 Tips de Lectura

- **Lectura rápida**: Lee los headers (titulares)
- **Lectura profunda**: Lee secciones enteras
- **Referencia**: Usa Ctrl+F para buscar conceptos
- **Ejemplos**: EJEMPLO_COMPLETO.md tiene código funcional
- **Visual**: ESTRUCTURA_VISUAL.txt es gráfico

---

## 🎓 Conceptos Clave en Documentación

| Concepto         | Dónde está                 | Qué es                               |
| ---------------- | -------------------------- | ------------------------------------ |
| Vertical Slicing | ARCHITECTURE, ADR-001      | Organizar por features, no por capas |
| Hexagonal        | ARCHITECTURE, ADR-002      | Domain puro, adaptadores, puertos    |
| Screaming        | ADR-010, PATTERNS          | Nombres descriptivos en archivos     |
| Smart Component  | PATTERNS, QUICK_START      | Componente que inyecta servicios     |
| Dumb Component   | PATTERNS, QUICK_START      | Componente presentacional puro       |
| Use Case         | PATTERNS, EJEMPLO_COMPLETO | Caso de uso de negocio               |
| Repository       | ADR-007, PATTERNS          | Abstracción de datos                 |
| Adapter          | ADR-007, EJEMPLO_COMPLETO  | Implementación concreta              |
| Signal           | QUICK_START, PATTERNS      | Reactividad Angular 21               |
| Input/Output     | PATTERNS, QUICK_START      | Comunicación entre componentes       |

---

## 🔗 Enlaces Entre Documentos

```
PROJECT_OVERVIEW.txt
  ├──→ README.md
  ├──→ QUICK_START.md
  └──→ ARCHITECTURE.md

QUICK_START.md
  ├──→ PATTERNS.md
  ├──→ EJEMPLO_COMPLETO.md
  └──→ ARCHITECTURE.md

ARCHITECTURE.md
  ├──→ ADR.md
  ├──→ PATTERNS.md
  └──→ ESTRUCTURA_VISUAL.txt

EJEMPLO_COMPLETO.md
  ├──→ PATTERNS.md
  ├──→ QUICK_START.md
  └──→ ARCHITECTURE.md

ADR.md
  └──→ ARCHITECTURE.md
```

---

## 📊 Estadísticas de Documentación

- **Archivos**: 9 (incluyendo este)
- **Páginas equivalentes**: ~60
- **Tiempo de lectura total**: ~2-3 horas
- **Código de ejemplo**: +500 líneas
- **Diagramas/visuales**: 3
- **Patrones documentados**: 12+
- **Decisiones documentadas**: 12

---

## ✅ Checklist de Lectura

Según tu rol, marca lo que debes leer:

### Desarrollador Full Stack

- [ ] README.md
- [ ] QUICK_START.md
- [ ] PATTERNS.md
- [ ] EJEMPLO_COMPLETO.md
- [ ] ARCHITECTURE.md (consulta)

### Frontend Developer

- [ ] README.md
- [ ] QUICK_START.md
- [ ] PATTERNS.md
- [ ] EJEMPLO_COMPLETO.md

### Tech Lead / Architect

- [ ] PROJECT_OVERVIEW.txt
- [ ] ARCHITECTURE.md
- [ ] ADR.md
- [ ] ESTRUCTURA_VISUAL.txt

### QA / Tester

- [ ] README.md
- [ ] QUICK_START.md (Testing)
- [ ] EJEMPLO_COMPLETO.md (Testing)

### Product Manager

- [ ] PROJECT_OVERVIEW.txt
- [ ] README.md

---

## 🆘 Soporte y Preguntas

Si tienes una pregunta:

1. Busca en el índice arriba
2. Consulta la sección "Búsqueda Rápida"
3. Revisa los ejemplos en EJEMPLO_COMPLETO.md
4. Pregunta a tu tech lead

---

**Última actualización**: Enero 2026  
**Versión**: 2.0  
**Autor**: Senior Software Architect

---

## 📱 Versión Móvil

Para leer en móvil, abre los archivos .md en:

- GitHub (sin clonar)
- Visual Studio Code
- Cualquier editor de markdown

---

**¡Feliz lectura y desarrollo!** 🚀
