"use server";

import { db } from "@/data/db";
import { requireUser } from "@/lib/guards";
import { headers } from "next/headers";
import { getMembershipData } from "./lib";

export async function getMembership() {
  try {
    const { user, error } = await requireUser("You must be logged in.");

    if (!user) {
      return {
        success: false as const,
        error,
        membership: null,
        quota: null,
      };
    }

    const data = await getMembershipData(user.id);

    return { success: true as const, ...data };
  } catch (error) {
    console.log("getMembership failed:", error);
    return {
      success: false as const,
      error: "We could not load your membership.",
      membership: null,
      quota: null,
    };
  }
}

export async function createMembershipCheckout() {
  try {
    const { user, error } = await requireUser(
      "You must be logged in to upgrade."
    );

    if (!user) {
      return { success: false as const, error, url: null };
    }

    const priceId = process.env.STRIPE_PRO_PRICE_ID;

    if (!priceId) {
      return {
        success: false as const,
        error: "Pro plan is not configured yet — please try again later.",
        url: null,
      };
    }

    const { stripe } = await import("@/lib/stripe");

    const existing = await db.membership.findUnique({
      where: { userId: user.id },
      select: { stripeCustomerId: true },
    });

    const baseUrl =
      (await headers()).get("origin") || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      ...(existing?.stripeCustomerId
        ? { customer: existing.stripeCustomerId }
        : { customer_email: user.email ?? undefined }),
      success_url: `${baseUrl}/pro?checkout=success`,
      cancel_url: `${baseUrl}/pro?checkout=canceled`,
      metadata: {
        kind: "membership",
        userId: user.id,
      },
      subscription_data: {
        metadata: {
          userId: user.id,
        },
      },
    });

    if (!session.url) {
      return {
        success: false as const,
        error: "Stripe did not return a checkout link. Please try again.",
        url: null,
      };
    }

    return { success: true as const, url: session.url };
  } catch (error) {
    console.log("createMembershipCheckout failed:", error);
    return {
      success: false as const,
      error: "We could not start the checkout. Please try again.",
      url: null,
    };
  }
}

export async function openBillingPortal() {
  try {
    const { user, error } = await requireUser(
      "You must be logged in to manage billing."
    );

    if (!user) {
      return { success: false as const, error, url: null };
    }

    const membership = await db.membership.findUnique({
      where: { userId: user.id },
      select: { stripeCustomerId: true },
    });

    if (!membership?.stripeCustomerId) {
      return {
        success: false as const,
        error: "No billing account yet — upgrade to Pro first.",
        url: null,
      };
    }

    const { stripe } = await import("@/lib/stripe");

    const baseUrl =
      (await headers()).get("origin") || "http://localhost:3000";

    const session = await stripe.billingPortal.sessions.create({
      customer: membership.stripeCustomerId,
      return_url: `${baseUrl}/pro`,
    });

    if (!session.url) {
      return {
        success: false as const,
        error: "Stripe did not return a billing link. Please try again.",
        url: null,
      };
    }

    return { success: true as const, url: session.url };
  } catch (error) {
    console.log("openBillingPortal failed:", error);
    return {
      success: false as const,
      error: "We could not open the billing portal. Please try again.",
      url: null,
    };
  }
}
