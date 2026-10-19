// app/api/webhooks/stripe/route.ts (App Router POST route)
import { db } from "@/data/db";
import { stripe } from "@/lib/stripe";
import { applySubscriptionEvent } from "@/features/membership/lib";
import { cloneTripForBuyer } from "@/features/curated-trips/lib";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

async function markBookingPaid({
  tripId,
  userId,
  amountInCents,
  stripeSessionId,
}: {
  tripId: string;
  userId: string;
  amountInCents: number;
  stripeSessionId?: string;
}) {
  try {
    // Upsert keeps duplicate deliveries idempotent
    await db.booking.upsert({
      where: {
        userId_tripId: {
          userId,
          tripId,
        },
      },
      update: {
        status: "PAID",
        priceInCents: amountInCents,
        ...(stripeSessionId ? { stripeSessionId } : {}),
      },
      create: {
        userId,
        tripId,
        status: "PAID",
        priceInCents: amountInCents,
        ...(stripeSessionId ? { stripeSessionId } : {}),
      },
    });
  } catch (error) {
    console.log(error);
  }
}

export async function POST(req: Request) {
  const rawBody = await req.text();

  const headersList = await headers();

  const sig = headersList.get("stripe-signature");

  if (!sig) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook signature verification failed.", message);
    return NextResponse.json({ error: "Webhook error" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;

      const tripId = session.metadata?.tripId;
      const userId = session.metadata?.userId;
      const amount = session.amount_total; // in cents

      if (tripId && userId && amount != null) {
        await markBookingPaid({
          tripId,
          userId,
          amountInCents: amount,
          stripeSessionId: session.id,
        });
      }

      // Subscription checkouts (Pro membership) — payment flow above untouched
      await applySubscriptionEvent(event);

      // Curated purchases — booking is already PAID above; clone for the buyer
      if (session.metadata?.kind === "curated" && tripId && userId) {
        const booking = await db.booking.findUnique({
          where: { userId_tripId: { userId, tripId } },
          select: { id: true },
        });

        if (booking) {
          await cloneTripForBuyer(booking.id);
        }
      }

      break;
    }

    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      await applySubscriptionEvent(event);
      break;
    }

    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice;

      console.log("Invoice payment succeeded:", invoice.id);

      const tripId = invoice.metadata?.tripId;
      const userId = invoice.metadata?.userId;

      if (tripId && userId) {
        await markBookingPaid({
          tripId,
          userId,
          amountInCents: invoice.amount_paid,
        });
      }

      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return new NextResponse(null, { status: 200 });
}
