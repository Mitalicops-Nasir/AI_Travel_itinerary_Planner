"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CalendarCheck, MapPin } from "lucide-react";
import { checkIn } from "../actions";
import { badgeCopy } from "../lib";
import type { TripDayViewModel } from "../types";
import { CheckInModal } from "./CheckInModal";
import { TodayStopCard } from "./TodayStopCard";

export function TripDayView({
  model,
  tripId,
  userId,
}: {
  model: TripDayViewModel;
  tripId: string;
  userId?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [target, setTarget] = useState<{ key: string; title: string } | null>(
    null
  );
  const [checkedInKeys, setCheckedInKeys] = useState<string[]>(
    model.checkedInKeys
  );

  function handleConfirm(note: string) {
    if (!target) return;

    startTransition(async () => {
      const result = await checkIn({
        tripId,
        day: model.dayNumber,
        stopKey: target.key,
        stopTitle: target.title,
        note: note || undefined,
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      setCheckedInKeys((current) =>
        current.includes(target.key) ? current : [...current, target.key]
      );

      if (result.badgeEarned) {
        const copy = badgeCopy(result.badgeEarned.type);
        toast.success(`${copy.title} unlocked — ${copy.description}`);
      } else {
        toast.success("Checked in. Enjoy the rest of your day!");
      }

      setTarget(null);
      router.refresh();
    });
  }

  return (
    <div className="rounded-[16px] border border-[#E3F1FF] bg-[#F9FBFC] p-4 max-[600px]:p-3.5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-full bg-white">
            <CalendarCheck className="size-5 text-[#256FF1]" />
          </span>
          <div>
            <p className="text-[15px] font-semibold text-[#1F1F36]">
              Day {model.dayNumber} in {model.city}
            </p>
            <p className="flex items-center gap-1.5 text-[13px] text-[#5C5A70]">
              <MapPin className="size-3.5" />
              {model.localTime}
            </p>
          </div>
        </div>

        {!userId && (
          <p className="text-[13px] text-[#7C7A8F]">
            Log in to tick off the places you visit.
          </p>
        )}
      </div>

      {model.stops.length > 0 ? (
        <div className="mt-4 flex flex-col gap-2">
          {model.stops.map((stop) => (
            <TodayStopCard
              key={stop.key}
              stopKey={stop.key}
              time={stop.time}
              title={stop.title}
              checkedIn={checkedInKeys.includes(stop.key)}
              canCheckIn={Boolean(userId)}
              onCheckIn={(key, title) => setTarget({ key, title })}
            />
          ))}
        </div>
      ) : (
        <p className="mt-4 text-[14px] text-[#5C5A70]">
          Nothing is planned for today yet — enjoy the free time.
        </p>
      )}

      <CheckInModal
        open={target !== null}
        onOpenChange={(open) => {
          if (!open) setTarget(null);
        }}
        stopTitle={target?.title ?? ""}
        dayNumber={model.dayNumber}
        onConfirm={handleConfirm}
        isPending={isPending}
      />
    </div>
  );
}