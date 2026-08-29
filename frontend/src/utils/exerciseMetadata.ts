export interface ExerciseMeta {
  name: string;
  isTimed: boolean;
  defaultDuration?: number; // In seconds (if timed)
  unit: 'seg' | 'reps';
  targetMuscles: string[];
  equipment: string;
  postureTips: string[];
  category: 'fuerza' | 'hiit' | 'core' | 'movilidad';
}

export const EXERCISE_METADATA: Record<string, ExerciseMeta> = {
  // ── LUNES: Glúteos y Piernas ──
  'Puente de Glúteos con Pausa de 2s': {
    name: 'Puente de Glúteos con Pausa de 2s',
    isTimed: false,
    unit: 'reps',
    targetMuscles: ['Glúteo Mayor', 'Isquiotibiales', 'Zona Lumbar'],
    equipment: 'Esterilla o Alfombra',
    postureTips: [
      'Empuja con la fuerza de tus talones, no con las puntas de los pies.',
      'Mantén la contracción máxima del glúteo durante 2 segundos arriba formando una rampa recta.',
      'Baja de forma controlada sin dejar caer la cadera de golpe.',
    ],
    category: 'fuerza',
  },
  'Sentadillas Búlgaras con Apoyo Elevado': {
    name: 'Sentadillas Búlgaras con Apoyo Elevado',
    isTimed: false,
    unit: 'reps',
    targetMuscles: ['Glúteo Mayor', 'Cuádriceps', 'Core'],
    equipment: 'Silla o Sofá resistente',
    postureTips: [
      'Apoya el empeine en el borde de la silla o sofá y mantén el torso ligeramente inclinado al frente.',
      'Desciende hasta que el muslo delantero quede paralelo al suelo.',
      'Sube empujando desde el talón delantero para aislar el glúteo.',
    ],
    category: 'fuerza',
  },
  'Sentadilla Isométrica en Pared (Wall Sit)': {
    name: 'Sentadilla Isométrica en Pared (Wall Sit)',
    isTimed: true,
    defaultDuration: 45,
    unit: 'seg',
    targetMuscles: ['Cuádriceps', 'Glúteos', 'Abdomen'],
    equipment: 'Pared lisa',
    postureTips: [
      'Pega toda la espalda y la cabeza a la pared.',
      'Las rodillas deben formar un ángulo perfecto de 90° con los muslos paralelos al piso.',
      'Respira con calma y mantén el abdomen activo todo el tiempo.',
    ],
    category: 'fuerza',
  },
  'Zancadas Dinámicas Alternas': {
    name: 'Zancadas Dinámicas Alternas',
    isTimed: false,
    unit: 'reps',
    targetMuscles: ['Cuádriceps', 'Glúteos', 'Gemelos'],
    equipment: 'Peso corporal',
    postureTips: [
      'Da un paso amplio hacia atrás flexionando ambas rodillas a 90°.',
      'Evita que la rodilla delantera sobrepase la punta del pie.',
      'Mantén el pecho erguido y la mirada al frente.',
    ],
    category: 'fuerza',
  },
  'Elevaciones de Talones para Gemelos': {
    name: 'Elevaciones de Talones para Gemelos',
    isTimed: false,
    unit: 'reps',
    targetMuscles: ['Gemelos (Gastrocnemio)', 'Sóleo'],
    equipment: 'Suelo o escalón',
    postureTips: [
      'Elévate sobre la punta de los pies lo más alto posible.',
      'Haz una pausa de 1 segundo en el punto de máxima altura antes de descender.',
      'Baja lento controlando el estiramiento del talón.',
    ],
    category: 'fuerza',
  },

  // ── MARTES: Quema Grasa y Aceleración (HIIT) ──
  'Saltos en Tijera (Jumping Jacks)': {
    name: 'Saltos en Tijera (Jumping Jacks)',
    isTimed: true,
    defaultDuration: 45,
    unit: 'seg',
    targetMuscles: ['Cuerpo Completo', 'Sistema Cardiovascular', 'Hombros'],
    equipment: 'Esterilla o Suelo',
    postureTips: [
      'Aterriza suavemente sobre las puntas de los pies para proteger las articulaciones.',
      'Abre y cierra brazos y piernas en un ritmo continuo y coordinado.',
      'Mantén el abdomen firme para absorber el impacto elástico.',
    ],
    category: 'hiit',
  },
  'Escaladores de Montaña (Mountain Climbers)': {
    name: 'Escaladores de Montaña (Mountain Climbers)',
    isTimed: true,
    defaultDuration: 30,
    unit: 'seg',
    targetMuscles: ['Core Abdominal', 'Hombros', 'Flexores de Cadera'],
    equipment: 'Esterilla o Alfombra',
    postureTips: [
      'Posición de plancha alta con las manos debajo de los hombros.',
      'Lleva las rodillas hacia el pecho de forma alterna y dinámica sin elevar la cadera.',
      'Mantén la espalda recta como una tabla.',
    ],
    category: 'hiit',
  },
  'Sentadillas con Salto Explosivo': {
    name: 'Sentadillas con Salto Explosivo',
    isTimed: false,
    unit: 'reps',
    targetMuscles: ['Glúteos', 'Cuádriceps', 'Potencia Cardiovascular'],
    equipment: 'Esterilla o Suelo',
    postureTips: [
      'Baja a una sentadilla profunda y salta verticalmente con potencia.',
      'Amortigua la caída pasando de puntas a talones y flexionando rodillas inmediatamente.',
      'Usa el impulso de los brazos para mayor altura y fluidez.',
    ],
    category: 'hiit',
  },
  'Burpees Controlados': {
    name: 'Burpees Controlados',
    isTimed: false,
    unit: 'reps',
    targetMuscles: ['Total Body', 'Pectorales', 'Piernas', 'Core'],
    equipment: 'Esterilla',
    postureTips: [
      'Lleva las manos al suelo, salta o da un paso atrás a plancha con el abdomen tenso.',
      'Regresa con los pies al lado de las manos y salta con palmada arriba.',
      'Prioriza la técnica antes que la velocidad.',
    ],
    category: 'hiit',
  },
  'Paso de Patinador Lateral (Skater Hops)': {
    name: 'Paso de Patinador Lateral (Skater Hops)',
    isTimed: true,
    defaultDuration: 30,
    unit: 'seg',
    targetMuscles: ['Glúteo Medio', 'Abductores', 'Estabilidad de Tobillos'],
    equipment: 'Suelo libre',
    postureTips: [
      'Salta lateralmente de un pie al otro cruzando la pierna libre por detrás.',
      'Flexiona la rodilla de apoyo para absorber el salto y ganar equilibrio.',
      'Acompaña con braceo atlético para mayor cadencia.',
    ],
    category: 'hiit',
  },

  // ── MIÉRCOLES: Torso Firme, Brazos y Espalda ──
  'Flexiones de Pecho (Inclinadas o Rodillas)': {
    name: 'Flexiones de Pecho (Inclinadas o Rodillas)',
    isTimed: false,
    unit: 'reps',
    targetMuscles: ['Pectorales', 'Tríceps', 'Deltoides Anterior'],
    equipment: 'Esterilla o Silla',
    postureTips: [
      'Coloca las manos un poco más anchas que los hombros y codos a 45° del torso.',
      'Mantén el cuerpo en línea recta desde la coronilla hasta las rodillas o talones.',
      'Baja el pecho hasta casi rozar el suelo y empuja con firmeza.',
    ],
    category: 'fuerza',
  },
  'Remo con Tensión en Toalla / Botellas': {
    name: 'Remo con Tensión en Toalla / Botellas',
    isTimed: false,
    unit: 'reps',
    targetMuscles: ['Dorsales', 'Espalda Alta', 'Bíceps'],
    equipment: 'Toalla o 2 botellas de agua',
    postureTips: [
      'Inclina el torso a 45° con la espalda totalmente recta y rodillas semiflexionadas.',
      'Tira de los codos hacia atrás pegados a las costillas apretando los omóplatos.',
      'Siente la tensión en la espalda en cada repetición.',
    ],
    category: 'fuerza',
  },
  'Fondos de Tríceps en Apoyo Elevado': {
    name: 'Fondos de Tríceps en Apoyo Elevado',
    isTimed: false,
    unit: 'reps',
    targetMuscles: ['Tríceps (Brazos)', 'Hombros', 'Pecho Superior'],
    equipment: 'Silla o Sofá resistente',
    postureTips: [
      'Manos en el borde de la silla con los dedos hacia adelante.',
      'Mantén la espalda pegada a la silla durante todo el descenso.',
      'Flexiona los codos a 90° y empuja usando solo la fuerza de tus brazos.',
    ],
    category: 'fuerza',
  },
  'Plancha con Toques de Hombro Controlados': {
    name: 'Plancha con Toques de Hombro Controlados',
    isTimed: false,
    unit: 'reps',
    targetMuscles: ['Core', 'Estabilizadores de Hombro', 'Oblicuos'],
    equipment: 'Esterilla',
    postureTips: [
      'Abre los pies un poco más que el ancho de caderas para mayor base de apoyo.',
      'Toca el hombro opuesto sin que la cadera se balancee hacia los lados.',
      'Mueve solo los brazos; el torso se mantiene como una roca.',
    ],
    category: 'core',
  },
  'Elevaciones de Brazos en Y-T-W (Espalda y Postura)': {
    name: 'Elevaciones de Brazos en Y-T-W (Espalda y Postura)',
    isTimed: false,
    unit: 'reps',
    targetMuscles: ['Romboides', 'Trapecios', 'Manguito Rotador'],
    equipment: 'Esterilla (acostada boca abajo)',
    postureTips: [
      'Boca abajo en la esterilla con la frente cerca del suelo.',
      'Eleva los brazos formando una Y, luego una T y luego una W apretando la espalda alta.',
      'Mantén 1 segundo la contracción en cada posición.',
    ],
    category: 'fuerza',
  },

  // ── JUEVES: Cintura Esbelta y Vientre Plano ──
  'Plancha Abdominal Frontal Isométrica': {
    name: 'Plancha Abdominal Frontal Isométrica',
    isTimed: true,
    defaultDuration: 45,
    unit: 'seg',
    targetMuscles: ['Transverso Abdominal', 'Recto del Abdomen', 'Glúteos'],
    equipment: 'Esterilla',
    postureTips: [
      'Apoya los antebrazos alineados bajo los hombros.',
      'Contrae glúteos y mete el ombligo hacia adentro evitando que la cintura caiga.',
      'Mantén el cuello neutro mirando entre tus manos.',
    ],
    category: 'core',
  },
  'Bicho Muerto (Deadbug para Vientre Plano)': {
    name: 'Bicho Muerto (Deadbug para Vientre Plano)',
    isTimed: false,
    unit: 'reps',
    targetMuscles: ['Core Profundo', 'Estabilidad Pélvica'],
    equipment: 'Esterilla',
    postureTips: [
      'Boca arriba, pega la zona lumbar firmemente contra la esterilla (cero hueco).',
      'Extiende brazo derecho y pierna izquierda de forma lenta y sincronizada.',
      'Exhala al extender y vuelve a la posición inicial sin despegar la espalda.',
    ],
    category: 'core',
  },
  'Plancha Lateral con Elevación de Cadera': {
    name: 'Plancha Lateral con Elevación de Cadera',
    isTimed: false,
    unit: 'reps',
    targetMuscles: ['Oblicuos (Cintura)', 'Glúteo Medio', 'Hombros'],
    equipment: 'Esterilla',
    postureTips: [
      'Apóyate sobre un antebrazo y el lateral de tus pies (o rodilla inferior).',
      'Baja suavemente la cadera y elévala comprimiendo la cintura lateral.',
      'Mantén el pecho abierto y el cuerpo en un solo plano recto.',
    ],
    category: 'core',
  },
  'Perro de Caza (Bird-Dog para Lumbar y Glúteo)': {
    name: 'Perro de Caza (Bird-Dog para Lumbar y Glúteo)',
    isTimed: false,
    unit: 'reps',
    targetMuscles: ['Erectores Espinales', 'Glúteos', 'Deltoides'],
    equipment: 'Esterilla',
    postureTips: [
      'En cuadrupedia con muñecas bajo hombros y rodillas bajo caderas.',
      'Extiende brazo y pierna contrarios hasta que queden paralelos al suelo.',
      'Aprieta el glúteo arriba sin arquear la espalda baja.',
    ],
    category: 'core',
  },
  'Bicicleta Abdominal con Respiración Rítmica': {
    name: 'Bicicleta Abdominal con Respiración Rítmica',
    isTimed: false,
    unit: 'reps',
    targetMuscles: ['Oblicuos', 'Abdomen Superior e Inferior'],
    equipment: 'Esterilla',
    postureTips: [
      'No jales del cuello con las manos; deja que giren las costillas hacia la rodilla.',
      'Pedalea de forma lenta y controlada manteniendo los hombros despegados del suelo.',
      'Extiende completamente la pierna que no está flexionada.',
    ],
    category: 'core',
  },

  // ── VIERNES: Glúteos Redondos y Cadena Posterior ──
  'Puente de Glúteos a Una Sola Pierna': {
    name: 'Puente de Glúteos a Una Sola Pierna',
    isTimed: false,
    unit: 'reps',
    targetMuscles: ['Glúteo Mayor', 'Isquiotibiales', 'Estabilidad Pélvica'],
    equipment: 'Esterilla',
    postureTips: [
      'Eleva una pierna al aire extendida o flexionada.',
      'Empuja con el talón de la pierna apoyada hasta alinear cadera con hombros.',
      'Aprieta el glúteo 1 segundo arriba antes de descender.',
    ],
    category: 'fuerza',
  },
  'Sentadilla Profunda con Pausa de 2 Segundos Abajo': {
    name: 'Sentadilla Profunda con Pausa de 2 Segundos Abajo',
    isTimed: false,
    unit: 'reps',
    targetMuscles: ['Glúteos', 'Cuádriceps', 'Aductores'],
    equipment: 'Peso corporal',
    postureTips: [
      'Baja controlando hasta romper el paralelo de las rodillas.',
      'Quédate quieta y sólida 2 segundos abajo sin rebotar.',
      'Sube con fuerza explosiva empujando desde los talones.',
    ],
    category: 'fuerza',
  },
  'Deslizamiento de Isquiotibiales con Toalla': {
    name: 'Deslizamiento de Isquiotibiales con Toalla',
    isTimed: false,
    unit: 'reps',
    targetMuscles: ['Isquiotibiales (Parte posterior del muslo)', 'Glúteos'],
    equipment: 'Toalla pequeña + Suelo liso',
    postureTips: [
      'Boca arriba, coloca los talones sobre una toalla pequeña en piso liso.',
      'Eleva la cadera en puente y desliza los talones hacia adelante alejándolos.',
      'Contrae con fuerza los isquiotibiales para regresar los talones a la cadera.',
    ],
    category: 'fuerza',
  },
  'Patadas de Glúteo en Cuadrupedia con Isometría': {
    name: 'Patadas de Glúteo en Cuadrupedia con Isometría',
    isTimed: false,
    unit: 'reps',
    targetMuscles: ['Glúteo Mayor Superior'],
    equipment: 'Esterilla',
    postureTips: [
      'En 4 apoyos, patea con la planta del pie hacia el techo manteniendo la rodilla a 90°.',
      'Aprieta al máximo el glúteo arriba durante 1 segundo sin doblar la cintura.',
      'Baja la rodilla sin tocar el suelo y repite.',
    ],
    category: 'fuerza',
  },
  'Abducciones de Cadera (Clamshells) Acostada': {
    name: 'Abducciones de Cadera (Clamshells) Acostada',
    isTimed: false,
    unit: 'reps',
    targetMuscles: ['Glúteo Medio (Forma redondeada de cadera)'],
    equipment: 'Esterilla',
    postureTips: [
      'Acostada de lado con rodillas flexionadas a 90° y talones juntos.',
      'Abre la rodilla superior como una almeja manteniendo los pies pegados.',
      'Siente el trabajo en la parte lateral y superior del glúteo.',
    ],
    category: 'fuerza',
  },

  // ── SÁBADO: Circuito Total Body Quema Grasa ──
  'Sentadillas con Elevación de Brazos al Techo': {
    name: 'Sentadillas con Elevación de Brazos al Techo',
    isTimed: false,
    unit: 'reps',
    targetMuscles: ['Piernas', 'Hombros', 'Cadena Posterior'],
    equipment: 'Peso corporal',
    postureTips: [
      'Haz una sentadilla y al ponerte de pie estira ambos brazos al techo activando todo el cuerpo.',
      'Movimiento fluido y rítmico para mantener la quema calórica.',
      'Respira de forma constante al subir y bajar.',
    ],
    category: 'hiit',
  },
  'Saltos de Cuerda Simulados en el Sitio': {
    name: 'Saltos de Cuerda Simulados en el Sitio',
    isTimed: true,
    defaultDuration: 60,
    unit: 'seg',
    targetMuscles: ['Gemelos', 'Sistema Cardiovascular', 'Coordinación'],
    equipment: 'Esterilla o Suelo',
    postureTips: [
      'Rebota suavemente sobre las puntas de los pies con rodillas relajadas.',
      'Rota las muñecas como si sostuvieras una comba real.',
      'Mantén el pecho erguido y un ritmo cardíaco estable.',
    ],
    category: 'hiit',
  },
  'Zancadas Reversas con Elevación de Rodilla': {
    name: 'Zancadas Reversas con Elevación de Rodilla',
    isTimed: false,
    unit: 'reps',
    targetMuscles: ['Glúteos', 'Cuádriceps', 'Equilibrio'],
    equipment: 'Peso corporal',
    postureTips: [
      'Da un paso atrás a zancada y al subir impulsa la rodilla trasera directo al pecho.',
      'Mantén el equilibrio apretando el abdomen en cada elevación.',
      'Completa todas las repeticiones por pierna antes de cambiar.',
    ],
    category: 'fuerza',
  },
  'Plancha Spiderman (Rodilla al Codo)': {
    name: 'Plancha Spiderman (Rodilla al Codo)',
    isTimed: false,
    unit: 'reps',
    targetMuscles: ['Oblicuos', 'Core Frontal', 'Hombros'],
    equipment: 'Esterilla',
    postureTips: [
      'En plancha alta, lleva la rodilla por fuera del cuerpo hacia el codo del mismo lado.',
      'Aprieta el lateral del abdomen en el punto de contacto.',
      'Alterna lados manteniendo la cadera nivelada.',
    ],
    category: 'core',
  },
  'Paso del Oso Isométrico (Bear Crawl Hold)': {
    name: 'Paso del Oso Isométrico (Bear Crawl Hold)',
    isTimed: true,
    defaultDuration: 30,
    unit: 'seg',
    targetMuscles: ['Core Total', 'Hombros', 'Cuádriceps'],
    equipment: 'Esterilla o Suelo',
    postureTips: [
      'Colócate en 4 apoyos con las rodillas flotando a solo 2-3 cm del suelo.',
      'Espalda plana como una mesa de café y ombligo succionado hacia adentro.',
      'Aguanta la postura respirando con calma.',
    ],
    category: 'core',
  },

  // ── DOMINGO: Movilidad, Estiramientos & Flexibilidad ──
  'Estiramiento Gato-Vaca para Columna': {
    name: 'Estiramiento Gato-Vaca para Columna',
    isTimed: true,
    defaultDuration: 30,
    unit: 'seg',
    targetMuscles: ['Columna Vertebral', 'Espalda', 'Cuello'],
    equipment: 'Esterilla',
    postureTips: [
      'Inhala arqueando suavemente la espalda y mirando hacia arriba (Vaca).',
      'Exhala redondeando la columna y metiendo la barbilla al pecho (Gato).',
      'Siente la descompresión y alivio en cada vértebra.',
    ],
    category: 'movilidad',
  },
  'Postura de la Paloma para Glúteos y Caderas': {
    name: 'Postura de la Paloma para Glúteos y Caderas',
    isTimed: true,
    defaultDuration: 45,
    unit: 'seg',
    targetMuscles: ['Glúteo Profundo', 'Piriforme', 'Flexores de Cadera'],
    equipment: 'Esterilla',
    postureTips: [
      'Cruza la pierna delantera flexionada sobre la esterilla y estira la pierna trasera.',
      'Inclina el torso suavemente hacia adelante apoyando antebrazos.',
      'Respira profundo sintiendo cómo se liberan las tensiones de la cadera.',
    ],
    category: 'movilidad',
  },
  'Apertura de Pecho y Hombros en Pared': {
    name: 'Apertura de Pecho y Hombros en Pared',
    isTimed: true,
    defaultDuration: 30,
    unit: 'seg',
    targetMuscles: ['Pectorales', 'Deltoides Anterior', 'Postura'],
    equipment: 'Pared o Marco de puerta',
    postureTips: [
      'Apoya la palma y el antebrazo contra la pared a la altura del hombro.',
      'Gira suavemente el torso hacia el lado contrario hasta sentir el estiramiento en el pecho.',
      'Mantén la postura respirando hondo sin forzar.',
    ],
    category: 'movilidad',
  },
  'Postura del Niño (Child’s Pose) para Relajar Espalda': {
    name: 'Postura del Niño (Child’s Pose) para Relajar Espalda',
    isTimed: true,
    defaultDuration: 45,
    unit: 'seg',
    targetMuscles: ['Espalda Baja', 'Dorsales', 'Hombros'],
    equipment: 'Esterilla',
    postureTips: [
      'Siéntate sobre los talones y abre ligeramente las rodillas.',
      'Extiende los brazos al frente en el suelo y relaja la frente sobre la esterilla.',
      'Inhala inflando la espalda y exhala soltando toda la fatiga.',
    ],
    category: 'movilidad',
  },
  'Respiración Diafragmática y Vacío Abdominal Suave': {
    name: 'Respiración Diafragmática y Vacío Abdominal Suave',
    isTimed: true,
    defaultDuration: 30,
    unit: 'seg',
    targetMuscles: ['Transverso Abdominal (Faja Natural)', 'Suelo Pélvico'],
    equipment: 'De pie o acostada',
    postureTips: [
      'Exhala todo el aire de los pulmones vaciando el abdomen.',
      'Mete suavemente el ombligo hacia arriba y hacia la columna sin tomar aire durante 3-4s.',
      'Inhala de forma relajada y repite con tranquilidad.',
    ],
    category: 'movilidad',
  },
};

/**
 * Get metadata for an exercise. Fallback safely if not found.
 */
export function getExerciseMetadata(exerciseName: string): ExerciseMeta {
  if (EXERCISE_METADATA[exerciseName]) {
    return EXERCISE_METADATA[exerciseName];
  }

  // Fallback heuristic
  const isTimed = /plancha|wall sit|isom[eé]trico|jumping|cuerda|estiramiento|postura|respiraci[oó]n|climbers/i.test(exerciseName);
  return {
    name: exerciseName,
    isTimed,
    defaultDuration: isTimed ? 45 : undefined,
    unit: isTimed ? 'seg' : 'reps',
    targetMuscles: ['Músculos Principales'],
    equipment: 'Peso Corporal / Esterilla',
    postureTips: [
      'Mantén el abdomen firme y la respiración fluida.',
      'Controla el movimiento en todo momento.',
    ],
    category: isTimed ? 'hiit' : 'fuerza',
  };
}
