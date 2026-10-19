import { NextResponse } from "next/server";
import { getPublicTrip } from "@/features/trip-sharing/lib";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const payload = await getPublicTrip(token);

  return NextResponse.json(payload, {
    // Follow-along data is live — never cache it
    headers: { "Cache-Control": "no-store" },
  });
}