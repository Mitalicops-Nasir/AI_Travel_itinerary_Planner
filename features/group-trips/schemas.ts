import { z } from "zod";

export const suggestionInput = z.object({
  tripId: z.string().min(1),
  day: z.coerce.number().int().min(1, "Pick a day"),
  title: z
    .string()
    .trim()
    .min(2, "Give your idea a short title")
    .max(120, "Keep the title under 120 characters"),
  notes: z
    .string()
    .trim()
    .max(500, "Keep the note under 500 characters")
    .optional(),
});

export type SuggestionInput = z.infer<typeof suggestionInput>;
