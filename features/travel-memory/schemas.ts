import { z } from "zod";

export const TravelProfileInputSchema = z.object({
  pace: z.string().max(40).optional(),
  budgetStyle: z.string().max(40).optional(),
  interests: z.array(z.string().min(1).max(60)).max(20),
  dietaryNeeds: z.string().max(200).optional(),
  accessibilityNeeds: z.string().max(200).optional(),
  notes: z.string().max(600).optional(),
});

export type TravelProfileInput = z.infer<typeof TravelProfileInputSchema>;

export const VisitedDestinationInputSchema = z.object({
  country: z.string().min(2).max(80),
  city: z.string().max(80).optional(),
  year: z.coerce.number().int().min(1950).max(2100).optional(),
});

export type VisitedDestinationInput = z.infer<
  typeof VisitedDestinationInputSchema
>;
