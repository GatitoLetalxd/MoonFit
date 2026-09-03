# 🏗️ Arquitectura Técnica del Sistema — MoonFit

## 1. Visión General de la Arquitectura

```
┌───────────────────────────────────────┐ ┌───────────────────────────────────────┐
│       APLICACIÓN WEB (CLIENTE)        │ │    APLICACIÓN MÓVIL (REACT NATIVE)    │
│  React 19 + Vite + Vanilla CSS Glass  │ │  Expo SDK 52/53 + Offline-First + APK │
└───────────────────┬───────────────────┘ └───────────────────┬───────────────────┘
                    │ HTTPS / JSON / FormData                 │ REST + Query Token Auth
                    └─────────────────────┬───────────────────┘
                                          ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                               BACKEND (API REST)                                │
│           Node.js 24 + Express + TypeScript + Prisma ORM + JWT Auth             │
├─────────────────────────────────────────┬───────────────────────────────────────┤
│  Módulos:                               │  Middlewares & Seguridad:             │
│  • auth (JWT + Refresh Tokens)          │  • authMiddleware (Bearer / ?token=)  │
│  • users (Perfil, Onboarding, Avatar)   │  • rateLimiter (Brute Force Defense)  │
│  • routines & exercises (35 WebP)       │  • uploadMiddleware (Multer + MIME)   │
│  • workouts (Logs, Historial, Metas)    │  • errorHandler (Centralizado)        │
│  • progress (Peso & Fotos Privadas)     │  • requestLogger                      │
│  • nutrition (Comidas & Agua)           │                                       │
│  • goals & reminders                    │                                       │
│  • admin (Auditoría, Supervisión Alumn) │                                       │
└───────────────────┬─────────────────────┴───────────────────┬───────────────────┘
                    │                                         │
                    ▼                                         ▼
┌─────────────────────────────────────────┐ ┌─────────────────────────────────────┐
│       BASE DE DATOS (PostgreSQL)        │ │     ALMACENAMIENTO DE ARCHIVOS      │
│    13 Modelos Relacionales (Prisma)     │ │  • Fotos de Progreso (UUID seguro)  │
│    Índices & Borrado en Cascada         │ │  • Fotos de Comidas (UUID seguro)   │
│                                         │ │  • Fotos de Perfil / Avatares       │
│                                         │ │  • Demos WebP Ejercicios (Public)   │
└─────────────────────────────────────────┘ └─────────────────────────────────────┘
```

---

## 2. Frontend — Aplicación Web

- **Framework:** React 19 con TypeScript sobre Vite 8 (Ultra-rápido, Hot Module Reload y builds en < 800ms).
- **Sistema de Diseño:** *Dark Luxury Glassmorphism* en Vanilla CSS (`frontend/src/index.css`), estructurado con variables semánticas HSL, efectos de desenfoque (`backdrop-filter`), animaciones fluidas y microinteracciones.
- **Iconografía:** `lucide-react`.
- **Efectos y Celebraciones:** `canvas-confetti` para hitos de metas y culminación de rutinas.
- **Módulos y Vistas Principales:**
  - **Autenticación:** Iniciar Sesión (`LoginPage`) y Crear Cuenta (`RegisterPage`) con branding oficial de MoonFit.
  - **Onboarding:** Asistente paso a paso (`OnboardingPage`) de 4 etapas para configuración inicial y cálculo de metas.
  - **Dashboard:** Métricas principales, racha activa (*Streaks 🔥*), rutina recomendada del día y acceso rápido.
  - **Rutinas:**
    - Catálogo categorizado con filtros por objetivo.
    - Previsualización completa (`RoutineDetailModal`) con 35 animaciones WebP, tiempos y requerimientos caseros.
    - Reproductor interactivo (`WorkoutPlayer`) con cronómetro automático, soporte isométrico, descansos, sonidos `beep` y tips de postura biomecánica en español.
    - Historial de entrenamientos con desglose de sesiones completadas vs canceladas.
    - Creador y editor de rutinas personalizadas.
  - **Progreso Físico:**
    - Gráfica interactiva de evolución de peso semanal (`WeightChart`).
    - Visor seguro de fotos de progreso privadas.
    - Comparador visual de fotos *Antes / Después* (Modo Lado a Lado y Modo Deslizador Split-view).
    - Registro de peso semanal con validación de una entrada por semana y medidas corporales opcionales.
  - **Nutrición & Agua:**
    - Registro rápido de comidas en 3 clics con selección de sensaciones corporales y subida de foto.
    - Contador y barra de progreso de consumo de agua diaria (meta orientativa 2200 ml con botones de adición rápida).
  - **Metas & Recordatorios:** Monitoreo porcentual de objetivos corporales y administración de alarmas.
  - **Panel de Administración (`/admin`):**
    - Listado y búsqueda avanzada de usuarios con métricas globales.
    - Detalle de usuario (`AdminUserDetailPage`) con auditoría de adherencia de entrenamientos, visor autenticado de fotos, historial de comidas y envío de mensajes de coaching.
    - Cambio de contraseñas de usuarios y activación/desactivación de cuentas.

---

## 3. Aplicación Móvil Nativa (`mobile/`)

- **Framework:** React Native 0.76+ con Expo SDK 52/53 y TypeScript.
- **Compilación Nativa:** Gradle Release (`./gradlew.bat assembleRelease`) produciendo binario APK optimizado autónomo.
- **Arquitectura Offline-First:**
  - **Persistencia Local:** `AsyncStorage` como base de datos local y almacenamiento de tokens/perfil.
  - **Cola de Sincronización:** `offlineStorage.ts` almacena operaciones pendientes (agua, comidas, pesos, entrenamientos) y las sincroniza en segundo plano al restablecer la conexión (`SyncContext.tsx`).
  - **Indicador de Estado:** `SyncBadge.tsx` en cabecera con aviso temporal y colapsado automático a icono minimalista tras 1 segundo.
  - **Sincronización Multitab:** `useFocusEffect` en Inicio y Nutrición para refrescar instantáneamente consumos de agua basados en la fecha local.
- **Módulos Nativos del Dispositivo:**
  - **Área Segura:** `react-native-safe-area-context` protege cabeceras y pestañas contra bordes redondeados, notch y barras de gestos Android/iOS.
  - **Splash Screen:** Configuración nativa para Android 12+ en `Theme.App.SplashScreen` (fondo `#0B0F17`) eliminando la pantalla blanca de arranque.
  - **Notificaciones Locales:** `expo-notifications` para recordatorios programados en segundo plano (`DAILY` y `WEEKLY`) sin necesidad de servidores push externos.
  - **Galería del Teléfono:** `expo-media-library` y `expo-file-system/legacy` para descargar y guardar fotos en el carrete del usuario con control de permisos nativos (`READ_MEDIA_IMAGES`).
- **Estructura de Vistas Móviles:**
  - `screens/auth/`: `LoginScreen`, `RegisterScreen` (con visibilidad de contraseña `Eye`/`EyeOff` y prevención de solapamiento de teclado).
  - `screens/onboarding/`: `OnboardingScreen` (wizard interactivo de 4 pasos).
  - `screens/main/`:
    - `DashboardScreen`: Resumen diario, racha, hidratación sincronizada, inspiración del día y acceso a rutinas.
    - `RoutinesScreen`: Catálogo de rutinas, previsualizador y acceso al historial.
    - `WorkoutPlayerScreen`: Reproductor inmersivo guiado con animaciones WebP locales, cronómetros y sonidos.
    - `WorkoutHistoryScreen`: Historial completo con filtros por estado/tipo, métricas acumuladas y repetición directa.
    - `ProgressScreen`: Peso semanal, galería de fotos con visor modal y botón para guardar en galería.
    - `NutritionScreen`: Registro de comidas con foto, miniatura en historial, visor ampliado y control de agua.
    - `ProfileScreen`: Datos biométricos, selector interactivo de recordatorios (día y hora) y acceso a panel admin.
  - `screens/admin/`:
    - `AdminUsersScreen`: Buscador de alumnos con avatar, fecha, estado y contadores de actividad.
    - `AdminUserDetailScreen`: Supervisión total de alumno (ficha biométrica, rutinas, fotos de progreso con descarga en galería, fotos de comidas con descarga en galería, pesajes y feedback de coaching).

---

## 4. Backend — API REST

- **Entorno:** Node.js 24 + Express + TypeScript.
- **ORM:** Prisma Client conectado a PostgreSQL.
- **Autenticación y Seguridad:**
  - **JWT de Acceso:** Corta duración (~15 min), transportado en cabecera `Authorization: Bearer <token>` o en parámetro de consulta `?token=` (indispensable para peticiones directas de `<Image>` en React Native Android).
  - **Refresh Tokens:** Larga duración (~30 días), almacenados con hash en la tabla `refresh_tokens` para soportar rotación continua e invalidación forzada.
  - **Rate Limiting:** Middleware `express-rate-limit` protegiendo rutas de autenticación.
  - **Hashing de Contraseñas:** `bcryptjs` con 10 rounds de salting.
  - **Roles y Permisos:** Control de acceso basado en roles (`USER` y `ADMIN`).
- **Arquitectura Modular (`backend/src/modules/`):**
  - `auth/` — Registro, login, refresh tokens, perfil y cambio administrativo de contraseñas.
  - `users/` — Gestión de usuarios, onboarding, subida/consulta de avatares y borrado en cascada.
  - `routines/` — Gestión de rutinas, ejercicios y asignaciones.
  - `workouts/` — Registro y consulta de entrenamientos con duración y estado (`COMPLETADA` / `CANCELADA`).
  - `progress/` — Peso semanal, medidas corporales y streaming protegido de fotos.
  - `nutrition/` — Comidas, sensaciones corporales, fotos de platos y registro de agua.
  - `goals/` — Metas y objetivos corporales con estados.
  - `reminders/` — Configuración de alarmas y recordatorios.
  - `admin/` — Listado de alumnos con avatares, detalle exhaustivo, auditoría y feedback de coaching.

---

## 5. Gestión de Multimedia y Archivos

### 5.1 Demostraciones de Ejercicios (35 Archivos WebP)
- Archivos WebP animados y optimizados alojados en `frontend/public/exercises/` y `mobile/assets/exercises/`.
- Mapeo centralizado de archivos y metadatos biomecánicos en TypeScript.
- Carga fluida tanto en web como en dispositivos móviles offline.

### 5.2 Fotos de Progreso Privadas y Comidas (Seguridad Estricta)
- Las imágenes subidas por los usuarios se guardan en el servidor (`uploads/progress/` y `uploads/meals/`) bajo nombres UUID únicos e impredecibles.
- **No se sirven de forma estática pública.**
- Se exponen exclusivamente a través de endpoints protegidos (`/api/progress/photos/:id/view` y `/api/nutrition/meals/photos/:id/view`), que verifican que el solicitante sea el dueño de la imagen o un usuario con rol `ADMIN`.
- Soporte dual de autenticación: cabecera `Authorization` (Web fetch/blob) y parámetro `?token=` (React Native Image tag).

### 5.3 Optimización del Branding Oficial
- Archivo original `LogoApp.png` (2.97 MB) comprimido en un **98.6%**:
  - `logo.webp` (512x512, 42.4 KB) para splash, login, onboarding y modales.
  - `logo-sm.webp` (128x128, 6.8 KB) para navbar superior.
  - `favicon.png` (64x64, 8.9 KB) para icono de navegador y PWA.
  - `logo.png` (512x512, 353 KB) para fallback.

---

## 6. Base de Datos (PostgreSQL)

- Motor: PostgreSQL 16.
- Control de Esquema: Prisma ORM con migraciones automáticas (`prisma db push` / `prisma migrate`).
- Estructura: 13 tablas relacionales con claves foráneas, índices de búsqueda y políticas de eliminación en cascada (`onDelete: Cascade`).
- *(Consultar documento `03-modelo-datos.md` para el detalle completo de campos y tablas)*.

---

## 7. Despliegue e Infraestructura

- **Desarrollo Local:**
  - Backend: `npm run dev` (puerto 3000 con `tsx`).
  - Frontend: `npm run dev` (puerto 5173 con Vite).
  - Mobile Metro: `npx expo start` (puerto 8081).
  - PostgreSQL: Localhost en puerto 5432.
- **Producción (VPS Ubuntu):**
  - **Servidor Web / Reverse Proxy:** Nginx con terminación SSL (Certbot Let's Encrypt).
  - **Gestor de Procesos:** PM2 para el servicio Node.js.
  - **Compilación Frontend:** Bundle estático generado con `npm run build` servido por Nginx.
  - **Compilación Mobile:** APK generado con `./gradlew assembleRelease`.

---

## 8. Credenciales del Sistema

- **Administrador / Coach:** `rogeeromontufar@gmail.com` / `72091907`
- **Usuario de Prueba:** `carlos.fit@moondev.online` / `Password123!` (o cualquier usuario nuevo registrado).

