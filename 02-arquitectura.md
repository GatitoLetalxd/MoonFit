# 🏗️ Arquitectura Técnica del Sistema — MoonFit

## 1. Visión General de la Arquitectura

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          APLICACIÓN WEB (CLIENTE)                           │
│     React 19 + TypeScript + Vite + Vanilla CSS Glassmorphism + Lucide UI    │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ HTTPS / JSON / FormData
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                             BACKEND (API REST)                              │
│         Node.js 24 + Express + TypeScript + Prisma ORM + JWT Auth           │
├──────────────────────────────────────┬──────────────────────────────────────┤
│  Módulos:                            │  Middlewares & Seguridad:            │
│  • auth (JWT + Refresh Tokens)       │  • authMiddleware (RBAC: USER/ADMIN) │
│  • users (Perfil & Onboarding)       │  • rateLimiter (Brute Force Defense) │
│  • routines & exercises (35 WebP)    │  • uploadMiddleware (Multer + MIME)  │
│  • workouts (Logs & Adherencia)      │  • errorHandler (Centralizado)       │
│  • progress (Peso & Fotos Privadas)  │  • requestLogger                     │
│  • nutrition (Comidas & Agua)        │                                      │
│  • goals & reminders                 │                                      │
│  • admin (Auditoría & Coaching)      │                                      │
└──────────────────┬───────────────────┴───────────────────┬──────────────────┘
                   │                                       │
                   ▼                                       ▼
┌──────────────────────────────────────┐ ┌────────────────────────────────────┐
│      BASE DE DATOS (PostgreSQL)      │ │   ALMACENAMIENTO DE ARCHIVOS       │
│   13 Modelos Relacionales (Prisma)   │ │  • Fotos de Progreso (UUID seguro) │
│   Índices & Borrado en Cascada       │ │  • Demos WebP Ejercicios (Public)  │
└──────────────────────────────────────┘ └────────────────────────────────────┘
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

## 3. Backend — API REST

- **Entorno:** Node.js 24 + Express + TypeScript.
- **ORM:** Prisma Client conectado a PostgreSQL.
- **Autenticación y Seguridad:**
  - **JWT de Acceso:** Corta duración (~15 min), transportado en cabecera `Authorization: Bearer <token>`.
  - **Refresh Tokens:** Larga duración (~30 días), almacenados con hash en la tabla `refresh_tokens` para soportar rotación continua e invalidación forzada.
  - **Rate Limiting:** Middleware `express-rate-limit` protegiendo rutas de autenticación.
  - **Hashing de Contraseñas:** `bcryptjs` con 10 rounds de salting.
  - **Roles y Permisos:** Control de acceso basado en roles (`USER` y `ADMIN`).
- **Arquitectura Modular (`backend/src/modules/`):**
  - `auth/` — Registro, login, refresh tokens, perfil y cambio administrativo de contraseñas.
  - `users/` — Gestión de usuarios, onboarding y borrado en cascada.
  - `routines/` — Gestión de rutinas, ejercicios y asignaciones.
  - `workouts/` — Registro y consulta de entrenamientos con duración y estado (`COMPLETADA` / `CANCELADA`).
  - `progress/` — Peso semanal, medidas corporales y streaming protegido de fotos.
  - `nutrition/` — Comidas, sensaciones corporales, fotos de platos y registro de agua.
  - `goals/` — Metas y objetivos corporales con estados.
  - `reminders/` — Configuración de alarmas y recordatorios.
  - `admin/` — Auditoría de usuarios, control de cuentas y feedback de coaching.

---

## 4. Gestión de Multimedia y Archivos

### 4.1 Demostraciones de Ejercicios (35 Archivos WebP)

- Archivos WebP animados y optimizados alojados en `frontend/public/exercises/`.
- Mapeo centralizado mediante `frontend/src/utils/exerciseMedia.ts` y metadatos biomecánicos en `frontend/src/utils/exerciseMetadata.ts`.
- Componente de renderizado optimizado `ExerciseDemo.tsx` con soporte para tamaños `lg`, `md`, `sm`, loaders skeleton y fallbacks.

### 4.2 Fotos de Progreso Privadas (Seguridad Estricta)

- Las imágenes subidas por los usuarios se guardan en el servidor (`uploads/progress/`) bajo nombres UUID únicos e impredecibles.
- **No se sirven de forma estática pública.**
- Se exponen exclusivamente a través del endpoint protegido `GET /api/progress/photos/:id/view`, que valida mediante el token JWT que el solicitante sea el dueño de la foto o un usuario con rol `ADMIN`.
- Carga fluida en el frontend mediante el hook `useAuthenticatedImage` que realiza peticiones Blob autenticadas y genera URLs seguras en memoria (`URL.createObjectURL`).

### 4.3 Optimización del Branding Oficial

- Archivo original `LogoApp.png` (2.97 MB) comprimido en un **98.6%**:
  - `logo.webp` (512x512, 42.4 KB) para splash, login, onboarding y modales.
  - `logo-sm.webp` (128x128, 6.8 KB) para navbar superior.
  - `favicon.png` (64x64, 8.9 KB) para icono de navegador y PWA.
  - `logo.png` (512x512, 353 KB) para fallback.

---

## 5. Base de Datos (PostgreSQL)

- Motor: PostgreSQL 16.
- Control de Esquema: Prisma ORM con migraciones automáticas (`prisma db push` / `prisma migrate`).
- Estructura: 13 tablas relacionales con claves foráneas, índices de búsqueda y políticas de eliminación en cascada (`onDelete: Cascade`).
- *(Consultar documento `03-modelo-datos.md` para el detalle completo de campos y tablas)*.

---

## 6. Despliegue e Infraestructura

- **Desarrollo Local:**
  - Backend: `npm run dev` (puerto 3000 con `tsx` / `ts-node-dev`).
  - Frontend: `npm run dev` (puerto 5173 con Vite).
  - PostgreSQL: Localhost en puerto 5432.
- **Producción (VPS Ubuntu):**
  - **Servidor Web / Reverse Proxy:** Nginx con terminación SSL (Certbot Let's Encrypt).
  - **Gestor de Procesos:** PM2 para el servicio Node.js.
  - **Compilación Frontend:** Bundle estático generado con `npm run build` servido directamente por Nginx o CDN.
  - **Seguridad:** Firewall UFW, acceso SSH por llaves Ed25519 y variables de entorno no versionadas en `.env`.

Credenciales:

Administrador: <rogeeromontufar@gmail.com> / 72091907 (o haz clic en el botón "Rellenar credenciales Admin" en la pantalla de login).
Usuario de Prueba Creado: <carlos.fit@moondev.online> / Password123! (o puedes registrar cualquier usuario nuevo y probar el onboarding).
