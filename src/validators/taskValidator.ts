import { z } from "zod";

export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1),
  }),
});

export const updateTaskSchema = z.object({
  params: z.object({
    id: z.uuid(),
  }),
  body: z.object({
    title: z.string().min(1),
    done: z.boolean(),
  }),
});
