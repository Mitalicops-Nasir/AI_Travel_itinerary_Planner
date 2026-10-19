import { getAllCountries } from "countries-and-timezones";
import { db } from "@/data/db";
import { parseJsonField } from "@/lib/trip-view";
import type {
  BadgeView,
  CheckInView,
  TripDayViewModel,
  TripPhase,
  TodayStop,
} from "./types";

const BADGES = {
  FIRST_TRIP: {
    type: "FIRST_TRIP",
    title: "First trip",
    description: "You checked in on your first trip.",
  },
  FIVE_CITIES: {
    type: "FIVE_CITIES",
    title: "Five cities",
    description: "You checked in across five different cities.",
  },
  THREE_COUNTRIES: {
    type: "THREE_COUNTRIES",
    title: "Three countries",
    description: "You checked in across three different countries.",
  },
} as const;

export type BadgeType = keyof typeof BADGES;

export function badgeCopy(type: string): { title: string; description: string } {
  const match = Object.values(BADGES).find((badge) => badge.type === type);
  return match ?? { title: type, description: "Milestone unlocked." };
}

/** Stable key for one itinerary stop, e.g. `2:0`. */
export function stopKey(day: number, activityIndex: number): string {
  return `${day}:${activityIndex}`;
}

let countryTimeZoneCache: Map<string, string> | null = null;

function allCountryTimeZones(): Map<string, string> {
  if (countryTimeZoneCache) return countryTimeZoneCache;

  const map = new Map<string, string>();

  for (const country of Object.values(getAllCountries())) {
    const zones = country.timezones ?? [];

    // Skip far-flung island zones (e.g. Azores for Portugal) so the trip shows
    // the time people actually keep on the mainland.
    const mainZone =
      zones.find((zone) => !zone.startsWith("Atlantic/")) ?? zones[0];

    if (mainZone) {
      map.set(country.name.toLowerCase(), mainZone);
    }
  }

  countryTimeZoneCache = map;
  return map;
}

/** Best-effort IANA zone for a country name; null when unknown. */
export function destinationTimeZone(country: string): string | null {
  if (!country) return null;
  return allCountryTimeZones().get(country.trim().toLowerCase()) ?? null;
}

/** Calendar date (YYYY-MM-DD) of an instant in a given zone. */
function localDateString(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = parts.find((part) => part.type === "year")?.value ?? "";
  const month = parts.find((part) => part.type === "month")?.value ?? "";
  const day = parts.find((part) => part.type === "day")?.value ?? "";

  return `${year}-${month}-${day}`;
}

function daysBetween(fromIso: string, toIso: string): number {
  const from = Date.parse(`${fromIso}T00:00:00Z`);
  const to = Date.parse(`${toIso}T00:00:00Z`);
  return Math.round((to - from) / 86_400_000);
}

export function getDestinationLocalNow(country: string): {
  timeZone: string | null;
  now: Date;
  formatted: string;
} {
  const timeZone = destinationTimeZone(country) ?? "UTC";
  const now = new Date();

  const formatted = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(now);

  return { timeZone, now, formatted };
}

/**
 * Where the trip stands right now, judged in the destination's timezone.
 * Undated trips behave exactly as before (FR-016).
 */
export function getTripPhase(trip: {
  startDate: Date | null;
  endDate: Date | null;
  country: string;
}): TripPhase {
  if (!trip.startDate || !trip.endDate) return "undated";

  const timeZone = destinationTimeZone(trip.country) ?? "UTC";
  const today = localDateString(new Date(), timeZone);
  const start = localDateString(trip.startDate, timeZone);
  const end = localDateString(trip.endDate, timeZone);

  if (today < start) return "upcoming";
  if (today > end) return "completed";
  return "active";
}

/** Builds everything the Today view needs. Server-side only. */
export function buildTripDayViewModel(input: {
  tripId: string;
  country: string;
  city: string;
  startDate: Date | null;
  endDate: Date | null;
  itineraryDays: { day: number; activities: { time: string; description: string }[] }[];
  checkIns: CheckInView[];
}): TripDayViewModel {
  const phase = getTripPhase(input);
  const localNow = getDestinationLocalNow(input.country);
  const timeZone = localNow.timeZone ?? "UTC";
  const today = localDateString(new Date(), timeZone);

  let dayNumber = 0;
  let daysUntilStart: number | null = null;

  if (input.startDate) {
    const start = localDateString(input.startDate, timeZone);

    dayNumber = daysBetween(start, today) + 1;
    daysUntilStart = daysBetween(today, start);
  }

  const todaysItinerary =
    phase === "active" ? input.itineraryDays.find((day) => day.day === dayNumber) : undefined;

  const stops: TodayStop[] = (todaysItinerary?.activities ?? []).map(
    (activity, index) => ({
      key: stopKey(dayNumber, index),
      time: activity.time,
      title: activity.description,
      description: activity.description,
    })
  );

  return {
    phase,
    city: input.city,
    country: input.country,
    timeZone: localNow.timeZone,
    localTime: localNow.formatted,
    dayNumber,
    daysUntilStart,
    stops,
    checkedInKeys: input.checkIns.map((checkIn) => checkIn.stopKey),
    completedDayCount: new Set(input.checkIns.map((checkIn) => checkIn.day)).size,
  };
}

/**
 * Checks milestone badges after a check-in and returns the badge the user just
 * earned (if any), so the UI can celebrate it exactly once.
 */
export async function evaluateBadges(
  userId: string
): Promise<BadgeView | null> {
  try {
    const checkIns = await db.checkIn.findMany({
      where: { userId },
      select: { stopKey: true, tripId: true, day: true },
    });

    if (checkIns.length === 0) return null;

    const tripIds = [...new Set(checkIns.map((item) => item.tripId))];

    const trips = await db.trip.findMany({
      where: { id: { in: tripIds } },
      select: {
        id: true,
        country: true,
        aiResponse: { select: { location: true, itinerary: true } },
      },
    });

    // Day -> city name, so "five cities" counts real places, not stop numbers
    const cityByTripDay = new Map<string, string>();

    for (const trip of trips) {
      const itinerary = parseJsonField<unknown>(trip.aiResponse?.itinerary);
      const days = Array.isArray(itinerary)
        ? (itinerary as { day: number; location: string }[])
        : ((itinerary as { day?: { day: number; location: string }[] } | null)
            ?.day ?? []);

      for (const day of days) {
        if (day?.location) {
          cityByTripDay.set(`${trip.id}:${day.day}`, day.location);
        }
      }
    }

    const cities = new Set<string>();
    const countries = new Set<string>();

    for (const trip of trips) {
      countries.add(trip.country.toLowerCase());
    }

    for (const checkIn of checkIns) {
      const city =
        cityByTripDay.get(`${checkIn.tripId}:${checkIn.day}`) ?? "Somewhere";
      cities.add(city.toLowerCase());
    }

    const candidates: string[] = [];

    if (new Set(checkIns.map((item) => item.tripId)).size >= 1) {
      candidates.push(BADGES.FIRST_TRIP.type);
    }

    if (cities.size >= 5) candidates.push(BADGES.FIVE_CITIES.type);
    if (countries.size >= 3) candidates.push(BADGES.THREE_COUNTRIES.type);

    for (const type of candidates) {
      const existing = await db.badge.findFirst({
        where: { userId, type },
        select: { id: true },
      });

      if (existing) continue;

      const created = await db.badge.create({ data: { userId, type } });

      return { id: created.id, type: created.type, earnedAt: created.earnedAt };
    }

    return null;
  } catch (error) {
    console.log("evaluateBadges failed:", error);
    return null;
  }
}