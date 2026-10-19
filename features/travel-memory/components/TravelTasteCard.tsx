"use client";

import { useState } from "react";
import { Heart, Pencil } from "lucide-react";
import { TravelProfileModal } from "./TravelProfileModal";
import type { TravelProfileView } from "../types";

export function TravelTasteCard({
  profile,
}: {
  profile: TravelProfileView | null;
}) {
  const [open, setOpen] = useState(false);

  const rows: { label: string; value: string }[] = profile
    ? [
        profile.pace && { label: "Pace", value: profile.pace },
        profile.budgetStyle && { label: "Budget", value: profile.budgetStyle },
        profile.interests.length > 0 && {
          label: "Loves",
          value: profile.interests.join(", "),
        },
        profile.dietaryNeeds && {
          label: "Food",
          value: profile.dietaryNeeds,
        },
        profile.accessibilityNeeds && {
          label: "Accessibility",
          value: profile.accessibilityNeeds,
        },
        profile.notes && { label: "Notes", value: profile.notes },
      ].filter(Boolean) as { label: string; value: string }[]
    : [];

  const hasContent = rows.length > 0;

  return (
    <div className="rounded-[16px] bg-white p-[19px] drop-shadow-2xl drop-shadow-[#0D0A2C14]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-full bg-[#F7EDF6]">
            <Heart className="size-5 text-[#C11574]" />
          </span>
          <div>
            <h2 className="text-[16px] font-semibold text-[#1F1F36]">
              Your travel taste
            </h2>
            <p className="text-[13px] text-[#7C7A8F]">
              Optional — used to personalize new plans.
            </p>
          </div>
        </div>

        {hasContent && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex h-[36px] cursor-pointer items-center gap-1.5 rounded-full bg-[#F3F6F8] px-4 text-[13.5px] text-[#2E2C48] transition-colors hover:bg-[#E8F1FE]"
          >
            <Pencil className="size-3.5" />
            Edit
          </button>
        )}
      </div>

      {hasContent ? (
        <div className="mt-4 flex flex-col gap-2.5">
          {rows.map((row) => (
            <div key={row.label} className="flex gap-3">
              <span className="w-[100px] shrink-0 text-[12.5px] font-semibold uppercase tracking-wide text-[#7C7A8F]">
                {row.label}
              </span>
              <span className="text-[14.5px] text-[#2E2C48]">{row.value}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-[12px] border border-dashed border-[#D8DEF0] bg-[#F9FBFC] p-4">
          <p className="text-[14px] text-[#5C5A70]">
            Tell us how you like to travel once — pace, food, the things you
            love — and every new plan will fit you better. Skipping this is
            completely fine.
          </p>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="mt-3 h-[40px] cursor-pointer rounded-full bg-[#256FF1] px-5 text-[14px] font-[500] text-white transition-colors hover:bg-[#1D5AD9]"
          >
            Add my travel taste
          </button>
        </div>
      )}

      <TravelProfileModal open={open} onOpenChange={setOpen} profile={profile} />
    </div>
  );
}
