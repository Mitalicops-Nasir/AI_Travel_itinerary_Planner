"use client";

import { useEffect, useState } from "react";
import { MapPin, CalendarDays, Users } from "lucide-react";
import type { PublicTripView } from "@/features/trip-sharing/types";
import { ShareFollowMap } from "./ShareFollowMap";
import { JoinTripButton } from "./JoinTripButton";

const POLL_INTERVAL_MS = 30_000;

export function PublicTripPage({
  initialData,
  token,
  loggedIn,
}: {
  initialData: PublicTripView;
  token: string;
  loggedIn: boolean;
}) {
  const [data, setData] = useState(initialData);

  // Poll every 30 s so family and friends see updates while travelling
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/public/trips/${token}`, {
          cache: "no-store",
        });

        if (!response.ok) return;

        const next = (await response.json()) as PublicTripView;
        setData((current) =>
          next.updatedAt === current.updatedAt ? current : next
        );
      } catch {
        // Offline or hiccup — keep showing what we already have
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [token]);

  if (data.state === "invalid" || data.state === "revoked") {
    return (
      <div className="mx-auto w-full max-w-[560px] rounded-[20px] bg-white p-8 text-center shadow-sm">
        <h1 className="text-[24px] font-[700] text-[#141627]">
          This link is no longer available
        </h1>
        <p className="mt-2 text-[15px] text-[#7F7E83]">
          The traveller turned sharing off. Ask them for a new link.
        </p>
      </div>
    );
  }

  if (data.state === "paused") {
    return (
      <div className="mx-auto w-full max-w-[560px] rounded-[20px] bg-white p-8 text-center shadow-sm">
        <h1 className="text-[24px] font-[700] text-[#141627]">
          Sharing is paused
        </h1>
        <p className="mt-2 text-[15px] text-[#7F7E83]">
          The traveller paused this trip for a moment. Check back soon.
        </p>
      </div>
    );
  }

  const trip = data.trip;
  if (!trip) return null;

  const visitedCount = data.visited.length;

  return (
    <div className="mx-auto flex w-full max-w-[760px] flex-col gap-4">
      <div className="overflow-hidden rounded-[20px] bg-white shadow-sm">
        {trip.coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={trip.coverImage}
            alt={trip.title}
            className="h-[220px] w-full object-cover"
          />
        )}

        <div className="p-5">
          <p className="text-[13px] font-semibold uppercase tracking-wide text-[#7C7A8F]">
            {data.traveler?.firstName ?? "A traveller"}&apos;s trip
          </p>
          <h1 className="mt-1 text-[24px] font-[700] text-[#141627]">
            {trip.title}
          </h1>

          <div className="mt-2 flex flex-wrap items-center gap-4 text-[14px] text-[#5C5A70]">
            <span className="flex items-center gap-1.5">
              <MapPin className="size-4" />
              {trip.city}, {trip.country}
            </span>
            {trip.startDate && trip.endDate && (
              <span className="flex items-center gap-1.5">
                <CalendarDays className="size-4" />
                {new Date(trip.startDate).toLocaleDateString("en-GB")} –{" "}
                {new Date(trip.endDate).toLocaleDateString("en-GB")}
              </span>
            )}
            {trip.phase === "active" && (
              <span className="flex items-center gap-1.5">
                <Users className="size-4" />
                {visitedCount} {visitedCount === 1 ? "stop" : "stops"} visited
              </span>
            )}
          </div>

          {trip.phase === "active" && loggedIn && (
            <JoinTripButton token={token} />
          )}
        </div>
      </div>

      {trip.phase === "upcoming" && (
        <div className="rounded-[16px] bg-white p-5 text-[15px] text-[#2E2C48] shadow-sm">
          The trip has not started yet. Check back when it does.
        </div>
      )}

      {trip.phase === "active" && (
        <>
          <ShareFollowMap route={data.route} visited={data.visited} />

          <div className="rounded-[20px] bg-white p-5 shadow-sm">
            <h2 className="text-[18px] font-[600] text-[#141627]">
              Where they have been
            </h2>

            {data.visited.length === 0 ? (
              <p className="mt-2 text-[14.5px] text-[#7F7E83]">
                Nothing checked in yet — the fun starts soon.
              </p>
            ) : (
              <ul className="mt-3 flex flex-col gap-2.5">
                {data.visited.map((stop) => (
                  <li
                    key={`${stop.stopKey}-${stop.checkedInAt}`}
                    className="rounded-[12px] border border-[#ECF2EF] bg-[#F9FBFC] px-3.5 py-3"
                  >
                    <p className="text-[11.5px] font-semibold uppercase tracking-wide text-[#7C7A8F]">
                      Day {stop.day}
                    </p>
                    <p className="mt-0.5 text-[14.5px] text-[#2E2C48]">
                      {stop.stopTitle}
                    </p>
                    {stop.note && (
                      <p className="mt-1 text-[13.5px] text-[#5C5A70]">
                        {stop.note}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {data.journal.length > 0 && (
            <div className="rounded-[20px] bg-white p-5 shadow-sm">
              <h2 className="text-[18px] font-[600] text-[#141627]">
                Trip journal
              </h2>
              <ul className="mt-3 flex flex-col gap-3">
                {data.journal.map((entry, index) => (
                  <li key={`${entry.createdAt}-${index}`} className="flex flex-col gap-2">
                    {entry.photos.length > 0 && (
                      <div className="flex gap-2 overflow-x-auto">
                        {entry.photos.map((photo) => (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            key={photo}
                            src={photo}
                            alt="Trip journal"
                            className="h-[110px] w-[110px] shrink-0 rounded-[10px] object-cover"
                          />
                        ))}
                      </div>
                    )}
                    {entry.note && (
                      <p className="text-[14.5px] text-[#2E2C48]">{entry.note}</p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {trip.phase === "completed" && (
        <a
          href={`/Trip/share/${token}/recap`}
          className="block rounded-[16px] bg-[#256FF1] p-5 text-center text-[15px] font-[500] text-white"
        >
          See the full trip recap
        </a>
      )}
    </div>
  );
}