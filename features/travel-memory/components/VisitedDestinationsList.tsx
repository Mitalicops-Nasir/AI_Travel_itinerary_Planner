"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MapPin, Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { addVisitedDestination, removeVisitedDestination } from "../actions";
import type { VisitedDestinationView } from "../types";

const inputClass =
  "w-full rounded-[8px] border border-[#ECF2EF] bg-white px-3 py-2 text-[14.5px] text-[#2E2C48] outline-none transition-colors focus:border-[#256FF1]";

const labelClass =
  "text-[12px] font-semibold uppercase tracking-wide text-[#7C7A8F]";

export function VisitedDestinationsList({
  visited,
}: {
  visited: VisitedDestinationView[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [year, setYear] = useState("");

  function handleAdd() {
    if (!country.trim()) {
      toast.error("Please add at least a country.");
      return;
    }

    startTransition(async () => {
      const result = await addVisitedDestination({
        country: country.trim(),
        city: city.trim() || undefined,
        year: year ? Number(year) : undefined,
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Place added — plans will avoid repeating it.");
      setCountry("");
      setCity("");
      setYear("");
      setOpen(false);
      router.refresh();
    });
  }

  function handleRemove(id: string) {
    startTransition(async () => {
      const result = await removeVisitedDestination(id);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Place removed.");
      router.refresh();
    });
  }

  return (
    <div className="rounded-[16px] bg-white p-[19px] drop-shadow-2xl drop-shadow-[#0D0A2C14]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-full bg-[#E8F1FE]">
            <MapPin className="size-5 text-[#256FF1]" />
          </span>
          <div>
            <h2 className="text-[16px] font-semibold text-[#1F1F36]">
              Places you&apos;ve been
            </h2>
            <p className="text-[13px] text-[#7C7A8F]">
              New plans will suggest fresh things instead of repeats.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex h-[36px] cursor-pointer items-center gap-1.5 rounded-full bg-[#256FF1] px-4 text-[13.5px] font-[500] text-white transition-colors hover:bg-[#1D5AD9]"
        >
          <Plus className="size-4" />
          Add
        </button>
      </div>

      {visited.length > 0 ? (
        <div className="mt-4 flex flex-col gap-2">
          {visited.map((place) => (
            <div
              key={place.id}
              className="flex items-center justify-between gap-3 rounded-[10px] border border-[#ECF2EF] bg-[#F9FBFC] px-3 py-2.5"
            >
              <div className="min-w-0">
                <p className="truncate text-[14.5px] font-semibold text-[#2E2C48]">
                  {place.city ? `${place.city}, ${place.country}` : place.country}
                </p>
                {place.year && (
                  <p className="text-[12.5px] text-[#7C7A8F]">{place.year}</p>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleRemove(place.id)}
                disabled={isPending}
                aria-label={`Remove ${place.country}`}
                className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white transition-colors hover:bg-[#FDECEC] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Trash2 className="size-4 text-[#E23636]" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-[12px] border border-dashed border-[#D8DEF0] bg-[#F9FBFC] p-4">
          <p className="text-[14px] text-[#5C5A70]">
            Add the places you already know, and future plans will skip them and
            suggest new ideas instead.
          </p>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-[16px] border-[#ECF2EF] sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="text-[20px] font-[700] text-[#141627]">
              Add a place you&apos;ve visited
            </DialogTitle>
            <DialogDescription className="text-[14px] text-[#7F7E83]">
              Only the country is required.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className={labelClass} htmlFor="visited-country">
                Country
              </label>
              <input
                id="visited-country"
                value={country}
                onChange={(event) => setCountry(event.target.value)}
                placeholder="e.g. Portugal"
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className={labelClass} htmlFor="visited-city">
                  City (optional)
                </label>
                <input
                  id="visited-city"
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  placeholder="e.g. Lisbon"
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className={labelClass} htmlFor="visited-year">
                  Year (optional)
                </label>
                <input
                  id="visited-year"
                  value={year}
                  onChange={(event) =>
                    setYear(event.target.value.replace(/[^0-9]/g, "").slice(0, 4))
                  }
                  inputMode="numeric"
                  placeholder="e.g. 2023"
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="h-[42px] cursor-pointer rounded-full border border-[#ECF2EF] px-5 text-[14.5px] text-[#2E2C48] transition-colors hover:bg-[#F3F6F8]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAdd}
              disabled={isPending}
              className="h-[42px] cursor-pointer rounded-full bg-[#256FF1] px-6 text-[14.5px] font-[500] text-white transition-colors hover:bg-[#1D5AD9] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? "Adding…" : "Add place"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
