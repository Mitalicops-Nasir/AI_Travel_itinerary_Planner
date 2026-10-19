export type CuratedTripView = {
  id: string;
  title: string;
  country: string;
  city: string;
  duration: number;
  isCurated: boolean;
  isPublished: boolean;
  priceInCents: number | null;
  paidBuyers: number;
  createdAt: string;
};

export type CuratedGateView = {
  tripId: string;
  isCurated: boolean;
  hasAccess: boolean;
  priceInCents: number | null;
};

export type CuratedFlagsInput = {
  isCurated: boolean;
  priceInCents?: number;
  isPublished: boolean;
};

export type CuratedActionResult<T = object> =
  | ({ success: true } & T)
  | { success: false; error: string };
