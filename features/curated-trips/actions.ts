"use server";

import { db } from "@/data/db";
import { currentUser } from "@/lib/auth";
import { requireAdmin, requireUser } from "@/lib/guards";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { parseJsonField, toTripDetails, type TripLocation } from "@/lib/trip-view";
import { hasCuratedAccess } from "./lib";
import type {
  CuratedActionResult,
  CuratedFlagsInput,
  CuratedGateView,
  CuratedTripView,
} from "./types";

export async function setCuratedFlags(
  tripId: string,
  input: CuratedFlagsInput
): Promise<CuratedActionResult> {
  const { user, error } = await requireAdmin("Admin access required.");
  if (!user) return { success: false, error };

  const { isCurated, isPublished } = input;
  const priceInCents = input.priceInCents ?? null;

  if (
    isCurated &&
    (priceInCents === null ||
      !Number.isInteger(priceInCents) ||
      priceInCents < 100)
  ) {
    return {
      success: false,
      error: "Set a price of at least $1 before marking a trip premium.",
    };
  }

  const trip = await db.trip.findUnique({
    where: { id: tripId },
    select: { id: true },
  });

  if (!trip) {
    return { success: false, error: "Trip not found." };
  }

  await db.trip.update({
    where: { id: tripId },
    data: {
      isCurated,
      isPublished: isCurated ? isPublished : false,
      curatedPriceInCents: isCurated ? priceInCents : null,
    },
  });

  revalidatePath("/curated-trips");
  revalidatePath(`/Trip/${tripId}/Trip-Details`);

  return { success: true };
}

export async function listCuratedTrips(): Promise<
  CuratedActionResult<{ trips: CuratedTripView[] }>
> {
  try {
    const user = await currentUser();
    const isAdmin = user?.role === "ADMIN";

    const trips = await db.trip.findMany({
      where: isAdmin ? {} : { isCurated: true, isPublished: true },
      include: {
        aiResponse: { select: { title: true, location: true } },
        booking: { where: { status: "PAID" }, select: { id: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      trips: trips.map((trip) => {
        const location = parseJsonField<TripLocation>(trip.aiResponse?.location);

        return {
          id: trip.id,
          title: trip.aiResponse?.title ?? "Untitled trip",
          country: trip.country,
          city: location?.city ?? trip.country,
          duration: trip.duration,
          isCurated: trip.isCurated,
          isPublished: trip.isPublished,
          priceInCents: trip.curatedPriceInCents,
          paidBuyers: trip.booking.length,
          createdAt: trip.createdAt.toISOString(),
        };
      }),
    };
  } catch (error) {
    console.log(error);
    return { success: false, error: "Could not load trips right now." };
  }
}

export async function getCuratedGate(
  tripId: string
): Promise<
  | ({ success: true; trip: ReturnType<typeof toTripDetails> } & CuratedGateView)
  | { success: false; error: string }
> {
  const trip = await db.trip.findUnique({
    where: { id: tripId },
    include: { aiResponse: true },
  });

  if (!trip) {
    return { success: false, error: "Trip not found." };
  }

  const user = await currentUser();
  const hasAccess = await hasCuratedAccess(tripId, user?.id);

  return {
    success: true,
    trip: toTripDetails(trip),
    tripId,
    isCurated: trip.isCurated,
    hasAccess,
    priceInCents: trip.curatedPriceInCents,
  };
}

export async function createCuratedCheckoutSession(
  tripId: string
): Promise<CuratedActionResult<{ url: string }>> {
  const { user, error } = await requireUser("Log in to buy this curated trip.");
  if (!user) return { success: false, error };

  try {
    const trip = await db.trip.findUnique({
      where: { id: tripId },
      include: { aiResponse: true },
    });

    if (!trip || !trip.isCurated || !trip.isPublished) {
      return { success: false, error: "This trip is not available for purchase." };
    }

    if (trip.userId === user.id) {
      return { success: false, error: "This is your own curated trip." };
    }

    const priceInCents = trip.curatedPriceInCents;

    if (priceInCents === null || priceInCents <= 0) {
      return { success: false, error: "This trip does not have a price yet." };
    }

    const alreadyOwned = await db.booking.findFirst({
      where: { tripId, userId: user.id, status: "PAID" },
      select: { id: true },
    });

    if (alreadyOwned) {
      return {
        success: false,
        error: "You already own this trip — find your personal copy in AI Trips.",
      };
    }

    const booking = await db.booking.upsert({
      where: {
        userId_tripId: { userId: user.id, tripId },
      },
      update: { priceInCents },
      create: {
        userId: user.id,
        tripId,
        priceInCents,
        status: "PENDING",
      },
      select: { id: true },
    });

    const baseUrl = (await headers()).get("origin") || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: trip.aiResponse?.title ?? "Curated trip",
              images: (trip.aiResponse?.images ?? []).slice(0, 8),
            },
            unit_amount: priceInCents,
          },
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/Trip/${tripId}/Trip-Details?purchased=1`,
      cancel_url: `${baseUrl}/Trip/${tripId}/Trip-Details`,
      metadata: {
        kind: "curated",
        tripId,
        userId: user.id,
      },
    });

    await db.booking.update({
      where: { id: booking.id },
      data: { stripeSessionId: session.id },
    });

    if (!session.url) {
      return { success: false, error: "Could not start checkout. Please try again." };
    }

    return { success: true, url: session.url };
  } catch (error) {
    console.log(error);
    return { success: false, error: "Could not start checkout. Please try again." };
  }
}
