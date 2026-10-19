export type PartnerId =
  | "viator"
  | "getyourguide"
  | "booking"
  | "insurance"
  | "esim"
  | "car";

export type OfferKind = "activity" | "stay" | "insurance" | "esim" | "car";

export type PartnerOffer = {
  id: string;
  partner: PartnerId;
  kind: "activity" | "stay";
  title: string;
  description: string;
  url: string;
  ctaLabel: string;
};

export type EssentialsOffer = {
  id: string;
  partner: PartnerId;
  kind: "insurance" | "esim" | "car";
  title: string;
  description: string;
  url: string;
  ctaLabel: string;
};

export type DayOffersMap = Record<number, PartnerOffer[]>;
