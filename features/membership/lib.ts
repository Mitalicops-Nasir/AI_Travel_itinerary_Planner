import type Stripe from "stripe";
import { db } from "@/data/db";
import {
  FREE_TRIP_LIMIT_PER_MONTH,
  type MembershipStatusName,
  type MembershipView,
  type QuotaView,
} from "./types";

export function monthKey(now = new Date()): string {
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(
    2,
    "0"
  )}`;
}

export function monthRange(now = new Date()): { start: Date; end: Date } {
  return {
    start: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)),
    end: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)),
  };
}

type MembershipRow = {
  tier: "FREE" | "PRO";
  status: MembershipStatusName;
  currentPeriodEnd: Date | null;
} | null;

function rowIsPro(row: MembershipRow): boolean {
  if (!row) return false;
  if (row.tier !== "PRO") return false;
  if (row.status === "EXPIRED") return false;
  return row.currentPeriodEnd !== null && row.currentPeriodEnd.getTime() > Date.now();
}

export async function isPro(userId: string): Promise<boolean> {
  const row = await db.membership.findUnique({
    where: { userId },
    select: { tier: true, status: true, currentPeriodEnd: true },
  });

  return rowIsPro(row as MembershipRow);
}

export async function getQuota(userId: string): Promise<QuotaView> {
  const { start, end } = monthRange();

  const [used, pro] = await Promise.all([
    db.trip.count({
      where: { userId, createdAt: { gte: start, lt: end } },
    }),
    isPro(userId),
  ]);

  if (pro) {
    return { used, limit: null, remaining: null };
  }

  return {
    used,
    limit: FREE_TRIP_LIMIT_PER_MONTH,
    remaining: Math.max(0, FREE_TRIP_LIMIT_PER_MONTH - used),
  };
}

export async function getMembershipData(
  userId: string
): Promise<{ membership: MembershipView; quota: QuotaView }> {
  const [row, quota] = await Promise.all([
    db.membership.findUnique({
      where: { userId },
      select: { tier: true, status: true, currentPeriodEnd: true },
    }),
    getQuota(userId),
  ]);

  const pro = rowIsPro(row as MembershipRow);

  return {
    membership: {
      tier: pro ? "PRO" : "FREE",
      status: (row?.status as MembershipStatusName) ?? "ACTIVE",
      currentPeriodEnd: row?.currentPeriodEnd
        ? row.currentPeriodEnd.toISOString()
        : null,
    },
    quota,
  };
}

export async function assertCanGenerate(
  userId: string
): Promise<{ ok: true } | { ok: false; error: string; quota: QuotaView }> {
  const quota = await getQuota(userId);

  if (quota.limit === null || quota.remaining === null || quota.remaining > 0) {
    return { ok: true };
  }

  return {
    ok: false,
    error: `You have used all ${quota.limit} free trip generations this month. Upgrade to Pro for unlimited trips — your existing trips stay exactly where they are.`,
    quota,
  };
}

function mapSubscriptionStatus(
  status: Stripe.Subscription.Status
): MembershipStatusName {
  switch (status) {
    case "active":
    case "trialing":
      return "ACTIVE";
    case "past_due":
      return "PAST_DUE";
    case "canceled":
    case "unpaid":
      return "CANCELED";
    default:
      return "EXPIRED";
  }
}

function subscriptionPeriodEnd(subscription: Stripe.Subscription): Date | null {
  const legacy = (
    subscription as unknown as { current_period_end?: number }
  ).current_period_end;

  const item = subscription.items?.data?.[0] as
    | (Stripe.SubscriptionItem & { current_period_end?: number })
    | undefined;

  const timestamp = item?.current_period_end ?? legacy;

  return typeof timestamp === "number" ? new Date(timestamp * 1000) : null;
}

type SubscriptionUpdate = {
  tier: "PRO";
  status: MembershipStatusName;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  currentPeriodEnd?: Date;
};

export async function applySubscriptionEvent(event: Stripe.Event): Promise<void> {
  const { stripe } = await import("@/lib/stripe");

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    if (session.mode !== "subscription") return;

    const userId = session.metadata?.userId;
    if (!userId) {
      console.log("Membership checkout without userId metadata — skipped.");
      return;
    }

    const customerId =
      typeof session.customer === "string"
        ? session.customer
        : (session.customer?.id ?? null);

    const subscriptionId =
      typeof session.subscription === "string"
        ? session.subscription
        : (session.subscription?.id ?? null);

    let periodEnd: Date | null = null;

    if (subscriptionId) {
      try {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        periodEnd = subscriptionPeriodEnd(subscription);
      } catch (error) {
        console.log("Could not fetch subscription period end:", error);
      }
    }

    const update: SubscriptionUpdate = { tier: "PRO", status: "ACTIVE" };
    if (customerId) update.stripeCustomerId = customerId;
    if (subscriptionId) update.stripeSubscriptionId = subscriptionId;
    if (periodEnd) update.currentPeriodEnd = periodEnd;

    await db.membership.upsert({
      where: { userId },
      update,
      create: {
        userId,
        ...update,
      },
    });

    return;
  }

  if (
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    const subscription = event.data.object as Stripe.Subscription;

    const userId = subscription.metadata?.userId ?? null;

    const customerId =
      typeof subscription.customer === "string"
        ? subscription.customer
        : (subscription.customer?.id ?? null);

    const status =
      event.type === "customer.subscription.deleted"
        ? "CANCELED"
        : mapSubscriptionStatus(subscription.status);

    const periodEnd = subscriptionPeriodEnd(subscription);

    const update: SubscriptionUpdate = { tier: "PRO", status };
    if (customerId) update.stripeCustomerId = customerId;
    if (subscription.id) update.stripeSubscriptionId = subscription.id;
    if (periodEnd) update.currentPeriodEnd = periodEnd;

    if (userId) {
      await db.membership.upsert({
        where: { userId },
        update,
        create: {
          userId,
          ...update,
        },
      });
      return;
    }

    if (customerId) {
      const membership = await db.membership.findFirst({
        where: { stripeCustomerId: customerId },
        select: { id: true },
      });

      if (membership) {
        await db.membership.update({
          where: { id: membership.id },
          data: update,
        });
      }
    }
  }
}
