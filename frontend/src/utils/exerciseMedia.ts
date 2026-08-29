/**
 * Centralized map: exercise_name (as stored in DB/seed) → WebP animation path.
 * Used by ExerciseDemo and any component that needs exercise visuals.
 */
export const EXERCISE_MEDIA: Record<string, string> = {
  // ── LUNES: Glúteos y Piernas ──
  'Puente de Glúteos con Pausa de 2s':
    '/exercises/puente-de-gluteos-en-suelo-webp.webp',
  'Sentadillas Búlgaras con Apoyo Elevado':
    '/exercises/sentadillas-bulgaras-con-apoyo-en-silla-o-sof-webp.webp',
  'Sentadilla Isométrica en Pared (Wall Sit)':
    '/exercises/sentadilla-isometrica-en-pared-webp.webp',
  'Zancadas Dinámicas Alternas':
    '/exercises/zancadas-dinamicas-sin-salto-webp.webp',
  'Elevaciones de Talones para Gemelos':
    '/exercises/elevaciones-de-talones-para-gemelos-en-suelo-webp.webp',

  // ── MARTES: HIIT Quema Grasa ──
  'Saltos en Tijera (Jumping Jacks)':
    '/exercises/saltos-en-tijera-webp.webp',
  'Escaladores de Montaña (Mountain Climbers)':
    '/exercises/escaladores-de-montaña-en-alfombra-o-suelo-webp.webp',
  'Sentadillas con Salto Explosivo':
    '/exercises/sentadillas-con-salto-suave-o-sentadillas-rapidas-webp.webp',
  'Burpees Controlados':
    '/exercises/burpees-modificados-en-suelo-o-silla-webp.webp',
  'Paso de Patinador Lateral (Skater Hops)':
    '/exercises/paso-de-patinador-lateral-webp.webp',

  // ── MIÉRCOLES: Torso Firme, Brazos y Espalda ──
  'Flexiones de Pecho (Inclinadas o Rodillas)':
    '/exercises/flexiones-de-pecho-en-suelo-webp.webp',
  'Remo con Tensión en Toalla / Botellas':
    '/exercises/remo-casero-con-toalla-webp.webp',
  'Fondos de Tríceps en Apoyo Elevado':
    '/exercises/fondos-de-triceps-en-borde-de-silla-webp.webp',
  'Plancha con Toques de Hombro Controlados':
    '/exercises/plancha-con-toques-de-hombro-controlados-webp.webp',
  'Elevaciones de Brazos en Y-T-W (Espalda y Postura)':
    '/exercises/elevaciones-de-brazos-en-ytw-en-suelo-webp.webp',

  // ── JUEVES: Cintura Esbelta y Vientre Plano ──
  'Plancha Abdominal Frontal Isométrica':
    '/exercises/plancha-abdominal-frontal-isometrica-webp.webp',
  'Bicho Muerto (Deadbug para Vientre Plano)':
    '/exercises/bicho-muerto-webp.webp',
  'Plancha Lateral con Elevación de Cadera':
    '/exercises/plancha-lateral-con-apoyo-de-rodilla-o-pie-webp.webp',
  'Perro de Caza (Bird-Dog para Lumbar y Glúteo)':
    '/exercises/perro-de-caza-webp.webp',
  'Bicicleta Abdominal con Respiración Rítmica':
    '/exercises/bicicleta-abdominal-con-respiracion-ritmica-webp.webp',

  // ── VIERNES: Glúteos Redondos y Cadena Posterior ──
  'Puente de Glúteos a Una Sola Pierna':
    '/exercises/puente-de-gluteos-a-una-sola-pierna-en-suelo-webp.webp',
  'Sentadilla Profunda con Pausa de 2 Segundos Abajo':
    '/exercises/sentadilla-profunda-con-pausa-de-2-segundos-webp.webp',
  'Deslizamiento de Isquiotibiales con Toalla':
    '/exercises/deslizamiento-de-isquiotibiales-con-toalla-en-suelo-webp.webp',
  'Patadas de Glúteo en Cuadrupedia con Isometría':
    '/exercises/patadas-de-gluteo-en-cuadrupedia-con-isometria-webp.webp',
  'Abducciones de Cadera (Clamshells) Acostada':
    '/exercises/abducciones-de-cadera-clamshells-acostada-webp.webp',

  // ── SÁBADO: Circuito Total Body ──
  'Sentadillas con Elevación de Brazos al Techo':
    '/exercises/sentadillas-con-elevacion-de-brazos-al-techo-webp.webp',
  'Saltos de Cuerda Simulados en el Sitio':
    '/exercises/saltos-de-cuerda-simulados-en-el-sitio-webp.webp',
  'Zancadas Reversas con Elevación de Rodilla':
    '/exercises/zancadas-reversas-con-elevacion-de-rodilla-webp.webp',
  'Plancha Spiderman (Rodilla al Codo)':
    '/exercises/plancha-spiderman-webp.webp',
  'Paso del Oso Isométrico (Bear Crawl Hold)':
    '/exercises/paso-del-oso-isometrico-webp.webp',

  // ── DOMINGO: Movilidad y Flexibilidad ──
  'Estiramiento Gato-Vaca para Columna':
    '/exercises/estiramiento-gato-vaca-en-alfombra-o-esterilla-webp.webp',
  'Postura de la Paloma para Glúteos y Caderas':
    '/exercises/postura-de-la-paloma-para-gluteos-y-caderas-webp.webp',
  'Apertura de Pecho y Hombros en Pared':
    '/exercises/apertura-de-pecho-y-hombros-apoyada-en-pared-webp.webp',
  'Postura del Niño (Child\'s Pose) para Relajar Espalda':
    '/exercises/postura-del-niño-child-s-pose-para-relajar-espalda-webp.webp',
  'Respiración Diafragmática y Vacío Abdominal Suave':
    '/exercises/respiracion-diafragmatica-y-vacio-abdominal-suave-webp.webp',
};

/**
 * Resolve the WebP animation path for a given exercise name.
 * Returns null if no media file is mapped for the exercise.
 */
export function getExerciseMedia(exerciseName: string): string | null {
  return EXERCISE_MEDIA[exerciseName] ?? null;
}
