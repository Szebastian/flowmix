# GUÍA RÁPIDA DE DESARROLLO - FLOWMIX v2

## 🚀 Inicio Rápido

### Instalación

```bash
npm install
npm start
# http://localhost:4200
```

### Compilar para Producción

```bash
npm run build:prod
# dist/flowmix/
```

---

## 📝 Checklist: Crear un Nuevo Slice

### 1. Crear Carpeta Base

```
src/app/features/mi-slice/
├── application/
├── domain/
└── infrastructure/
    └── ui/
```

### 2. Modelo de Dominio (Pure)

**Archivo**: `domain/mi-slice.model.ts`

```typescript
export interface MiEntidad {
  id: string;
  nombre: string;
  estado: "activo" | "inactivo";
}
```

### 3. Puerto (Abstracción)

**Archivo**: `domain/mi-slice.repository.ts`

```typescript
@Injectable({ providedIn: "root" })
export abstract class MiSliceRepository {
  abstract getData(): Promise<MiEntidad[]>;
  abstract createItem(item: MiEntidad): Promise<MiEntidad>;
}
```

### 4. Adaptador Concreto

**Archivo**: `infrastructure/http-mi-slice.adapter.ts`

```typescript
@Injectable({ providedIn: "root" })
export class HttpMiSliceAdapter extends MiSliceRepository {
  constructor(private http: HttpClient) {
    super();
  }

  async getData(): Promise<MiEntidad[]> {
    return await this.http.get<MiEntidad[]>("/api/mi-slice").toPromise();
  }
}
```

### 5. Use Cases

**Archivo**: `application/get-data.use-case.ts`

```typescript
@Injectable({ providedIn: "root" })
export class GetDataUseCase {
  private loadingSignal = signal(false);
  private dataSignal = signal<MiEntidad[]>([]);

  loading = this.loadingSignal.asReadonly();
  data = this.dataSignal.asReadonly();

  constructor(private repo: MiSliceRepository) {}

  async execute(): Promise<void> {
    this.loadingSignal.set(true);
    try {
      const data = await this.repo.getData();
      this.dataSignal.set(data);
    } finally {
      this.loadingSignal.set(false);
    }
  }
}
```

### 6. Componentes Dumb

**Archivo**: `infrastructure/ui/mi-lista/mi-lista.component.ts`

```typescript
@Component({
  selector: "app-mi-lista",
  standalone: true,
  template: `
    <div *ngFor="let item of items()">
      {{ item.nombre }}
      <button (click)="onSelect.emit(item.id)">Seleccionar</button>
    </div>
  `,
})
export class MiListaComponent {
  items = input.required<MiEntidad[]>();
  onSelect = output<string>();
}
```

### 7. Container (Smart)

**Archivo**: `mi-slice.container.ts`

```typescript
@Component({
  selector: "app-mi-slice-container",
  standalone: true,
  imports: [MiListaComponent],
  providers: [
    { provide: MiSliceRepository, useClass: HttpMiSliceAdapter },
    GetDataUseCase,
  ],
  template: `
    <app-mi-lista [items]="getData.data()" (onSelect)="onItemSelect($event)" />
  `,
})
export class MiSliceContainerComponent implements OnInit {
  getData = inject(GetDataUseCase);

  ngOnInit() {
    this.getData.execute();
  }

  onItemSelect(id: string) {
    // Lógica
  }
}
```

### 8. Usar en App

**Archivo**: `app.component.ts`

```typescript
import { MiSliceContainerComponent } from "./features/mi-slice/mi-slice.container";

@Component({
  standalone: true,
  imports: [MiSliceContainerComponent],
  template: `<app-mi-slice-container />`,
})
export class AppComponent {}
```

---

## 🔑 Conceptos Clave

### Signals (Reactividad)

```typescript
// Crear
const mySignal = signal<string>('valor inicial');

// Leer
const value = mySignal(); // Invocar

// Actualizar
mySignal.set('nuevo valor');
mySignal.update(v => v + ' modificado');

// Readonly (para templates)
mySignal = mySignal.asReadonly();

// Computed
const uppercased = computed(() => mySignal().toUpperCase());

// En template
<span>{{ mySignal() }}</span>
```

### Input / Output

```typescript
// Input (Propiedades)
export class MyComponent {
  // Requerido
  myProp = input.required<string>();

  // Con default
  myProp = input<string>('default');

  // En template padre
  <app-my [myProp]="value"/>
}

// Output (Eventos)
export class MyComponent {
  myEvent = output<EventType>();

  emitir() {
    this.myEvent.emit(value);
  }

  // En template padre
  <app-my (myEvent)="handleEvent($event)"/>
}
```

### Inyección de Dependencias

```typescript
// Inyectar servicio
constructor(private myService: MyService) {}

// Con inject()
private myService = inject(MyService);

// En providers
providers: [
  MyUseCase,
  { provide: MyRepository, useClass: HttpMyAdapter }
]
```

---

## 🎨 Componentes Shared Disponibles

### Button

```html
<app-button variant="primary" size="lg" (onClick)="handle()">
  ENVIAR
</app-button>
```

### Section Header

```html
<app-section-header
  mainTitle="Mi Sección"
  subtitle="Subtítulo"
  description="Descripción"
  [showDivider]="true"
  dividerText="Divisor"
>
</app-section-header>
```

### Directivas

```html
<!-- Efecto cristal -->
<div appGlassEffect></div>

<!-- Efecto neon -->
<div appNeonGlow="cyan"></div>
<div appNeonGlow="red"></div>
<div appNeonGlow="blue"></div>
```

### Pipes

```html
<!-- Formato monoespaciado -->
{{ 'hola mundo' | monotechFormat }}
<!-- OUTPUT: HOLA_MUNDO -->
```

---

## 🧪 Testing

### Crear Mock Repository

```typescript
const mockRepo = jasmine.createSpyObj("MyRepository", ["getData"]);

beforeEach(() => {
  TestBed.configureTestingModule({
    providers: [{ provide: MyRepository, useValue: mockRepo }, GetDataUseCase],
  });
});
```

### Test Use Case

```typescript
it("debería cargar datos", async () => {
  mockRepo.getData.and.returnValue(Promise.resolve(mockData));

  await useCase.execute();

  expect(useCase.data()).toEqual(mockData);
});
```

---

## 📱 Responsive Design

Tailwind breakpoints:

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

```html
<!-- Oculto en mobile, visible en md+ -->
<div class="hidden md:block">Visible</div>

<!-- Grid responsive -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  <div>Item</div>
</div>
```

---

## 🌐 Internacionalización (EN/ES)

### Inyectar servicio

```typescript
private i18n = inject(I18nService);

// Obtener idioma actual
const lang = this.i18n.language(); // 'en' | 'es'

// Cambiar idioma
this.i18n.setLanguage('es');

// Traducir
const text = this.i18n.get('WAITLIST'); // Usa translations.ts
```

### En template

```html
<!-- Mostrar diferente según idioma -->
<span *ngIf="i18n.language() === 'en'">English</span>
<span *ngIf="i18n.language() === 'es'">Español</span>
```

---

## 🎨 Temas y Estilos

### Colores CSS

```css
var(--primary)      /* #0dccf2 Cyan */
var(--secondary)    /* #ff00ff Magenta */
var(--supporter)    /* #22c55e Verde */
var(--insider)      /* #3b82f6 Azul */
var(--partner)      /* #ef4444 Rojo */
var(--charcoal)     /* #0a0a0a Muy oscuro */
var(--glass)        /* Efecto glassmorphism */
```

### Clases Utilitarias

```html
<!-- Glassmorphism -->
<div class="glass p-6 rounded-3xl">Content</div>

<!-- Neon Glow -->
<div class="neon-glow-cyan">Content</div>
<div class="neon-glow-red">Content</div>
<div class="neon-glow-blue">Content</div>

<!-- Neon Text -->
<span class="neon-text-red">Texto</span>

<!-- Audio Grid (fondo) -->
<div class="audio-grid">Contenido</div>

<!-- Fuente monoespaciada -->
<span class="monotech">CÓDIGO</span>
```

---

## 🚨 Errores Comunes

❌ **Usar `new` en componentes**

```typescript
// MAL
const service = new MyService();

// BIEN
private service = inject(MyService);
```

❌ **Modificar signal sin `set()`**

```typescript
// MAL
this.mySignal().push(item);

// BIEN
this.mySignal.set([...this.mySignal(), item]);
```

❌ **Olvidar standalone: true**

```typescript
// MAL
@Component({
  selector: 'app-my'
})

// BIEN
@Component({
  selector: 'app-my',
  standalone: true
})
```

---

## 📚 Documentación

- **ARCHITECTURE.md** - Explicación detallada de la arquitectura
- **PATTERNS.md** - Patrones y convenciones
- **EJEMPLO_COMPLETO.md** - Ejemplo paso a paso (Merchandise Store)
- **ESTRUCTURA_VISUAL.txt** - Árbol de directorios anotado

---

## 🔗 Links Útiles

- [Angular 21 Docs](https://angular.io)
- [Angular Signals](https://angular.io/guide/signals)
- [Tailwind CSS](https://tailwindcss.com)
- [TypeScript](https://www.typescriptlang.org)

---

**Última actualización**: Enero 2026  
**Versión**: 2.0
