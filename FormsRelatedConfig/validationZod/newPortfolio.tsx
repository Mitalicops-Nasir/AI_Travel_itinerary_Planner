import { z } from "zod";

export const newPortfolio = z.object({
  title: z.string().min(3),
  shortDescription: z.string().min(3),
  description: z.string().min(3),
  image: z.string().min(3),
  liveLink: z.string().min(3),
  githubLink: z.string().min(3),
  FullStack: z.boolean(),
  FrontEnd: z.boolean(),
  aiFullStack: z.boolean(),
});
