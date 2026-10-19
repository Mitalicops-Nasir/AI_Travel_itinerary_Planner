import type { EssentialsOffer, PartnerOffer } from "./types";

// Partner affiliate configuration. All optional: when an id is missing the
// matching offer block is hidden entirely (never broken or empty).
const VIATOR_PARTNER_ID = process.env.VIATOR_PARTNER_ID;
const GETYOURGUIDE_PARTNER_ID = process.env.GETYOURGUIDE_PARTNER_ID;
const BOOKING_AID = process.env.BOOKING_AID;
const SAFETYWING_REF = process.env.SAFETYWING_REF;
const DISCOVERCARS_AID = process.env.DISCOVERCARS_AID;

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function withParam(url: string, key: string, value: string): string {
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}${key}=${encodeURIComponent(value)}`;
}

/** Tour/activity offer for one day — Viator when configured, else GetYourGuide. */
export function buildActivityOffer(
  city: string,
  dayNumber: number
): PartnerOffer | null {
  const destination = city.trim() || "this destination";

  if (VIATOR_PARTNER_ID) {
    const url = withParam(
      `https://www.viator.com/searchResults/all?text=${encodeURIComponent(
        `things to do in ${destination}`
      )}`,
      "pid",
      VIATOR_PARTNER_ID
    );

    return {
      id: `viator-${slugify(destination)}-${dayNumber}`,
      partner: "viator",
      kind: "activity",
      title: `Tours & activities in ${destination}`,
      description: "Top-rated experiences for this stop, bookable on Viator.",
      url,
      ctaLabel: "Browse tours",
    };
  }

  if (GETYOURGUIDE_PARTNER_ID) {
    const url = withParam(
      `https://www.getyourguide.com/s/?q=${encodeURIComponent(destination)}`,
      "partner_id",
      GETYOURGUIDE_PARTNER_ID
    );

    return {
      id: `getyourguide-${slugify(destination)}-${dayNumber}`,
      partner: "getyourguide",
      kind: "activity",
      title: `Things to do in ${destination}`,
      description: "Hand-picked tours and tickets, bookable on GetYourGuide.",
      url,
      ctaLabel: "Browse activities",
    };
  }

  return null;
}

/** Stay offer for one day — only when Booking affiliate is configured. */
export function buildStayOffer(
  city: string,
  dayNumber: number
): PartnerOffer | null {
  const destination = city.trim() || "this destination";

  if (!BOOKING_AID) return null;

  const url = withParam(
    `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(
      destination
    )}`,
    "aid",
    BOOKING_AID
  );

  return {
    id: `booking-${slugify(destination)}-${dayNumber}`,
    partner: "booking",
    kind: "stay",
    title: `Stays in ${destination}`,
    description: "Places to stay near this day's plan, bookable on Booking.com.",
    url,
    ctaLabel: "Find a stay",
  };
}

/** All bookable offers for one itinerary day (may be empty). */
export function buildDayOffers(input: {
  country: string;
  city: string;
  dayNumber: number;
  interests?: string;
}): PartnerOffer[] {
  return [
    buildActivityOffer(input.city, input.dayNumber),
    buildStayOffer(input.city, input.dayNumber),
  ].filter((offer): offer is PartnerOffer => offer !== null);
}

/** Pre-trip essentials. Always available; tracking params added when configured. */
export function buildEssentialsOffers(): EssentialsOffer[] {
  const insuranceUrl = SAFETYWING_REF
    ? withParam("https://safetywing.com/nomad-insurance", "referenceID", SAFETYWING_REF)
    : "https://safetywing.com/nomad-insurance";

  const carUrl = DISCOVERCARS_AID
    ? withParam("https://www.discovercars.com/", "a_aid", DISCOVERCARS_AID)
    : "https://www.discovercars.com/";

  return [
    {
      id: "insurance-safetywing",
      partner: "insurance",
      kind: "insurance",
      title: "Travel insurance",
      description: "Cover for delays, medical costs and lost bags.",
      url: insuranceUrl,
      ctaLabel: "Get a quote",
    },
    {
      id: "esim-airalo",
      partner: "esim",
      kind: "esim",
      title: "Travel eSIM",
      description: "Mobile data abroad without roaming fees.",
      url: "https://www.airalo.com/",
      ctaLabel: "Get data",
    },
    {
      id: "car-discovercars",
      partner: "car",
      kind: "car",
      title: "Rental car",
      description: "Compare rental cars at your destination.",
      url: carUrl,
      ctaLabel: "Compare cars",
    },
  ];
}
