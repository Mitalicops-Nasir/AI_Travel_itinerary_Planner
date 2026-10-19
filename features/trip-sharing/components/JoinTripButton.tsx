"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UpgradeModal } from "@/features/membership/components/UpgradeModal";
import { joinTrip } from "../actions";

export function JoinTripButton({ token }: { token: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [joined, setJoined] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  function handleJoin() {
    startTransition(async () => {
      const result = await joinTrip(token);

      if (!result.success) {
        if ("limitReached" in result && result.limitReached) {
          setUpgradeOpen(true);
          return;
        }

        toast.error(result.error);
        return;
      }

      setJoined(true);
      toast.success("You joined this trip.");
      router.push(`/Trip/${result.tripId}/Trip-Details`);
    });
  }

  if (joined) return null;

  return (
    <>
      <button
        type="button"
        onClick={handleJoin}
        disabled={isPending}
        className="mt-4 flex h-[44px] w-full cursor-pointer items-center justify-center rounded-full bg-[#256FF1] text-[15px] font-[500] text-white transition-colors hover:bg-[#1D5AD9] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Joining…" : "Join this trip"}
      </button>

      <UpgradeModal
        open={upgradeOpen}
        onOpenChange={setUpgradeOpen}
        reason="group"
      />
    </>
  );
}