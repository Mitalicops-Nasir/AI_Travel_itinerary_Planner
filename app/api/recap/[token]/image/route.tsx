import { ImageResponse } from "next/og";
import { getPublicTrip } from "@/features/trip-sharing/lib";
import { dateRangeLabel } from "@/features/trip-journal/lib";

export const dynamic = "force-dynamic";

function Stat({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "4px",
        padding: "16px 28px",
        borderRadius: "16px",
        backgroundColor: "#FFFFFF",
        border: "1px solid #ECF2EF",
      }}
    >
      <span style={{ fontSize: "32px", fontWeight: 800, color: "#141627" }}>
        {value}
      </span>
      <span style={{ fontSize: "16px", color: "#7F7E83" }}>{label}</span>
    </div>
  );
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const view = await getPublicTrip(token);

  if (view.state !== "active" || !view.trip || view.trip.phase === "upcoming") {
    return new Response("Recap image not available", { status: 404 });
  }

  const trip = view.trip;

  const photos =
    view.journal.reduce((total, entry) => total + entry.photos.length, 0) +
    view.visited.filter((stop) => stop.photoUrl).length;

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#F9FBFC",
          padding: "56px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div
            style={{
              display: "flex",
              width: "46px",
              height: "46px",
              borderRadius: "999px",
              backgroundColor: "#256FF1",
              color: "#FFFFFF",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
              fontWeight: 700,
            }}
          >
            AI
          </div>
          <span style={{ fontSize: "22px", fontWeight: 600, color: "#141627" }}>
            AI Travel Planner
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <span style={{ fontSize: "18px", color: "#5C5A70" }}>
            {`${trip.city}, ${trip.country}`}
          </span>
          <span
            style={{
              fontSize: "56px",
              fontWeight: 800,
              color: "#141627",
              lineHeight: 1.1,
            }}
          >
            {trip.title}
          </span>
          <span style={{ fontSize: "20px", color: "#7F7E83" }}>
            {`${dateRangeLabel(trip.startDate, trip.endDate)} · ${
              trip.phase === "completed" ? "Trip recap" : "Live recap"
            }`}
          </span>
        </div>

        <div style={{ display: "flex", gap: "16px" }}>
          <Stat value={view.route.length} label="days" />
          <Stat value={view.visited.length} label="places visited" />
          <Stat value={photos} label="photos" />
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: { "Cache-Control": "no-store" },
    }
  );
}
