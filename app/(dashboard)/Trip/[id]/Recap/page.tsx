import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { db } from "@/data/db";
import { getTripAccess } from "@/lib/trip-access";
import { buildRecap, toRecapView } from "@/features/trip-journal/lib";
import { RecapView } from "@/features/trip-journal/components/RecapView";
import { ShareControls } from "@/features/trip-sharing/components/ShareControls";
import { getShareState } from "@/features/trip-sharing/actions";

export const dynamic = "force-dynamic";

export default async function TripRecapPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await currentUser();

  if (!user?.id) {
    redirect(`/auth/login?callbackUrl=/Trip/${id}/Recap`);
  }

  const access = await getTripAccess(db, id, user.id);

  if (!access) {
    notFound();
  }

  const recap = await buildRecap(id);

  if (!recap) {
    notFound();
  }

  const shareState = await getShareState(id);

  const share = shareState.success
    ? {
        state: shareState.state,
        joinEnabled: shareState.joinEnabled,
        url: shareState.url,
      }
    : null;

  return (
    <section className="min-h-dvh bg-[#F9FBFC] px-[50px] pt-[30px] pb-[50px] max-[768px]:px-[15px]">
      <div className="mx-auto flex w-full max-w-[900px] flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href={`/Trip/${id}/Trip-Details`}
            className="text-[14px] font-[500] text-[#256FF1] hover:underline"
          >
            Back to trip
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-[12.5px] text-[#7F7E83] max-[600px]:hidden">
              Private — only you and trip members can see this.
            </span>
            {share && (
              <ShareControls
                tripId={id}
                state={share.state}
                joinEnabled={share.joinEnabled}
                url={share.url}
              />
            )}
          </div>
        </div>

        {share?.state === "ACTIVE" && share.url && (
          <Link
            href={`${share.url}/recap`}
            className="w-fit rounded-full bg-[#E8F1FE] px-4 py-2 text-[13px] font-[500] text-[#256FF1] hover:bg-[#DCEAFD]"
          >
            View the public version of this recap
          </Link>
        )}

        <RecapView data={toRecapView(recap)} />
      </div>
    </section>
  );
}
