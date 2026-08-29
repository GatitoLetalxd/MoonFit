export interface ExerciseMeta {
  isTimed: boolean;
  defaultSeconds: number;
  targetMuscles: string[];
  tips: string[];
  equipmentNeeded: string;
}

export const EXERCISE_METADATA: Record<string, ExerciseMeta> = {
  // Tren Inferior & Glúteos
  'Sentadillas': {
    isTimed: false,
    defaultSeconds: 0,
    targetMuscles: ['Cuádriceps', 'Glúteos', 'Femoral'],
    tips: ['Pies al ancho de hombros', 'Mantén el pecho erguido y espalda recta', 'Baja hasta que los muslos queden paralelos al suelo', 'Empuja con los talones'],
    equipmentNeeded: 'Ninguno (Peso corporal)',
  },
  'Sentadilla búlgara': {
    isTimed: false,
    defaultSeconds: 0,
    targetMuscles: ['Glúteos', 'Cuádriceps', 'Core'],
    tips: ['Apoya el empeine trasero en una silla/sofá', 'Da un paso largo adelante', 'Baja la rodilla trasera hacia el suelo manteniendo el torso firme'],
    equipmentNeeded: 'Silla o sofá',
  },
  'Sentadilla isométrica': {
    isTimed: true,
    defaultSeconds: 30,
    targetMuscles: ['Cuádriceps', 'Glúteos', 'Core'],
    tips: ['Apoya la espalda completamente contra la pared', 'Forma un ángulo de 90° en las rodillas', 'Respira de forma constante sin empujar con las manos'],
    equipmentNeeded: 'Pared despejada',
  },
  'Sentadilla con salto': {
    isTimed: false,
    defaultSeconds: 0,
    targetMuscles: ['Cuádriceps', 'Glúteos', 'Pantorrillas', 'Cardio'],
    tips: ['Realiza una sentadilla profunda y salta con potencia', 'Aterriza suavemente con la punta de los pies flexionando las rodillas'],
    equipmentNeeded: 'Ninguno',
  },
  'Zancadas alternas': {
    isTimed: false,
    defaultSeconds: 0,
    targetMuscles: ['Glúteos', 'Cuádriceps', 'Isquiotibiales'],
    tips: ['Da un paso firme al frente', 'Ambas rodillas deben doblarse a 90°', 'Evita que la rodilla delantera sobrepase la punta del pie'],
    equipmentNeeded: 'Ninguno',
  },
  'Zancadas con salto': {
    isTimed: false,
    defaultSeconds: 0,
    targetMuscles: ['Glúteos', 'Piernas', 'Cardio'],
    tips: ['Cambia de pierna en el aire de forma dinámica', 'Amortigua la caída manteniendo el torso erguido'],
    equipmentNeeded: 'Ninguno',
  },
  'Puente de glúteos': {
    isTimed: false,
    defaultSeconds: 0,
    targetMuscles: ['Glúteo mayor', 'Femoral', 'Zona lumbar'],
    tips: ['Acuéstate boca arriba con rodillas flexionadas', 'Eleva la cadera contrayendo los glúteos en el punto más alto durante 1 segundo', 'No arquees en exceso la zona lumbar'],
    equipmentNeeded: 'Tapete o alfombra',
  },
  'Puente de glúteos a una pierna': {
    isTimed: false,
    defaultSeconds: 0,
    targetMuscles: ['Glúteo medio y mayor', 'Isquiotibiales'],
    tips: ['Extiende una pierna en el aire y empuja únicamente con el talón apoyado', 'Mantén la pelvis nivelada sin que caiga de un lado'],
    equipmentNeeded: 'Tapete o alfombra',
  },
  'Patada de glúteo': {
    isTimed: false,
    defaultSeconds: 0,
    targetMuscles: ['Glúteo mayor', 'Core'],
    tips: ['En cuatro puntos de apoyo, eleva la pierna flexionada a 90° hacia el techo', 'Aprieta el glúteo arriba sin balancear el torso'],
    equipmentNeeded: 'Tapete',
  },
  'Abducción de cadera': {
    isTimed: false,
    defaultSeconds: 0,
    targetMuscles: ['Glúteo medio', 'Cadera lateral'],
    tips: ['Acuéstate de lado con el cuerpo alineado', 'Eleva la pierna superior controlando el movimiento sin girar la cadera hacia atrás'],
    equipmentNeeded: 'Tapete',
  },
  'Elevación de talones': {
    isTimed: false,
    defaultSeconds: 0,
    targetMuscles: ['Gemelos / Pantorrillas'],
    tips: ['Párate recto, eleva los talones al máximo sobre la punta de los pies', 'Sostén 1 segundo arriba y baja despacio'],
    equipmentNeeded: 'Pared o escalón opcional',
  },

  // Tren Superior
  'Flexiones de brazos': {
    isTimed: false,
    defaultSeconds: 0,
    targetMuscles: ['Pectorales', 'Tríceps', 'Deltoides anterior', 'Core'],
    tips: ['Manos un poco más abiertas que el ancho de hombros', 'Codos a 45° del torso (forma de flecha, no de T)', 'Cuerpo en línea recta desde los talones a la cabeza'],
    equipmentNeeded: 'Ninguno',
  },
  'Flexiones con rodillas': {
    isTimed: false,
    defaultSeconds: 0,
    targetMuscles: ['Pectorales', 'Tríceps', 'Core'],
    tips: ['Apoya las rodillas en el suelo cruzando los tobillos', 'Mantén la cadera baja en línea recta con los hombros'],
    equipmentNeeded: 'Tapete para rodillas',
  },
  'Flexiones diamante': {
    isTimed: false,
    defaultSeconds: 0,
    targetMuscles: ['Tríceps', 'Pectoral interno'],
    tips: ['Junta los dedos pulgares e índices formando un diamante con las manos', 'Baja el pecho hacia las manos manteniendo codos pegados'],
    equipmentNeeded: 'Ninguno',
  },
  'Flexiones declinadas': {
    isTimed: false,
    defaultSeconds: 0,
    targetMuscles: ['Pectoral superior', 'Hombros'],
    tips: ['Coloca los pies sobre una silla o cama y las manos en el suelo', 'Baja con control manteniendo el abdomen tenso'],
    equipmentNeeded: 'Silla o cama',
  },
  'Flexiones pike': {
    isTimed: false,
    defaultSeconds: 0,
    targetMuscles: ['Deltoides / Hombros', 'Trapecios', 'Tríceps'],
    tips: ['Forma una V invertida con el cuerpo elevando la cadera', 'Baja la cabeza hacia el suelo entre las manos y empuja hacia arriba'],
    equipmentNeeded: 'Ninguno',
  },
  'Fondos en silla': {
    isTimed: false,
    defaultSeconds: 0,
    targetMuscles: ['Tríceps', 'Hombro anterior'],
    tips: ['Apoya las palmas en el borde de una silla sólida con los dedos hacia adelante', 'Flexiona los codos a 90° cerca del cuerpo y empuja'],
    equipmentNeeded: 'Silla firme',
  },
  'Remo con toalla': {
    isTimed: false,
    defaultSeconds: 0,
    targetMuscles: ['Dorsales', 'Bíceps', 'Espalda alta'],
    tips: ['Engancha una toalla en el pomo de una puerta cerrada o poste firme', 'Inclina el cuerpo hacia atrás y tira llevando los codos hacia las costillas'],
    equipmentNeeded: 'Toalla y puerta cerrada',
  },
  'Remo invertido en mesa': {
    isTimed: false,
    defaultSeconds: 0,
    targetMuscles: ['Espalda completa', 'Bíceps', 'Core'],
    tips: ['Sujeta el borde de una mesa resistente y cuelga por debajo', 'Tira del pecho hacia la mesa manteniendo el cuerpo rígido como una tabla'],
    equipmentNeeded: 'Mesa resistente',
  },
  'Superman': {
    isTimed: false,
    defaultSeconds: 0,
    targetMuscles: ['Lumbares', 'Glúteos', 'Deltoides posterior'],
    tips: ['Boca abajo, eleva simultáneamente brazos y piernas del suelo', 'Aprieta la espalda baja y glúteos arriba por 2 segundos'],
    equipmentNeeded: 'Tapete',
  },

  // Core & Abdomen
  'Plancha frontal': {
    isTimed: true,
    defaultSeconds: 40,
    targetMuscles: ['Recto abdominal', 'Transverso', 'Hombros'],
    tips: ['Apóyate sobre los antebrazos y puntas de pie', 'No dejes caer la cadera ni la subas en exceso', 'Activa el abdomen como si fueras a recibir un golpe'],
    equipmentNeeded: 'Tapete',
  },
  'Plancha lateral': {
    isTimed: true,
    defaultSeconds: 30,
    targetMuscles: ['Oblicuos', 'Abductor de cadera', 'Hombros'],
    tips: ['Cuerpo de lado apoyado en un antebrazo justo debajo del hombro', 'Eleva la cadera formando una línea diagonal perfecta'],
    equipmentNeeded: 'Tapete',
  },
  'Plancha dinámica': {
    isTimed: true,
    defaultSeconds: 40,
    targetMuscles: ['Core', 'Tríceps', 'Hombros'],
    tips: ['Pasa de posición de antebrazos a posición de flexión con palmas alternando brazos', 'Evita balancear las caderas'],
    equipmentNeeded: 'Tapete',
  },
  'Crunches': {
    isTimed: false,
    defaultSeconds: 0,
    targetMuscles: ['Abdomen superior'],
    tips: ['Eleva los hombros del suelo concentrando el esfuerzo en el abdomen', 'No tires del cuello con las manos'],
    equipmentNeeded: 'Tapete',
  },
  'Bicycle crunches': {
    isTimed: false,
    defaultSeconds: 0,
    targetMuscles: ['Oblicuos', 'Abdomen general'],
    tips: ['Lleva el codo hacia la rodilla contraria mientras extiendes la otra pierna', 'Movimiento fluido y controlado sin prisas'],
    equipmentNeeded: 'Tapete',
  },
  'Elevaciones de piernas': {
    isTimed: false,
    defaultSeconds: 0,
    targetMuscles: ['Abdomen inferior', 'Flexores de cadera'],
    tips: ['Acuéstate boca arriba con manos bajo los glúteos', 'Eleva las piernas rectas a 90° y baja despacio sin tocar el suelo'],
    equipmentNeeded: 'Tapete',
  },
  'Hollow body hold': {
    isTimed: true,
    defaultSeconds: 30,
    targetMuscles: ['Transverso profundo', 'Abdomen'],
    tips: ['Pega la zona lumbar contra el suelo sin dejar ningún hueco', 'Extiende brazos hacia atrás y piernas hacia adelante a 45°'],
    equipmentNeeded: 'Tapete',
  },
  'Dead bug': {
    isTimed: false,
    defaultSeconds: 0,
    targetMuscles: ['Core profundo', 'Coordinación'],
    tips: ['Extiende brazo derecho y pierna izquierda mientras mantienes la espalda plana', 'Regresa al centro y alterna de forma controlada'],
    equipmentNeeded: 'Tapete',
  },
  'Bird dog': {
    isTimed: false,
    defaultSeconds: 0,
    targetMuscles: ['Lumbares', 'Glúteos', 'Estabilidad escapular'],
    tips: ['En cuatro puntos, estira brazo y pierna opuesta formando una línea recta', 'Sostén 1 segundo y cambia sin rotar la columna'],
    equipmentNeeded: 'Tapete',
  },
  'Giros rusos': {
    isTimed: false,
    defaultSeconds: 0,
    targetMuscles: ['Oblicuos', 'Abdomen rotacional'],
    tips: ['Siéntate con rodillas flexionadas e inclina el torso a 45°', 'Gira los hombros de lado a lado tocando el suelo con las manos'],
    equipmentNeeded: 'Tapete',
  },

  // Cardio & HIIT
  'Jumping Jacks': {
    isTimed: true,
    defaultSeconds: 45,
    targetMuscles: ['Cuerpo completo', 'Sistema cardiovascular'],
    tips: ['Abre piernas y junta brazos sobre la cabeza al saltar', 'Aterriza con suavidad en la punta de los pies con rodillas relajadas'],
    equipmentNeeded: 'Ninguno',
  },
  'Mountain Climbers': {
    isTimed: true,
    defaultSeconds: 35,
    targetMuscles: ['Abdomen', 'Hombros', 'Cardio'],
    tips: ['En posición de flexión, lleva las rodillas hacia el pecho de forma alterna y rápida', 'Mantén la cadera baja a la altura de los hombros'],
    equipmentNeeded: 'Ninguno',
  },
  'High Knees': {
    isTimed: true,
    defaultSeconds: 30,
    targetMuscles: ['Cuádriceps', 'Flexores de cadera', 'Cardio'],
    tips: ['Corre en el sitio elevando las rodillas a la altura de la cadera', 'Mueve los brazos en sincronía y mantén el torso erguido'],
    equipmentNeeded: 'Ninguno',
  },
  'Burpees': {
    isTimed: false,
    defaultSeconds: 0,
    targetMuscles: ['Cuerpo completo', 'Potencia', 'Cardio extremo'],
    tips: ['Pasa de pie a posición de flexión tocando el pecho en el suelo', 'Salta hacia adelante con los pies y salta verticalmente dando una palmada'],
    equipmentNeeded: 'Ninguno',
  },
  'Skaters': {
    isTimed: true,
    defaultSeconds: 40,
    targetMuscles: ['Glúteo medio', 'Piernas', 'Agilidad'],
    tips: ['Salta lateralmente de un pie al otro cruzando la pierna libre por detrás', 'Flexiona la rodilla de apoyo para absorber el impacto'],
    equipmentNeeded: 'Espacio libre de 2 metros',
  },
};

export const getExerciseMetadata = (name: string): ExerciseMeta => {
  if (EXERCISE_METADATA[name]) {
    return EXERCISE_METADATA[name];
  }

  const cleanName = name.toLowerCase().trim();
  const matchedKey = Object.keys(EXERCISE_METADATA).find(
    (k) => cleanName.includes(k.toLowerCase()) || k.toLowerCase().includes(cleanName)
  );

  if (matchedKey) {
    return EXERCISE_METADATA[matchedKey];
  }

  return {
    isTimed: false,
    defaultSeconds: 0,
    targetMuscles: ['Cuerpo completo'],
    tips: ['Mantén una postura erguida', 'Respira de forma constante y controlada', 'Ejecuta el movimiento con técnica limpia'],
    equipmentNeeded: 'Ninguno (Peso corporal)',
  };
};
