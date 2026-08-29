import { apiClient, API_BASE_URL, getStoredAccessToken } from './client';
import {
  ApiResponse,
  User,
  Routine,
  WorkoutLog,
  WeeklyWeightLog,
  BodyMeasurement,
  ProgressPhoto,
  Meal,
  WaterSummary,
  WaterLog,
  Goal,
  Reminder,
  AdminUserListItem,
  AdminUserDetail,
  AdminFeedback,
} from '../types';

export const authApi = {
  async register(data: {
    name: string;
    email: string;
    password: string;
    age?: number;
    height_cm?: number;
    initial_weight_kg?: number;
  }) {
    const res = await apiClient.post<ApiResponse<{ user: User; accessToken: string; refreshToken: string }>>(
      '/auth/register',
      data
    );
    return res.data;
  },

  async login(email: string, password: string) {
    const res = await apiClient.post<ApiResponse<{ user: User; accessToken: string; refreshToken: string }>>(
      '/auth/login',
      { email, password }
    );
    return res.data;
  },

  async getMe() {
    const res = await apiClient.get<ApiResponse<User>>('/auth/me');
    return res.data;
  },

  async logout(refreshToken?: string) {
    const res = await apiClient.post<ApiResponse<null>>('/auth/logout', { refreshToken });
    return res.data;
  },
};

export const usersApi = {
  async updateProfile(data: {
    name?: string;
    age?: number;
    height_cm?: number;
    initial_weight_kg?: number;
  }) {
    const res = await apiClient.put<ApiResponse<User>>('/users/profile', data);
    return res.data;
  },

  async uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append('avatar', file);
    const res = await apiClient.post<ApiResponse<User>>('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  getAvatarUrl(userId: string) {
    return `/api/users/${userId}/avatar`;
  },

  async completeOnboarding(data: {
    age?: number;
    height_cm?: number;
    initial_weight_kg?: number;
    target_weight_kg?: number;
    target_date?: string;
    reminder_time?: string;
    reminder_type?: string;
  }) {
    const res = await apiClient.post<ApiResponse<User>>('/users/onboarding', data);
    return res.data;
  },

  async deleteMyAccount() {
    const res = await apiClient.delete<ApiResponse<null>>('/users/me');
    return res.data;
  },
};

export const routinesApi = {
  async list() {
    const res = await apiClient.get<ApiResponse<{
      predefined: Routine[];
      userCreated: Routine[];
      assigned: Routine[];
    }>>('/routines');
    return res.data;
  },

  async getById(id: number) {
    const res = await apiClient.get<ApiResponse<Routine>>(`/routines/${id}`);
    return res.data;
  },

  async create(data: {
    name: string;
    type: string;
    exercises: Array<{
      exercise_name: string;
      sets: number;
      reps: number;
      rest_seconds?: number;
      order_index?: number;
    }>;
  }) {
    const res = await apiClient.post<ApiResponse<Routine>>('/routines', data);
    return res.data;
  },

  async update(id: number, data: Partial<Routine>) {
    const res = await apiClient.put<ApiResponse<Routine>>(`/routines/${id}`, data);
    return res.data;
  },

  async delete(id: number) {
    const res = await apiClient.delete<ApiResponse<null>>(`/routines/${id}`);
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

  async getHistory(limit: number = 50) {
    const res = await apiClient.get<ApiResponse<WorkoutLog[]>>(`/workouts/history?limit=${limit}`);
    return res.data;
  },
};

export const progressApi = {
  async logWeight(data: { weight_kg: number; notes?: string; date?: string }) {
    const res = await apiClient.post<ApiResponse<WeeklyWeightLog>>('/progress/weight', data);
    return res.data;
  },

  async getWeightHistory() {
    const res = await apiClient.get<ApiResponse<WeeklyWeightLog[]>>('/progress/weight');
    return res.data;
  },

  async logMeasurements(data: { waist_cm?: number; arm_cm?: number; other_json?: any; date?: string }) {
    const res = await apiClient.post<ApiResponse<BodyMeasurement>>('/progress/measurements', data);
    return res.data;
  },

  async getMeasurementsHistory() {
    const res = await apiClient.get<ApiResponse<BodyMeasurement[]>>('/progress/measurements');
    return res.data;
  },

  async uploadPhoto(file: File, taken_at?: string) {
    const formData = new FormData();
    formData.append('photo', file);
    if (taken_at) formData.append('taken_at', taken_at);

    const res = await apiClient.post<ApiResponse<ProgressPhoto>>('/progress/photos', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  async listPhotos() {
    const res = await apiClient.get<ApiResponse<ProgressPhoto[]>>('/progress/photos');
    return res.data;
  },

  getPhotoViewUrl(photoId: string): string {
    return `${API_BASE_URL}/progress/photos/${photoId}/view`;
  },

  async deletePhoto(photoId: string) {
    const res = await apiClient.delete<ApiResponse<null>>(`/progress/photos/${photoId}`);
    return res.data;
  },
};

export const nutritionApi = {
  async logMeal(data: { description?: string; meal_type?: string; photo?: File; logged_at?: string }) {
    const formData = new FormData();
    if (data.description) formData.append('description', data.description);
    if (data.meal_type) formData.append('meal_type', data.meal_type);
    if (data.logged_at) formData.append('logged_at', data.logged_at);
    if (data.photo) formData.append('photo', data.photo);

    const res = await apiClient.post<ApiResponse<Meal>>('/nutrition/meals', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  async listMeals(limit: number = 30) {
    const res = await apiClient.get<ApiResponse<Meal[]>>(`/nutrition/meals?limit=${limit}`);
    return res.data;
  },

  getMealPhotoViewUrl(photoId: string): string {
    return `${API_BASE_URL}/nutrition/meals/photos/${photoId}/view`;
  },

  async deleteMeal(mealId: number) {
    const res = await apiClient.delete<ApiResponse<null>>(`/nutrition/meals/${mealId}`);
    return res.data;
  },

  async logWater(amount_ml: number, logged_at?: string) {
    const res = await apiClient.post<ApiResponse<WaterLog>>('/nutrition/water', { amount_ml, logged_at });
    return res.data;
  },

  async getWaterSummary(date?: string) {
    const res = await apiClient.get<ApiResponse<WaterSummary>>(
      date ? `/nutrition/water?date=${date}` : '/nutrition/water'
    );
    return res.data;
  },

  async getReferences() {
    const res = await apiClient.get<ApiResponse<any>>('/nutrition/references');
    return res.data;
  },
};

export const goalsApi = {
  async create(data: { target_weight_kg: number; target_date: string; status?: string }) {
    const res = await apiClient.post<ApiResponse<Goal>>('/goals', data);
    return res.data;
  },

  async list() {
    const res = await apiClient.get<ApiResponse<Goal[]>>('/goals');
    return res.data;
  },

  async update(id: number, data: Partial<Goal>) {
    const res = await apiClient.put<ApiResponse<Goal>>(`/goals/${id}`, data);
    return res.data;
  },

  async delete(id: number) {
    const res = await apiClient.delete<ApiResponse<null>>(`/goals/${id}`);
    return res.data;
  },
};

export const remindersApi = {
  async list() {
    const res = await apiClient.get<ApiResponse<Reminder[]>>('/reminders');
    return res.data;
  },

  async create(data: { type: string; time: string; frequency?: string; active?: boolean }) {
    const res = await apiClient.post<ApiResponse<Reminder>>('/reminders', data);
    return res.data;
  },

  async update(id: number, data: Partial<Reminder>) {
    const res = await apiClient.put<ApiResponse<Reminder>>(`/reminders/${id}`, data);
    return res.data;
  },

  async delete(id: number) {
    const res = await apiClient.delete<ApiResponse<null>>(`/reminders/${id}`);
    return res.data;
  },
};

export const adminApi = {
  async listUsers(params?: { page?: number; limit?: number; search?: string; role?: string }) {
    const res = await apiClient.get<ApiResponse<{ users: AdminUserListItem[]; pagination: any }>>('/admin/users', {
      params,
    });
    return res.data;
  },

  async getUserDetail(id: string) {
    const res = await apiClient.get<ApiResponse<AdminUserDetail>>(`/admin/users/${id}`);
    return res.data;
  },

  async toggleStatus(id: string, active: boolean) {
    const res = await apiClient.patch<ApiResponse<{ id: string; email: string; active: boolean }>>(
      `/admin/users/${id}/status`,
      { active }
    );
    return res.data;
  },

  async changePassword(id: string, password: string) {
    const res = await apiClient.post<ApiResponse<{ message: string }>>(`/admin/users/${id}/change-password`, {
      password,
    });
    return res.data;
  },

  async assignRoutine(id: string, routine_id: number) {
    const res = await apiClient.post<ApiResponse<any>>(`/admin/users/${id}/assign-routine`, {
      routine_id,
    });
    return res.data;
  },

  async sendFeedback(id: string, message: string) {
    const res = await apiClient.post<ApiResponse<AdminFeedback>>(`/admin/users/${id}/feedback`, {
      message,
    });
    return res.data;
  },

  async deleteUser(id: string) {
    const res = await apiClient.delete<ApiResponse<null>>(`/admin/users/${id}`);
    return res.data;
  },
};
