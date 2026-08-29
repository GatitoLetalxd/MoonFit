import { apiClient, BASE_API_URL } from './client';
import {
  User,
  Routine,
  WorkoutLog,
  WeeklyWeightLog,
  ProgressPhoto,
  Meal,
  WaterLog,
  Goal,
  Reminder,
  ApiResponse,
} from '../types';

export const authApi = {
  async register(data: { name: string; email: string; password: string }) {
    const res = await apiClient.post<
      ApiResponse<{
        user: User;
        accessToken?: string;
        access_token?: string;
        refreshToken?: string;
        refresh_token?: string;
      }>
    >('/auth/register', data);
    return res.data;
  },

  async login(data: { email: string; password: string }) {
    const res = await apiClient.post<
      ApiResponse<{
        user: User;
        accessToken?: string;
        access_token?: string;
        refreshToken?: string;
        refresh_token?: string;
      }>
    >('/auth/login', data);
    return res.data;
  },

  async getProfile() {
    const res = await apiClient.get<ApiResponse<User>>('/users/profile');
    return res.data;
  },
};

export const usersApi = {
  async completeOnboarding(data: {
    age?: number;
    height_cm?: number;
    initial_weight_kg?: number;
    target_weight_kg?: number;
    target_date?: string;
    reminder_time?: string;
    reminder_type?: string;
  }) {
    const res = await apiClient.put<ApiResponse<User>>('/users/onboarding', data);
    return res.data;
  },

  async uploadAvatar(formData: FormData) {
    const res = await apiClient.post<ApiResponse<User>>('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  getAvatarUrl(userId: string) {
    return `${BASE_API_URL}/users/${userId}/avatar`;
  },
};

export const routinesApi = {
  async getRoutines() {
    const res = await apiClient.get<ApiResponse<any>>('/routines');
    const payload = res.data?.data ?? res.data;
    if (payload && typeof payload === 'object') {
      if (Array.isArray(payload)) {
        return { ...res.data, data: payload as Routine[] };
      }
      const dataObj = payload as Record<string, any>;
      const combined: Routine[] = [
        ...(Array.isArray(dataObj.assigned) ? dataObj.assigned : []),
        ...(Array.isArray(dataObj.userCreated) ? dataObj.userCreated : []),
        ...(Array.isArray(dataObj.predefined) ? dataObj.predefined : []),
      ];
      return { ...res.data, data: combined };
    }
    return { ...res.data, data: [] as Routine[] };
  },

  async createRoutine(data: {
    name: string;
    type: string;
    exercises: { exercise_name: string; sets: number; reps: number; rest_seconds: number }[];
  }) {
    const res = await apiClient.post<ApiResponse<Routine>>('/routines', data);
    return res.data;
  },
};

export const workoutsApi = {
  async log(
    data:
      | {
          routine_id: number;
          status?: 'COMPLETADA' | 'CANCELADA';
          duration_seconds?: number;
          exercises_completed?: number;
          total_exercises?: number;
          completed_at?: string;
        }
      | number
  ) {
    const payload = typeof data === 'number' ? { routine_id: data, status: 'COMPLETADA' } : data;
    const res = await apiClient.post<ApiResponse<WorkoutLog>>('/workouts', payload);
    return res.data;
  },

  async getHistory() {
    const res = await apiClient.get<ApiResponse<WorkoutLog[]>>('/workouts');
    return res.data;
  },
};

export const progressApi = {
  async getWeightLogs() {
    const res = await apiClient.get<ApiResponse<WeeklyWeightLog[]>>('/progress/weight');
    return res.data;
  },

  async logWeight(data: { weight_kg: number; notes?: string; date?: string }) {
    const res = await apiClient.post<ApiResponse<WeeklyWeightLog>>('/progress/weight', data);
    return res.data;
  },

  async getPhotos() {
    const res = await apiClient.get<ApiResponse<ProgressPhoto[]>>('/progress/photos');
    return res.data;
  },

  async uploadPhoto(formData: FormData) {
    const res = await apiClient.post<ApiResponse<ProgressPhoto>>('/progress/photos', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  getPhotoViewUrl(photoId: string, token?: string | null) {
    if (token) {
      return `${BASE_API_URL}/progress/photos/${photoId}/view?token=${encodeURIComponent(token)}`;
    }
    return `${BASE_API_URL}/progress/photos/${photoId}/view`;
  },
};

export const nutritionApi = {
  async getMeals() {
    const res = await apiClient.get<ApiResponse<Meal[]>>('/nutrition/meals');
    return res.data;
  },

  async logMeal(formData: FormData) {
    const res = await apiClient.post<ApiResponse<Meal>>('/nutrition/meals', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  async getTodayWater() {
    const res = await apiClient.get<ApiResponse<{ total_ml: number }>>('/nutrition/water');
    return res.data;
  },

  async logWater(amount_ml: number) {
    const res = await apiClient.post<ApiResponse<WaterLog>>('/nutrition/water', { amount_ml });
    return res.data;
  },
};

export const goalsApi = {
  async getActiveGoal() {
    const res = await apiClient.get<ApiResponse<Goal>>('/goals/active');
    return res.data;
  },

  async setGoal(data: { target_weight_kg: number; target_date: string }) {
    const res = await apiClient.post<ApiResponse<Goal>>('/goals', data);
    return res.data;
  },
};

export const remindersApi = {
  async getReminders() {
    const res = await apiClient.get<ApiResponse<Reminder[]>>('/reminders');
    return res.data;
  },

  async createReminder(data: { type: string; time: string; frequency?: string; active?: boolean }) {
    const res = await apiClient.post<ApiResponse<Reminder>>('/reminders', data);
    return res.data;
  },

  async updateReminder(id: number, data: { type?: string; time?: string; frequency?: string; active?: boolean }) {
    const res = await apiClient.put<ApiResponse<Reminder>>(`/reminders/${id}`, data);
    return res.data;
  },

  async deleteReminder(id: number) {
    const res = await apiClient.delete<ApiResponse<null>>(`/reminders/${id}`);
    return res.data;
  },
};
