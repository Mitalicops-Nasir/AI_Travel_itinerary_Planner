"use client";

import dynamic from "next/dynamic";

// Leaflet touches window/document at import time, so it must never be SSR'd
const TripMap = dynamic(
  () => import("@/components/TripDetails/TripMap").then((mod) => mod.TripMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[300px] w-full rounded-[16px] bg-[#ECF2EF]" />
    ),
  }
);

export function ShareFollowMap({
  route,
  visited,
}: {
  route: { day: number; location: string; lat: number; lng: number }[];
  visited: { stopKey: string; stopTitle: string }[];
}) {
  if (route.length === 0) return null;

  const averageLat =
    route.reduce((sum, stop) => sum + stop.lat, 0) / route.length;
  const averageLng =
    route.reduce((sum, stop) => sum + stop.lng, 0) / route.length;

  return (
    <div className="rounded-[20px] bg-white p-4 shadow-sm">
      <TripMap
        coordinates={[averageLat, averageLng]}
        city={route[0]?.location ?? "Trip route"}
      />
      {visited.length > 0 && (
        <p className="mt-2 text-[13px] text-[#7F7E83]">
          Showing the trip route with {visited.length} visited{" "}
          {visited.length === 1 ? "stop" : "stops"}.
        </p>
      )}
    </div>
  );
}