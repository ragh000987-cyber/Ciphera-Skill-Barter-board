import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),

  bio: z.string().trim().max(1000).nullable().optional(),

  avatarUrl: z.string().url().nullable().optional(),

  location: z.string().trim().max(120).nullable().optional(),

  timeZone: z.string().trim().min(1).max(100).optional(),
}).strict();

export const searchUsersSchema = z.object({
  q: z.string().trim().max(100).default(""),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
