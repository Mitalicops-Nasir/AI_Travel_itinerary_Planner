"use server";

import { db } from "@/data/db";
import { requireUser } from "@/lib/guards";
import {
  TravelProfileInputSchema,
  VisitedDestinationInputSchema,
} from "./schemas";
import type { TravelProfileInput } from "./schemas";
import type { TravelProfileView, VisitedDestinationView } from "./types";

function toProfileView(row: {
  pace: string | null;
  budgetStyle: string | null;
  interests: string[];
  dietaryNeeds: string | null;
  accessibilityNeeds: string | null;
  notes: string | null;
}): TravelProfileView {
  return {
    pace: row.pace,
    budgetStyle: row.budgetStyle,
    interests: row.interests ?? [],
    dietaryNeeds: row.dietaryNeeds,
    accessibilityNeeds: row.accessibilityNeeds,
    notes: row.notes,
  };
}

function toVisitedView(row: {
  id: string;
  country: string;
  city: string | null;
  year: number | null;
}): VisitedDestinationView {
  return {
    id: row.id,
    country: row.country,
    city: row.city,
    year: row.year,
  };
}

function clean(value?: string): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export async function getTravelProfile() {
  try {
    const { user, error } = await requireUser();

    if (!user) {
      return {
        success: false as const,
        error,
        profile: null,
        visited: [] as VisitedDestinationView[],
      };
    }

    const [profile, visited] = await Promise.all([
      db.travelProfile.findUnique({ where: { userId: user.id } }),
      db.visitedDestination.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return {
      success: true as const,
      profile: profile ? toProfileView(profile) : null,
      visited: visited.map(toVisitedView),
    };
  } catch (error) {
    console.log("getTravelProfile failed:", error);
    return {
      success: false as const,
      error: "Could not load your travel profile.",
      profile: null,
      visited: [] as VisitedDestinationView[],
    };
  }
}

export async function upsertTravelProfile(input: TravelProfileInput) {
  try {
    const { user, error } = await requireUser();

    if (!user) {
      return { success: false as const, error };
    }

    const parsed = TravelProfileInputSchema.safeParse(input);

    if (!parsed.success) {
      return {
        success: false as const,
        error: "Please check the profile details and try again.",
      };
    }

    const data = parsed.data;
    const fields = {
      pace: clean(data.pace),
      budgetStyle: clean(data.budgetStyle),
      interests: data.interests,
      dietaryNeeds: clean(data.dietaryNeeds),
      accessibilityNeeds: clean(data.accessibilityNeeds),
      notes: clean(data.notes),
    };

    const row = await db.travelProfile.upsert({
      where: { userId: user.id },
      create: { userId: user.id, ...fields },
      update: fields,
    });

    return { success: true as const, profile: toProfileView(row) };
  } catch (error) {
    console.log("upsertTravelProfile failed:", error);
    return {
      success: false as const,
      error: "Could not save your travel profile.",
    };
  }
}

export async function addVisitedDestination(input: {
  country: string;
  city?: string;
  year?: number;
}) {
  try {
    const { user, error } = await requireUser();

    if (!user) {
      return { success: false as const, error };
    }

    const parsed = VisitedDestinationInputSchema.safeParse(input);

    if (!parsed.success) {
      return {
        success: false as const,
        error: "Please add a valid country (and optional city/year).",
      };
    }

    const country = parsed.data.country.trim();
    const city = parsed.data.city?.trim() || null;
    const year = parsed.data.year ?? null;

    const existing = await db.visitedDestination.findFirst({
      where: { userId: user.id, country, city },
    });

    const row = existing
      ? await db.visitedDestination.update({
          where: { id: existing.id },
          data: { year },
        })
      : await db.visitedDestination.create({
          data: { userId: user.id, country, city, year },
        });

    return { success: true as const, destination: toVisitedView(row) };
  } catch (error) {
    console.log("addVisitedDestination failed:", error);
    return {
      success: false as const,
      error: "Could not save this place.",
    };
  }
}

export async function removeVisitedDestination(id: string) {
  try {
    const { user, error } = await requireUser();

    if (!user) {
      return { success: false as const, error };
    }

    const existing = await db.visitedDestination.findUnique({ where: { id } });

    if (!existing || existing.userId !== user.id) {
      return { success: false as const, error: "Place not found." };
    }

    await db.visitedDestination.delete({ where: { id } });

    return { success: true as const };
  } catch (error) {
    console.log("removeVisitedDestination failed:", error);
    return {
      success: false as const,
      error: "Could not remove this place.",
    };
  }
}
