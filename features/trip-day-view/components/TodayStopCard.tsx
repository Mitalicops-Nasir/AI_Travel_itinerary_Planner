"use client";

import { Check } from "lucide-react";

export function TodayStopCard({
  stopKey,
  time,
  title,
  checkedIn,
  canCheckIn,
  onCheckIn,
}: {
  stopKey: string;
  time: string;
  title: string;
  checkedIn: boolean;
  canCheckIn: boolean;
  onCheckIn: (stopKey: string, title: string) => void;
}) {
  return (
    <div
      className={`flex items-start justify-between gap-3 rounded-[12px] border px-3.5 py-3 max-[500px]:flex-col ${
        checkedIn
          ? "border-[#C7E9C7] bg-[#F4FBF4]"
          : "border-[#ECF2EF] bg-white"
      }`}
    >
      <div className="min-w-0">
        {time && (
          <p className="text-[12px] font-semibold uppercase tracking-wide text-[#7C7A8F]">
            {time}
          </p>
        )}
        <p className="mt-0.5 text-[14.5px] text-[#2E2C48]">{title}</p>
      </div>

      <button
        type="button"
        onClick={() => onCheckIn(stopKey, title)}
        disabled={checkedIn || !canCheckIn}
        className={`flex h-[36px] shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-4 text-[13px] font-[500] transition-colors ${
          checkedIn
            ? "bg-[#E8F6E8] text-[#2F7D32] disabled:cursor-default"
            : canCheckIn
              ? "bg-[#256FF1] text-white hover:bg-[#1D5AD9]"
              : "cursor-not-allowed bg-[#F3F6F8] text-[#9C9AA6]"
        }`}
      >
        <Check className="size-4" />
        {checkedIn ? "Visited" : "Check in"}
      </button>
    </div>
  );
}