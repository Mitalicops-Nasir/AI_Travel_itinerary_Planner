import { currentUser } from "@/lib/auth";
import { getPublicTrip } from "@/features/trip-sharing/lib";
import { PublicTripPage } from "@/features/trip-sharing/components/PublicTripPage";

export const dynamic = "force-dynamic";

export default async function SharedTripPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const [data, user] = await Promise.all([getPublicTrip(token), currentUser()]);

  return (
    <div className="min-h-dvh w-full bg-[#F9FBFC] px-4 py-6">
      <PublicTripPage
        initialData={data}
        token={token}
        loggedIn={Boolean(user?.id)}
      />
    </div>
  );
}