import { z } from 'zod'

export const RegisterSchema = z.object({
  name: z
    .string('Name is required')
    .min(2, 'Name must be at least 2 characters long')
    .max(50, 'Name must be at most 50 characters long'),
  email: z.email('Email is required'),
  password: z
    .string('Password is required')
    .min(6, 'Password must be at least 6 characters long')
    .max(50, 'Password must be at most 50 characters long')
})

export const LoginSchema = z.object({
  email: z.email('Email is required'),
  password: z
    .string('Password is required')
    .min(6, 'Password must be at least 6 characters long')
    .max(50, 'Password must be at most 50 characters long')
})
