import { db } from "@/data/db";
import type { TravelProfileView, VisitedDestinationView } from "./types";

/**
 * Builds the extra prompt paragraph that personalizes a generation
 * from the traveler's saved profile. Returns null when there is
 * nothing useful to add (FR-002/FR-005: never block generation).
 */
export function profileSummaryForPrompt(input: {
  profile: TravelProfileView | null;
  visited: VisitedDestinationView[];
}): string | null {
  const { profile, visited } = input;
  const parts: string[] = [];

  if (profile) {
    if (profile.pace) parts.push(`prefers a ${profile.pace.toLowerCase()} pace`);
    if (profile.budgetStyle)
      parts.push(`usually travels ${profile.budgetStyle.toLowerCase()}`);
    if (profile.interests.length)
      parts.push(`loves ${profile.interests.join(", ")}`);
    if (profile.dietaryNeeds)
      parts.push(`dietary needs: ${profile.dietaryNeeds}`);
    if (profile.accessibilityNeeds)
      parts.push(`accessibility needs: ${profile.accessibilityNeeds}`);
    if (profile.notes) parts.push(`personal notes: ${profile.notes}`);
  }

  if (visited.length) {
    const places = visited
      .slice(0, 20)
      .map((item) => (item.city ? `${item.city}, ${item.country}` : item.country))
      .join("; ");
    parts.push(
      `has already visited: ${places} (avoid suggesting the same famous highlights they have already seen)`
    );
  }

  if (parts.length === 0) return null;

  return `TRAVELER PROFILE — personalize this plan for a traveler who: ${parts.join("; ")}.`;
}

/**
 * Loads and formats the caller's profile context for trip generation.
 * Never throws — a missing profile simply produces null.
 */
export async function loadProfileSummary(
  userId: string
): Promise<string | null> {
  try {
    const [profile, visited] = await Promise.all([
      db.travelProfile.findUnique({ where: { userId } }),
      db.visitedDestination.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
    ]);

    return profileSummaryForPrompt({
      profile: profile
        ? {
            pace: profile.pace,
            budgetStyle: profile.budgetStyle,
            interests: profile.interests ?? [],
            dietaryNeeds: profile.dietaryNeeds,
            accessibilityNeeds: profile.accessibilityNeeds,
            notes: profile.notes,
          }
        : null,
      visited: visited.map((item) => ({
        id: item.id,
        country: item.country,
        city: item.city,
        year: item.year,
      })),
    });
  } catch (error) {
    console.log("loadProfileSummary failed:", error);
    return null;
  }
}
