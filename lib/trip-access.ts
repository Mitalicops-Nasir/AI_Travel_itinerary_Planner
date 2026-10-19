import type { PrismaClient } from "@prisma/client";

export type TripAccessLevel = "owner" | "member" | null;

/**
 * Server-side access check shared by trip features (day view, journal,
 * sharing, groups). Returns null when the caller may not touch the trip.
 */
export async function getTripAccess(
  db: PrismaClient,
  tripId: string,
  userId: string
): Promise<TripAccessLevel> {
  const trip = await db.trip.findUnique({
    where: { id: tripId },
    select: { userId: true },
  });

  if (!trip) return null;
  if (trip.userId === userId) return "owner";

  const membership = await db.tripMember.findFirst({
    where: { tripId, userId },
    select: { id: true },
  });

  return membership ? "member" : null;
}