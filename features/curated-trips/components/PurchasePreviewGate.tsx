"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, Lock } from "lucide-react";
import { createCuratedCheckoutSession } from "../actions";

export function PurchasePreviewGate({
  tripId,
  priceInCents,
  isLoggedIn,
}: {
  tripId: string;
  priceInCents: number | null;
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const price =
    priceInCents != null
      ? `$${priceInCents % 100 === 0 ? priceInCents / 100 : (priceInCents / 100).toFixed(2)}`
      : null;

  const unlocks = [
    "The full day-by-day itinerary",
    "Bookable offers for every day",
    "Journal, check-ins and group tools",
    "A personal, editable copy in AI Trips",
  ];

  function purchase() {
    if (!isLoggedIn) {
      toast.error("Log in to buy this curated trip.");
      router.push(
        `/auth/login?callbackUrl=${encodeURIComponent(`/Trip/${tripId}/Trip-Details`)}`
      );
      return;
    }

    startTransition(async () => {
      const result = await createCuratedCheckoutSession(tripId);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      window.location.href = result.url;
    });
  }

  return (
    <div className="flex flex-col gap-4 rounded-[16px] border border-[#E3F1FF] bg-white p-6">
      <div className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#F4F8FF]">
          <Lock className="size-5 text-[#256FF1]" />
        </span>
        <div>
          <p className="text-[16px] font-[600] text-[#1F1F36]">
            This is a premium curated trip
          </p>
          <p className="text-[13.5px] text-[#5C5A70]">
            {price
              ? `Unlock the full plan for a one-time ${price}.`
              : "The full plan unlocks here once the curator sets a price."}
          </p>
        </div>
      </div>

      <ul className="grid gap-2 sm:grid-cols-2">
        {unlocks.map((item) => (
          <li
            key={item}
            className="flex items-center gap-2 text-[13.5px] text-[#2E2C48]"
          >
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#E8F1FE]">
              <Check className="size-3 text-[#256FF1]" />
            </span>
            {item}
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={purchase}
        disabled={isPending || priceInCents == null}
        className="h-[48px] w-full cursor-pointer rounded-[10px] bg-[#256FF1] px-4 text-[15px] font-[500] text-white transition-colors hover:bg-[#1D5AD9] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending
          ? "Opening checkout..."
          : price
            ? `Unlock full plan — ${price}`
            : "Not on sale yet"}
      </button>

      <p className="text-[12.5px] text-[#A5A3B2]">
        One-time payment. After purchase you get your own editable copy — the
        original stays untouched.
      </p>
    </div>
  );
}
