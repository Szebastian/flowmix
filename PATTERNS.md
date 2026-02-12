// ============================================================================
// PATRONES Y CONVENCIONES DE ARQUITECTURA
// ============================================================================

/\*\*

- 1.  SMART COMPONENTS (Containers)
-
- - Ubicación: features/{slice}/{slice}.container.ts
- - Responsabilidades:
- • Inyectar servicios
- • Despachar Use Cases
- • Gestionar estado (Signals)
- • Pasar datos a componentes dumb
-
- Ejemplo: waitlist.container.ts
-
- @Component({
- selector: 'app-waitlist-container',
- standalone: true,
- providers: [
-     { provide: WaitlistRepository, useClass: HttpWaitlistAdapter },
-     JoinWaitlistUseCase,
-     GetPositionUseCase,
- ],
- })
- export class WaitlistContainerComponent implements OnInit {
- joinWaitlist = inject(JoinWaitlistUseCase);
- getPosition = inject(GetPositionUseCase);
-
- ngOnInit() {
-     this.getPosition.execute('user_id');
- }
-
- onJoinWaitlist(request: JoinWaitlistRequest) {
-     this.joinWaitlist.execute(request);
- }
- }
  \*/

/\*\*

- 2.  DUMB COMPONENTS (Presentacionales)
-
- - Ubicación: features/{slice}/infrastructure/ui/{component}/
- - Responsabilidades:
- • Recibir datos vía @input()
- • Emitir eventos vía @output()
- • Renderizar UI
- • SIN lógica de negocio
-
- Ejemplo: waitlist-form.component.ts
-
- @Component({
- selector: 'app-waitlist-form',
- standalone: true,
- })
- export class WaitlistFormComponent {
- isLoading = input<boolean>(false);
- onSubmitForm = output<JoinWaitlistRequest>();
-
- onSubmit() {
-     this.onSubmitForm.emit({ djName, email });
- }
- }
  \*/

/\*\*

- 3.  USE CASES (Orquestación de Lógica)
-
- - Ubicación: features/{slice}/application/{use-case}.use-case.ts
- - Responsabilidades:
- • Coordinar la lógica de negocio
- • Inyectar el Repository (puerto)
- • Gestionar estado (loading, error, success)
- • Exponer signals para reactividad
-
- Ejemplo: join-waitlist.use-case.ts
-
- @Injectable({ providedIn: 'root' })
- export class JoinWaitlistUseCase {
- private loadingSignal = signal(false);
- private errorSignal = signal<string | null>(null);
-
- loading = this.loadingSignal.asReadonly();
- error = this.errorSignal.asReadonly();
-
- constructor(private waitlistRepository: WaitlistRepository) {}
-
- async execute(request: JoinWaitlistRequest): Promise<void> {
-     this.loadingSignal.set(true);
-     try {
-       const position = await this.waitlistRepository.joinWaitlist(request);
-       // success
-     } catch (error) {
-       this.errorSignal.set(error.message);
-     } finally {
-       this.loadingSignal.set(false);
-     }
- }
- }
  \*/

/\*\*

- 4.  DOMAIN MODELS (Lógica Pura)
-
- - Ubicación: features/{slice}/domain/{model}.model.ts
- - Responsabilidades:
- • Definir tipos/interfaces de dominio
- • SIN dependencias de Angular
- • SIN dependencias de HTTP
- • 100% testeable
-
- Ejemplo: waitlist.model.ts
-
- export interface WaitlistPosition {
- userId: string;
- position: number;
- totalEntries: number;
- }
  \*/

/\*\*

- 5.  REPOSITORIES (Puertos)
-
- - Ubicación: features/{slice}/domain/{repository}.repository.ts
- - Responsabilidades:
- • Definir interfaz/contrato
- • Abstracción del origen de datos
- • Permitir múltiples implementaciones
-
- Ejemplo: waitlist.repository.ts
-
- @Injectable({ providedIn: 'root' })
- export abstract class WaitlistRepository {
- abstract joinWaitlist(request: JoinWaitlistRequest): Promise<WaitlistPosition>;
- }
  \*/

/\*\*

- 6.  ADAPTERS (Implementaciones Concretas)
-
- - Ubicación: features/{slice}/infrastructure/{adapter}.adapter.ts
- - Responsabilidades:
- • Implementar el Repository
- • Hacer llamadas HTTP / WebSocket
- • Mapear respuestas
- • Manejar errores específicos
-
- Ejemplo: http-waitlist.adapter.ts
-
- @Injectable({ providedIn: 'root' })
- export class HttpWaitlistAdapter extends WaitlistRepository {
- constructor(private http: HttpClient) { super(); }
-
- async joinWaitlist(request: JoinWaitlistRequest): Promise<WaitlistPosition> {
-     return await this.http.post<WaitlistPosition>('/api/waitlist', request).toPromise();
- }
- }
  \*/

/\*\*

- 7.  SHARED COMPONENTS
-
- - Ubicación: shared/components/
- - Ejemplos: ButtonComponent, SectionHeaderComponent, StatusBarComponent
- - Reutilizables en múltiples slices
- - No contienen lógica de negocio
    \*/

/\*\*

- 8.  DIRECTIVAS
-
- - Ubicación: shared/directives/
- - Ejemplos: NeonGlowDirective, GlassEffectDirective
- - Comportamiento reutilizable
-
- Uso:
- <div appGlassEffect appNeonGlow="cyan"></div>
  */

/\*\*

- 9.  PIPES
-
- - Ubicación: shared/pipes/
- - Ejemplos: MonotechFormatPipe
- - Transformación de datos en templates
-
- Uso:
- <span>{{ value | monotechFormat }}</span>
  \*/

// ============================================================================
// INYECCIÓN DE DEPENDENCIAS
// ============================================================================

/\*\*

- En componentes container, proporciona el Repository e inyecta los Use Cases:
-
- providers: [
- { provide: WaitlistRepository, useClass: HttpWaitlistAdapter },
- JoinWaitlistUseCase,
- GetPositionUseCase,
- ]
  \*/

// ============================================================================
// SIGNALS Y REACTIVIDAD
// ============================================================================

/\*\*

- Crear signal:
- private mySignal = signal<string>('initial value');
-
- Leer signal:
- const value = mySignal(); // Invocar como función
-
- Actualizar signal:
- mySignal.set('new value');
-
- Signal readonly (para template):
- mySignal = this.mySignal.asReadonly();
-
- Computed signal:
- displayValue = computed(() => this.signal() + ' extra');
  \*/

// ============================================================================
// INPUT / OUTPUT
// ============================================================================

/\*\*

- Input (Propiedades):
- myProp = input<string>(); // Requerido
- myProp = input<string>('default'); // Opcional con default
- myProp = input.required<string>(); // Requerido explícito
-
- Output (Eventos):
- myEvent = output<EventType>();
- this.myEvent.emit(value);
  \*/

// ============================================================================
// CREAR UN NUEVO SLICE
// ============================================================================

/\*\*

- 1.  Crear carpeta: src/app/features/mi-slice/
-
- 2.  Crear estructura:
- - application/
- - domain/
- - infrastructure/ui/
-
- 3.  Crear modelo:
- domain/mi-slice.model.ts
-
- 4.  Crear puerto (interfaz):
- domain/mi-slice.repository.ts
-
- 5.  Crear adaptador:
- infrastructure/http-mi-slice.adapter.ts
-
- 6.  Crear use cases:
- application/get-mi-slice-data.use-case.ts
- application/create-mi-slice-item.use-case.ts
-
- 7.  Crear componentes dumb:
- infrastructure/ui/mi-slice-list/
- infrastructure/ui/mi-slice-form/
-
- 8.  Crear container (smart):
- mi-slice.container.ts
-
- 9.  Usar en app.component.ts:
- imports: [MiSliceContainerComponent]
  \*/

// ============================================================================
// TESTING
// ============================================================================

/\*\*

- Mock repository:
-
- const mockRepo = jasmine.createSpyObj('MiSliceRepository', ['getData', 'createItem']);
-
- Usar en test:
-
- beforeEach(() => {
- TestBed.configureTestingModule({
-     providers: [
-       { provide: MiSliceRepository, useValue: mockRepo },
-       GetMiSliceDataUseCase
-     ]
- });
- useCase = TestBed.inject(GetMiSliceDataUseCase);
- });
-
- test('debería ejecutar use case correctamente', async () => {
- mockRepo.getData.and.returnValue(Promise.resolve(mockData));
- await useCase.execute();
- expect(mockRepo.getData).toHaveBeenCalled();
- });
  \*/
