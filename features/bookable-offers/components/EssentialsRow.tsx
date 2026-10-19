import { Car, ShieldCheck, Smartphone } from "lucide-react";
import { OfferLinkButton } from "./OfferLinkButton";
import type { EssentialsOffer } from "../types";

const ICONS = {
  insurance: ShieldCheck,
  esim: Smartphone,
  car: Car,
} as const;

export function EssentialsRow({
  offers,
  tripId,
}: {
  offers: EssentialsOffer[];
  tripId?: string;
}) {
  if (offers.length === 0) return null;

  return (
    <div className="rounded-[10px] border border-[#E3F1FF] bg-[#F9FBFC] p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[#7C7A8F]">
        Before you go · travel essentials
      </p>

      <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-3">
        {offers.map((offer) => {
          const Icon = ICONS[offer.kind];

          return (
            <div
              key={offer.id}
              className="flex flex-col justify-between gap-3 rounded-[10px] border border-[#E3F1FF] bg-white px-3 py-3"
            >
              <div className="flex items-start gap-2.5">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#F7EDF6]">
                  <Icon className="size-4 text-[#C11574]" />
                </span>
                <div className="min-w-0">
                  <p className="text-[14px] font-semibold text-[#2E2C48]">
                    {offer.title}
                  </p>
                  <p className="text-[12px] leading-[18px] text-[#7C7A8F]">
                    {offer.description}
                  </p>
                </div>
              </div>

              <OfferLinkButton
                url={offer.url}
                partner={offer.partner}
                kind={offer.kind}
                tripId={tripId}
                label={offer.ctaLabel}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
