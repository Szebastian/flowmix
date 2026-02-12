# Documento de Requerimientos del Producto (PRD)

## Resumen Ejecutivo
- Objetivo: captar y convertir DJs a través de una Lista de Espera y un flujo de Membresías con verificación, beneficios y comunidad por niveles.
- Alcance: aplicación Angular con formularios progresivos, estado de solicitudes en tiempo real, persistencia en Supabase, notificaciones por email y pantallas de beneficios.
- Métricas clave: conversión waitlist→membresía, tiempo de verificación, éxito de emails, errores por duplicados y uso por nivel de membresía.

## Contexto y Motivación
- Necesidad de un flujo confiable de registro con datos técnicos para asignar builds compatibles y facilitar soporte.
- Sistema de membresías por niveles para financiar y construir comunidad (apoyo, interno, socio).
- Minimizar fricción: formularios progresivos, validación temprana de duplicados, feedback visual y auto‑reset tras éxito.

## Personas
- DJ aspirante: desea unirse, completar datos técnicos, recibir acceso y soporte.
- Miembro activo: consulta estado, accede a beneficios y al grupo de WhatsApp según nivel.
- Mantenedor/operaciones: verifica aportes, activa membresías, gestiona comunicaciones y monitoriza métricas.

## Alcance Funcional
### Lista de Espera
- Paso 1 progresivo: Email → validar contra profiles; si no duplicado, aparece Nombre Completo; al escribir Nombre, aparece Alias de DJ.
  - Implementación UI: [waitlist-form.component.ts](file:///c:/DESARROLLO/DESARROLLO%20CON%20ELECTRON/software%20Libre%20de%20dj/26-11-25/webpresentacion/v2/src/app/features/waitlist/infrastructure/ui/waitlist-form/waitlist-form.component.ts#L36-L128)
  - Lógica de visibilidad: [waitlist-form.component.ts](file:///c:/DESARROLLO/DESARROLLO%20CON%20ELECTRON/software%20Libre%20de%20dj/26-11-25/webpresentacion/v2/src/app/features/waitlist/infrastructure/ui/waitlist-form/waitlist-form.component.ts#L736-L741)
- Paso 2 técnico: país, sistema operativo, versión, arquitectura, preferencias de audio; animaciones suaves.
  - UI y selects: [waitlist-form.component.ts](file:///c:/DESARROLLO/DESARROLLO%20CON%20ELECTRON/software%20Libre%20de%20dj/26-11-25/webpresentacion/v2/src/app/features/waitlist/infrastructure/ui/waitlist-form/waitlist-form.component.ts#L130-L271)
- Paso 3 confirmación: consentimiento y envío.
- Validación de duplicados: bloqueo de avance si email existe en profiles; mensaje claro.
  - Detección de duplicados: [checkExistingUser](file:///c:/DESARROLLO/DESARROLLO%20CON%20ELECTRON/software%20Libre%20de%20dj/26-11-25/webpresentacion/v2/src/app/features/waitlist/infrastructure/ui/waitlist-form/waitlist-form.component.ts#L549-L592)
  - Condición de validez: [isStep1Valid](file:///c:/DESARROLLO/DESARROLLO%20CON%20ELECTRON/software%20Libre%20de%20dj/26-11-25/webpresentacion/v2/src/app/features/waitlist/infrastructure/ui/waitlist-form/waitlist-form.component.ts#L732-L741)
- Finalización y éxito:
  - Pantalla: “¡Registro Exitoso! Revisa tu correo”
  - Cuenta regresiva 10s con mensaje dinámico; auto‑reset completo al llegar a 0; clearInterval y ngOnDestroy seguro.
  - Implementación: [countdown y reset](file:///c:/DESARROLLO/DESARROLLO%20CON%20ELECTRON/software%20Libre%20de%20dj/26-11-25/webpresentacion/v2/src/app/features/waitlist/infrastructure/ui/waitlist-form/waitlist-form.component.ts#L934-L973), [UI éxito y contador](file:///c:/DESARROLLO/DESARROLLO%20CON%20ELECTRON/software%20Libre%20de%20dj/26-11-25/webpresentacion/v2/src/app/features/waitlist/infrastructure/ui/waitlist-form/waitlist-form.component.ts#L322-L347)

### Membresías y Estado de Pago
- Subida de comprobante, creación y verificación de membresía.
- Pantalla de estado con tiempo real; confeti al activar; sin botón de descarga.
- Botones de beneficios y grupo de WhatsApp por nivel (apoyo/interno/socio).
  - Implementación: [payment-status.component.ts](file:///c:/DESARROLLO/DESARROLLO%20CON%20ELECTRON/software%20Libre%20de%20dj/26-11-25/webpresentacion/v2/src/app/features/memberships/track/payment-status.component.ts)

### Emails y Notificaciones
- Encolado de emails de confirmación y beneficios.
- Funciones serverless en Supabase para envío/transición de estados (diseño).

### Administración
- Cambiar estado de membresía por email, adjuntar notas y disparar emails de beneficios (diseño).

## Requerimientos No Funcionales
- Rendimiento: Angular signals; animaciones livianas; renders mínimos.
- Seguridad: no exponer secretos; validación cliente y servidor; Unique Constraint en profiles.email; manejo silencioso de errores con feedback de UI.
- Accesibilidad: alto contraste; foco visible; etiquetas claras; textos cortos.
- Mantenibilidad: servicios modulares; patrones consistentes; sin dependencias innecesarias.
- Confiabilidad: suscripción en tiempo real + fallback; reintentos seguros; cleanups (clearInterval).

## Modelo de Datos (Supabase)
- profiles: id (PK), email (UNIQUE), username, dj_name, nationality, primary_software, full_name (opcional).
- technical_data: id (PK), user_id (FK→profiles), os_family, os_version, architecture, audio_formats.
- memberships: id (PK), user_id (FK→profiles), level (‘apoyo’|‘interno’|‘socio’), status (‘pending’|‘pending_verification’|‘active’|‘expired’|‘cancelled’|‘rejected’), start_date, receipt_url, transaction_ref, internal_notes, months_paid, expiry_date.
- waiting_list: email, username, dj_name, nationality, instagram, interests, status, os, osVersion, architecture, currentSoftware, audioFormats.
- email_jobs: email, type, status, payload, user_id, created_at.
- Constraint esencial:
  - `ALTER TABLE public.profiles ADD CONSTRAINT profiles_email_key UNIQUE (email);`

## Integraciones y Servicios
- Angular (standalone, signals, i18n de componentes).
- Supabase JS v2: client, storage, canales de tiempo real, funciones RPC (diseño).
- Servicio Supabase:
  - getProfileByEmail, joinWaitingList, upsertProfileCompat, etc. [supabase.service.ts](file:///c:/DESARROLLO/DESARROLLO%20CON%20ELECTRON/software%20Libre%20de%20dj/26-11-25/webpresentacion/v2/src/app/core/integrations/supabase.service.ts)

## UX y Estilo
- Tema oscuro con bordes celestes al foco, transiciones fade/slide para progresión.
- Inputs con iconos y checks verdes al validar; interfaz limpia sin banners informativos intrusivos.
- Pantalla de éxito con iconografía simple, textos cortos y countdown visible.

## Validaciones y Estados
- Email: formato, duplicado en profiles; bloqueo de avance.
- Nombre: letras y espacios.
- Alias: caracteres permitidos y disponibilidad; feedback “verificando”.
- Botón Continuar: solo habilitado cuando los tres campos (email, nombre, alias) están validados.
- Estado de membresía: transición a ‘active’ dispara confeti; CTAs visibles; sin descarga.

## Métricas y Analítica
- Eventos: `waitlist_submit`, `membership_submit`, `receipt_upload`, `membership_status_change`, `email_sent`.
- KPI: tasa de conversión; % de estados activos; tiempo a verificación; errores de duplicado; clics en WhatsApp por nivel.

## Criterios de Aceptación
- Paso 1 muestra sólo Email; si no duplicado, aparecen Nombre y luego Alias con animación; Continuar se habilita sólo con los tres válidos.
- Éxito de waitlist muestra mensaje, countdown 10s y resetea limpio; no quedan timers activos.
- Estado de membresía sin botón de descarga; confeti al activar; botón de WhatsApp según nivel.
- Supabase impide duplicados por constraint; el cliente maneja conflictos actualizando perfiles existentes cuando corresponde.

## Plan de Lanzamiento
- Semana 1: refactor Paso 1 progresivo; duplicados; pruebas de validación.
- Semana 2: countdown 10s y auto‑reset; estado de solicitud y confeti; WhatsApp por nivel.
- Semana 3: hardening Supabase (constraints, fallbacks, funciones de email); pruebas E2E básicas.
- Semana 4: pulido UI/UX; métricas e instrumentación; revisión de accesibilidad.

## Riesgos y Mitigación
- Cambios de esquema: fallbacks y defensas en servicio; logs.
- Tiempo real intermitente: fallback a polling.
- Duplicados: constraints + recuperación segura; mensajes claros.
- UX móvil: pruebas en dispositivos; simplificación de animaciones si necesario.

## Suposiciones
- Disponibilidad de Supabase y storage.
- Enlaces de WhatsApp por nivel definidos externamente y configurables en componente de estado.
- Envíos de email vía funciones y cola (o servicio tercero) disponibles y con credenciales seguras.

## Anexos (Referencias de Código)
- Waitlist Form: [waitlist-form.component.ts](file:///c:/DESARROLLO/DESARROLLO%20CON%20ELECTRON/software%20Libre%20de%20dj/26-11-25/webpresentacion/v2/src/app/features/waitlist/infrastructure/ui/waitlist-form/waitlist-form.component.ts)
- Estado de Pago/Membresías: [payment-status.component.ts](file:///c:/DESARROLLO/DESARROLLO%20CON%20ELECTRON/software%20Libre%20de%20dj/26-11-25/webpresentacion/v2/src/app/features/memberships/track/payment-status.component.ts)
- Servicio Supabase: [supabase.service.ts](file:///c:/DESARROLLO/DESARROLLO%20CON%20ELECTRON/software%20Libre%20de%20dj/26-11-25/webpresentacion/v2/src/app/core/integrations/supabase.service.ts)
