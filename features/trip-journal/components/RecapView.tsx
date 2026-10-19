import Image from "next/image";
import { Camera, CheckCircle2, Compass, MapPin } from "lucide-react";
import { FALLBACK_TRIP_IMAGE } from "@/lib/trip-view";
import type { RecapViewData } from "../types";

const phaseLabels: Record<string, string> = {
  upcoming: "Starts soon",
  active: "Happening now",
  completed: "Completed",
  undated: "Just a plan",
};

function StatTile({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-1 flex-col items-center gap-1 rounded-[14px] border border-[#ECF2EF] bg-white px-4 py-3">
      <span className="text-[22px] font-[700] text-[#141627]">{value}</span>
      <span className="text-[12.5px] text-[#7F7E83]">{label}</span>
    </div>
  );
}

export function RecapView({ data }: { data: RecapViewData }) {
  return (
    <div className="flex w-full flex-col gap-4">
      <div className="overflow-hidden rounded-[18px] border border-[#ECF2EF] bg-white">
        <div className="relative h-[230px] w-full">
          <Image
            src={data.coverImage ?? FALLBACK_TRIP_IMAGE}
            alt={data.title}
            fill
            className="object-cover"
            sizes="100vw"
          />
          <span className="absolute top-3 left-3 rounded-full bg-white/90 px-3 py-1 text-[12px] font-[600] text-[#256FF1]">
            {phaseLabels[data.phase] ?? data.phase}
          </span>
        </div>

        <div className="flex flex-col gap-2 p-5">
          <h1 className="text-[26px] font-[700] text-[#141627]">{data.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-[14px] text-[#5C5A70]">
            <span className="flex items-center gap-1.5">
              <MapPin className="size-4 text-[#256FF1]" />
              {data.city}, {data.country}
            </span>
            <span className="flex items-center gap-1.5">
              <Compass className="size-4 text-[#256FF1]" />
              {data.dateLabel}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap gap-3">
            <StatTile value={data.stats.days} label="days" />
            <StatTile value={data.stats.stopsVisited} label="places visited" />
            <StatTile value={data.stats.photos} label="photos" />
          </div>
        </div>
      </div>

      <div className="rounded-[18px] border border-[#ECF2EF] bg-white p-5">
        <h2 className="text-[18px] font-[700] text-[#141627]">The route</h2>
        {data.route.length === 0 ? (
          <p className="mt-2 text-[14px] text-[#7C7A8F]">
            No route details were saved for this trip.
          </p>
        ) : (
          <ol className="mt-3 flex flex-col gap-2">
            {data.route.map((stop, index) => (
              <li
                key={`${stop.day}-${index}`}
                className="flex items-center gap-3 rounded-[10px] bg-[#F9FBFC] px-3 py-2"
              >
                <span className="flex size-7 items-center justify-center rounded-full bg-[#E8F1FE] text-[12.5px] font-[600] text-[#256FF1]">
                  {stop.day}
                </span>
                <span className="text-[14px] text-[#2E2C48]">
                  {stop.location}
                </span>
              </li>
            ))}
          </ol>
        )}
      </div>

      <div className="rounded-[18px] border border-[#ECF2EF] bg-white p-5">
        <h2 className="text-[18px] font-[700] text-[#141627]">
          Places visited
        </h2>
        {data.visited.length === 0 ? (
          <p className="mt-2 text-[14px] text-[#7C7A8F]">
            No check-ins on this trip yet — the plan above still tells the story.
          </p>
        ) : (
          <ul className="mt-3 flex flex-col gap-3">
            {data.visited.map((stop, index) => (
              <li
                key={`${stop.stopTitle}-${index}`}
                className="flex gap-3 rounded-[12px] border border-[#ECF2EF] bg-[#F9FBFC] p-3"
              >
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-[#2F7D32]" />
                <div className="flex flex-col gap-1">
                  <p className="text-[14.5px] font-[600] text-[#2E2C48]">
                    {stop.stopTitle}
                  </p>
                  <p className="text-[12.5px] text-[#7F7E83]">
                    Day {stop.day} · {stop.checkedInAtLabel}
                  </p>
                  {stop.note && (
                    <p className="text-[13.5px] text-[#5C5A70]">{stop.note}</p>
                  )}
                  {stop.photoUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={stop.photoUrl}
                      alt={stop.stopTitle}
                      className="mt-1 h-[110px] w-[150px] rounded-[10px] object-cover"
                    />
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-[18px] border border-[#ECF2EF] bg-white p-5">
        <h2 className="text-[18px] font-[700] text-[#141627]">
          Journal & photos
        </h2>
        {data.journal.length === 0 ? (
          <p className="mt-2 text-[14px] text-[#7C7A8F]">
            No journal entries this time. Add a few memories on your next trip —
            the recap gets even better.
          </p>
        ) : (
          <ul className="mt-3 flex flex-col gap-4">
            {data.journal.map((entry, index) => (
              <li
                key={`${entry.createdLabel}-${index}`}
                className="rounded-[12px] border border-[#ECF2EF] bg-[#F9FBFC] p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[#E8F1FE] px-3 py-1 text-[12.5px] font-[600] text-[#256FF1]">
                    {entry.day != null ? `Day ${entry.day}` : "Memory"}
                  </span>
                  <span className="text-[12.5px] text-[#A5A3B2]">
                    {entry.createdLabel}
                  </span>
                </div>

                {entry.note && (
                  <p className="mt-3 text-[14.5px] leading-[24px] text-[#2E2C48]">
                    {entry.note}
                  </p>
                )}

                {entry.photos.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {entry.photos.map((photo) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={photo}
                        src={photo}
                        alt="Journal photo"
                        className="h-[110px] w-[110px] rounded-[10px] object-cover"
                      />
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="flex items-center justify-center gap-2 px-2 text-[12.5px] text-[#A5A3B2]">
        <Camera className="size-3.5" />
        Recap assembled automatically from the plan, check-ins and journal.
      </p>
    </div>
  );
}
