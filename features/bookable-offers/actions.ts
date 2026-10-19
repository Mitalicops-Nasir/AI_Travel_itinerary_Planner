"use server";

import { currentUser } from "@/lib/auth";
import { requireAdmin } from "@/lib/guards";
import { db } from "@/data/db";
import type { OfferKind, PartnerId } from "./types";

/**
 * Fire-and-forget analytics for affiliate clicks. Never blocks the user's
 * navigation: failures are swallowed and logged.
 */
export async function logOfferClick(input: {
  tripId?: string;
  partner: PartnerId;
  kind: OfferKind;
  destination?: string;
}) {
  try {
    const user = await currentUser();

    await db.offerClick.create({
      data: {
        userId: user?.id ?? null,
        tripId: input.tripId ?? null,
        partner: input.partner,
        kind: input.kind,
        destination: input.destination ?? null,
      },
    });

    return { success: true as const };
  } catch (error) {
    console.log("Offer click log failed:", error);
    return { success: false as const, error: "Failed to log click" };
  }
}

/** Admin dashboard stat: total affiliate clicks + top partner. */
export async function getOfferClickStats() {
  try {
    const { user, error } = await requireAdmin();

    if (!user) {
      return {
        success: false as const,
        error,
        total: 0,
        topPartner: null as string | null,
      };
    }

    const [total, grouped] = await Promise.all([
      db.offerClick.count(),
      db.offerClick.groupBy({
        by: ["partner"],
        _count: { partner: true },
        orderBy: { _count: { partner: "desc" } },
        take: 1,
      }),
    ]);

    return {
      success: true as const,
      total,
      topPartner: grouped[0]?.partner ?? null,
    };
  } catch (error) {
    console.log("Offer click stats failed:", error);
    return {
      success: false as const,
      error: "Failed to load offer stats",
      total: 0,
      topPartner: null as string | null,
    };
  }
}
