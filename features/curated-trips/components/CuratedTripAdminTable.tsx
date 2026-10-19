"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { setCuratedFlags } from "../actions";
import type { CuratedTripView } from "../types";

function TripRow({ trip }: { trip: CuratedTripView }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [isCurated, setIsCurated] = useState(trip.isCurated);
  const [isPublished, setIsPublished] = useState(trip.isPublished);
  const [price, setPrice] = useState(
    trip.priceInCents != null ? String(trip.priceInCents / 100) : ""
  );

  function save() {
    const parsedPrice = Number.parseFloat(price);

    if (isCurated && (!Number.isFinite(parsedPrice) || parsedPrice < 1)) {
      toast.error("Enter a price of at least $1 for a premium trip.");
      return;
    }

    startTransition(async () => {
      const result = await setCuratedFlags(trip.id, {
        isCurated,
        isPublished,
        priceInCents: isCurated ? Math.round(parsedPrice * 100) : undefined,
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(
        isCurated
          ? `${trip.title} updated — ${isPublished ? "live for travelers" : "saved as draft"}.`
          : `${trip.title} is back to a standard trip.`
      );
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-4 rounded-[14px] border border-[#ECF2EF] bg-white p-4 md:flex-row md:items-center md:justify-between">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-[15px] font-[600] text-[#141627]">
            {trip.title}
          </p>
          {trip.isCurated && (
            <span
              className={`rounded-full px-2.5 py-[3px] text-[11.5px] font-[600] ${
                trip.isPublished
                  ? "bg-[#E8F1FE] text-[#256FF1]"
                  : "bg-[#F3F6F8] text-[#5C5A70]"
              }`}
            >
              {trip.isPublished ? "Published" : "Draft"}
            </span>
          )}
        </div>
        <p className="mt-[3px] text-[13px] text-[#7F7E83]">
          {trip.city}, {trip.country} · {trip.duration} days ·{" "}
          {trip.paidBuyers} {trip.paidBuyers === 1 ? "buyer" : "buyers"}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex cursor-pointer items-center gap-2 text-[13.5px] text-[#2E2C48]">
          <input
            type="checkbox"
            checked={isCurated}
            onChange={(event) => setIsCurated(event.target.checked)}
            className="size-4 cursor-pointer accent-[#256FF1]"
          />
          Premium
        </label>

        <label className="flex items-center gap-1.5 text-[13.5px] text-[#2E2C48]">
          $
          <input
            type="number"
            min="1"
            step="1"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            disabled={!isCurated}
            placeholder="29"
            className="h-[38px] w-[84px] rounded-[8px] border border-[#ECF2EF] px-3 text-[14px] text-[#141627] outline-none focus:border-[#256FF1] disabled:bg-[#F6F8FA] disabled:text-[#A5A3B2]"
          />
        </label>

        <label className="flex cursor-pointer items-center gap-2 text-[13.5px] text-[#2E2C48]">
          <input
            type="checkbox"
            checked={isPublished}
            disabled={!isCurated}
            onChange={(event) => setIsPublished(event.target.checked)}
            className="size-4 cursor-pointer accent-[#256FF1] disabled:cursor-not-allowed"
          />
          Published
        </label>

        <button
          type="button"
          onClick={save}
          disabled={isPending}
          className="h-[38px] cursor-pointer rounded-full bg-[#256FF1] px-5 text-[13.5px] font-[500] text-white transition-colors hover:bg-[#1D5AD9] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}

export function CuratedTripAdminTable({ trips }: { trips: CuratedTripView[] }) {
  if (trips.length === 0) {
    return (
      <p className="rounded-[14px] border border-[#ECF2EF] bg-white px-4 py-6 text-center text-[14px] text-[#7F7E83]">
        No trips yet. Generate a trip first, then mark it premium here.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {trips.map((trip) => (
        <TripRow key={trip.id} trip={trip} />
      ))}
    </div>
  );
}
