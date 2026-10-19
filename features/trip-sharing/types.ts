export type PublicTripState = "active" | "paused" | "revoked" | "invalid";

export type PublicTripView = {
  state: PublicTripState;
  updatedAt: string;
  traveler: { firstName: string; image: string | null } | null;
  trip: {
    title: string;
    country: string;
    city: string;
    coverImage: string | null;
    startDate: string | null;
    endDate: string | null;
    phase: "upcoming" | "active" | "completed" | "undated";
  } | null;
  route: { day: number; location: string; lat: number; lng: number }[];
  visited: {
    day: number;
    stopKey: string;
    stopTitle: string;
    checkedInAt: string;
    note: string | null;
    photoUrl: string | null;
  }[];
  journal: {
    day: number | null;
    note: string | null;
    photos: string[];
    createdAt: string;
  }[];
};

export type ShareStateView = "ACTIVE" | "PAUSED" | "REVOKED";