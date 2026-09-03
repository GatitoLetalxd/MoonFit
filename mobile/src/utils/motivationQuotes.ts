export interface MotivationQuote {
  id: string;
  quote: string;
  author: string;
  tip: string;
  tag: 'recomposicion' | 'constancia' | 'paciencia' | 'mente';
}

export const MOTIVATION_QUOTES: MotivationQuote[] = [
  {
    id: '1',
    quote: 'Los cambios más profundos ocurren primero por dentro: en tu energía, tu metabolismo y tu fuerza antes de reflejarse en el espejo.',
    author: 'Filosofía MoonFit',
    tip: 'El músculo activo quema calorías incluso en reposo. Aunque no lo notes hoy, tu motor metabólico está acelerándose.',
    tag: 'paciencia',
  },
  {
    id: '2',
    quote: 'Tu peso puede fluctuar de 1 a 2 kg en un solo día por agua, digestión o estrés. La balanza mide gravedad, no tu grasa corporal.',
    author: 'Ciencia del Hábito',
    tip: 'Al entrenar, los músculos retienen glucógeno y agua para repararse. Esa hinchazón temporal es señal de que estás progresando.',
    tag: 'recomposicion',
  },
  {
    id: '3',
    quote: 'Un entrenamiento de 15 minutos siempre será 100 veces mejor que el entrenamiento perfecto que nunca hiciste.',
    author: 'Mentalidad Imparable',
    tip: 'La consistencia en los días difíciles es lo que construye una verdadera transformación duradera.',
    tag: 'constancia',
  },
  {
    id: '4',
    quote: 'El músculo es denso y firme; la grasa es blanda y voluminosa. Si tu peso no baja pero tu ropa te queda más holgada, estás ganando.',
    author: 'Recomposición Corporal',
    tip: 'Toma fotos y mide cómo te sientes. El espejo y las prendas son jueces mucho más justos que la báscula.',
    tag: 'recomposicion',
  },
  {
    id: '5',
    quote: 'El bambú tarda 5 años en echar raíces bajo tierra antes de crecer 20 metros en solo 6 semanas. Confía en lo que estás sembrando hoy.',
    author: 'Paciencia Activa',
    tip: 'Cada gota de sudor y cada vaso de agua son ladrillos de tu nueva versión. No te rindas justo antes de ver los brotes.',
    tag: 'paciencia',
  },
  {
    id: '6',
    quote: 'No tienes que hacerlo perfecto todos los días, solo tienes que no renunciar.',
    author: 'Comunidad MoonFit',
    tip: 'Si un día no puedes completar todas las series, haz lo que alcances. Lo importante es mantener la chispa viva.',
    tag: 'mente',
  },
  {
    id: '7',
    quote: 'No estás empezando de cero; estás empezando con más experiencia, determinación y claridad que ayer.',
    author: 'Fuerza Interior',
    tip: 'La fatiga de hoy es la resistencia y firmeza de mañana.',
    tag: 'constancia',
  },
  {
    id: '8',
    quote: 'Tu cuerpo escucha todo lo que tu mente le dice. Háblate con orgullo, respeto y paciencia.',
    author: 'Salud Integral',
    tip: 'Agradece lo que tu cuerpo ya es capaz de hacer: levantarse, resistir y adaptarse.',
    tag: 'mente',
  },
];

/**
 * Retorna una frase según el día del año para que haya consistencia diaria
 */
export const getDailyMotivationQuote = (): MotivationQuote => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  const index = Math.abs(dayOfYear) % MOTIVATION_QUOTES.length;
  return MOTIVATION_QUOTES[index];
};

/**
 * Retorna una frase aleatoria para cuando el usuario pulse el botón de refrescar
 */
export const getRandomMotivationQuote = (currentId?: string): MotivationQuote => {
  const filtered = currentId
    ? MOTIVATION_QUOTES.filter((q) => q.id !== currentId)
    : MOTIVATION_QUOTES;
  const randomIndex = Math.floor(Math.random() * filtered.length);
  return filtered[randomIndex] || MOTIVATION_QUOTES[0];
};
