import { getPublicTrip } from "@/features/trip-sharing/lib";
import { publicRecapView } from "@/features/trip-journal/lib";
import { RecapView } from "@/features/trip-journal/components/RecapView";
import { RecapShareActions } from "@/features/trip-journal/components/RecapShareActions";

export const dynamic = "force-dynamic";

function StateNotice({ title, body }: { title: string; body: string }) {
  return (
    <div className="min-h-dvh w-full bg-[#F9FBFC] px-4 py-10">
      <div className="mx-auto flex w-full max-w-[560px] flex-col items-center gap-3 rounded-[18px] border border-[#ECF2EF] bg-white p-8 text-center">
        <h1 className="text-[22px] font-[700] text-[#141627]">{title}</h1>
        <p className="text-[14.5px] text-[#5C5A70]">{body}</p>
      </div>
    </div>
  );
}

export default async function SharedRecapPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const data = await getPublicTrip(token);

  if (data.state === "paused") {
    return (
      <StateNotice
        title="Sharing is paused"
        body="The traveler paused this trip for now. Check back later."
      />
    );
  }

  if (data.state !== "active" || !data.trip) {
    return (
      <StateNotice
        title="This link is no longer available"
        body="The share link was revoked or never existed. Ask the traveler for a fresh link."
      />
    );
  }

  if (data.trip.phase === "upcoming") {
    return (
      <StateNotice
        title="The trip hasn't started yet"
        body="The recap fills up as memories are added. Check back once the trip is underway."
      />
    );
  }

  const recap = publicRecapView(data);

  if (!recap) {
    return (
      <StateNotice
        title="This link is no longer available"
        body="The share link was revoked or never existed. Ask the traveler for a fresh link."
      />
    );
  }

  return (
    <div className="min-h-dvh w-full bg-[#F9FBFC] px-4 py-6">
      <div className="mx-auto flex w-full max-w-[900px] flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-[22px] font-[700] text-[#141627]">
              {data.trip.phase === "completed" ? "Trip recap" : "Live recap"}
            </h1>
            <p className="text-[13px] text-[#7F7E83]">
              By {data.traveler?.firstName ?? "a traveller"} — no account needed.
            </p>
          </div>

          <RecapShareActions imageUrl={`/api/recap/${token}/image`} />
        </div>

        <RecapView data={recap} />

        <p className="px-2 text-center text-[12.5px] text-[#A5A3B2]">
          {data.trip.phase === "completed"
            ? "This trip is complete. Thanks for following along."
            : "Updates automatically as new memories are added."}
        </p>
      </div>
    </div>
  );
}
