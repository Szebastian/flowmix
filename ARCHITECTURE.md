# FLOWMIX v2 - Arquitectura Hexagonal + Vertical Slicing + Screaming Architecture

## 🏗️ Estructura del Proyecto

```
src/app/
├── core/                                    # Kernel Compartido
│   ├── theme/
│   │   ├── theme-service.ts                # Gestión de modo oscuro (Signals)
│   │   └── theme-variables.css             # Variables CSS nativas
│   └── i18n/
│       └── i18n-service.ts                 # Bilingüismo EN/ES (Signals)
│
├── features/                                # VERTICAL SLICING
│   ├── waitlist/                            # Slice: Registro + Ranking
│   │   ├── application/
│   │   │   ├── join-waitlist.use-case.ts   # UC: Registrarse en lista de espera
│   │   │   └── get-position.use-case.ts    # UC: Obtener posición
│   │   ├── domain/
│   │   │   ├── waitlist.model.ts           # Modelos puros
│   │   │   └── waitlist.repository.ts      # Puerto (Interfaz)
│   │   └── infrastructure/
│   │       ├── http-waitlist.adapter.ts    # Adaptador HTTP
│   │       └── ui/
│   │           ├── waitlist-form/          # Componente Dumb
│   │           └── rank-counter/           # Componente Dumb
│   │
│   ├── hall-of-fame/                       # Slice: Muro de la fama
│   │   ├── application/
│   │   │   └── get-contributors.use-case.ts
│   │   ├── domain/
│   │   │   ├── contributor.model.ts
│   │   │   └── contributor.repository.ts
│   │   └── infrastructure/
│   │       ├── api-contributor.adapter.ts
│   │       └── ui/
│   │           ├── partner-card/
│   │           └── insider-scroller/
│   │
│   └── social-pulse/                       # Slice: Feed interactivo
│       ├── application/
│       │   └── sync-feed.use-case.ts
│       ├── domain/
│       │   └── post.model.ts
│       └── infrastructure/
│           └── ui/
│               ├── masonry-grid/
│               └── post-card/
│
├── shared/                                  # UI Kit Transversal
│   ├── components/
│   │   ├── button.component.ts
│   │   ├── section-header.component.ts
│   │   ├── status-bar.component.ts
│   │   ├── navbar.component.ts
│   │   └── footer.component.ts
│   ├── directives/
│   │   ├── neon-glow.directive.ts
│   │   └── glass-effect.directive.ts
│   └── pipes/
│       └── monotech-format.pipe.ts
│
├── app.component.ts                        # App Shell (Orquestador)
│
└── styles/
    ├── globals.css                         # Estilos globales
    └── tailwind.config.js                  # Config de Tailwind
```

## 🎯 Principios de Arquitectura

### 1. **Vertical Slicing**

Cada feature (`waitlist`, `hall-of-fame`, `social-pulse`) es **autónoma y autosuficiente**.
Si eliminas un slice, la app no se rompe. Cada uno tiene:

- **Application**: Casos de uso (Use Cases)
- **Domain**: Lógica pura (Modelos, Puertos)
- **Infrastructure**: Adaptadores y UI

### 2. **Arquitectura Hexagonal**

- **Domain** (Núcleo): Sin dependencias de frameworks. Completamente testeable.
- **Application**: Orquesta la lógica de negocio mediante Use Cases.
- **Infrastructure**: Adaptadores concretos (HTTP, UI).

**Ventaja**: Si cambias de backend HTTP a WebSocket, solo cambias el adapter.

### 3. **Screaming Architecture**

Los nombres de archivos **gritan** qué hace el sistema:

- `join-waitlist.use-case.ts` → Registro en lista de espera
- `get-position.use-case.ts` → Obtener posición en ranking
- `get-contributors.use-case.ts` → Obtener colaboradores

## 🔄 Flujo de Datos

### Ejemplo: Registrarse en Waitlist

```
Usuario → [UI] waitlist-form.component
    ↓
[Container] waitlist.container.ts
    ↓
[UseCase] join-waitlist.use-case.ts
    ↓
[Repository] waitlist.repository.ts (Puerto)
    ↓
[Adapter] http-waitlist.adapter.ts
    ↓
HTTP Request → Backend
```

## 📦 Componentes Smart vs Dumb

### Smart Components (Containers)

- **Ubicación**: `features/{slice}/`
- **Ejemplo**: `waitlist.container.ts`
- Inyectan servicios, maneja state (signals)
- Despachan Use Cases
- Pasan datos a componentes dumb via `@input()`

### Dumb Components (Presentacionales)

- **Ubicación**: `features/{slice}/infrastructure/ui/`
- **Ejemplo**: `waitlist-form.component.ts`, `rank-counter.component.ts`
- Solo reciben `@input()` y emiten `@output()`
- Sin lógica de negocio
- 100% reutilizables

## 🛠️ Tecnologías

- **Angular 21**: Signals para reactividad
- **Standalone Components**: Modularidad moderna
- **Tailwind CSS**: Estilos Glassmorphism + Neon
- **TypeScript**: Tipado fuerte

## 🚀 Cómo Usar

### Crear un nuevo Slice

1. Crear carpeta en `features/{nuevo-slice}`
2. Crear subcarpetas: `application/`, `domain/`, `infrastructure/ui/`
3. Crear modelo en `domain/`
4. Crear puerto (abstract repository) en `domain/`
5. Crear adapter en `infrastructure/`
6. Crear use case en `application/`
7. Crear componentes UI en `infrastructure/ui/`
8. Crear container component para orquestar

### Inyección de Dependencias

```typescript
providers: [
  { provide: WaitlistRepository, useClass: HttpWaitlistAdapter },
  JoinWaitlistUseCase,
  GetPositionUseCase,
],
```

## 📡 Servicios Core

### ThemeService

```typescript
isDarkMode = signal(boolean);
setDarkMode(isDark: boolean): void;
toggleDarkMode(): void;
```

### I18nService

```typescript
language = signal('en' | 'es');
setLanguage(lang: Language): void;
toggleLanguage(): void;
translate(i18nString: I18nString): string;
```

## 🎨 Sistema de Diseño

### Colores

- **Primary**: Cyan (#0dccf2)
- **Secondary**: Magenta (#ff00ff)
- **Partner**: Red (#ef4444) - Neon Glow Red
- **Insider**: Blue (#3b82f6) - Neon Glow Blue
- **Supporter**: Green (#22c55e) - Neon Glow Green

### Utilidades CSS Personalizadas

- `.glass` - Efecto glassmorphism
- `.neon-glow-{color}` - Efecto neon
- `.neon-text-{color}` - Texto con neon
- `.audio-grid` - Patrón de fondo
- `.monotech` - Fuente monoespaciada

## 🧪 Testing

Estructura lista para tests:

- **Domain Models**: Testeable sin dependencias
- **Use Cases**: Mock repositories fácilmente
- **Components**: Standalone facilita testing

Ejemplo:

```typescript
it("should execute join-waitlist use case", async () => {
  const mockRepo = jasmine.createSpyObj("WaitlistRepository", ["joinWaitlist"]);
  const useCase = new JoinWaitlistUseCase(mockRepo);

  await useCase.execute({ djName: "Test", email: "test@test.com" });

  expect(mockRepo.joinWaitlist).toHaveBeenCalled();
});
```

---

**Arquitecto**: Senior Software Architect  
**Fecha**: 2026-01-29  
**Versión**: 2.0 - Refactorización Completa
