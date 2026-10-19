"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Check, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createMembershipCheckout, openBillingPortal } from "../actions";
import type { QuotaView } from "../types";

const perks = [
  "Unlimited AI trip generations",
  "Unlimited group members on shared trips",
  "Itinerary export options",
  "Every future Pro goodie — no re-buying",
];

export function UpgradeModal({
  open,
  onOpenChange,
  reason = "default",
  quota = null,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reason?: "limit" | "group" | "default";
  quota?: QuotaView | null;
}) {
  const [isPending, startTransition] = useTransition();

  const intro =
    reason === "limit"
      ? "You have used all of this month's free trip generations. Existing trips stay open — upgrade to keep planning."
      : reason === "group"
        ? "Your group has reached the free member limit. Upgrade to Pro for unlimited travel buddies."
        : "Plan as much as you want, with your whole crew.";

  function upgrade() {
    startTransition(async () => {
      const result = await createMembershipCheckout();

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      window.location.href = result.url;
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-[16px] border-[#ECF2EF] sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[20px] font-[700] text-[#141627]">
            <Sparkles className="size-5 text-[#256FF1]" />
            Go Pro
          </DialogTitle>
          <DialogDescription className="text-[14px] text-[#7F7E83]">
            {intro}
          </DialogDescription>
        </DialogHeader>

        {quota?.limit != null && (
          <div className="rounded-[12px] border border-[#E3F1FF] bg-[#F4F8FF] px-4 py-3 text-[13.5px] text-[#2E2C48]">
            This month: <span className="font-[600]">{quota.used}</span> of{" "}
            {quota.limit} free generations used.
          </div>
        )}

        <ul className="flex flex-col gap-2">
          {perks.map((perk) => (
            <li
              key={perk}
              className="flex items-center gap-2.5 text-[14px] text-[#2E2C48]"
            >
              <span className="flex size-5 items-center justify-center rounded-full bg-[#E8F1FE]">
                <Check className="size-3 text-[#256FF1]" />
              </span>
              {perk}
            </li>
          ))}
        </ul>

        <DialogFooter>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-[40px] cursor-pointer rounded-full border border-[#ECF2EF] px-5 text-[14px] text-[#2E2C48] transition-colors hover:bg-[#F3F6F8]"
          >
            Maybe later
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={upgrade}
            className="h-[40px] cursor-pointer rounded-full bg-[#256FF1] px-5 text-[14px] font-[500] text-white transition-colors hover:bg-[#1D5AD9] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Opening checkout..." : "Upgrade to Pro"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function UpgradeButton({
  reason = "default",
  quota = null,
  label = "Upgrade to Pro",
}: {
  reason?: "limit" | "group" | "default";
  quota?: QuotaView | null;
  label?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="h-[44px] cursor-pointer rounded-full bg-[#256FF1] px-6 text-[14px] font-[500] text-white transition-colors hover:bg-[#1D5AD9]"
      >
        {label}
      </button>
      <UpgradeModal
        open={open}
        onOpenChange={setOpen}
        reason={reason}
        quota={quota}
      />
    </>
  );
}

export function ManageBillingButton() {
  const [isPending, startTransition] = useTransition();

  function openPortal() {
    startTransition(async () => {
      const result = await openBillingPortal();

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      window.location.href = result.url;
    });
  }

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={openPortal}
      className="h-[44px] cursor-pointer rounded-full border border-[#ECF2EF] bg-white px-5 text-[14px] font-[500] text-[#2E2C48] transition-colors hover:bg-[#F3F6F8] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isPending ? "Opening..." : "Manage billing"}
    </button>
  );
}
