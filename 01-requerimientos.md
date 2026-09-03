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
- [x] ✅ **Historial de entrenamientos del usuario**:
  - Lista visual en la pestaña Rutinas con badges de estado, fecha, hora, duración y botón para repetir rutina.
  - **Pantalla dedicada de Historial Completo (`WorkoutHistoryScreen`) en App Móvil**:
    - KPIs acumulados: sesiones completadas, minutos totales invertidos y entrenamientos registrados.
    - Filtros reactivos por estado (`Todos`, `Completadas`, `Canceladas`).
    - Filtros por tipo de rutina (`Todos`, `Fuerza`, `HIIT`, `Core`, `Cardio`).
    - Tarjetas con desglose detallado de ejercicios completados (`X/Y ej.`), duración exacta en minutos (`⏱️`) y botón directo para repetir el entrenamiento en el reproductor.
    - Persistencia y sincronización Offline-First con caché local.
- [x] ✅ **Sistema de Rachas Activas (*Streaks 🔥*)**: Cálculo de días consecutivos de entrenamiento en el Dashboard.
- [x] ✅ **Asignación de rutinas por Administrador**: El coach/admin puede asignar rutinas específicas a los usuarios.

---

### 2.3 Progreso Físico y Fotos Privadas
- [x] ✅ **Registro de peso semanal**: Control con restricción de un registro único por semana (lunes a domingo con sobreescritura/actualización del valor más reciente).
- [x] ✅ **Registro de medidas corporales opcionales**: Cintura (cm), brazo (cm) y almacenamiento JSON extensible.
- [x] ✅ **Subida de fotos de progreso físico privadas**:
  - Almacenamiento seguro en servidor con nombres UUID no predecibles.
  - **Streaming autenticado de fotos**: No existen URLs públicas; las imágenes solo se sirven mediante verificación de token JWT del usuario propietario o del administrador (`/api/progress/photos/:id/view`), con soporte de parámetro `?token=` para compatibilidad con el pipeline nativo de Android Fresco.
- [x] ✅ **Comparador Visual de Fotos "Antes y Después"**:
  - Modo lado a lado con selección dinámica de fechas.
  - Modo deslizador interactivo (*Split-view Slider*) para comparar cambios corporales directos.
- [x] ✅ **Visor en Pantalla Completa & Guardado en Galería (App Móvil)**:
  - Apertura táctil en alta resolución con fecha y fondo oscuro.
  - Botón nativo para **"Guardar Foto en Mi Galería"** del teléfono mediante `expo-media-library` y gestión de permisos del sistema operativo.
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
- [x] ✅ **Historial visual de comidas**:
  - Tarjetas con miniatura nítida del plato, etiquetas de tipo, sensación corporal y fecha/hora.
  - **Visor ampliado en modal** al tocar la miniatura con notas de la comida y botón para guardar la foto en la galería del dispositivo.
- [x] ✅ **Registro y Sincronización de Consumo de Agua Diario**:
  - Barra de progreso interactiva con meta orientativa (2200 ml / día).
  - Botones rápidos de incremento (+250 ml vaso, +500 ml botella).
  - Botón de reinicio rápido.
  - **Sincronización instantánea entre pestañas (Inicio y Nutrición)**: Implementación con `useFocusEffect` y cálculo en zona horaria local (`offlineStorage`) para evitar desfases de carga.
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
  - **Selector interactivo de Día de la Semana** (`[Dom] [Lun] [Mar] [Mié] [Jue] [Vie] [Sáb]`) para el pesaje semanal.
  - **Steppers de ajuste rápido de hora** (`[-1h]`, `[-15m]`, `[+15m]`, `[+1h]`) con display digital de hora centrado y presets de horarios populares.
- [-] ⏳ **Notificaciones en navegador (Web Notifications API)**: Notificaciones visuales en la aplicación web.
- [x] ✅ **Notificaciones locales nativas en dispositivo móvil**: Disparo local en segundo plano con acciones Aceptar / Posponer (+30 min) mediante React Native/Expo (`expo-notifications`) con triggers `WEEKLY` y `DAILY`.

---

### 2.8 Panel de Administrador (Web & App Móvil)
- [x] ✅ **Acceso inteligente y condicional**: Tarjetas de supervisión en Perfil e Inicio visibles exclusivamente para cuentas con rol `ADMIN`.
- [x] ✅ **Listado completo de alumnos (`AdminUsersScreen`)**:
  - Buscador en tiempo real por nombre o correo.
  - Filtros de estado (`ACTIVO` / `INACTIVO`) y métricas globales.
  - Tarjetas con foto de perfil / avatar, fecha de ingreso y contadores rápidos de actividad:
    - 🏋️ Rutinas realizadas
    - 📸 Fotos de progreso
    - 🥗 Comidas registradas
    - ⚖️ Pesajes semanales
- [x] ✅ **Vista de Detalle Integral por Alumno (`AdminUserDetailScreen`)**:
  - **Ficha biométrica:** Edad, estatura, peso inicial e IMC estimado.
  - **Pestaña 🏋️ Rutinas:** Auditoría cronológica de entrenamientos realizados (duración, fecha, ejercicios completados).
  - **Pestaña 📸 Fotos de Progreso:** Galería de evolución física con visor a pantalla completa en alta resolución y botón de **guardado en la galería del teléfono**.
  - **Pestaña 🥗 Comidas:** Registro nutricional con miniaturas de fotos de platos, tipo de comida, fecha, notas y visor con guardado en galería.
  - **Pestaña ⚖️ Pesajes:** Historial de pesajes semanales con comparador de diferencia de peso vs peso inicial.
  - **💬 Módulo de Feedback Directo:** Envío de recomendaciones personalizadas de entrenamiento y nutrición que el alumno recibe en su pantalla de inicio.
- [x] ✅ **Gestión directa del usuario (Web)**: Cambiar contraseña, activar/desactivar y eliminar cuenta con borrado en cascada.
- [x] ✅ **Switch rápido de rol en Web**: Acceso instantáneo entre vista de Usuario y Administrador para pruebas y supervisión.

---

### 2.9 Branding e Inspiración Diaria
- [x] ✅ **Logo Oficial de MoonFit**: Isotipo de luna creciente con silueta atlética, mancuernas e iluminación neón.
- [x] ✅ **Optimización Multiformato**: Archivo fuente comprimido en un 98.6% a formatos WebP (512x512 y 128x128), Favicon PNG (64x64) y PNG optimizado.
- [x] ✅ **Frases de Ánimo, Paciencia y Recomposición Corporal (`motivationQuotes`)**:
  - Consejos científicos sobre fluctuaciones de peso, volumen de grasa vs músculo y valoración del esfuerzo diario.
  - Tarjeta interactiva en Inicio con botón para cambiar de frase.
  - Banners empáticos en la pestaña de Progreso.

---

## 3. Requerimientos No Funcionales

- [x] ✅ **Arquitectura y Rendimiento Web**: Frontend React 19 + TypeScript sobre Vite con builds optimizados en submilisegundos (~480ms).
- [x] ✅ **App Móvil Nativa (React Native 0.76+ / Expo SDK 52-53)**:
  - Compilación nativa en APK de Release para Android.
  - **Soporte Offline-First**: Persistencia de datos locales en `AsyncStorage`, cola de sincronización de fondo con reintentos automáticos e indicador de estado en cabecera con colapsado a icono tras 1 segundo.
  - **Adaptación a Pantallas (Safe Area Insets)**: Interfaz blindada con `react-native-safe-area-context` para dispositivos con notch, punch-hole y barras de navegación edge-to-edge.
  - **Splash Screen Oscuro Nativo**: Configuración en Android 12+ (`Theme.App.SplashScreen`, fondo `#0B0F17`) eliminando destellos blancos en el arranque.
  - **Teclado y Formularios**: Scroll suave y evitación del teclado en login y registro sin obstruir botones.
  - **Seguridad en Entrada de Texto**: Botón de ojo interactivo (`Eye` / `EyeOff`) para revelar u ocultar contraseñas al escribir.
- [x] ✅ **Diseño UI/UX de Alta Gama**: Estética atlética oscura (*Dark Luxury Glassmorphism*), paleta HSL balanceada, tipografía Inter y Outfit, microanimaciones CSS/nativas y confetti al completar logros.
- [x] ✅ **Seguridad de Datos**: Contraseñas hasheadas con bcrypt (10 rounds), validación de tipos en TypeScript, aislamiento de rutas privadas y fotos protegidas contra accesos directos con streaming autenticado.
- [x] ✅ **Base de Datos Relacional**: PostgreSQL con Prisma ORM, tipos fuertemente tipados, índices en claves foráneas y relaciones con borrado en cascada.
