"use server";

import { db } from "@/data/db";
import { requireUser } from "@/lib/guards";
import { getTripAccess } from "@/lib/trip-access";
import {
  MAX_PHOTOS_PER_ENTRY,
  MAX_PHOTO_BYTES,
} from "./constants";
import { deletePhoto, savePhoto, toJournalEntryView } from "./lib";
import type { JournalEntryView } from "./types";

function parseDay(raw: unknown): number | null | "invalid" {
  if (raw == null || raw === "") return null;

  const day = Number(raw);

  if (!Number.isInteger(day) || day < 1 || day > 60) return "invalid";

  return day;
}

export async function addJournalEntry(formData: FormData) {
  try {
    const { user, error } = await requireUser(
      "You must be logged in to write a journal entry."
    );

    if (!user) {
      return { success: false as const, error, entry: null };
    }

    const tripId = String(formData.get("tripId") ?? "");
    if (!tripId) {
      return {
        success: false as const,
        error: "This entry is missing its trip.",
        entry: null,
      };
    }

    const day = parseDay(formData.get("day"));
    if (day === "invalid") {
      return {
        success: false as const,
        error: "That trip day does not look right.",
        entry: null,
      };
    }

    const note = String(formData.get("note") ?? "").trim().slice(0, 1000);

    const files = formData
      .getAll("photos")
      .filter((item): item is File => item instanceof File && item.size > 0);

    if (files.length > MAX_PHOTOS_PER_ENTRY) {
      return {
        success: false as const,
        error: `You can add up to ${MAX_PHOTOS_PER_ENTRY} photos per entry.`,
        entry: null,
      };
    }

    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        return {
          success: false as const,
          error: "Only photo files can be attached. Your note is still here — try again.",
          entry: null,
        };
      }

      if (file.size > MAX_PHOTO_BYTES) {
        return {
          success: false as const,
          error: "One photo is bigger than 5 MB. Your note is still here — pick a smaller photo and retry.",
          entry: null,
        };
      }
    }

    if (!note && files.length === 0) {
      return {
        success: false as const,
        error: "Add a note or at least one photo.",
        entry: null,
      };
    }

    const access = await getTripAccess(db, tripId, user.id);

    if (!access) {
      return {
        success: false as const,
        error: "You do not have access to this trip.",
        entry: null,
      };
    }

    const photoPaths: string[] = [];

    try {
      for (const file of files) {
        photoPaths.push(await savePhoto(user.id, file));
      }
    } catch (photoError) {
      await Promise.all(photoPaths.map(deletePhoto));
      console.log("addJournalEntry photo save failed:", photoError);

      return {
        success: false as const,
        error: "A photo could not be saved. Your note is still here — please retry.",
        entry: null,
      };
    }

    const row = await db.journalEntry.create({
      data: {
        tripId,
        userId: user.id,
        day,
        note: note || null,
        photos: photoPaths,
      },
    });

    return { success: true as const, entry: toJournalEntryView(row) };
  } catch (error) {
    console.log("addJournalEntry failed:", error);
    return {
      success: false as const,
      error: "We could not save your entry. Please try again.",
      entry: null,
    };
  }
}

export async function updateJournalEntry(input: {
  id: string;
  note?: string;
  day?: number | null;
}): Promise<
  | { success: true; entry: JournalEntryView }
  | { success: false; error: string; entry: null }
> {
  try {
    const { user, error } = await requireUser(
      "You must be logged in to edit a journal entry."
    );

    if (!user) {
      return { success: false, error, entry: null };
    }

    const entry = await db.journalEntry.findUnique({
      where: { id: input.id },
    });

    if (!entry) {
      return { success: false, error: "That entry no longer exists.", entry: null };
    }

    if (entry.userId !== user.id) {
      return {
        success: false,
        error: "You can only edit your own entries.",
        entry: null,
      };
    }

    const note =
      input.note === undefined ? undefined : input.note.trim().slice(0, 1000);

    const day = input.day === undefined ? undefined : parseDay(input.day as unknown);

    if (day === "invalid") {
      return {
        success: false,
        error: "That trip day does not look right.",
        entry: null,
      };
    }

    const row = await db.journalEntry.update({
      where: { id: entry.id },
      data: {
        ...(note !== undefined ? { note: note || null } : {}),
        ...(day !== undefined ? { day: day as number | null } : {}),
      },
    });

    return { success: true, entry: toJournalEntryView(row) };
  } catch (error) {
    console.log("updateJournalEntry failed:", error);
    return {
      success: false,
      error: "We could not update your entry. Please try again.",
      entry: null,
    };
  }
}

export async function deleteJournalEntry(id: string) {
  try {
    const { user, error } = await requireUser(
      "You must be logged in to delete a journal entry."
    );

    if (!user) {
      return { success: false as const, error };
    }

    const entry = await db.journalEntry.findUnique({ where: { id } });

    if (!entry) {
      return { success: true as const };
    }

    if (entry.userId !== user.id) {
      return {
        success: false as const,
        error: "You can only delete your own entries.",
      };
    }

    await Promise.all((entry.photos ?? []).map(deletePhoto));
    await db.journalEntry.delete({ where: { id: entry.id } });

    return { success: true as const };
  } catch (error) {
    console.log("deleteJournalEntry failed:", error);
    return {
      success: false as const,
      error: "We could not delete that entry. Please try again.",
    };
  }
}

export async function getJournalEntries(tripId: string) {
  try {
    const { user, error } = await requireUser("You must be logged in.");

    if (!user) {
      return { success: false as const, error, entries: [] as JournalEntryView[] };
    }

    const access = await getTripAccess(db, tripId, user.id);

    if (!access) {
      return {
        success: false as const,
        error: "You do not have access to this trip.",
        entries: [] as JournalEntryView[],
      };
    }

    const rows = await db.journalEntry.findMany({
      where: { tripId },
      orderBy: { createdAt: "asc" },
    });

    return {
      success: true as const,
      entries: rows.map(toJournalEntryView),
    };
  } catch (error) {
    console.log("getJournalEntries failed:", error);
    return {
      success: false as const,
      error: "We could not load the journal.",
      entries: [] as JournalEntryView[],
    };
  }
}
