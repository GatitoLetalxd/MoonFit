<div align="center">

  <img src="frontend/public/logo.webp" alt="MoonFit Logo" width="120" height="120" style="border-radius: 28px; box-shadow: 0 0 35px rgba(6, 182, 212, 0.45);" />

  # 🌙 MoonFit
  ### *Transforma tu cuerpo y hábitos desde casa — Sin equipamiento costoso.*

  [![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
  [![React Native](https://img.shields.io/badge/React_Native-0.76-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactnative.dev/)
  [![Expo](https://img.shields.io/badge/Expo-SDK_52-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
  [![Vite](https://img.shields.io/badge/Vite-8.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-24.11-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
  [![Prisma](https://img.shields.io/badge/Prisma-6.4-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)

  <p align="center">
    <strong>Plataforma fitness integral multiplataforma (Web & Móvil Android APK)</strong> con reproductor interactivo de rutinas guiadas, 35 demostraciones animadas WebP, historial completo de entrenamientos sincronizado, registro de comidas por hábitos, control diario de agua en tiempo real, fotos privadas con visor en alta resolución y descarga en galería, y panel de administración para la supervisión y coaching de alumnos.
  </p>

</div>

---

## 🌟 Características Principales

### 🏋️‍♂️ 1. Rutinas Guiadas, 35 Animaciones WebP & Historial Completo
- **Catálogo Inteligente:** Rutinas predefinidas por objetivos (*Fuerza, Glúteos & Piernas, Cardio HIIT, Core, Tren Superior y Full Body*).
- **35 Animaciones WebP Integradas:** Videos en bucle optimizados para cada ejercicio con técnica biomecánica y tips posturales.
- **Modal de Previsualización:** Muestra duración estimada, calorías calculadas, equipo casero necesario y desglose de ejercicios antes de empezar.
- **Reproductor Interactivo (`WorkoutPlayer`):**
  - Conteo regresivo automático para ejercicios de tiempo e isometría.
  - Temporizador de descanso configurable (+30s / -10s) con alerta sonora `beep` en los últimos 3 segundos.
  - Desplegable interactivo: *"💡 Ver Técnica y Tips de Postura"* en español.
  - Pantalla de celebración con cálculo de calorías quemadas y botón para compartir logros en redes sociales.
- **Historial Completo de Entrenamientos (`WorkoutHistoryScreen`):**
  - KPIs globales: Conteo de sesiones completadas, minutos totales entrenando y sesiones registradas.
  - Filtros reactivos por estado (`Todos`, `Completadas`, `Canceladas`) y por tipo (`Fuerza`, `HIIT`, `Core`, `Cardio`).
  - Tarjetas detalladas con duración exacta (`⏱️`), conteo de ejercicios completados (`💪 X/Y ej.`) y botón para repetir la rutina al instante.
- **Sistema de Rachas (*Streaks 🔥*):** Contador de días consecutivos entrenando.

---

### 📸 2. Progreso Físico, Fotos Privadas y Descarga en Galería
- **Gráfica de Evolución de Peso (`WeightChart`):** Trazado semanal interactivo con comparativa frente al peso inicial y la meta deseada.
- **Registro Semanal Único:** Validación estricta de una sola medición por semana (lunes a domingo con actualización del valor más reciente).
- **Fotos de Progreso con Streaming Autenticado:**
  - Archivos guardados bajo nombres UUID no predecibles.
  - **Sin URLs públicas:** Accesibles únicamente mediante verificación de token JWT del propietario o del administrador.
  - Compatibilidad dual: cabecera `Authorization` para Web y parámetro seguro `?token=` para el pipeline nativo de Android.
- **Visor en Pantalla Completa & Guardado en Galería:**
  - Apertura táctil en alta resolución con fecha.
  - Botón directo para **"Guardar Foto en Mi Galería"** del teléfono mediante `expo-media-library`.
- **Comparador Visual *Antes y Después* (Web):** Modo lado a lado y modo deslizador *Split-view* interactivo.

---

### 🥗 3. Nutrición en 3 Clics & Control de Agua Sincronizado
- **Registro Rápido sin Obsesión Calórica:**
  - Selección de tipo de comida (🍳 Desayuno, 🥗 Almuerzo, 🍲 Cena, 🍎 Snack).
  - Selector de **Sensaciones Corporales** (🌱 *Ligera y con energía*, 🥗 *Satisfecha*, ⚡ *Fuerte*, 🥱 *Pesada*).
  - Subida de foto del plato y notas libres.
- **Historial de Comidas:** Miniaturas nítidas, visor modal ampliado y botón para guardar la foto del plato en la galería.
- **Control de Agua Diario Sincronizado:**
  - Barra de progreso con meta orientativa (2200 ml / día) e incrementos rápidos (+250 ml, +500 ml).
  - **Sincronización instantánea multitab**: `useFocusEffect` mantiene idéntico el registro entre Inicio y Nutrición usando la fecha local.

---

### 🛡️ 4. Panel de Administración & Supervisión de Alumnos (Web & Móvil)
- **Acceso Inteligente Condicional:** Tarjeta de supervisión visible en Inicio y Perfil únicamente para cuentas con rol `ADMIN`.
- **Listado de Alumnos (`AdminUsersScreen`):**
  - Buscador en tiempo real por nombre o correo electrónico.
  - Tarjetas de alumnos con foto de perfil / avatar, fecha de ingreso, estado (`ACTIVO` / `INACTIVO`) y contadores rápidos:
    - 🏋️ Rutinas realizadas
    - 📸 Fotos de progreso
    - 🥗 Comidas registradas
    - ⚖️ Pesajes semanales
- **Detalle y Progreso Integral del Alumno (`AdminUserDetailScreen`):**
  - Ficha biométrica con estatura, peso inicial, edad e IMC estimado.
  - **Pestaña Rutinas:** Auditoría completa de entrenamientos realizados por el alumno con tiempos y ejercicios.
  - **Pestaña Fotos de Progreso:** Galería de evolución física con visor a pantalla completa y botón de guardado en la galería.
  - **Pestaña Comidas:** Historial de platos del alumno con miniaturas, notas y visor con guardado en galería.
  - **Pestaña Pesajes:** Historial semanal de peso con delta comparativo vs peso inicial.
  - **💬 Feedback Directo:** Envío de recomendaciones de entrenamiento y nutrición que el alumno visualiza en su dashboard.

---

### 📱 5. App Móvil Nativa (Android APK)
- **Modo Offline-First:** Persistencia en `AsyncStorage`, cola de sincronización de fondo con reintentos automáticos e indicador colapsable en cabecera (`SyncBadge`).
- **Adaptación Total de Pantalla:** Safe Area Insets con protección de barra de estado, cámaras frontales (punch-hole) y barras de navegación del sistema.
- **Splash Screen Nativo Oscuro:** Configuración nativa en Android 12+ (`Theme.App.SplashScreen`, fondo `#0B0F17`) sin pantallas blancas de arranque.
- **Recordatorios Nativos:** Notificaciones locales programadas en segundo plano (`DAILY` para agua y rutinas, `WEEKLY` con selector de día de la semana para pesajes).

---

## 🏛️ Arquitectura del Proyecto

```
MoonFit/
├── backend/                  # Servidor API REST (Node.js, Express, TypeScript, Prisma)
│   ├── prisma/
│   │   └── schema.prisma     # Esquema de base de datos relacional (13 modelos)
│   ├── src/
│   │   ├── config/           # Variables de entorno y conexión a DB
│   │   ├── middlewares/      # Auth JWT (Bearer y ?token=), RBAC, Upload, Rate Limit
│   │   ├── modules/          # auth, users, routines, workouts, progress, nutrition, goals, admin
│   │   ├── utils/            # JWT, bcrypt, logger
│   │   └── server.ts         # Punto de entrada Express
│   └── uploads/              # Almacenamiento seguro de fotos privadas
│
├── mobile/                   # Aplicación Móvil Nativa (React Native, Expo SDK 52/53, TypeScript)
│   ├── assets/               # Demos WebP locales, iconos adaptativos y splash
│   ├── src/
│   │   ├── api/              # Cliente Axios con interceptor seguro y servicios tipados
│   │   ├── components/       # Header, SyncBadge, WorkoutPlayer, RoutineDetailModal
│   │   ├── context/          # AuthContext, NotificationContext, SyncContext
│   │   ├── navigation/       # RootNavigator, MainTabNavigator (Safe Area integrado)
│   │   ├── screens/
│   │   │   ├── auth/         # LoginScreen, RegisterScreen (con botón de visibilidad de contraseña)
│   │   │   ├── onboarding/   # OnboardingScreen (Wizard de 4 pasos)
│   │   │   ├── main/         # Dashboard, Routines, WorkoutPlayer, WorkoutHistory, Progress, Nutrition, Profile
│   │   │   └── admin/        # AdminUsersScreen, AdminUserDetailScreen
│   │   ├── theme/            # Tokens Dark Luxury Glassmorphism
│   │   ├── types/            # Tipos e interfaces globales TypeScript
│   │   └── utils/            # offlineStorage, notifications, motivationQuotes
│   └── android/              # Configuración nativa Gradle para generación de APK de Release
│
├── frontend/                 # Aplicación Web SPA (React 19, TypeScript, Vite 8)
│   ├── public/exercises/     # 35 archivos WebP animados de demostración
│   └── src/pages/            # user (Dashboard, Routines...), admin (Users, UserDetail...)
│
├── 01-requerimientos.md      # Matriz exhaustiva de requerimientos del sistema
├── 02-arquitectura.md        # Documento detallado de arquitectura técnica multiplataforma
├── 03-modelo-datos.md        # Especificación técnica de las 13 tablas relacionales
├── 04-despliegue-produccion.md # Guía de despliegue en VPS Ubuntu y generación de APK
└── README.md                 # Documentación principal del repositorio
```

---

## 💻 Stack Tecnológico

| Capa | Tecnología | Propósito |
| :--- | :--- | :--- |
| **App Móvil** | React Native 0.76 + Expo SDK 52/53 + TypeScript | Aplicación nativa Android autónoma compilada en APK |
| **Persistencia Móvil**| AsyncStorage + Offline Sync Queue | Operación completa sin internet y sincronización en reconexión |
| **Frontend Web** | React 19 + TypeScript + Vite 8 | Interfaz SPA reactiva de ultra-alta velocidad |
| **Estilos & UI** | Vanilla CSS Glassmorphism / React Native Stylesheet | Sistema de diseño atlético oscuro de alta gama (*Dark Luxury*) |
| **Backend** | Node.js 24 + Express + TypeScript | API REST modular, segura y fuertemente tipada |
| **Base de Datos** | PostgreSQL 16 + Prisma ORM | Almacenamiento relacional con integridad referencial |
| **Seguridad** | JWT + Refresh Tokens rotativos + bcryptjs | Sesiones protegidas y rate limiting contra fuerza bruta |
| **Multimedia** | WebP animados + Multer con streaming autenticado | Demos de ejercicios y fotos privadas sin exposición pública |

---

## 🚀 Guía de Instalación y Ejecución Local

### Prerrequisitos
- **Node.js** 20+ (recomendado Node.js 24)
- **PostgreSQL** 15+ activo en `localhost:5432`
- **npm** o **pnpm**
- **Android SDK & Java 17** (para compilar el APK nativo en local)

---

### 1. Clonar el Repositorio
```bash
git clone https://github.com/GatitoLetalxd/MoonFit.git
cd MoonFit
```

---

### 2. Configurar y Arrancar el Backend
```bash
cd backend
npm install
```
Crea un archivo `.env` en la raíz de `backend/`:
```env
PORT=3000
DATABASE_URL="postgresql://postgres:1234@localhost:5432/moonfit_db?schema=public"
JWT_SECRET="moonfit_super_secret_access_jwt_key_2026"
JWT_REFRESH_SECRET="moonfit_super_secret_refresh_jwt_key_2026"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="30d"
UPLOAD_DIR="./uploads"
ADMIN_INITIAL_PASSWORD="TU_PASSWORD_ADMIN"
```
Ejecuta las migraciones y arranca:
```bash
npx prisma db push
npm run dev
```
> El backend estará corriendo en `http://localhost:3000`.

---

### 3. Configurar y Arrancar la Aplicación Móvil (`mobile/`)
En una nueva terminal:
```bash
cd mobile
npm install
```
Crea o verifica `mobile/.env`:
```env
EXPO_PUBLIC_API_URL="http://TU_IP_LOCAL:3000/api"
```
Para iniciar el servidor de desarrollo Metro:
```bash
npx expo start
```
Para compilar el **APK de Release para Android**:
```bash
cd android
./gradlew.bat assembleRelease
```
> El archivo APK listo para instalar en teléfonos físicos se generará en:  
> `mobile/android/app/build/outputs/apk/release/app-release.apk`

---

### 4. Configurar el Frontend Web
En una nueva terminal:
```bash
cd frontend
npm install
npm run dev
```
> La aplicación web estará disponible en `http://localhost:5173`.

---

## 🔑 Credenciales del Sistema

### 👑 Cuenta Administrador / Coach
- **Correo:** `rogeeromontufar@gmail.com`
- **Contraseña:** `72091907`
- **Rol:** `ADMIN`

### 👤 Cuenta de Alumno / Usuario de Prueba
- **Correo:** `carlos.fit@moondev.online`
- **Contraseña:** `Password123!`
- *(O puedes registrar cualquier usuario nuevo y realizar el onboarding)*.

---

## 📡 Referencia de Endpoints Principales (API REST)

| Método | Endpoint | Acceso | Descripción |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Público | Registro de nuevo usuario |
| `POST` | `/api/auth/login` | Público | Inicio de sesión (Retorna Access + Refresh Tokens) |
| `POST` | `/api/auth/refresh` | Público | Rotación de Refresh Token |
| `GET` | `/api/users/profile` | Autenticado | Perfil biométrico del usuario |
| `PUT` | `/api/users/onboarding` | Autenticado | Completar wizard inicial |
| `POST` | `/api/users/avatar` | Autenticado | Subida de foto de perfil |
| `GET` | `/api/users/:id/avatar` | Público / Token | Obtener avatar de perfil con caché |
| `GET` | `/api/routines` | Autenticado | Catálogo de rutinas predefinidas y propias |
| `POST` | `/api/routines` | Autenticado | Crear rutina personalizada |
| `POST` | `/api/workouts` | Autenticado | Registrar sesión completada o cancelada con duración |
| `GET` | `/api/workouts?limit=50` | Autenticado | Historial completo de entrenamientos |
| `GET` | `/api/progress/weight` | Autenticado | Historial semanal de peso |
| `POST` | `/api/progress/weight` | Autenticado | Registrar peso de la semana actual |
| `POST` | `/api/progress/photos` | Autenticado | Subir foto de progreso privada |
| `GET` | `/api/progress/photos/:id/view` | Propietario / Admin | **Streaming seguro de foto de evolución (soporta ?token=)** |
| `GET` | `/api/nutrition/meals` | Autenticado | Historial de comidas registradas |
| `POST` | `/api/nutrition/meals` | Autenticado | Registro rápido de comida con foto opcional |
| `GET` | `/api/nutrition/meals/photos/:id/view`| Propietario / Admin | **Streaming seguro de foto de comida (soporta ?token=)** |
| `POST` | `/api/nutrition/water` | Autenticado | Registro de consumo de agua diario |
| `GET` | `/api/admin/users` | Solo ADMIN | Listado de alumnos con avatares y métricas |
| `GET` | `/api/admin/users/:id` | Solo ADMIN | Detalle integral del alumno (rutinas, fotos, comidas, pesajes) |
| `POST` | `/api/admin/feedback` | Solo ADMIN | Envío de feedback y coaching directo al alumno |

---

## 📱 Estado del Roadmap
- [x] **Fase 1 (Completada):** Plataforma web responsive SPA con backend modular, PostgreSQL y diseño Dark Glassmorphism.
- [x] **Fase 2 (Completada):** Aplicación móvil nativa **React Native + Expo**, soporte Offline-First, historial completo de entrenamientos, visores de fotos en alta resolución con guardado en galería, panel de supervisión de alumnos para el Administrador y generación exitosa del APK de Release.

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo `LICENSE` para más detalles.

---

<div align="center">
  Hecho con pasión por el equipo de <strong>MoonFit</strong> • <i>Fitness para todos desde casa</i>.
</div>

