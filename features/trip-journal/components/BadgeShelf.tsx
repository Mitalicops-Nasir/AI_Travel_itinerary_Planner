"use client";

import { Award, Globe2, MapPinned, Plane } from "lucide-react";
import { badgeCopy } from "@/features/trip-day-view/lib";

export type BadgeItem = {
  id: string;
  type: string;
  earnedAt: string;
};

const icons = {
  FIRST_TRIP: Plane,
  FIVE_CITIES: MapPinned,
  THREE_COUNTRIES: Globe2,
} as const;

export function BadgeShelf({ badges }: { badges: BadgeItem[] }) {
  return (
    <div className="rounded-[16px] bg-white p-[19px] drop-shadow-2xl drop-shadow-[#0D0A2C14] mt-5">
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-full bg-[#FFF4ED]">
          <Award className="size-5 text-[#B93815]" />
        </span>
        <div>
          <h2 className="text-[16px] font-semibold text-[#1F1F36]">
            Your badges
          </h2>
          <p className="text-[13px] text-[#7C7A8F]">
            Earned by checking in while you travel.
          </p>
        </div>
      </div>

      {badges.length === 0 ? (
        <p className="mt-4 rounded-[12px] border border-dashed border-[#D8DEF0] bg-[#F9FBFC] p-4 text-[14px] text-[#5C5A70]">
          No badges yet. Check in at a stop on a trip that has dates and your
          first badge unlocks straight away.
        </p>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {badges.map((badge) => {
            const copy = badgeCopy(badge.type);
            const Icon = icons[badge.type as keyof typeof icons] ?? Award;

            return (
              <div
                key={badge.id}
                className="flex items-start gap-3 rounded-[12px] border border-[#ECF2EF] bg-[#F9FBFC] px-3.5 py-3"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#FFF4ED]">
                  <Icon className="size-4 text-[#B93815]" />
                </span>
                <div className="min-w-0">
                  <p className="text-[14px] font-semibold text-[#2E2C48]">
                    {copy.title}
                  </p>
                  <p className="text-[12.5px] text-[#7F7E83]">
                    {copy.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}