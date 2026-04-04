import {z } from 'zod';

export const signupSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters long').trim(),
  email: z.email('Invalid email address').toLowerCase().trim(),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  role: z.enum(['user', 'admin']).default('user'),
});

export const loginSchema = z.object({
  email: z.email('Invalid email address').toLowerCase().trim(),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export const logoutSchema = z.object({
  token: z.string().min(1, 'Token is required'),
});
