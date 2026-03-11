import { z } from "zod";

export const createTokenSchema = z.object({
  body: z.object({
    email: z.email(),
    password: z.string(),
  }),
});
