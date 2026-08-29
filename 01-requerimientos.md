# 📋 Requerimientos del Sistema — MoonFit

> **Convención de Estados:**
> - `[x] ✅ APLICADO / COMPLETADO`: Funcionalidad totalmente desarrollada, probada y operativa en el sistema.
> - `[-] ⏳ EN PROCESO / SIGUIENTE FASE`: Funcionalidad en desarrollo o pendiente de validación específica.
> - `[ ] ⚪ PLANIFICADO (FASE APP MÓVIL)`: Requerimiento reservado para la etapa final de desarrollo en React Native (Expo).

---

## 1. Descripción General
**MoonFit** es una plataforma integral de fitness diseñada para personas que entrenan en casa sin equipamiento costoso. Permite el seguimiento exhaustivo de rutinas con animaciones visuales WebP, cronómetros inteligentes, registro de nutrición simplificado enfocado en hábitos, control de agua diaria, auditoría de progreso físico (peso semanal, fotos privadas y comparador antes/después), metas personalizadas y un panel de administración completo con auditoría de adherencia y feedback de coaching.

---

## 2. Requerimientos Funcionales

### 2.1 Autenticación, Seguridad y Perfil
- [x] ✅ **Registro e inicio de sesión de usuarios** con validación y tokens JWT.
- [x] ✅ **Rotación y persistencia de Refresh Tokens** en base de datos para sesiones seguras y revocación instantánea.
- [x] ✅ **Rate Limiting** en endpoints críticos (`/api/auth/login` y `/api/auth/register`) para mitigar ataques de fuerza bruta.
- [x] ✅ **Control de acceso basado en roles (`RBAC`)**: Roles `USER` y `ADMIN` con middleware de protección.
- [x] ✅ **Perfil completo del usuario**: Edad, altura, peso inicial, fecha de registro y avatar/datos de contacto.
- [x] ✅ **Gestión administrativa de credenciales**: El administrador puede cambiar contraseñas de usuarios directamente desde el panel sin depender de SMTP.
- [x] ✅ **Activación / Desactivación de cuentas** por el administrador.
- [x] ✅ **Borrado de cuenta en cascada** con advertencia modal explícita de irreversibilidad.

---

### 2.2 Rutinas de Ejercicio y Reproductor Inteligente
- [x] ✅ **Catálogo de rutinas predefinidas por objetivos**: Fuerza, Piernas & Glúteos, Cardio HIIT, Core, Tren Superior y Full Body.
- [x] ✅ **Creación y edición de rutinas personalizadas**: Configuración de ejercicios, series, repeticiones, descansos y orden.
- [x] ✅ **Integración de 35 Demostraciones Visuales Animadas WebP**: Miniaturas y videos de técnica en bucle para cada ejercicio.
- [x] ✅ **Metadatos y Biomecánica de Ejercicios**: Clasificación por tipo (repeticiones vs isometría/tiempo), grupos musculares diana y equipo casero sugerido.
- [x] ✅ **Modal de Previsualización de Rutinas**: Vista previa con duración estimada, quema calórica aproximada y lista interactiva de ejercicios antes de iniciar.
- [x] ✅ **Reproductor de Rutinas Guiadas (`WorkoutPlayer`)**:
  - Conteo regresivo automático para ejercicios de tiempo/isométricos.
  - Temporizador de descanso interactivo con opción de saltar descanso (+30s / -10s).
  - Alertas sonoras biomecánicas (`beeps` en los últimos 3 segundos y sonido de éxito al finalizar).
  - Desplegable interactivo de *"💡 Ver Técnica y Tips de Postura"* en español.
  - Pantalla de celebración con cálculo de calorías quemadas y botón para compartir logros en redes.
- [x] ✅ **Registro detallado de entrenamientos (`WorkoutLog`)**:
  - Registro de sesiones **COMPLETADAS** vs **CANCELADAS**.
  - Duración exacta transcurrida en segundos/minutos.
  - Cantidad de ejercicios completados sobre el total (ej. *3 de 5 ejercicios*).
  - Fecha y hora exacta del registro.
- [x] ✅ **Historial de entrenamientos del usuario**: Lista visual en la pestaña Rutinas con badges de estado, fecha, hora, duración y botón para repetir rutina.
- [x] ✅ **Sistema de Rachas Activas (*Streaks 🔥*)**: Cálculo de días consecutivos de entrenamiento en el Dashboard.
- [x] ✅ **Asignación de rutinas por Administrador**: El coach/admin puede asignar rutinas específicas a los usuarios.

---

### 2.3 Progreso Físico y Fotos Privadas
- [x] ✅ **Registro de peso semanal**: Control con restricción de un registro único por semana (lunes a domingo con sobreescritura/actualización del valor más reciente).
- [x] ✅ **Registro de medidas corporales opcionales**: Cintura (cm), brazo (cm) y almacenamiento JSON extensible.
- [x] ✅ **Subida de fotos de progreso físico privadas**:
  - Almacenamiento seguro en servidor con nombres UUID no predecibles.
  - **Streaming autenticado de fotos**: No existen URLs públicas; las imágenes solo se sirven mediante verificación de token JWT del usuario propietario o del administrador (`/api/progress/photos/:id/view`).
- [x] ✅ **Comparador Visual de Fotos "Antes y Después"**:
  - Modo lado a lado con selección dinámica de fechas.
  - Modo deslizador interactivo (*Split-view Slider*) para comparar cambios corporales directos.
- [x] ✅ **Gráfica Interactiva de Evolución de Peso (`WeightChart`)**:
  - Trazado de línea de peso semanal con Canvas/SVG.
  - Línea de referencia de Peso Inicial.
  - Línea de referencia de Meta de Peso Objetivo.
  - Indicador de tendencia y porcentaje de variación.

---

### 2.4 Nutrición Simplificada (Enfoque en Hábitos) y Control de Agua
- [x] ✅ **Registro de comidas rápido en 3 clics**:
  - Selección de tipo de comida (Desayuno 🍳, Almuerzo 🥗, Cena 🍲, Snack 🍎).
  - Selector de **Sensación Corporal** (🌱 *Ligera y con energía*, 🥗 *Satisfecha y en balance*, ⚡ *Fuerte y nutrida*, 🥱 *Pesada o lenta*).
  - Subida opcional de fotografía del plato con vista previa.
  - Campo de descripción o notas libre (sin obligar a conteo calórico obsesivo).
- [x] ✅ **Historial visual de comidas**: Tarjetas con fotos, etiquetas de tipo, sensación corporal y fecha/hora.
- [x] ✅ **Registro de consumo de agua diario**:
  - Barra de progreso interactiva con meta orientativa (2200 ml / día).
  - Botones rápidos de incremento (+250 ml vaso, +500 ml botella).
  - Botón de reinicio rápido.
- [x] ✅ **Mensajes informativos y guías de hidratación**: Consejos nutricionales basados en hábitos saludables.

---

### 2.5 Metas y Objetivos
- [x] ✅ **Meta principal de peso y fecha objetivo**: Configuración de peso deseado y fecha estimada.
- [x] ✅ **Cálculo de progreso y adherencia**: Porcentaje dinámico de avance completado hacia la meta.
- [x] ✅ **Estados de la meta**: `ACTIVA`, `CUMPLIDA`, `ABANDONADA`.
- [x] ✅ **Historial de metas anteriores**: Registro de metas alcanzadas o modificadas.

---

### 2.6 Onboarding (Primer Uso)
- [x] ✅ **Asistente paso a paso (Wizard de 4 pasos)**:
  - **Paso 1:** Datos biométricos iniciales (edad, altura, peso inicial).
  - **Paso 2:** Definición de meta de peso y fecha objetivo.
  - **Paso 3:** Primera foto de progreso inicial (opcional).
  - **Paso 4:** Configuración de recordatorios iniciales.
- [x] ✅ **Transición automática al Dashboard principal** al finalizar el onboarding.

---

### 2.7 Recordatorios
- [x] ✅ **Gestión de recordatorios en base de datos y UI**:
  - Tipos: Entrenar, Tomar Agua, Registrar Peso Semanal.
  - Configuración de hora y frecuencia (diaria, semanal).
  - Switch de activación/desactivación rápida.
- [-] ⏳ **Notificaciones en navegador (Web Notifications API)**: Notificaciones visuales en la aplicación web.
- [ ] ⚪ **Notificaciones locales nativas en dispositivo móvil**: Disparo local en segundo plano con acciones Aceptar / Posponer (+30 min) mediante React Native/Expo.

---

### 2.8 Panel de Administrador (Web)
- [x] ✅ **Listado completo de usuarios**: Buscador por nombre/correo, filtros de estado (activo/inactivo) y métricas globales.
- [x] ✅ **Vista de Detalle por Usuario**:
  - Resumen biométrico y meta activa.
  - Gráfica de peso semanal del usuario.
  - Visor seguro de fotos de progreso privadas.
  - Registro de comidas y hábitos.
  - **Auditoría de Entrenamientos y Adherencia**: KPIs de *Total Sesiones*, *Completadas*, *Canceladas*, *Tasa de Finalización %* y desglose de cada entrenamiento realizado.
- [x] ✅ **Gestión directa del usuario**: Cambiar contraseña, activar/desactivar y eliminar cuenta.
- [x] ✅ **Módulo de Feedback / Coaching**: Envío de mensajes y consejos personalizados al usuario con historial de feedback.
- [x] ✅ **Switch rápido de rol**: Acceso instantáneo entre vista de Usuario y vista de Administrador para pruebas y gestión.

---

### 2.9 Branding e Identidad Visual
- [x] ✅ **Logo Oficial de MoonFit**: Isotipo de luna creciente con silueta atlética, mancuernas e iluminación neón.
- [x] ✅ **Optimización Multiformato**: Archivo fuente comprimido en un 98.6% a formatos WebP (512x512 y 128x128), Favicon PNG (64x64) y PNG optimizado.
- [x] ✅ **Integración en la interfaz**: Desplegado en Login, Registro, Onboarding, Navbar superior, Pantalla de Carga y Favicon de la pestaña.

---

## 3. Requerimientos No Funcionales

- [x] ✅ **Arquitectura y Rendimiento**: Frontend React 19 + TypeScript sobre Vite con builds optimizados en submilisegundos (~480ms).
- [x] ✅ **Diseño UI/UX de Alta Gama**: Estética atlética oscura (*Dark Luxury Glassmorphism*), paleta HSL balanceada, tipografía Inter y Outfit, microanimaciones CSS y confetti al completar logros.
- [x] ✅ **Seguridad de Datos**: Contraseñas hasheadas con bcrypt (10 rounds), validación de tipos en TypeScript, aislamiento de rutas privadas y fotos protegidas contra accesos directos.
- [x] ✅ **Base de Datos Relacional**: PostgreSQL con Prisma ORM, tipos fuertemente tipados, índices en claves foráneas y relaciones con borrado en cascada.
- [ ] ⚪ **App Móvil Nativa (React Native / Expo)**: Creación del proyecto móvil y generación del instalador APK autónomo al concluir la fase web.
