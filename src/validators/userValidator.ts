import { z } from "zod";

export const createUserSchema = z.object({
  body: z.object({
    email: z.email(),
    password: z.string(),
  }),
});

export const updateUserSchema = z.object({
  body: z.object({
    email: z.email().optional(),
    name: z.string().min(1).optional(),
  }),
});
