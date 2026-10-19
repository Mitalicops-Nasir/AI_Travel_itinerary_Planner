"use server";

import { z } from "zod";
import { db } from "@/data/db";
import { requireUser } from "@/lib/guards";
import { getTripAccess } from "@/lib/trip-access";
import { evaluateBadges } from "./lib";
import type { CheckInView } from "./types";

export const CheckInInputSchema = z.object({
  tripId: z.string().min(1),
  day: z.number().int().min(1).max(60),
  stopKey: z.string().min(2).max(20),
  stopTitle: z.string().min(1).max(300),
  note: z.string().max(500).optional(),
});

export type CheckInInput = z.infer<typeof CheckInInputSchema>;

function toCheckInView(row: {
  id: string;
  tripId: string;
  userId: string;
  day: number;
  stopKey: string;
  stopTitle: string;
  note: string | null;
  photoUrl: string | null;
  checkedInAt: Date;
}): CheckInView {
  return {
    id: row.id,
    tripId: row.tripId,
    userId: row.userId,
    day: row.day,
    stopKey: row.stopKey,
    stopTitle: row.stopTitle,
    note: row.note,
    photoUrl: row.photoUrl,
    checkedInAt: row.checkedInAt,
  };
}

export async function checkIn(input: CheckInInput) {
  try {
    const { user, error } = await requireUser(
      "You must be logged in to check in."
    );

    if (!user) {
      return { success: false as const, error, checkIn: null, badgeEarned: null };
    }

    const parsed = CheckInInputSchema.safeParse(input);

    if (!parsed.success) {
      return {
        success: false as const,
        error: "That check-in did not look right. Please try again.",
        checkIn: null,
        badgeEarned: null,
      };
    }

    const data = parsed.data;

    const access = await getTripAccess(db, data.tripId, user.id);

    if (!access) {
      return {
        success: false as const,
        error: "You do not have access to this trip.",
        checkIn: null,
        badgeEarned: null,
      };
    }

    const row = await db.checkIn.upsert({
      where: {
        tripId_userId_stopKey: {
          tripId: data.tripId,
          userId: user.id,
          stopKey: data.stopKey,
        },
      },
      create: {
        tripId: data.tripId,
        userId: user.id,
        day: data.day,
        stopKey: data.stopKey,
        stopTitle: data.stopTitle,
        note: data.note?.trim() || null,
      },
      update: {
        stopTitle: data.stopTitle,
        note: data.note?.trim() || null,
      },
    });

    const badgeEarned = await evaluateBadges(user.id);

    return {
      success: true as const,
      checkIn: toCheckInView(row),
      badgeEarned,
    };
  } catch (error) {
    console.log("checkIn failed:", error);
    return {
      success: false as const,
      error: "We could not save your check-in. Please try again.",
      checkIn: null,
      badgeEarned: null,
    };
  }
}

export async function undoCheckIn(input: { tripId: string; stopKey: string }) {
  try {
    const { user, error } = await requireUser("You must be logged in.");

    if (!user) {
      return { success: false as const, error };
    }

    const access = await getTripAccess(db, input.tripId, user.id);

    if (!access) {
      return { success: false as const, error: "You do not have access to this trip." };
    }

    const existing = await db.checkIn.findFirst({
      where: { tripId: input.tripId, userId: user.id, stopKey: input.stopKey },
      select: { id: true },
    });

    if (existing) {
      await db.checkIn.delete({ where: { id: existing.id } });
    }

    return { success: true as const };
  } catch (error) {
    console.log("undoCheckIn failed:", error);
    return { success: false as const, error: "We could not undo that check-in." };
  }
}