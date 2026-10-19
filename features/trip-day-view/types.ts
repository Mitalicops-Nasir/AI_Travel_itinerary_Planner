export type TripPhase = "upcoming" | "active" | "completed" | "undated";

export type CheckInView = {
  id: string;
  tripId: string;
  userId: string;
  day: number;
  stopKey: string;
  stopTitle: string;
  note: string | null;
  photoUrl: string | null;
  checkedInAt: Date;
};

export type BadgeView = {
  id: string;
  type: string;
  earnedAt: Date;
};

export type TodayStop = {
  key: string;
  time: string;
  title: string;
  description: string;
};

export type TripDayViewModel = {
  phase: TripPhase;
  city: string;
  country: string;
  timeZone: string | null;
  localTime: string;
  dayNumber: number;
  daysUntilStart: number | null;
  stops: TodayStop[];
  checkedInKeys: string[];
  completedDayCount: number;
};