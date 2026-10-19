"use client";

import { ArrowUpRight } from "lucide-react";
import { logOfferClick } from "../actions";
import type { OfferKind, PartnerId } from "../types";

export function OfferLinkButton({
  url,
  partner,
  kind,
  tripId,
  destination,
  label,
}: {
  url: string;
  partner: PartnerId;
  kind: OfferKind;
  tripId?: string;
  destination?: string;
  label: string;
}) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer sponsored"
      onClick={() => {
        // Analytics only — never block the outbound navigation
        void logOfferClick({ tripId, partner, kind, destination });
      }}
      className="inline-flex shrink-0 items-center gap-1 rounded-[20px] border border-[#E3F1FF] bg-white px-3 py-1.5 text-[12.5px] font-semibold text-[#2E2C48] transition-colors hover:bg-[#F3F8FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C11574]/40"
    >
      {label}
      <ArrowUpRight className="size-3.5" />
    </a>
  );
}
