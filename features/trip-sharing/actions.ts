"use server";

import { db } from "@/data/db";
import { currentUser } from "@/lib/auth";
import { requireUser } from "@/lib/guards";
import { getTripAccess } from "@/lib/trip-access";
import { isPro } from "@/features/membership/lib";
import { FREE_GROUP_MEMBER_LIMIT } from "@/features/membership/types";
import { newShareToken } from "./lib";

async function requireTripOwner(tripId: string, userId: string) {
  const access = await getTripAccess(db, tripId, userId);
  return access === "owner";
}

export async function enableShare(
  tripId: string,
  input: { joinEnabled: boolean }
) {
  try {
    const { user, error } = await requireUser("You must be logged in.");

    if (!user) {
      return { success: false as const, error };
    }

    if (!(await requireTripOwner(tripId, user.id))) {
      return {
        success: false as const,
        error: "Only the trip owner can change sharing.",
      };
    }

    const existing = await db.shareLink.findUnique({
      where: { tripId },
      select: { id: true, token: true },
    });

    const token = existing?.token ?? newShareToken();

    await db.shareLink.upsert({
      where: { tripId },
      create: {
        tripId,
        token,
        state: "ACTIVE",
        joinEnabled: Boolean(input?.joinEnabled),
      },
      update: { state: "ACTIVE", joinEnabled: Boolean(input?.joinEnabled) },
    });

    return { success: true as const, token, url: `/Trip/share/${token}` };
  } catch (caught) {
    console.log("enableShare failed:", caught);
    return { success: false as const, error: "We could not start sharing." };
  }
}

export async function pauseShare(tripId: string) {
  try {
    const { user, error } = await requireUser("You must be logged in.");

    if (!user) {
      return { success: false as const, error };
    }

    if (!(await requireTripOwner(tripId, user.id))) {
      return {
        success: false as const,
        error: "Only the trip owner can change sharing.",
      };
    }

    await db.shareLink.updateMany({
      where: { tripId },
      data: { state: "PAUSED" },
    });

    return { success: true as const };
  } catch (caught) {
    console.log("pauseShare failed:", caught);
    return { success: false as const, error: "We could not pause sharing." };
  }
}

export async function revokeShare(tripId: string) {
  try {
    const { user, error } = await requireUser("You must be logged in.");

    if (!user) {
      return { success: false as const, error };
    }

    if (!(await requireTripOwner(tripId, user.id))) {
      return {
        success: false as const,
        error: "Only the trip owner can change sharing.",
      };
    }

    await db.shareLink.updateMany({
      where: { tripId },
      data: { state: "REVOKED" },
    });

    return { success: true as const };
  } catch (caught) {
    console.log("revokeShare failed:", caught);
    return { success: false as const, error: "We could not stop sharing." };
  }
}

export async function regenerateShare(tripId: string) {
  try {
    const { user, error } = await requireUser("You must be logged in.");

    if (!user) {
      return { success: false as const, error };
    }

    if (!(await requireTripOwner(tripId, user.id))) {
      return {
        success: false as const,
        error: "Only the trip owner can change sharing.",
      };
    }

    const token = newShareToken();

    await db.shareLink.upsert({
      where: { tripId },
      create: { tripId, token, state: "ACTIVE" },
      update: { token, state: "ACTIVE" },
    });

    return { success: true as const, token, url: `/Trip/share/${token}` };
  } catch (caught) {
    console.log("regenerateShare failed:", caught);
    return { success: false as const, error: "We could not create a new link." };
  }
}

export async function getShareState(tripId: string) {
  try {
    const user = await currentUser();

    if (!user?.id) {
      return {
        success: false as const,
        error: "You must be logged in.",
        state: null,
        joinEnabled: false,
        url: null,
      };
    }

    if (!(await requireTripOwner(tripId, user.id))) {
      return {
        success: false as const,
        error: "Only the trip owner can manage sharing.",
        state: null,
        joinEnabled: false,
        url: null,
      };
    }

    const link = await db.shareLink.findUnique({
      where: { tripId },
      select: { state: true, joinEnabled: true, token: true },
    });

    return {
      success: true as const,
      state: link?.state ?? null,
      joinEnabled: link?.joinEnabled ?? false,
      url: link ? `/Trip/share/${link.token}` : null,
    };
  } catch (caught) {
    console.log("getShareState failed:", caught);
    return {
      success: false as const,
      error: "We could not load sharing settings.",
      state: null,
      joinEnabled: false,
      url: null,
    };
  }
}

/** Anyone logged in can join a trip whose ACTIVE link allows joining. */
export async function joinTrip(token: string) {
  try {
    const { user, error } = await requireUser(
      "Log in to join this trip."
    );

    if (!user) {
      return { success: false as const, error };
    }

    const link = await db.shareLink.findUnique({
      where: { token },
      select: { tripId: true, state: true, joinEnabled: true },
    });

    if (!link || link.state !== "ACTIVE" || !link.joinEnabled) {
      return {
        success: false as const,
        error: "This trip is not accepting new members right now.",
      };
    }

    const trip = await db.trip.findUnique({
      where: { id: link.tripId },
      select: { userId: true },
    });

    if (!trip) {
      return { success: false as const, error: "Trip not found." };
    }

    if (trip.userId === user.id) {
      return { success: true as const, tripId: link.tripId };
    }

    // Free-plan trips cap the crew; Pro owners host unlimited travellers (FR-038)
    const memberCount = await db.tripMember.count({
      where: { tripId: link.tripId },
    });

    if (memberCount >= FREE_GROUP_MEMBER_LIMIT) {
      const ownerIsPro = await isPro(trip.userId);

      if (!ownerIsPro) {
        return {
          success: false as const,
          limitReached: true as const,
          error: `This trip's free plan allows up to ${FREE_GROUP_MEMBER_LIMIT} travel buddies. The trip owner can upgrade to Pro for unlimited members.`,
        };
      }
    }

    await db.tripMember.upsert({
      where: { tripId_userId: { tripId: link.tripId, userId: user.id } },
      create: { tripId: link.tripId, userId: user.id, role: "MEMBER" },
      update: {},
    });

    return { success: true as const, tripId: link.tripId };
  } catch (caught) {
    console.log("joinTrip failed:", caught);
    return { success: false as const, error: "We could not join this trip." };
  }
}