import { z } from "zod";

export const RatingSchema = z.object({
  rating: z.coerce.number().min(1).max(5),
});
