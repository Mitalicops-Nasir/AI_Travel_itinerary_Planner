import { z } from "zod";

export const RegisterUser = z.object({
  name: z.string().min(3).max(20),
  email: z.string().email(),
  password: z.string().min(6).max(20),
  phone: z.string().min(10),
});
