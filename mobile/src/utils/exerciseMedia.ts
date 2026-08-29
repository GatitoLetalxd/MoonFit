/**
 * Centralized map: exercise_name (from database / routines) -> local WebP require.
 * Bundles the 35 exercises locally into the mobile app for instant, zero-latency playback.
 */

export const EXERCISE_MEDIA_MAP: Record<string, any> = {
  // ── LUNES: Glúteos y Piernas ──
  'Puente de Glúteos con Pausa de 2s': require('../../assets/exercises/puente-de-gluteos-en-suelo-webp.webp'),
  'Sentadillas Búlgaras con Apoyo Elevado': require('../../assets/exercises/sentadillas-bulgaras-con-apoyo-en-silla-o-sof-webp.webp'),
  'Sentadilla Isométrica en Pared (Wall Sit)': require('../../assets/exercises/sentadilla-isometrica-en-pared-webp.webp'),
  'Zancadas Dinámicas Alternas': require('../../assets/exercises/zancadas-dinamicas-sin-salto-webp.webp'),
  'Elevaciones de Talones para Gemelos': require('../../assets/exercises/elevaciones-de-talones-para-gemelos-en-suelo-webp.webp'),

  // ── MARTES: HIIT Quema Grasa ──
  'Saltos en Tijera (Jumping Jacks)': require('../../assets/exercises/saltos-en-tijera-webp.webp'),
  'Escaladores de Montaña (Mountain Climbers)': require('../../assets/exercises/escaladores-de-montaña-en-alfombra-o-suelo-webp.webp'),
  'Sentadillas con Salto Explosivo': require('../../assets/exercises/sentadillas-con-salto-suave-o-sentadillas-rapidas-webp.webp'),
  'Burpees Controlados': require('../../assets/exercises/burpees-modificados-en-suelo-o-silla-webp.webp'),
  'Paso de Patinador Lateral (Skater Hops)': require('../../assets/exercises/paso-de-patinador-lateral-webp.webp'),

  // ── MIÉRCOLES: Torso Firme, Brazos y Espalda ──
  'Flexiones de Pecho (Inclinadas o Rodillas)': require('../../assets/exercises/flexiones-de-pecho-en-suelo-webp.webp'),
  'Remo con Tensión en Toalla / Botellas': require('../../assets/exercises/remo-casero-con-toalla-webp.webp'),
  'Fondos de Tríceps en Apoyo Elevado': require('../../assets/exercises/fondos-de-triceps-en-borde-de-silla-webp.webp'),
  'Plancha con Toques de Hombro Controlados': require('../../assets/exercises/plancha-con-toques-de-hombro-controlados-webp.webp'),
  'Elevaciones de Brazos en Y-T-W (Espalda y Postura)': require('../../assets/exercises/elevaciones-de-brazos-en-ytw-en-suelo-webp.webp'),

  // ── JUEVES: Cintura Esbelta y Vientre Plano ──
  'Plancha Abdominal Frontal Isométrica': require('../../assets/exercises/plancha-abdominal-frontal-isometrica-webp.webp'),
  'Bicho Muerto (Deadbug para Vientre Plano)': require('../../assets/exercises/bicho-muerto-webp.webp'),
  'Plancha Lateral con Elevación de Cadera': require('../../assets/exercises/plancha-lateral-con-apoyo-de-rodilla-o-pie-webp.webp'),
  'Perro de Caza (Bird-Dog para Lumbar y Glúteo)': require('../../assets/exercises/perro-de-caza-webp.webp'),
  'Bicicleta Abdominal con Respiración Rítmica': require('../../assets/exercises/bicicleta-abdominal-con-respiracion-ritmica-webp.webp'),

  // ── VIERNES: Glúteos Redondos y Cadena Posterior ──
  'Puente de Glúteos a Una Sola Pierna': require('../../assets/exercises/puente-de-gluteos-a-una-sola-pierna-en-suelo-webp.webp'),
  'Sentadilla Profunda con Pausa de 2 Segundos Abajo': require('../../assets/exercises/sentadilla-profunda-con-pausa-de-2-segundos-webp.webp'),
  'Deslizamiento de Isquiotibiales con Toalla': require('../../assets/exercises/deslizamiento-de-isquiotibiales-con-toalla-en-suelo-webp.webp'),
  'Patadas de Glúteo en Cuadrupedia con Isometría': require('../../assets/exercises/patadas-de-gluteo-en-cuadrupedia-con-isometria-webp.webp'),
  'Abducciones de Cadera (Clamshells) Acostada': require('../../assets/exercises/abducciones-de-cadera-clamshells-acostada-webp.webp'),

  // ── SÁBADO: Circuito Total Body ──
  'Sentadillas con Elevación de Brazos al Techo': require('../../assets/exercises/sentadillas-con-elevacion-de-brazos-al-techo-webp.webp'),
  'Saltos de Cuerda Simulados en el Sitio': require('../../assets/exercises/saltos-de-cuerda-simulados-en-el-sitio-webp.webp'),
  'Zancadas Reversas con Elevación de Rodilla': require('../../assets/exercises/zancadas-reversas-con-elevacion-de-rodilla-webp.webp'),
  'Plancha Spiderman (Rodilla al Codo)': require('../../assets/exercises/plancha-spiderman-webp.webp'),
  'Paso del Oso Isométrico (Bear Crawl Hold)': require('../../assets/exercises/paso-del-oso-isometrico-webp.webp'),

  // ── DOMINGO: Movilidad y Flexibilidad ──
  'Estiramiento Gato-Vaca para Columna': require('../../assets/exercises/estiramiento-gato-vaca-en-alfombra-o-esterilla-webp.webp'),
  'Postura de la Paloma para Glúteos y Caderas': require('../../assets/exercises/postura-de-la-paloma-para-gluteos-y-caderas-webp.webp'),
  'Apertura de Pecho y Hombros en Pared': require('../../assets/exercises/apertura-de-pecho-y-hombros-apoyada-en-pared-webp.webp'),
  'Postura del Niño (Child\'s Pose) para Relajar Espalda': require('../../assets/exercises/postura-del-niño-child-s-pose-para-relajar-espalda-webp.webp'),
  'Respiración Diafragmática y Vacío Abdominal Suave': require('../../assets/exercises/respiracion-diafragmatica-y-vacio-abdominal-suave-webp.webp'),
};

/**
 * Normaliza y busca la animación WebP para cualquier nombre de ejercicio
 */
export const getExerciseMedia = (name: string): any => {
  if (!name) return null;

  // 1. Coincidencia exacta
  if (EXERCISE_MEDIA_MAP[name]) {
    return EXERCISE_MEDIA_MAP[name];
  }

  // 2. Coincidencia por palabra clave / subcadena
  const lower = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  for (const key of Object.keys(EXERCISE_MEDIA_MAP)) {
    const keyLower = key.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (keyLower.includes(lower) || lower.includes(keyLower)) {
      return EXERCISE_MEDIA_MAP[key];
    }
  }

  // 3. Fallback inteligente por tipo básico
  if (lower.includes('sentadilla') || lower.includes('squat')) {
    return EXERCISE_MEDIA_MAP['Sentadilla Profunda con Pausa de 2 Segundos Abajo'];
  }
  if (lower.includes('gluteo') || lower.includes('puente')) {
    return EXERCISE_MEDIA_MAP['Puente de Glúteos con Pausa de 2s'];
  }
  if (lower.includes('plancha') || lower.includes('plank')) {
    return EXERCISE_MEDIA_MAP['Plancha Abdominal Frontal Isométrica'];
  }
  if (lower.includes('flexion') || lower.includes('push')) {
    return EXERCISE_MEDIA_MAP['Flexiones de Pecho (Inclinadas o Rodillas)'];
  }
  if (lower.includes('zancada') || lower.includes('lunge')) {
    return EXERCISE_MEDIA_MAP['Zancadas Dinámicas Alternas'];
  }

  // Fallback por defecto: primer ejercicio
  return EXERCISE_MEDIA_MAP['Puente de Glúteos con Pausa de 2s'];
};

export const getExerciseSource = getExerciseMedia;

