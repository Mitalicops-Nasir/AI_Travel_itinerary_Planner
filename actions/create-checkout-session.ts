"use server";

import { currentUser } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";

export async function createCheckoutSession(
  tripId: string,
  TripName: string,
  TripImage: string[],
  ammount: string
) {
  const user = await currentUser();

  if (!user?.id) {
    throw new Error("Unauthorized");
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
            name: TripName,
            images: TripImage,
          },
          unit_amount: parseInt(ammount) * 100,
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
