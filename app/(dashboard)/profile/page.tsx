import { redirect } from "next/navigation";
import { requireUser } from "@/lib/guards";
import { db } from "@/data/db";
import { getTravelProfile } from "@/features/travel-memory/actions";
import { TravelTasteCard } from "@/features/travel-memory/components/TravelTasteCard";
import { VisitedDestinationsList } from "@/features/travel-memory/components/VisitedDestinationsList";
import { BadgeShelf } from "@/features/trip-journal/components/BadgeShelf";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const { user } = await requireUser();

  if (!user) {
    redirect("/auth/login");
  }

  const [result, badges] = await Promise.all([
    getTravelProfile(),
    db.badge.findMany({
      where: { userId: user.id },
      orderBy: { earnedAt: "desc" },
      select: { id: true, type: true, earnedAt: true },
    }),
  ]);

  return (
    <div className="w-full p-[2%]">
      <h1 className="text-[28px] font-[700] text-[#141627]">
        Your travel profile
      </h1>
      <p className="mt-1 max-w-[720px] text-[16px] text-[#7F7E83]">
        Save your travel taste once and every new trip plan is personalized for
        you. Everything here is optional — trips work great without it.
      </p>

      <div className="mt-6 grid max-w-[1100px] grid-cols-1 gap-5 lg:grid-cols-2">
        <TravelTasteCard profile={result.success ? result.profile : null} />
        <VisitedDestinationsList
          visited={result.success ? result.visited : []}
        />
      </div>

      <div className="max-w-[1100px]">
        <BadgeShelf
          badges={badges.map((badge) => ({
            id: badge.id,
            type: badge.type,
            earnedAt: badge.earnedAt.toISOString(),
          }))}
        />
      </div>
    </div>
  );
}
