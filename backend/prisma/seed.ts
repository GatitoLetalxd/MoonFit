import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed with clean, premium routines...');

  const adminEmail = process.env.ADMIN_INITIAL_EMAIL || 'rogeeromontufar@gmail.com';
  const adminPassword = process.env.ADMIN_INITIAL_PASSWORD || '72091907';

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  // 1. Create or update Administrator
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password_hash: passwordHash,
      role: Role.ADMIN,
      active: true,
    },
    create: {
      name: 'Admin MoonFit',
      email: adminEmail,
      password_hash: passwordHash,
      role: Role.ADMIN,
      active: true,
      onboarding_completed: true,
    },
  });

  console.log(`✅ Administrator ready: ${admin.email} (Role: ${admin.role})`);

  // 2. Clean previous predefined routines
  await prisma.routineExercise.deleteMany({
    where: { routine: { is_predefined: true } },
  });
  await prisma.routineAssignment.deleteMany({
    where: { routine: { is_predefined: true } },
  });
  await prisma.workoutLog.deleteMany({
    where: { routine: { is_predefined: true } },
  });
  await prisma.routine.deleteMany({
    where: { is_predefined: true },
  });

  // 3. 7 Evidence-Based Routines (Bodyweight & Accessible, Fat Loss & Toning for 18-35 Female/Adults)
  const cleanRoutines = [
    {
      name: 'Lunes: Glúteos y Piernas (Fuerza & Tonificación)',
      type: 'fuerza',
      is_predefined: true,
      exercises: [
        { exercise_name: 'Puente de Glúteos con Pausa de 2s', sets: 4, reps: 15, rest_seconds: 45, order_index: 1 },
        { exercise_name: 'Sentadillas Búlgaras con Apoyo Elevado', sets: 3, reps: 10, rest_seconds: 45, order_index: 2 },
        { exercise_name: 'Sentadilla Isométrica en Pared (Wall Sit)', sets: 3, reps: 45, rest_seconds: 45, order_index: 3 },
        { exercise_name: 'Zancadas Dinámicas Alternas', sets: 3, reps: 12, rest_seconds: 45, order_index: 4 },
        { exercise_name: 'Elevaciones de Talones para Gemelos', sets: 3, reps: 20, rest_seconds: 30, order_index: 5 },
      ],
    },
    {
      name: 'Martes: Quema Grasa y Aceleración Metabólica (HIIT)',
      type: 'HIIT',
      is_predefined: true,
      exercises: [
        { exercise_name: 'Saltos en Tijera (Jumping Jacks)', sets: 4, reps: 45, rest_seconds: 30, order_index: 1 },
        { exercise_name: 'Escaladores de Montaña (Mountain Climbers)', sets: 4, reps: 30, rest_seconds: 30, order_index: 2 },
        { exercise_name: 'Sentadillas con Salto Explosivo', sets: 4, reps: 15, rest_seconds: 30, order_index: 3 },
        { exercise_name: 'Burpees Controlados', sets: 3, reps: 10, rest_seconds: 45, order_index: 4 },
        { exercise_name: 'Paso de Patinador Lateral (Skater Hops)', sets: 4, reps: 30, rest_seconds: 30, order_index: 5 },
      ],
    },
    {
      name: 'Miércoles: Torso Firme, Brazos y Espalda',
      type: 'fuerza',
      is_predefined: true,
      exercises: [
        { exercise_name: 'Flexiones de Pecho (Inclinadas o Rodillas)', sets: 4, reps: 10, rest_seconds: 45, order_index: 1 },
        { exercise_name: 'Remo con Tensión en Toalla / Botellas', sets: 4, reps: 12, rest_seconds: 45, order_index: 2 },
        { exercise_name: 'Fondos de Tríceps en Apoyo Elevado', sets: 3, reps: 12, rest_seconds: 45, order_index: 3 },
        { exercise_name: 'Plancha con Toques de Hombro Controlados', sets: 3, reps: 16, rest_seconds: 30, order_index: 4 },
        { exercise_name: 'Elevaciones de Brazos en Y-T-W (Espalda y Postura)', sets: 3, reps: 12, rest_seconds: 30, order_index: 5 },
      ],
    },
    {
      name: 'Jueves: Cintura Esbelta y Vientre Plano (Core)',
      type: 'core',
      is_predefined: true,
      exercises: [
        { exercise_name: 'Plancha Abdominal Frontal Isométrica', sets: 4, reps: 45, rest_seconds: 45, order_index: 1 },
        { exercise_name: 'Bicho Muerto (Deadbug para Vientre Plano)', sets: 3, reps: 12, rest_seconds: 45, order_index: 2 },
        { exercise_name: 'Plancha Lateral con Elevación de Cadera', sets: 3, reps: 10, rest_seconds: 45, order_index: 3 },
        { exercise_name: 'Perro de Caza (Bird-Dog para Lumbar y Glúteo)', sets: 3, reps: 12, rest_seconds: 30, order_index: 4 },
        { exercise_name: 'Bicicleta Abdominal con Respiración Rítmica', sets: 3, reps: 20, rest_seconds: 30, order_index: 5 },
      ],
    },
    {
      name: 'Viernes: Glúteos Redondos y Cadena Posterior',
      type: 'fuerza',
      is_predefined: true,
      exercises: [
        { exercise_name: 'Puente de Glúteos a Una Sola Pierna', sets: 4, reps: 12, rest_seconds: 45, order_index: 1 },
        { exercise_name: 'Sentadilla Profunda con Pausa de 2 Segundos Abajo', sets: 4, reps: 15, rest_seconds: 45, order_index: 2 },
        { exercise_name: 'Deslizamiento de Isquiotibiales con Toalla', sets: 3, reps: 10, rest_seconds: 45, order_index: 3 },
        { exercise_name: 'Patadas de Glúteo en Cuadrupedia con Isometría', sets: 3, reps: 15, rest_seconds: 30, order_index: 4 },
        { exercise_name: 'Abducciones de Cadera (Clamshells) Acostada', sets: 3, reps: 20, rest_seconds: 30, order_index: 5 },
      ],
    },
    {
      name: 'Sábado: Circuito Total Body Quema Grasa',
      type: 'cardio',
      is_predefined: true,
      exercises: [
        { exercise_name: 'Sentadillas con Elevación de Brazos al Techo', sets: 4, reps: 15, rest_seconds: 30, order_index: 1 },
        { exercise_name: 'Saltos de Cuerda Simulados en el Sitio', sets: 4, reps: 60, rest_seconds: 30, order_index: 2 },
        { exercise_name: 'Zancadas Reversas con Elevación de Rodilla', sets: 3, reps: 10, rest_seconds: 45, order_index: 3 },
        { exercise_name: 'Plancha Spiderman (Rodilla al Codo)', sets: 3, reps: 14, rest_seconds: 30, order_index: 4 },
        { exercise_name: 'Paso del Oso Isométrico (Bear Crawl Hold)', sets: 3, reps: 30, rest_seconds: 45, order_index: 5 },
      ],
    },
    {
      name: 'Domingo: Movilidad, Estiramientos & Flexibilidad',
      type: 'core',
      is_predefined: true,
      exercises: [
        { exercise_name: 'Estiramiento Gato-Vaca para Columna', sets: 3, reps: 10, rest_seconds: 30, order_index: 1 },
        { exercise_name: 'Postura de la Paloma para Glúteos y Caderas', sets: 3, reps: 45, rest_seconds: 30, order_index: 2 },
        { exercise_name: 'Apertura de Pecho y Hombros en Pared', sets: 3, reps: 30, rest_seconds: 30, order_index: 3 },
        { exercise_name: 'Postura del Niño (Child’s Pose) para Relajar Espalda', sets: 3, reps: 45, rest_seconds: 30, order_index: 4 },
        { exercise_name: 'Respiración Diafragmática y Vacío Abdominal Suave', sets: 3, reps: 6, rest_seconds: 30, order_index: 5 },
      ],
    },
  ];

  for (const routineData of cleanRoutines) {
    const created = await prisma.routine.create({
      data: {
        name: routineData.name,
        type: routineData.type,
        is_predefined: true,
        exercises: {
          create: routineData.exercises,
        },
      },
    });
    console.log(`💪 Predefined Routine created: ${created.name}`);
  }

  console.log('✨ All 7 clean routines installed successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
