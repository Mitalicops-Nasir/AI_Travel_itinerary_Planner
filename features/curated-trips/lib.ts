import type { Prisma } from "@prisma/client";
import { db } from "@/data/db";

export async function hasCuratedAccess(
  tripId: string,
  viewerId?: string
): Promise<boolean> {
  if (!viewerId) return false;

  const trip = await db.trip.findUnique({
    where: { id: tripId },
    select: { userId: true, isCurated: true },
  });

  if (!trip) return false;
  if (!trip.isCurated) return true;
  if (trip.userId === viewerId) return true;

  const paid = await db.booking.findFirst({
    where: { tripId, userId: viewerId, status: "PAID" },
    select: { id: true },
  });

  return paid !== null;
}

// Webhook-invoked after a curated booking is marked PAID (FR-033).
// Idempotent via Booking.copiedTripId — replays never create a second copy.
export async function cloneTripForBuyer(bookingId: string): Promise<void> {
  try {
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: { trip: { include: { aiResponse: true } } },
    });

    if (!booking || booking.status !== "PAID") return;
    if (booking.copiedTripId) return;

    const source = booking.trip;

    const copy = await db.trip.create({
      data: {
        userId: booking.userId,
        country: source.country,
        duration: source.duration,
        groupType: source.groupType,
        travelStyle: source.travelStyle,
        interests: source.interests,
        budgetEstimate: source.budgetEstimate,
        startDate: null,
        endDate: null,
        copiedFromTripId: source.id,
      },
      select: { id: true },
    });

    if (source.aiResponse) {
      await db.aIResponse.create({
        data: {
          tripId: copy.id,
          title: source.aiResponse.title,
          description: source.aiResponse.description,
          estimatedPrice: source.aiResponse.estimatedPrice,
          duration: source.aiResponse.duration,
          budget: source.aiResponse.budget,
          travelStyle: source.aiResponse.travelStyle,
          country: source.aiResponse.country,
          interests: source.aiResponse.interests,
          groupType: source.aiResponse.groupType,
          tags: source.aiResponse.tags,
          bestTimeToVisit: source.aiResponse.bestTimeToVisit,
          weatherInfo: source.aiResponse.weatherInfo,
          location: source.aiResponse.location as Prisma.InputJsonValue,
          images: source.aiResponse.images,
          itinerary: source.aiResponse.itinerary as Prisma.InputJsonValue,
        },
      });
    }

    await db.booking.update({
      where: { id: booking.id },
      data: { copiedTripId: copy.id },
    });
  } catch (error) {
    console.log("Could not clone curated trip for buyer:", error);
  }
}
