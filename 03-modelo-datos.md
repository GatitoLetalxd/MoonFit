# 🗄️ Modelo de Datos del Sistema — MoonFit

El sistema utiliza **PostgreSQL** gestionado mediante **Prisma ORM**. Todas las claves foráneas tienen configurada la integridad referencial con eliminación en cascada (`onDelete: Cascade`) o establecimiento a nulo (`onDelete: SetNull`) donde corresponda.

---

## 1. Enums del Sistema

### `Role`
| Valor | Descripción |
| :--- | :--- |
| `USER` | Usuario estándar de la plataforma (acceso a sus propios datos). |
| `ADMIN` | Administrador / Coach (acceso a auditoría de usuarios y gestión). |

### `GoalStatus`
| Valor | Descripción |
| :--- | :--- |
| `ACTIVA` | Meta en curso. |
| `CUMPLIDA` | Meta completada exitosamente. |
| `ABANDONADA` | Meta cancelada o reemplazada. |

---

## 2. Tablas y Entidades

### 2.1 `users`
Almacena las cuentas de usuario y administradores con su perfil biométrico y estado.

| Campo | Tipo | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | String (UUID) | `@id @default(uuid())` | Identificador único del usuario |
| `name` | String | NOT NULL | Nombre completo |
| `email` | String | `@unique` | Correo electrónico |
| `password_hash` | String | NOT NULL | Contraseña hasheada con bcrypt |
| `role` | Role (Enum) | `@default(USER)` | Rol en la plataforma (`USER` \| `ADMIN`) |
| `age` | Int | NULL | Edad en años |
| `height_cm` | Float | NULL | Altura en centímetros |
| `initial_weight_kg` | Float | NULL | Peso inicial al registrarse (kg) |
| `active` | Boolean | `@default(true)` | Estado de activación de la cuenta |
| `onboarding_completed`| Boolean | `@default(false)` | Indica si completó el asistente inicial |
| `created_at` | DateTime | `@default(now())` | Fecha y hora de registro |
| `updated_at` | DateTime | `@updatedAt` | Última actualización |

---

### 2.2 `refresh_tokens`
Controla las sesiones activas, soporte de rotación de tokens y revocación instantánea.

| Campo | Tipo | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | Int | `@id @default(autoincrement())` | ID secuencial |
| `user_id` | String | FK → `users.id` (Cascade) | Usuario dueño de la sesión |
| `token_hash` | String | NOT NULL | Hash del token de refresco |
| `expires_at` | DateTime | NOT NULL | Fecha de expiración |
| `revoked` | Boolean | `@default(false)` | Bandera de revocación |
| `created_at` | DateTime | `@default(now())` | Fecha de emisión |

*Índices:* `@@index([user_id])`

---

### 2.3 `goals`
Metas y objetivos corporales establecidos por el usuario.

| Campo | Tipo | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | Int | `@id @default(autoincrement())` | ID de la meta |
| `user_id` | String | FK → `users.id` (Cascade) | Usuario propietario |
| `target_weight_kg` | Float | NOT NULL | Peso meta deseado (kg) |
| `target_date` | DateTime | NOT NULL | Fecha límite estimada |
| `status` | GoalStatus | `@default(ACTIVA)` | Estado (`ACTIVA` \| `CUMPLIDA` \| `ABANDONADA`) |
| `created_at` | DateTime | `@default(now())` | Fecha de creación |
| `updated_at` | DateTime | `@updatedAt` | Última actualización |

*Índices:* `@@index([user_id])`

---

### 2.4 `routines`
Catálogo de rutinas de entrenamiento predefinidas del sistema o personalizadas.

| Campo | Tipo | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | Int | `@id @default(autoincrement())` | ID de la rutina |
| `user_id` | String | FK → `users.id` (Cascade, NULL) | Propietario (NULL si es predefinida del sistema) |
| `name` | String | NOT NULL | Nombre de la rutina |
| `type` | String | NOT NULL | Tipo (`fuerza`, `cardio`, `HIIT`, `core`, etc.) |
| `is_predefined` | Boolean | `@default(false)` | True si es provista por el sistema |
| `created_at` | DateTime | `@default(now())` | Fecha de creación |
| `updated_at` | DateTime | `@updatedAt` | Última actualización |

*Índices:* `@@index([user_id])`

---

### 2.5 `routine_exercises`
Ejercicios pertenecientes a una rutina.

| Campo | Tipo | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | Int | `@id @default(autoincrement())` | ID del ejercicio |
| `routine_id` | Int | FK → `routines.id` (Cascade) | Rutina a la que pertenece |
| `exercise_name` | String | NOT NULL | Nombre exacto del ejercicio (mapeado a WebP) |
| `sets` | Int | NOT NULL | Cantidad de series |
| `reps` | Int | NOT NULL | Cantidad de repeticiones o segundos |
| `rest_seconds` | Int | `@default(60)` | Tiempo de descanso entre series (segundos) |
| `order_index` | Int | `@default(0)` | Posición / orden de ejecución |

*Índices:* `@@index([routine_id])`

---

### 2.6 `routine_assignments`
Asignaciones de rutinas realizadas a usuarios por un administrador o autoasignadas.

| Campo | Tipo | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | Int | `@id @default(autoincrement())` | ID de asignación |
| `routine_id` | Int | FK → `routines.id` (Cascade) | Rutina asignada |
| `user_id` | String | FK → `users.id` (Cascade) | Usuario asignado |
| `assigned_by` | String | FK → `users.id` (SetNull, NULL) | Administrador que asignó |
| `assigned_at` | DateTime | `@default(now())` | Fecha de asignación |

*Índices:* `@@index([user_id])`, `@@index([routine_id])`

---

### 2.7 `workout_logs`
Historial de sesiones de entrenamiento ejecutadas (completadas o canceladas) para métricas y auditoría.

| Campo | Tipo | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | Int | `@id @default(autoincrement())` | ID del registro |
| `user_id` | String | FK → `users.id` (Cascade) | Usuario que entrenó |
| `routine_id` | Int | FK → `routines.id` (Cascade) | Rutina realizada |
| `status` | String | `@default("COMPLETADA")` | Estado (`COMPLETADA` \| `CANCELADA`) |
| `duration_seconds` | Int | NULL | Duración total de la sesión en segundos |
| `exercises_completed`| Int | NULL | Cantidad de ejercicios completados |
| `total_exercises` | Int | NULL | Total de ejercicios de la rutina |
| `completed_at` | DateTime | `@default(now())` | Fecha y hora exacta de registro |

*Índices:* `@@index([user_id])`, `@@index([routine_id])`

---

### 2.8 `weekly_weight_logs`
Historial de peso corporal semanal (un registro único por semana de lunes a domingo).

| Campo | Tipo | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | Int | `@id @default(autoincrement())` | ID del registro |
| `user_id` | String | FK → `users.id` (Cascade) | Usuario |
| `week_start_date` | DateTime (@db.Date) | NOT NULL | Fecha del lunes de la semana correspondiente |
| `weight_kg` | Float | NOT NULL | Peso registrado en kg |
| `notes` | String | NULL | Notas u observaciones opcionales |
| `logged_at` | DateTime | `@default(now())` | Fecha de inserción |
| `updated_at` | DateTime | `@updatedAt` | Fecha de modificación |

*Restricción de unicidad:* `@@unique([user_id, week_start_date])`
*Índices:* `@@index([user_id])`

---

### 2.9 `body_measurements`
Registro de medidas antropométricas corporales complementarias.

| Campo | Tipo | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | Int | `@id @default(autoincrement())` | ID del registro |
| `user_id` | String | FK → `users.id` (Cascade) | Usuario |
| `week_start_date` | DateTime (@db.Date) | NOT NULL | Fecha del lunes de la semana |
| `waist_cm` | Float | NULL | Medida de cintura en cm |
| `arm_cm` | Float | NULL | Medida de brazo en cm |
| `other_json` | Json | NULL | Medidas adicionales flexibles en formato JSON |
| `created_at` | DateTime | `@default(now())` | Fecha de registro |

*Índices:* `@@index([user_id])`

---

### 2.10 `progress_photos`
Fotos de progreso físico del usuario protegidas con streaming autenticado.

| Campo | Tipo | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | String (UUID) | `@id @default(uuid())` | Identificador único / Nombre no predecible |
| `user_id` | String | FK → `users.id` (Cascade) | Usuario propietario |
| `storage_path` | String | NOT NULL | Ruta interna en disco del archivo |
| `taken_at` | DateTime | `@default(now())` | Fecha en que fue tomada |
| `created_at` | DateTime | `@default(now())` | Fecha de subida |

*Índices:* `@@index([user_id])`

---

### 2.11 `meals` y `meal_photos`
Registro de nutrición simplificada en 3 clics y fotos de comidas.

#### `meals`
| Campo | Tipo | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | Int | `@id @default(autoincrement())` | ID de la comida |
| `user_id` | String | FK → `users.id` (Cascade) | Usuario |
| `description` | String | NULL | Descripción o notas breves |
| `meal_type` | String | NULL | Tipo (`desayuno`, `almuerzo`, `cena`, `snack`) |
| `logged_at` | DateTime | `@default(now())` | Fecha de la comida |
| `created_at` | DateTime | `@default(now())` | Fecha de creación del registro |

*Índices:* `@@index([user_id])`

#### `meal_photos`
| Campo | Tipo | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | String (UUID) | `@id @default(uuid())` | ID único de la fotografía |
| `meal_id` | Int | FK → `meals.id` (Cascade) | Comida vinculada |
| `storage_path` | String | NOT NULL | Ruta interna en disco |
| `created_at` | DateTime | `@default(now())` | Fecha de subida |

*Índices:* `@@index([meal_id])`

---

### 2.12 `water_logs`
Control y registro del consumo diario de agua.

| Campo | Tipo | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | Int | `@id @default(autoincrement())` | ID del registro |
| `user_id` | String | FK → `users.id` (Cascade) | Usuario |
| `amount_ml` | Int | NOT NULL | Cantidad consumida en mililitros |
| `logged_at` | DateTime | `@default(now())` | Fecha y hora del registro |

*Índices:* `@@index([user_id])`

---

### 2.13 `reminders`
Configuración de recordatorios y hábitos.

| Campo | Tipo | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | Int | `@id @default(autoincrement())` | ID del recordatorio |
| `user_id` | String | FK → `users.id` (Cascade) | Usuario |
| `type` | String | NOT NULL | Tipo (`entrenar`, `agua`, `pesarse`) |
| `time` | String | NOT NULL | Hora en formato `HH:mm` |
| `frequency` | String | NOT NULL | Frecuencia (`diario`, `semanal`, etc.) |
| `active` | Boolean | `@default(true)` | Switch de activación |
| `created_at` | DateTime | `@default(now())` | Fecha de creación |
| `updated_at` | DateTime | `@updatedAt` | Última actualización |

*Índices:* `@@index([user_id])`

---

### 2.14 `admin_feedback`
Mensajes de acompañamiento, felicitaciones y coaching del administrador al usuario.

| Campo | Tipo | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | Int | `@id @default(autoincrement())` | ID del feedback |
| `user_id` | String | FK → `users.id` (Cascade) | Usuario receptor |
| `admin_id` | String | FK → `users.id` (Cascade) | Administrador emisor |
| `message` | String | NOT NULL | Contenido del mensaje |
| `created_at` | DateTime | `@default(now())` | Fecha y hora de envío |

*Índices:* `@@index([user_id])`, `@@index([admin_id])`
