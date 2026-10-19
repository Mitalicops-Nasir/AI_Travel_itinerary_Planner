import type { CheckInView, TripPhase } from "@/features/trip-day-view/types";

export type JournalEntryView = {
  id: string;
  tripId: string;
  userId: string;
  day: number | null;
  note: string | null;
  photos: string[];
  createdAt: Date;
  updatedAt: Date;
};

export type RecapRouteStop = {
  day: number;
  location: string;
  lat: number;
  lng: number;
};

export type RecapStats = {
  days: number;
  stopsVisited: number;
  photos: number;
};

export type RecapData = {
  tripId: string;
  title: string;
  country: string;
  city: string;
  coverImage: string | null;
  startDate: Date | null;
  endDate: Date | null;
  phase: TripPhase;
  route: RecapRouteStop[];
  visited: CheckInView[];
  journal: JournalEntryView[];
  stats: RecapStats;
};

export type RecapViewData = {
  title: string;
  country: string;
  city: string;
  coverImage: string | null;
  dateLabel: string;
  phase: TripPhase;
  stats: RecapStats;
  route: { day: number; location: string }[];
  visited: {
    day: number;
    stopTitle: string;
    checkedInAtLabel: string;
    note: string | null;
    photoUrl: string | null;
  }[];
  journal: {
    day: number | null;
    note: string | null;
    photos: string[];
    createdLabel: string;
  }[];
};
