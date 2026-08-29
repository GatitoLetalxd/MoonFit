import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Formato de correo inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  age: z.number().int().positive().optional(),
  height_cm: z.number().positive().optional(),
  initial_weight_kg: z.number().positive().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Formato de correo inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'El refreshToken es requerido'),
});
