"use server";

import { db } from "@/data/db";
import { requireUser } from "@/lib/guards";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";

export async function createCheckoutSession(tripId: string) {
  const { user, error: authError } = await requireUser("Unauthorized");

  if (!user) {
    throw new Error(authError);
  }

  const trip = await db.trip.findUnique({
    where: { id: tripId },
    include: { aiResponse: true },
  });

  if (!trip?.aiResponse) {
    throw new Error("Trip not found");
  }

  // Price is read from the database — never trusted from the client
  const priceInCents = Number(trip.aiResponse.estimatedPrice) * 100;

  if (!Number.isFinite(priceInCents) || priceInCents <= 0) {
    throw new Error("Trip price is invalid");
  }

  const baseUrl = (await headers()).get("origin") || "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: trip.aiResponse.title,
            images: (trip.aiResponse.images ?? []).slice(0, 8),
          },
          unit_amount: Math.round(priceInCents),
        },
        quantity: 1,
      },
    ],
    success_url: `${baseUrl}/Trip/checkout/${tripId}/?success=true`,
    cancel_url: `${baseUrl}/Trip/${tripId}/Trip-Details`,
    metadata: {
      tripId,
      userId: user.id,
    },
  });

  return session.url;
}
