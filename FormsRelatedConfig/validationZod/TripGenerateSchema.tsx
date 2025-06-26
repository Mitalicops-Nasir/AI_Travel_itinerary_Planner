import {
  budgetOptions,
  groupTypes,
  interests,
  travelStyles,
} from "@/constants";
import { z } from "zod";
import { id } from "zod/dist/types/v4/locales";

export const NewTrip = z.object({
  country: z.string().min(3),
  duration: z.coerce
    .number()
    .min(1)
    .max(10, { message: "Maximum 10 days only" }),
  groupType: z.enum([...groupTypes] as [string, ...string[]]),
  travelStyle: z.enum([...travelStyles] as [string, ...string[]]),
  interests: z.enum([...interests] as [string, ...string[]]),
  budgetEstimate: z.enum([...budgetOptions] as [string, ...string[]]),
});

export const TripGenerateSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Name must be at least 3 characters long" }),
  description: z.string(),
  estimatedPrice: z.string().regex(/^\d+$/, {
    message: "Estimated price must be a numeric string like '6000'",
  }),
  duration: z
    .number()
    .int()
    .min(1, { message: "Duration must be at least 1 day" })
    .max(10, { message: "Maximum duration is 10 days" }),
  budget: z.string(),
  travelStyle: z.string(),
  interests: z.string(),
  groupType: z.string(),
  country: z.string(),
  imageUrls: z.array(z.string()),
  itinerary: z.array(
    z.object({
      day: z.number(),
      location: z.string(),
      gettingThere: z.string(),
      activities: z.array(
        z.object({
          time: z.string(),
          description: z.string(),
        })
      ),
    })
  ),
  tags: z.array(z.string()),
  bestTimeToVisit: z.array(z.string()),
  weatherInfo: z.array(z.string()),
  location: z.object({
    city: z.string(),
    coordinates: z.array(z.number()).length(2),
  }),
});
