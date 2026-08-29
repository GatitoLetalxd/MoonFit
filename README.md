<div align="center">

  <img src="frontend/public/logo.webp" alt="MoonFit Logo" width="120" height="120" style="border-radius: 28px; box-shadow: 0 0 35px rgba(6, 182, 212, 0.45);" />

  # 🌙 MoonFit
  ### *Transforma tu cuerpo y hábitos desde casa — Sin equipamiento costoso.*

  [![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
  [![Vite](https://img.shields.io/badge/Vite-8.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-24.11-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
  [![Express](https://img.shields.io/badge/Express-4.21-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
  [![Prisma](https://img.shields.io/badge/Prisma-6.4-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)

  <p align="center">
    <strong>Plataforma web fitness de alto rendimiento</strong> con reproductor interactivo de rutinas guiadas, 35 demostraciones animadas WebP, registro de comidas por hábitos, control diario de agua, comparador de progreso con fotos privadas protegidas y panel de administración con auditoría de adherencia.
  </p>

</div>

---

## 🌟 Características Principales

### 🏋️‍♂️ 1. Rutinas Guiadas & 35 Demostraciones Animadas WebP
- **Catálogo Inteligente:** Rutinas predefinidas por objetivos (*Fuerza, Glúteos & Piernas, Cardio HIIT, Core, Tren Superior y Full Body*).
- **35 Animaciones WebP Integradas:** Videos en bucle optimizados para cada ejercicio con técnica biomecánica.
- **Modal de Previsualización:** Muestra duración estimada, calorías calculadas, equipo casero necesario y desglose de ejercicios antes de empezar.
- **Reproductor Interactivo (`WorkoutPlayer`):**
  - Conteo regresivo automático para ejercicios de tiempo e isometría.
  - Temporizador de descanso configurable (+30s / -10s) con alerta sonora `beep` en los últimos 3 segundos.
  - Desplegable interactivo: *"💡 Ver Técnica y Tips de Postura"* en español.
  - Pantalla de celebración con cálculo de calorías quemadas y botón para compartir logros en WhatsApp o Instagram Stories.
- **Historial Completo de Entrenamientos:** Registro detallado de sesiones **COMPLETADAS** y **CANCELADAS** con duración exacta y desglose de ejercicios.
- **Sistema de Rachas (*Streaks 🔥*):** Contador de días consecutivos entrenando.

---

### 📸 2. Progreso Físico, Fotos Privadas y Comparador
- **Gráfica de Evolución de Peso (`WeightChart`):** Trazado semanal interactivo con comparativa frente al peso inicial y la meta deseada.
- **Registro Semanal Único:** Validación estricta de una sola medición por semana (lunes a domingo con actualización del valor más reciente).
- **Fotos de Progreso con Streaming Autenticado:**
  - Archivos guardados bajo nombres UUID no predecibles.
  - **Sin URLs públicas:** Solo accesibles mediante verificación de token JWT del usuario propietario o del administrador (`GET /api/progress/photos/:id/view`).
- **Comparador Visual *Antes y Después*:**
  - Modo *Lado a Lado* con selección flexible de fechas.
  - Modo *Deslizador Split-view* interactivo para comparar cambios corporales.
- **Medidas Corporales Opcionales:** Cintura (cm), brazo (cm) y almacenamiento JSON extensible.

---

### 🥗 3. Nutrición en 3 Clics & Control de Agua
- **Registro Rápido sin Obsesión Calórica:**
  - Selección de tipo de comida (🍳 Desayuno, 🥗 Almuerzo, 🍲 Cena, 🍎 Snack).
  - Selector de **Sensaciones Corporales** (🌱 *Ligera y con energía*, 🥗 *Satisfecha*, ⚡ *Fuerte*, 🥱 *Pesada*).
  - Subida opcional de foto del plato y notas.
- **Control de Agua Diario:**
  - Barra de progreso con meta orientativa (2200 ml / día).
  - Botones de adición rápida (+250 ml vaso, +500 ml botella).

---

### 🛡️ 4. Panel de Administración & Coaching
- **Listado y Búsqueda de Usuarios:** Filtros por estado, métricas y acceso rápido.
- **Vista de Detalle por Usuario:**
  - Resumen biométrico y metas activas.
  - Auditoría de entrenamientos: KPIs de *Total Sesiones*, *Completadas*, *Canceladas*, *Tasa de Finalización %* y desglose de cada entrenamiento.
  - Visor autenticado de fotos de progreso y registro de comidas.
  - Gestión de credenciales: **Cambio directo de contraseña** sin depender de servidores SMTP.
  - Activación, desactivación y eliminación de cuentas con borrado en cascada.
- **Módulo de Feedback / Coaching:** Envío directo de notas de apoyo y consejos al usuario con historial.

---

### 🎨 5. Diseño Premium *Dark Luxury Glassmorphism*
- Paleta semántica HSL, contrastes nítidos, efectos `backdrop-filter` y microanimaciones fluidas.
- Logo oficial optimizado en formatos WebP (512x512 y 128x128) con reducción del **98.6%** sobre el archivo original.

---

## 🏛️ Arquitectura del Proyecto

```
MoonFit/
├── backend/                  # Servidor API REST (Node.js, Express, TypeScript, Prisma)
│   ├── prisma/
│   │   └── schema.prisma     # Esquema de base de datos (13 modelos)
│   ├── src/
│   │   ├── config/           # Variables de entorno y configuración
│   │   ├── middlewares/      # Auth JWT, RBAC, Upload Multer, Rate Limiting
│   │   ├── modules/          # Módulos: auth, users, routines, workouts,
│   │   │                     # progress, nutrition, goals, reminders, admin
│   │   ├── utils/            # JWT, bcrypt, logger
│   │   └── server.ts         # Punto de entrada Express
│   └── uploads/              # Almacenamiento seguro de fotos privadas
│
├── frontend/                 # Aplicación Web SPA (React 19, TypeScript, Vite 8)
│   ├── public/
│   │   ├── exercises/        # 35 archivos WebP animados de demostración
│   │   ├── logo.webp         # Logo oficial optimizado (512x512)
│   │   ├── logo-sm.webp      # Logo para navbar (128x128)
│   │   └── favicon.png       # Favicon del navegador (64x64)
│   └── src/
│       ├── api/              # Cliente Axios y servicios tipados
│       ├── components/       # Componentes: routines, progress, nutrition, layout, common
│       ├── context/          # AuthContext, NotificationContext
│       ├── pages/            # user (Dashboard, Routines, Progress, Nutrition, Profile...)
│       │                     # admin (Users, UserDetail, Assignments...)
│       │                     # auth (Login, Register), onboarding (Wizard 4 pasos)
│       ├── utils/            # exerciseMedia, exerciseMetadata, useAuthImage
│       └── index.css         # Design System Glassmorphism
│
├── 01-requerimientos.md      # Matriz de requerimientos y estado de implementación
├── 02-arquitectura.md        # Documento detallado de arquitectura técnica
├── 03-modelo-datos.md        # Documentación de las 13 tablas relacionales
└── README.md                 # Documentación principal del repositorio
```

---

## 💻 Stack Tecnológico

| Capa | Tecnología | Propósito |
| :--- | :--- | :--- |
| **Frontend** | React 19 + TypeScript + Vite 8 | Interfaz SPA reactiva de alta velocidad |
| **Estilos** | Vanilla CSS Glassmorphism + HSL Tokens | Sistema de diseño oscuro atlético con efectos de desenfoque |
| **Iconos & FX**| Lucide Icons + Canvas-Confetti | Iconografía moderna y animaciones de celebración |
| **Backend** | Node.js 24 + Express + TypeScript | API REST modular, segura y tipada |
| **Base de Datos** | PostgreSQL 16 + Prisma ORM | Almacenamiento relacional con integridad referencial |
| **Seguridad** | JWT + Refresh Tokens rotativos + bcryptjs | Sesiones protegidas y rate limiting contra fuerza bruta |
| **Multimedia** | WebP animados + Multer con streaming autenticado | Demos de ejercicios y fotos privadas sin exposición pública |

---

## 🗄️ Modelo de Base de Datos (13 Tablas)

```mermaid
erDiagram
    User ||--o{ RefreshToken : has
    User ||--o{ Goal : creates
    User ||--o{ Routine : owns
    User ||--o{ RoutineAssignment : receives
    User ||--o{ WorkoutLog : performs
    User ||--o{ WeeklyWeightLog : logs
    User ||--o{ BodyMeasurement : records
    User ||--o{ ProgressPhoto : uploads
    User ||--o{ Meal : logs
    User ||--o{ WaterLog : drinks
    User ||--o{ Reminder : sets
    User ||--o{ AdminFeedback : receives

    Routine ||--|{ RoutineExercise : contains
    Routine ||--o{ RoutineAssignment : assigned_in
    Routine ||--o{ WorkoutLog : logged_in
    Meal ||--o{ MealPhoto : attaches
```

---

## 🚀 Guía de Instalación y Ejecución Local

### Prerrequisitos
- **Node.js** 20+ (recomendado Node.js 24)
- **PostgreSQL** 15+ activo en `localhost:5432`
- **npm** o **pnpm**

---

### 1. Clonar el Repositorio
```bash
git clone https://github.com/tu-usuario/MoonFit.git
cd MoonFit
```

---

### 2. Configurar el Backend

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
```

Ejecuta las migraciones de Prisma y arranca el servidor:
```bash
npx prisma db push
npm run dev
```
> El backend estará corriendo en `http://localhost:3000`.

---

### 3. Configurar el Frontend

En una nueva terminal:
```bash
cd frontend
npm install
npm run dev
```
> La aplicación web estará disponible en `http://localhost:5173`.

---

## 🔑 Credenciales por Defecto

### 👑 Cuenta Administrador / Coach
- **Correo:** `rogeeromontufar@gmail.com`
- **Contraseña:** `password` o `72091907`
- **Rol:** `ADMIN`

### 👤 Cuenta de Usuario
- Puedes registrar cualquier cuenta nueva desde la pantalla de Registro o ingresar como administrador y utilizar el botón **"Switch Admin / User"** en el navbar para alternar de vista al instante.

---

## 📡 Referencia de Endpoints Principales (API REST)

| Método | Endpoint | Acceso | Descripción |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Público | Registro de nuevo usuario |
| `POST` | `/api/auth/login` | Público | Inicio de sesión (Retorna Access + Refresh Tokens) |
| `POST` | `/api/auth/refresh` | Público | Rotación de Refresh Token |
| `GET` | `/api/users/profile` | Autenticado | Obtener perfil del usuario autenticado |
| `PUT` | `/api/users/onboarding` | Autenticado | Completar wizard inicial |
| `GET` | `/api/routines` | Autenticado | Catálogo de rutinas predefinidas y propias |
| `POST` | `/api/routines` | Autenticado | Crear rutina personalizada |
| `POST` | `/api/workouts` | Autenticado | Registrar sesión completada o cancelada con duración |
| `GET` | `/api/workouts` | Autenticado | Historial de entrenamientos del usuario |
| `GET` | `/api/progress/weight` | Autenticado | Historial semanal de peso |
| `POST` | `/api/progress/weight` | Autenticado | Registrar peso de la semana actual |
| `POST` | `/api/progress/photos` | Autenticado | Subir foto de progreso privada |
| `GET` | `/api/progress/photos/:id/view` | Propietario / Admin | **Streaming seguro de foto privada** |
| `GET` | `/api/nutrition/meals` | Autenticado | Historial de comidas y sensaciones |
| `POST` | `/api/nutrition/meals` | Autenticado | Registro rápido de comida en 3 clics |
| `POST` | `/api/nutrition/water` | Autenticado | Registro de consumo de agua |
| `GET` | `/api/admin/users` | Solo ADMIN | Listado de usuarios para auditoría |
| `GET` | `/api/admin/users/:id` | Solo ADMIN | Detalle completo y adherencia de entrenamientos |
| `POST` | `/api/admin/feedback` | Solo ADMIN | Enviar mensaje de coaching al usuario |

---

## 📱 Roadmap Móvil (Fase Siguiente)
- [x] **Fase 1 (Completada):** Plataforma web responsive 100% funcional con backend modular, PostgreSQL y diseño Dark Glassmorphism.
- [ ] **Fase 2 (Próxima):** Implementación de la App Móvil nativa con **React Native + Expo**, reutilizando los contratos API y habilitando notificaciones locales en segundo plano para Android (APK).

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo `LICENSE` para más detalles.

---

<div align="center">
  Hecho con pasión por el equipo de <strong>MoonFit</strong> • <i>Fitness para todos desde casa</i>.
</div>
