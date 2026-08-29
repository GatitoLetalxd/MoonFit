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
}

export interface Exercise {
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
  exercises: Exercise[];
  assigned_by?: string;
  assigned_at?: string;
}

export interface WorkoutLog {
  id: number;
  user_id: string;
  routine_id: number;
  status: 'COMPLETADA' | 'CANCELADA';
  duration_seconds?: number | null;
  exercises_completed?: number | null;
  total_exercises?: number | null;
  completed_at: string;
  routine: {
    id: number;
    name: string;
    type: string;
    exercises?: Exercise[];
  };
}

export interface WeeklyWeightLog {
  id: number;
  user_id: string;
  week_start_date: string;
  weight_kg: number;
  notes?: string | null;
  logged_at: string;
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

export interface MealPhoto {
  id: string;
  meal_id: number;
  storage_path: string;
  created_at: string;
}

export interface Meal {
  id: number;
  user_id: string;
  description?: string | null;
  meal_type?: string | null;
  logged_at: string;
  photos: MealPhoto[];
}

export interface WaterLog {
  id: number;
  user_id: string;
  amount_ml: number;
  logged_at: string;
}

export interface WaterSummary {
  date: string;
  total_ml: number;
  reference_ml: number;
  logs: WaterLog[];
}

export interface Goal {
  id: number;
  user_id: string;
  target_weight_kg: number;
  target_date: string;
  status: GoalStatus;
  initial_weight_kg?: number | null;
  current_weight_kg?: number | null;
  progress_percentage?: number;
  created_at: string;
}

export interface Reminder {
  id: number;
  user_id: string;
  type: string;
  time: string;
  frequency: string;
  active: boolean;
  created_at: string;
}

export interface AdminFeedback {
  id: number;
  user_id: string;
  admin_id: string;
  message: string;
  created_at: string;
  admin?: {
    id: string;
    name: string;
    email?: string;
  };
}

export interface AdminUserListItem {
  id: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
  age?: number | null;
  height_cm?: number | null;
  initial_weight_kg?: number | null;
  onboarding_completed: boolean;
  created_at: string;
  _count: {
    weekly_weight_logs: number;
    progress_photos: number;
    workout_logs: number;
    meals: number;
  };
}

export interface AdminUserDetail extends User {
  goals: Goal[];
  weekly_weight_logs: WeeklyWeightLog[];
  body_measurements: BodyMeasurement[];
  progress_photos: { id: string; taken_at: string; created_at: string }[];
  assigned_routines: {
    id: number;
    routine_id: number;
    assigned_at: string;
    routine: Routine;
  }[];
  workout_logs: WorkoutLog[];
  meals: Meal[];
  reminders: Reminder[];
  received_feedback: AdminFeedback[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: any;
}
