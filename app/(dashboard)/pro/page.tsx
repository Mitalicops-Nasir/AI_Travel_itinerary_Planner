import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { getMembership } from "@/features/membership/actions";
import { PlanCard } from "@/features/membership/components/PlanCard";
import {
  ManageBillingButton,
  UpgradeButton,
} from "@/features/membership/components/UpgradeModal";
import {
  FREE_GROUP_MEMBER_LIMIT,
  FREE_TRIP_LIMIT_PER_MONTH,
} from "@/features/membership/types";

export const dynamic = "force-dynamic";

async function proPrice(): Promise<string> {
  const priceId = process.env.STRIPE_PRO_PRICE_ID;

  if (!priceId) return "Coming soon";

  try {
    const { stripe } = await import("@/lib/stripe");
    const price = await stripe.prices.retrieve(priceId);

    if (typeof price.unit_amount === "number") {
      const amount = price.unit_amount / 100;
      return `$${amount % 1 === 0 ? amount : amount.toFixed(2)}`;
    }
  } catch (error) {
    console.log("Could not fetch Pro price:", error);
  }

  return "At checkout";
}

export default async function ProPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const [user, params] = await Promise.all([currentUser(), searchParams]);

  if (!user?.id) {
    redirect("/auth/login?callbackUrl=/pro");
  }

  const [membership, price] = await Promise.all([
    getMembership(),
    proPrice(),
  ]);

  const membershipView = membership.success ? membership.membership : null;
  const quota = membership.success ? membership.quota : null;

  const userIsPro = membershipView?.tier === "PRO";
  const periodEnd = membershipView?.currentPeriodEnd
    ? new Date(membershipView.currentPeriodEnd).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  const quotaPercent =
    quota?.limit && quota.limit > 0
      ? Math.min(100, Math.round((quota.used / quota.limit) * 100))
      : 0;

  return (
    <section className="min-h-dvh bg-[#F9FBFC] px-[50px] pt-[30px] pb-[50px] max-[768px]:px-[15px]">
      <div className="mx-auto flex w-full max-w-[900px] flex-col gap-6">
        <div>
          <h1 className="text-[28px] font-[700] text-[#141627]">
            Plans & billing
          </h1>
          <p className="mt-1 text-[14.5px] text-[#7F7E83]">
            Free keeps you planning; Pro removes every limit. Cancel anytime —
            your trips are never locked.
          </p>
        </div>

        {params.checkout === "success" && (
          <div className="rounded-[14px] border border-[#C9E7CB] bg-[#F3FBF4] px-4 py-3 text-[14px] text-[#2F7D32]">
            Welcome to Pro! If the badge has not updated yet, give it a minute
            and refresh — billing syncs as soon as Stripe confirms.
          </div>
        )}

        {params.checkout === "canceled" && (
          <div className="rounded-[14px] border border-[#ECF2EF] bg-white px-4 py-3 text-[14px] text-[#5C5A70]">
            No charge was made — you are still on the free plan.
          </div>
        )}

        {userIsPro ? (
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-[18px] border border-[#256FF1] bg-white p-5">
            <div>
              <p className="text-[17px] font-[700] text-[#141627]">
                You are on Pro
              </p>
              <p className="mt-1 text-[13.5px] text-[#5C5A70]">
                Unlimited trips and unlimited travel buddies.
                {periodEnd ? ` Renews on ${periodEnd}.` : ""}
              </p>
            </div>
            <ManageBillingButton />
          </div>
        ) : (
          <div className="flex flex-col gap-3 rounded-[18px] border border-[#ECF2EF] bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[17px] font-[700] text-[#141627]">
                This month
              </p>
              <p className="text-[13.5px] text-[#5C5A70]">
                {quota
                  ? `${quota.used} of ${quota.limit} free generations used`
                  : "Usage unavailable right now"}
              </p>
            </div>

            <div className="h-[8px] w-full overflow-hidden rounded-full bg-[#ECF2EF]">
              <div
                className="h-full rounded-full bg-[#256FF1]"
                style={{ width: `${quotaPercent}%` }}
              />
            </div>

            <p className="text-[12.5px] text-[#7F7E83]">
              Free counts reset on the 1st of every month. Existing trips are
              always accessible.
            </p>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <PlanCard
            name="Free"
            price="$0"
            period="forever"
            tagline="Everything you need for a first adventure."
            features={[
              `${FREE_TRIP_LIMIT_PER_MONTH} AI trip generations per month`,
              `Up to ${FREE_GROUP_MEMBER_LIMIT} travel buddies per trip`,
              "Check-ins, journal, badges and sharing",
              "Bookable offers and import tools",
            ]}
            action={
              userIsPro ? (
                <span className="text-[13.5px] text-[#7F7E83]">
                  Your previous plan — still fully yours
                </span>
              ) : (
                <span className="inline-flex h-[44px] items-center rounded-full bg-[#F4F8FF] px-5 text-[14px] font-[500] text-[#256FF1]">
                  Your current plan
                </span>
              )
            }
          />

          <PlanCard
            name="Pro"
            price={price}
            period="month"
            tagline="For people who plan trips like a hobby."
            highlighted
            features={[
              "Unlimited AI trip generations",
              "Unlimited group members",
              "Itinerary export options",
              "Every new Pro feature as it ships",
            ]}
            action={
              userIsPro ? (
                <span className="inline-flex h-[44px] items-center rounded-full bg-[#E8F1FE] px-5 text-[14px] font-[600] text-[#256FF1]">
                  Active — thank you!
                </span>
              ) : (
                <UpgradeButton quota={quota} />
              )
            }
          />
        </div>

        <p className="text-center text-[12.5px] text-[#A5A3B2]">
          Payments are handled securely by Stripe. Cancel anytime from Manage
          billing — Pro stays active until the end of the paid period.
        </p>
      </div>
    </section>
  );
}
