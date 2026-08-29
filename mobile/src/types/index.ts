export type Role = 'USER' | 'ADMIN';
export type GoalStatus = 'ACTIVA' | 'CUMPLIDA' | 'ABANDONADA';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  age?: number | null;
  height_cm?: number | null;
  initial_weight_kg?: number | null;
  avatar_url?: string | null;
  active: boolean;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Goal {
  id: number;
  user_id: string;
  target_weight_kg: number;
  target_date: string;
  status: GoalStatus;
  created_at: string;
  updated_at: string;
}

export interface RoutineExercise {
  id: number;
  routine_id: number;
  exercise_name: string;
  sets: number;
  reps: number;
  rest_seconds: number;
  order_index: number;
}

export interface Routine {
  id: number;
  user_id?: string | null;
  name: string;
  type: string;
  is_predefined: boolean;
  created_at: string;
  updated_at: string;
  exercises?: RoutineExercise[];
}

export interface WorkoutLog {
  id: number;
  user_id: string;
  routine_id: number;
  routine?: Routine;
  status: 'COMPLETADA' | 'CANCELADA';
  duration_seconds?: number | null;
  exercises_completed?: number | null;
  total_exercises?: number | null;
  completed_at: string;
}

export interface WeeklyWeightLog {
  id: number;
  user_id: string;
  week_start_date: string;
  weight_kg: number;
  notes?: string | null;
  logged_at: string;
  updated_at: string;
}

export interface BodyMeasurement {
  id: number;
  user_id: string;
  week_start_date: string;
  waist_cm?: number | null;
  arm_cm?: number | null;
  other_json?: any;
  created_at: string;
}

export interface ProgressPhoto {
  id: string;
  user_id: string;
  storage_path: string;
  taken_at: string;
  created_at: string;
}

export interface Meal {
  id: number;
  user_id: string;
  description?: string | null;
  meal_type?: string | null;
  logged_at: string;
  created_at: string;
  photos?: { id: string; storage_path: string }[];
}

export interface WaterLog {
  id: number;
  user_id: string;
  amount_ml: number;
  logged_at: string;
}

export interface Reminder {
  id: number;
  user_id: string;
  type: string;
  time: string;
  frequency: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
  errors?: any[];
}
