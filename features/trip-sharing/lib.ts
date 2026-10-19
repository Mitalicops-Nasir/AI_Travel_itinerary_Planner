import { randomUUID } from "crypto";
import { db } from "@/data/db";
import { getTripPhase } from "@/features/trip-day-view/lib";
import { FALLBACK_TRIP_IMAGE, parseJsonField } from "@/lib/trip-view";
import type { PublicTripState, PublicTripView } from "./types";

export function newShareToken(): string {
  return randomUUID();
}

type ShareLinkRow = { token: string; state: "ACTIVE" | "PAUSED" | "REVOKED" } | null;

export function toPublicState(link: ShareLinkRow): PublicTripState {
  if (!link) return "invalid";

  switch (link.state) {
    case "ACTIVE":
      return "active";
    case "PAUSED":
      return "paused";
    default:
      return "revoked";
  }
}

const stateOnly = (state: PublicTripState): PublicTripView => ({
  state,
  updatedAt: new Date().toISOString(),
  traveler: null,
  trip: null,
  route: [],
  visited: [],
  journal: [],
});

/**
 * Builds the public follow-along payload from a share token.
 * Every field is written out explicitly (no spreading of Prisma rows) so no
 * private data can ever leak: no emails, ids, payments, ratings, members,
 * suggestions or budgets (FR-019).
 */
export async function getPublicTrip(token: string): Promise<PublicTripView> {
  try {
    const link = await db.shareLink.findUnique({
      where: { token },
      select: {
        token: true,
        state: true,
        updatedAt: true,
        joinEnabled: true,
        trip: {
          select: {
            id: true,
            country: true,
            startDate: true,
            endDate: true,
            user: { select: { name: true, image: true } },
            aiResponse: {
              select: {
                title: true,
                images: true,
                location: true,
                itinerary: true,
              },
            },
          },
        },
      },
    });

    if (!link) return stateOnly("invalid");

    if (link.state !== "ACTIVE") {
      return stateOnly(link.state === "PAUSED" ? "paused" : "revoked");
    }

    const trip = link.trip;
    const aiResponse = trip.aiResponse;

    const location = parseJsonField<{
      city: string;
      coordinates: number[];
    }>(aiResponse?.location);

    const rawItinerary = parseJsonField<unknown>(aiResponse?.itinerary);
    const days = Array.isArray(rawItinerary)
      ? (rawItinerary as { day: number; location: string }[])
      : ((rawItinerary as { day?: { day: number; location: string }[] } | null)
          ?.day ?? []);

    const [checkIns, journalEntries] = await Promise.all([
      db.checkIn.findMany({
        where: { tripId: trip.id },
        orderBy: { checkedInAt: "asc" },
      }),
      db.journalEntry.findMany({
        where: { tripId: trip.id },
        orderBy: { createdAt: "asc" },
      }),
    ]);

    const coords = location?.coordinates ?? [];
    const lat = typeof coords[0] === "number" ? coords[0] : 0;
    const lng = typeof coords[1] === "number" ? coords[1] : 0;

    return {
      state: "active",
      updatedAt: link.updatedAt.toISOString(),
      traveler: {
        firstName: trip.user.name.split(" ")[0] || "Your traveller",
        image: trip.user.image ?? null,
      },
      trip: {
        title: aiResponse?.title ?? `Trip to ${trip.country}`,
        country: trip.country,
        city: location?.city || trip.country,
        coverImage: aiResponse?.images?.[0] ?? FALLBACK_TRIP_IMAGE,
        startDate: trip.startDate ? trip.startDate.toISOString() : null,
        endDate: trip.endDate ? trip.endDate.toISOString() : null,
        phase: getTripPhase({
          startDate: trip.startDate,
          endDate: trip.endDate,
          country: trip.country,
        }),
      },
      route: days.map((day) => ({
        day: day.day,
        location: day.location,
        lat,
        lng,
      })),
      visited: checkIns.map((checkIn) => ({
        day: checkIn.day,
        stopKey: checkIn.stopKey,
        stopTitle: checkIn.stopTitle,
        checkedInAt: checkIn.checkedInAt.toISOString(),
        note: checkIn.note,
        photoUrl: checkIn.photoUrl,
      })),
      journal: journalEntries.map((entry) => ({
        day: entry.day,
        note: entry.note,
        photos: entry.photos ?? [],
        createdAt: entry.createdAt.toISOString(),
      })),
    };
  } catch (error) {
    console.log("getPublicTrip failed:", error);
    return stateOnly("invalid");
  }
}