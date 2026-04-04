import { z } from 'zod';

export const userIdSchema = z.object({
  id: z.coerce.number().int().positive('User id must be a positive integer'),
});

export const updateUserSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters long').trim().optional(),
  email: z.email('Invalid email address').toLowerCase().trim().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters long').optional(),
  role: z.enum(['user', 'admin']).optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update',
});
