export type TripLocation = {
  city: string;
  coordinates: number[];
};

export type TripActivity = {
  time: string;
  description: string;
};

export type TripItineraryDay = {
  day: number;
  location: string;
  gettingThere: string;
  activities: TripActivity[];
};

export type TripCardView = {
  id: string;
  country: string;
  city: string;
  imageUrl: string;
  estimatedPrice: string;
  tags: string[];
};

export type TripDetailsView = {
  id: string;
  duration: number;
  createdAt: Date;
  aiResponse: {
    title: string;
    description: string;
    estimatedPrice: string;
    tags: string[];
    bestTimeToVisit: string[];
    weatherInfo: string[];
    images: string[];
    location: TripLocation | null;
    itineraryDays: TripItineraryDay[];
  } | null;
};

export const FALLBACK_TRIP_IMAGE = "/assets/images/sample1.jpg";

export function parseJsonField<T>(raw: unknown): T | null {
  if (raw == null) return null;

  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  return raw as T;
}

type TripCardRow = {
  id: string;
  country: string;
  aiResponse: {
    images: string[];
    estimatedPrice: string;
    location: unknown;
    tags: string[];
  } | null;
};

export function toTripCard(row: TripCardRow): TripCardView {
  const aiResponse = row.aiResponse;
  const images = aiResponse?.images ?? [];
  const location = parseJsonField<TripLocation>(aiResponse?.location);

  return {
    id: row.id,
    country: row.country,
    city: location?.city || "Unknown City",
    imageUrl: images[2] || images[0] || FALLBACK_TRIP_IMAGE,
    estimatedPrice: aiResponse?.estimatedPrice || "0",
    tags: aiResponse?.tags ?? [],
  };
}

type TripDetailsRow = {
  id: string;
  duration: number;
  createdAt: Date;
  aiResponse: {
    title: string;
    description: string;
    estimatedPrice: string;
    tags: string[];
    bestTimeToVisit: string[];
    weatherInfo: string[];
    images: string[];
    location: unknown;
    itinerary: unknown;
  } | null;
};

export function toTripDetails(row: TripDetailsRow): TripDetailsView {
  const aiResponse = row.aiResponse;

  if (!aiResponse) {
    return {
      id: row.id,
      duration: row.duration,
      createdAt: row.createdAt,
      aiResponse: null,
    };
  }

  const rawItinerary = parseJsonField<unknown>(aiResponse.itinerary);
  const itineraryDays = Array.isArray(rawItinerary)
    ? (rawItinerary as TripItineraryDay[])
    : ((rawItinerary as { day?: TripItineraryDay[] } | null)?.day ?? []);

  return {
    id: row.id,
    duration: row.duration,
    createdAt: row.createdAt,
    aiResponse: {
      title: aiResponse.title,
      description: aiResponse.description,
      estimatedPrice: aiResponse.estimatedPrice,
      tags: aiResponse.tags ?? [],
      bestTimeToVisit: aiResponse.bestTimeToVisit ?? [],
      weatherInfo: aiResponse.weatherInfo ?? [],
      images: aiResponse.images ?? [],
      location: parseJsonField<TripLocation>(aiResponse.location),
      itineraryDays,
    },
  };
}
