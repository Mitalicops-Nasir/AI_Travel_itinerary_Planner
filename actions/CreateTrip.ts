"use server";

import { db } from "@/data/db";
import {
  NewTrip,
  TripGenerateSchema,
} from "@/FormsRelatedConfig/validationZod/TripGenerateSchema";
import { google } from "@ai-sdk/google";
import { generateText, Output } from "ai";
import { z } from "zod";
import { requireUser } from "@/lib/guards";
import { buildTripPrompt } from "@/lib/trip-prompt";
import { loadProfileSummary } from "@/features/travel-memory/lib";
import { assertCanGenerate } from "@/features/membership/lib";

type TripGenerateOutput = z.infer<typeof TripGenerateSchema>;

/** Accepts a Date (date picker) or a yyyy-mm-dd string; null when empty. */
function parseStartDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null;

  const parsed = value instanceof Date ? value : new Date(`${value}T09:00:00`);

  if (Number.isNaN(parsed.getTime())) return null;

  return parsed;
}

async function searchTripImages(query: string): Promise<string[]> {
  const unsplashApiKey = process.env.UNSPLASH_ACCESS_KEY;

  if (!unsplashApiKey) return [];

  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
        query
      )}&per_page=3&client_id=${unsplashApiKey}`
    );

    if (!response.ok) return [];

    const data = await response.json();

    if (!Array.isArray(data?.results)) return [];

    return data.results
      .slice(0, 3)
      .map((result: { urls?: { regular?: string } }) => result.urls?.regular)
      .filter((url: string | undefined): url is string => Boolean(url));
  } catch (error) {
    // Images are a nice-to-have; never block trip generation on them
    console.log("Unsplash search failed:", error);
    return [];
  }
}

export async function GenerateAITripIternary(values: z.infer<typeof NewTrip>) {
  try {
    const { user, error: authError } = await requireUser(
      "You must be logged in to generate a trip."
    );

    if (!user) {
      return { success: false, error: authError };
    }

    const validatedFields = NewTrip.safeParse(values);

    if (!validatedFields.success) {
      return { success: false, error: "Invalid trip details." };
    }

    const validated = validatedFields.data;

    // Free-tier quota gate (FR-027/030) — checked before any AI work
    const gate = await assertCanGenerate(user.id);

    if (!gate.ok) {
      return {
        success: false as const,
        error: gate.error,
        limitReached: true as const,
        quota: gate.quota,
      };
    }

    // Optional travel dates: startDate drives the live "Today" view
    const startDate = parseStartDate(validated.startDate);
    const endDate = startDate
      ? new Date(
          startDate.getTime() + (validated.duration - 1) * 86_400_000
        )
      : null;

    // Optional personalization from the traveler's saved memory (never blocks)
    const profileSummary = await loadProfileSummary(user.id);

    const prompt = profileSummary
      ? `${buildTripPrompt(validated)}\n\n${profileSummary}`
      : buildTripPrompt(validated);

    const model = google("gemini-2.5-flash");

    // Images are independent of the AI response, so search them in parallel
    const [imageUrls, result] = await Promise.all([
      searchTripImages(
        `${validated.country} ${validated.interests} ${validated.travelStyle}`
      ),
      generateText({
        model,
        // @ts-expect-error - complex schema causes deep type instantiation
        output: Output.object({ schema: TripGenerateSchema }),
        prompt,
      }),
    ]);

    const aiTrip = result.output as TripGenerateOutput | undefined;

    if (!aiTrip) {
      return { success: false, error: "Failed to generate AI trip itinerary" };
    }

    // Single nested write so a failed response never leaves an orphan Trip row
    const trip = await db.trip.create({
      data: {
        userId: user.id,
        country: validated.country,
        duration: validated.duration,
        groupType: validated.groupType,
        travelStyle: validated.travelStyle,
        interests: validated.interests,
        budgetEstimate: validated.budgetEstimate,
        startDate,
        endDate,
        aiResponse: {
          create: {
            title: aiTrip.name,
            description: aiTrip.description,
            estimatedPrice: aiTrip.estimatedPrice,
            duration: aiTrip.duration,
            budget: aiTrip.budget,
            travelStyle: aiTrip.travelStyle,
            interests: aiTrip.interests,
            groupType: aiTrip.groupType,
            tags: aiTrip.tags,
            country: aiTrip.country,
            images: imageUrls,
            itinerary: {
              day: aiTrip.itinerary,
            },
            bestTimeToVisit: aiTrip.bestTimeToVisit,
            weatherInfo: aiTrip.weatherInfo,
            location: {
              city: aiTrip.location.city,
              coordinates: aiTrip.location.coordinates,
            },
          },
        },
      },
      include: {
        aiResponse: true,
      },
    });

    return {
      success: true,
      aiTrip: trip.aiResponse,
    };
  } catch (error) {
    console.log("Error generating AI trip itinerary:", error);
    return { success: false, error: "Failed to generate AI trip itinerary" };
  }
}
