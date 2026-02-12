# DECISIONES ARQUITECTÓNICAS (ADR)

## ADR-001: Adoptar Vertical Slicing como estructura principal

### Contexto

La aplicación contiene múltiples características (waitlist, hall-of-fame, social-pulse) que podrían organizar de forma modular.

### Decisión

✅ Adoptar **Vertical Slicing** donde cada feature es autónoma.

### Justificación

- **Independencia**: Cada slice puede eliminarse sin romper la app
- **Escalabilidad**: Equipos pueden trabajar en paralelo
- **Mantenimiento**: Cambios localizados a un slice
- **Testabilidad**: Cada slice es testeable independientemente

### Consecuencias

- Mayor número de carpetas
- Requiere disciplina en no mezclar slices
- Facilita crecimiento futuro

---

## ADR-002: Implementar Arquitectura Hexagonal

### Contexto

Necesitamos separar la lógica de negocio de los detalles de implementación (HTTP, UI, BD).

### Decisión

✅ Implementar **tres capas**:

- **Domain**: Lógica pura (sin dependencias)
- **Application**: Casos de uso (orquestación)
- **Infrastructure**: Adaptadores y UI

### Justificación

- **Testabilidad**: Domain sin mocks de framework
- **Flexibilidad**: Cambiar HTTP a WebSocket sin tocar dominio
- **Claridad**: Responsabilidades bien definidas
- **Portabilidad**: Domain puede reutilizarse fuera de Angular

### Consecuencias

- Más archivos por slice
- Requiere entender puertos y adaptadores
- Invierte el flujo de dependencias (adentro hacia afuera)

---

## ADR-003: Usar Angular Signals en lugar de RxJS

### Contexto

Angular 21 introduce Signals como alternativa moderna a observables.

### Decisión

✅ Usar **Signals** para estado reactivo simple
⚠️ RxJS solo para operaciones complejas (streams, transformaciones)

### Justificación

- **Performance**: Signals son más eficientes que observables simples
- **Simplicidad**: Sintaxis más legible (`signal()` vs `.subscribe()`)
- **Facilidad**: No necesitas desuscribirse manualmente
- **Moderno**: Parte de Angular 21+

### Ejemplo

```typescript
// Signals
const loading = signal(false);
const value = loading(); // Leer

// vs RxJS (cuando sea necesario)
const data$ = this.http.get("/api");
```

### Consecuencias

- Aprendizaje de Signals
- Mezcla de paradigmas (imperativo + reactivo)
- Mejor performance

---

## ADR-004: Componentes Standalone sin NgModules

### Contexto

Angular removió la necesidad de NgModules con componentes standalone.

### Decisión

✅ **100% Componentes Standalone**
✅ **Sin NgModules** (excepto si es necesario para 3rd parties)

### Justificación

- **Simplicidad**: Sin boilerplate de módulos
- **Granularidad**: Inyectar solo lo necesario
- **Modernidad**: Dirección oficial de Angular
- **Composición**: Importar componentes directamente

### Ejemplo

```typescript
@Component({
  selector: "app-my",
  standalone: true, // ← SIN NgModule
  imports: [CommonModule, MyComponent],
  template: `...`,
})
export class MyComponent {}
```

### Consecuencias

- No compatible con Angular < 14
- Requiere Angular 21+
- Menor código boilerplate

---

## ADR-005: Usar Input/Output en lugar de observables en componentes

### Contexto

Necesitamos comunicación entre componentes (smart ↔ dumb).

### Decisión

✅ **Input/Output** para dumb components
✅ **Signals** + **Inyección** para smart components

### Justificación

- **Simplicidad**: Input/Output son explícitos
- **Reactividad**: Signals actualizan automáticamente
- **Testabilidad**: Fácil de mockear
- **Performance**: Cambio detección granular

### Patrón

```typescript
// Dumb Component
@Input() items: Item[] = [];
@Output() onSelect = new EventEmitter<string>();

// Smart Component
items = signal<Item[]>([]);
getUseCase.items(); // → reactivo
```

### Consecuencias

- Menos RxJS necesario
- Aprendizaje de Input/Output signals
- Mejor composición

---

## ADR-006: Use Cases como orquestadores de lógica

### Contexto

Necesitamos ejecutar operaciones que involucran múltiples pasos y efectos secundarios.

### Decisión

✅ **Use Cases** en `application/` que:

- Inyecten el repository
- Ejecuten lógica de negocio
- Gestionen estado (loading, error, data)
- Expongan signals readonly

### Justificación

- **Claridad**: Nombre explícito de qué hace
- **Reutilizable**: Múltiples componentes pueden usarlos
- **Testeable**: Fácil mockear el repository
- **Mantenible**: Cambios en un lugar

### Ejemplo

```typescript
// ✅ BIEN: Nombre que explica
class JoinWaitlistUseCase {
  async execute(request: JoinWaitlistRequest): Promise<void> { ... }
}

// ❌ EVITAR: Nombre genérico
class DataService {
  getData(endpoint: string): Promise<any> { ... }
}
```

### Consecuencias

- Más clases pequeñas
- Claridad en intención
- Facilita testing

---

## ADR-007: Adapters para implementaciones concretas

### Contexto

El repository define qué datos necesitamos, pero no cómo obtenerlos.

### Decisión

✅ **Adapters** que implementen el repository abstract:

- `HttpWaitlistAdapter` → HTTP
- `MockWaitlistAdapter` → Testing
- `WebSocketWaitlistAdapter` → Tiempo real (futuro)

### Justificación

- **Inversión de dependencias**: Domain no conoce HTTP
- **Testabilidad**: Fácil cambiar a mock
- **Flexibilidad**: Múltiples implementaciones
- **Aislamiento**: Errores HTTP no afectan lógica

### Inyección

```typescript
providers: [{ provide: WaitlistRepository, useClass: HttpWaitlistAdapter }];
```

### Consecuencias

- Requiere entender inyección de dependencias
- Más archivos por slice
- Máxima flexibilidad

---

## ADR-008: Colores y efectos visuales (Neon + Glassmorphism)

### Contexto

La UI necesita ser moderna, con efectos visuales atractivos.

### Decisión

✅ **Neon Glow**: Halos luminosos en elementos clave
✅ **Glassmorphism**: Efecto cristal translúcido
✅ **Monotech**: Fuente monoespaciada para "tech feel"

### Paleta de colores

```
Primary (Cyan):      #0dccf2  → Acción, CTA
Secondary (Magenta): #ff00ff  → Alternativas
Supporter (Green):   #22c55e  → Tier básico
Insider (Blue):      #3b82f6  → Tier premium
Partner (Red):       #ef4444  → Tier máximo
```

### Justificación

- **Marca visual**: Diferencia de competencia
- **Jerarquía**: Colores comunican importancia
- **Accesibilidad**: Contraste suficiente
- **Modernidad**: Efectos de 2024-2025

### Clases CSS

```html
<div class="glass">Glassmorphism</div>
<div class="neon-glow-cyan">Neon Cyan</div>
<span class="neon-text-red">Neon Text</span>
<div class="monotech">Monoespaciado</div>
```

### Consecuencias

- Requiere Tailwind CSS
- Performance en navegadores antiguos
- Muy atractivo visualmente

---

## ADR-009: Bilingüismo (EN/ES) con Signals

### Contexto

La aplicación debe soportar inglés y español dinámicamente.

### Decisión

✅ **I18nService** con signal de idioma
✅ Cambio dinámico sin recarga
✅ Persistencia en localStorage

### Implementación

```typescript
export class I18nService {
  private languageSignal = signal<Language>("en");
  language = this.languageSignal.asReadonly();

  setLanguage(lang: Language): void {
    this.languageSignal.set(lang);
    localStorage.setItem("language", lang);
    document.documentElement.lang = lang;
  }
}
```

### Uso en componentes

```typescript
<span *ngIf="i18n.language() === 'en'">English</span>
<span *ngIf="i18n.language() === 'es'">Español</span>
```

### Justificación

- **Reactividad**: Cambio sin recarga
- **Persistencia**: Recuerda idioma del usuario
- **Accesibilidad**: Soporte multiidioma
- **Moderno**: Con Signals, no con i18n library

### Consecuencias

- Traducción manual (sin librería)
- Strings en TypeScript
- Fácil de mantener y extender

---

## ADR-010: Estructura de carpetas "Screaming Architecture"

### Contexto

Los nombres de archivos deben comunicar intención inmediatamente.

### Decisión

✅ **Nombrado descriptivo**:

- `join-waitlist.use-case.ts` (no: `waitlist.service.ts`)
- `get-position.use-case.ts` (no: `position.ts`)
- `get-contributors.use-case.ts` (no: `data.ts`)

✅ **Carpetas que gritan intención**:

- `application/` → Casos de uso
- `domain/` → Lógica pura
- `infrastructure/` → Detalles técnicos

### Justificación

- **Claridad**: Sin necesidad de leer código
- **Onboarding**: Nuevos devs entienden rápido
- **Mantenimiento**: Cambios son evidentes
- **DDD**: Alineado con Domain-Driven Design

### Ejemplo

```
✅ BIEN:
  features/
  ├── waitlist/
  │   ├── application/
  │   │   ├── join-waitlist.use-case.ts
  │   │   └── get-position.use-case.ts
  │   ├── domain/
  │   │   ├── waitlist.model.ts
  │   │   └── waitlist.repository.ts

❌ MAL:
  features/
  ├── waitlist/
  │   ├── services/
  │   │   ├── waitlist.service.ts
  │   │   └── position.service.ts
```

### Consecuencias

- Archivos con nombres largos
- Requiere disciplina nombramiento
- Mejora significativa en claridad

---

## ADR-011: Testing con Mocks del Repository

### Contexto

Necesitamos tests rápidos sin hacer HTTP real.

### Decisión

✅ **Mock del Repository** en tests
✅ **Jasmine SpyObj** para crear mocks
✅ **Promise-based** testing (async/await)

### Ejemplo

```typescript
const mockRepo = jasmine.createSpyObj("WaitlistRepository", ["joinWaitlist"]);
mockRepo.joinWaitlist.and.returnValue(Promise.resolve(mockData));

TestBed.configureTestingModule({
  providers: [
    { provide: WaitlistRepository, useValue: mockRepo },
    JoinWaitlistUseCase,
  ],
});

const useCase = TestBed.inject(JoinWaitlistUseCase);
await useCase.execute(request);
expect(mockRepo.joinWaitlist).toHaveBeenCalled();
```

### Justificación

- **Velocidad**: Tests sin HTTP
- **Aislamiento**: No afecta base de datos
- **Determinístico**: Resultados predecibles
- **Facilidad**: Jasmine built-in

### Consecuencias

- Tests independientes
- Buena cobertura posible
- Arquitectura facilita testing

---

## ADR-012: No usar State Management (NgRx/Akita)

### Contexto

¿Necesitamos Redux/NgRx para estado global?

### Decisión

✅ **NO usar Redux** (por ahora)
✅ Signals en servicios es suficiente
⚠️ Si crece → considerar Redux

### Justificación

- **Aplicación pequeña**: No hay estado complejo
- **Signals**: Suficiente para estado local
- **Overhead**: Redux agrega complejidad innecesaria
- **Futuro**: Fácil agregar si es necesario

### Cuándo agregar Redux

- Múltiples slices compartiendo estado
- Debugging complejo
- Requisitos de time-travel debugging
- Equipo > 5 personas

### Consecuencias

- Signals en lugar de Redux
- Servicios injectables para estado
- Más simple inicialmente

---

## Resumen de Decisiones

| ADR | Decisión               | Beneficio                    |
| --- | ---------------------- | ---------------------------- |
| 001 | Vertical Slicing       | Independencia, escalabilidad |
| 002 | Arquitectura Hexagonal | Testabilidad, flexibilidad   |
| 003 | Angular Signals        | Performance, simplicidad     |
| 004 | Standalone Components  | Menos boilerplate            |
| 005 | Input/Output + Signals | Claridad, composición        |
| 006 | Use Cases              | Naming, reusabilidad         |
| 007 | Adapters               | Inversión de dependencias    |
| 008 | Neon + Glassmorphism   | Modernidad, marca visual     |
| 009 | i18n con Signals       | Reactividad, bilingüismo     |
| 010 | Screaming Architecture | Claridad, onboarding         |
| 011 | Mocks en Tests         | Velocidad, aislamiento       |
| 012 | Sin Redux (aún)        | Simplicidad inicial          |

---

**Documento de referencia para decisiones arquitectónicas**  
**Actualizado**: Enero 2026  
**Autor**: Senior Software Architect
