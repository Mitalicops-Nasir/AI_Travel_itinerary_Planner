// app/api/stripe/route.ts (App Router POST route)
import { db } from "@/data/db";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { buffer } from "node:stream/consumers";
import Stripe from "stripe";

export const runtime = "nodejs";

export async function POST(req: any) {
  const rawBody = await req.text();

  //const rawBody = await buffer(req.body);

  const headersList = await headers();

  const sig = headersList.get("stripe-signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed.", err.message);
    return NextResponse.json({ error: "Webhook error" }, { status: 400 });
  }

  // 👇 Handle different event types
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;

      const tripId = session?.metadata?.tripId;
      const userId = session?.metadata?.userId;
      const amount = session.amount_total; // in cents

      if (tripId && userId) {
        try {
          await db.booking.create({
            data: {
              userId,
              tripId,
              status: "PAID",
              priceInCents: amount!,
              stripeSessionId: session.id,
            },
          });
        } catch (error) {
          console.log(error);
        }
      }

      break;
    }

    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice;

      // Optional: log it or use invoice metadata to track tripId/userId
      console.log("Invoice payment succeeded:", invoice.id);

      const tripId = invoice?.metadata?.tripId;
      const userId = invoice?.metadata?.userId;
      const amount = invoice.amount_paid;

      if (tripId && userId) {
        try {
          await db.booking.upsert({
            where: {
              userId_tripId: {
                userId,
                tripId,
              },
            },
            update: {
              status: "PAID",
            },
            create: {
              userId,
              tripId,
              status: "PAID",
              priceInCents: amount,
            },
          });
        } catch (error) {
          console.log(error);
        }
      }

      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return new NextResponse(null, { status: 200 });
}
