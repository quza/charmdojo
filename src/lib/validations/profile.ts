import { z } from 'zod';

// Profile update validation
export const profileUpdateSchema = z.object({
  name: z
    .string()
    .min(1, 'Name must be at least 1 character')
    .max(100, 'Name must be less than 100 characters')
    .regex(
      /^[a-zA-Z0-9\s\-_'.]+$/,
      'Name can only contain letters, numbers, spaces, hyphens, underscores, apostrophes, and periods'
    )
    .optional(),
  avatar_url: z.string().url('Invalid avatar URL').optional(),
});

// Password change validation
export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  });

// Avatar file validation (client-side)
export const avatarFileSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, 'File size must be less than 5MB')
    .refine(
      (file) =>
        ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type),
      'File must be a JPEG, PNG, or WebP image'
    ),
});

// Types
export type ProfileUpdateRequest = z.infer<typeof profileUpdateSchema>;
export type PasswordChangeRequest = z.infer<typeof passwordChangeSchema>;
export type AvatarFileValidation = z.infer<typeof avatarFileSchema>;

