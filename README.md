# FLOWMIX v2 - Proyecto Angular 21

> **Refactorización Completa: Vertical Slicing + Arquitectura Hexagonal + Screaming Architecture**

## 🚀 Inicio Rápido

### Instalación

```bash
npm install
```

### Desarrollo

```bash
npm start
# Abre http://localhost:4200
```

### Compilar Producción

```bash
npm run build:prod
```

## 📂 Estructura del Proyecto

Véase [ARCHITECTURE.md](ARCHITECTURE.md) para documentación detallada.

## 🎯 Características Clave

✅ **Vertical Slicing**: Cada feature es autónoma  
✅ **Arquitectura Hexagonal**: Domain, Application, Infrastructure  
✅ **Screaming Architecture**: Nombres de archivos que explican qué hace el sistema  
✅ **Angular 21 Signals**: Reactividad moderna sin RxJS innecesario  
✅ **Componentes Standalone**: Modularidad y composición  
✅ **Tailwind CSS**: Glassmorphism + Neon Effects  
✅ **Bilingüismo**: Soporte EN/ES con i18nService  
✅ **Dark Mode**: Tema oscuro completo

## 📦 Slices Implementados

1. **Waitlist** - Registro en lista de espera + Ranking
2. **Hall of Fame** - Muro de colaboradores
3. **Social Pulse** - Feed de redes sociales

## 🛠️ Stack Técnico

- **Angular 21**
- **TypeScript 5.4+**
- **Tailwind CSS 3.4**
- **Angular Signals (Reactive)**
- **Standalone Components**

## ⚙️ Configuración de Supabase

Este proyecto se integra con Supabase para la persistencia de datos. La configuración se gestiona dinámicamente en el cliente a través de `localStorage` para evitar exponer claves en el código fuente.

Para configurar la conexión:

1.  Inicia la aplicación (`npm start`).
2.  Ve a la sección de configuración en la interfaz de la aplicación.
3.  Introduce la **URL** y la **Anon Key** de tu proyecto de Supabase.
4.  Guarda los cambios.

La aplicación almacenará estas claves de forma segura en `localStorage` bajo los siguientes nombres:
-   `sb_url`: La URL de tu instancia de Supabase.
-   `sb_anon`: La clave anónima (pública) de tu proyecto.

El `SupabaseService` leerá automáticamente estos valores para inicializar el cliente de Supabase.

## 👤 Autor

**Senior Software Architect**  
Especializado en Angular, Arquitectura Limpia y Patrones DDD

---

Última actualización: Enero 2026
