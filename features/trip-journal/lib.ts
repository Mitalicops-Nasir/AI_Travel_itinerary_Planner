import { randomUUID } from "crypto";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { db } from "@/data/db";
import { getTripPhase } from "@/features/trip-day-view/lib";
import type { CheckInView } from "@/features/trip-day-view/types";
import type { PublicTripView } from "@/features/trip-sharing/types";
import { FALLBACK_TRIP_IMAGE, parseJsonField } from "@/lib/trip-view";
import {
  MAX_PHOTO_BYTES,
  PHOTO_EXTENSIONS_BY_TYPE,
  PHOTO_PATH_PREFIX,
} from "./constants";
import type {
  JournalEntryView,
  RecapData,
  RecapViewData,
} from "./types";

export async function savePhoto(userId: string, file: File): Promise<string> {
  if (!file || file.size === 0) throw new Error("EMPTY_FILE");
  if (file.size > MAX_PHOTO_BYTES) throw new Error("FILE_TOO_LARGE");

  const extension = PHOTO_EXTENSIONS_BY_TYPE[file.type];
  if (!extension) throw new Error("UNSUPPORTED_TYPE");

  // Local-disk MVP (research R6). Swap this helper for object storage later —
  // callers only depend on the returned public URL path.
  const dir = path.join(process.cwd(), "public", "uploads", "journal", userId);
  await mkdir(dir, { recursive: true });

  const filename = `${randomUUID()}.${extension}`;
  await writeFile(
    path.join(dir, filename),
    Buffer.from(await file.arrayBuffer())
  );

  return `${PHOTO_PATH_PREFIX}${userId}/${filename}`;
}

export async function deletePhoto(photoPath: string): Promise<void> {
  try {
    if (!photoPath.startsWith(PHOTO_PATH_PREFIX)) return;

    const publicRoot = path.resolve(process.cwd(), "public");
    const absolute = path.resolve(publicRoot, photoPath.slice(1));
    const journalRoot = path.resolve(publicRoot, "uploads", "journal");

    if (!absolute.startsWith(journalRoot)) return;

    await unlink(absolute);
  } catch {
    return;
  }
}

export function toJournalEntryView(row: {
  id: string;
  tripId: string;
  userId: string;
  day: number | null;
  note: string | null;
  photos: string[];
  createdAt: Date;
  updatedAt: Date;
}): JournalEntryView {
  return {
    id: row.id,
    tripId: row.tripId,
    userId: row.userId,
    day: row.day,
    note: row.note,
    photos: row.photos ?? [],
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

type ItineraryDay = { day: number; location: string };

function parseItineraryDays(raw: unknown): ItineraryDay[] {
  const parsed = parseJsonField<unknown>(raw);

  if (Array.isArray(parsed)) {
    return parsed as ItineraryDay[];
  }

  const nested = (parsed as { day?: ItineraryDay[] } | null)?.day;
  return Array.isArray(nested) ? nested : [];
}

/** Assembled on read — no stored recap record (FR-025). */
export async function buildRecap(tripId: string): Promise<RecapData | null> {
  const trip = await db.trip.findUnique({
    where: { id: tripId },
    select: {
      id: true,
      country: true,
      duration: true,
      startDate: true,
      endDate: true,
      aiResponse: {
        select: { title: true, images: true, location: true, itinerary: true },
      },
    },
  });

  if (!trip) return null;

  const [checkIns, journalRows] = await Promise.all([
    db.checkIn.findMany({
      where: { tripId },
      orderBy: { checkedInAt: "asc" },
    }),
    db.journalEntry.findMany({
      where: { tripId },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const location = parseJsonField<{ city: string; coordinates: number[] }>(
    trip.aiResponse?.location
  );
  const days = parseItineraryDays(trip.aiResponse?.itinerary);

  const coords = location?.coordinates ?? [];
  const lat = typeof coords[0] === "number" ? coords[0] : 0;
  const lng = typeof coords[1] === "number" ? coords[1] : 0;

  const visited: CheckInView[] = checkIns.map((checkIn) => ({
    id: checkIn.id,
    tripId: checkIn.tripId,
    userId: checkIn.userId,
    day: checkIn.day,
    stopKey: checkIn.stopKey,
    stopTitle: checkIn.stopTitle,
    note: checkIn.note,
    photoUrl: checkIn.photoUrl,
    checkedInAt: checkIn.checkedInAt,
  }));

  const journal = journalRows.map(toJournalEntryView);

  const photoCount =
    journal.reduce((total, entry) => total + entry.photos.length, 0) +
    visited.filter((stop) => stop.photoUrl).length;

  return {
    tripId,
    title: trip.aiResponse?.title ?? `Trip to ${trip.country}`,
    country: trip.country,
    city: location?.city || trip.country,
    coverImage: trip.aiResponse?.images?.[0] ?? FALLBACK_TRIP_IMAGE,
    startDate: trip.startDate,
    endDate: trip.endDate,
    phase: getTripPhase({
      startDate: trip.startDate,
      endDate: trip.endDate,
      country: trip.country,
    }),
    route: days.map((day) => ({
      day: day.day,
      location: day.location,
      lat,
      lng,
    })),
    visited,
    journal,
    stats: {
      days: days.length || trip.duration || 0,
      stopsVisited: visited.length,
      photos: photoCount,
    },
  };
}

const dayFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const dateTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
});

export function dateRangeLabel(
  start: Date | string | null,
  end: Date | string | null
): string {
  const startDate = start ? new Date(start) : null;
  const endDate = end ? new Date(end) : null;

  if (
    !startDate ||
    !endDate ||
    Number.isNaN(startDate.getTime()) ||
    Number.isNaN(endDate.getTime())
  ) {
    return "Dates not set";
  }

  return `${dayFormatter.format(startDate)} – ${dayFormatter.format(endDate)}`;
}

export function dateTimeLabel(value: Date | string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : dateTimeFormatter.format(date);
}

export function toRecapView(recap: RecapData): RecapViewData {
  return {
    title: recap.title,
    country: recap.country,
    city: recap.city,
    coverImage: recap.coverImage,
    dateLabel: dateRangeLabel(recap.startDate, recap.endDate),
    phase: recap.phase,
    stats: recap.stats,
    route: recap.route.map((stop) => ({
      day: stop.day,
      location: stop.location,
    })),
    visited: recap.visited.map((stop) => ({
      day: stop.day,
      stopTitle: stop.stopTitle,
      checkedInAtLabel: dateTimeLabel(stop.checkedInAt),
      note: stop.note,
      photoUrl: stop.photoUrl,
    })),
    journal: recap.journal.map((entry) => ({
      day: entry.day,
      note: entry.note,
      photos: entry.photos,
      createdLabel: dateTimeLabel(entry.createdAt),
    })),
  };
}

export function publicRecapView(view: PublicTripView): RecapViewData | null {
  if (view.state !== "active" || !view.trip) return null;

  const photoCount =
    view.journal.reduce((total, entry) => total + entry.photos.length, 0) +
    view.visited.filter((stop) => stop.photoUrl).length;

  return {
    title: view.trip.title,
    country: view.trip.country,
    city: view.trip.city,
    coverImage: view.trip.coverImage,
    dateLabel: dateRangeLabel(view.trip.startDate, view.trip.endDate),
    phase: view.trip.phase,
    stats: {
      days: view.route.length,
      stopsVisited: view.visited.length,
      photos: photoCount,
    },
    route: view.route.map((stop) => ({
      day: stop.day,
      location: stop.location,
    })),
    visited: view.visited.map((stop) => ({
      day: stop.day,
      stopTitle: stop.stopTitle,
      checkedInAtLabel: dateTimeLabel(stop.checkedInAt),
      note: stop.note,
      photoUrl: stop.photoUrl,
    })),
    journal: view.journal.map((entry) => ({
      day: entry.day,
      note: entry.note,
      photos: entry.photos,
      createdLabel: dateTimeLabel(entry.createdAt),
    })),
  };
}
