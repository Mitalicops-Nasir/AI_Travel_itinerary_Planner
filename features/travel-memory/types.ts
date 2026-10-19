export type TravelProfileView = {
  pace: string | null;
  budgetStyle: string | null;
  interests: string[];
  dietaryNeeds: string | null;
  accessibilityNeeds: string | null;
  notes: string | null;
};

export type VisitedDestinationView = {
  id: string;
  country: string;
  city: string | null;
  year: number | null;
};
