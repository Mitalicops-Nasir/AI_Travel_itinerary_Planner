import { BedDouble, Compass } from "lucide-react";
import { OfferLinkButton } from "./OfferLinkButton";
import type { PartnerOffer } from "../types";

export function BookableOffersCard({
  offers,
  tripId,
  city,
}: {
  offers: PartnerOffer[];
  tripId: string;
  city: string;
}) {
  if (offers.length === 0) return null;

  return (
    <div className="mt-4 rounded-[10px] border border-[#E3F1FF] bg-[#F9FBFC] p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[#7C7A8F]">
        Bookable near {city} · booking opens on partner sites
      </p>

      <div className="mt-3 flex flex-col gap-2">
        {offers.map((offer) => (
          <div
            key={offer.id}
            className="flex items-center justify-between gap-3 rounded-[10px] border border-[#E3F1FF] bg-white px-3 py-2.5 max-[500px]:flex-col max-[500px]:items-start"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#F7EDF6]">
                {offer.kind === "activity" ? (
                  <Compass className="size-4 text-[#C11574]" />
                ) : (
                  <BedDouble className="size-4 text-[#C11574]" />
                )}
              </span>

              <div className="min-w-0">
                <p className="truncate text-[14.5px] font-semibold text-[#2E2C48]">
                  {offer.title}
                </p>
                <p className="truncate text-[12.5px] text-[#7C7A8F]">
                  {offer.description}
                </p>
              </div>
            </div>

            <OfferLinkButton
              url={offer.url}
              partner={offer.partner}
              kind={offer.kind}
              tripId={tripId}
              destination={city}
              label={offer.ctaLabel}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
