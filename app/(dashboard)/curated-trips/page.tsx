import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { listCuratedTrips } from "@/features/curated-trips/actions";
import { CuratedTripAdminTable } from "@/features/curated-trips/components/CuratedTripAdminTable";

export const dynamic = "force-dynamic";

export default async function CuratedTripsPage() {
  const user = await currentUser();

  if (!user?.id) {
    redirect("/auth/login?callbackUrl=/curated-trips");
  }

  if (user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const result = await listCuratedTrips();

  return (
    <section className="min-h-dvh bg-[#F9FBFC] px-[50px] pt-[30px] pb-[50px] max-[768px]:px-[15px]">
      <div className="mx-auto flex w-full max-w-[1000px] flex-col gap-5">
        <div>
          <h1 className="text-[28px] font-[700] text-[#141627]">
            Curated trips
          </h1>
          <p className="mt-1 text-[14.5px] text-[#7F7E83]">
            Mark any trip as premium, set its price, and publish it for
            travelers. Unpublished premium trips stay hidden.
          </p>
        </div>

        {result.success ? (
          <CuratedTripAdminTable trips={result.trips} />
        ) : (
          <p className="text-[14px] text-[#5C5A70]">{result.error}</p>
        )}
      </div>
    </section>
  );
}
