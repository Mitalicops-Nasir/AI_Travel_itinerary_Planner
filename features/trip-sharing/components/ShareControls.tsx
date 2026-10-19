"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, Copy, Link2, Pause, RefreshCw, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  enableShare,
  pauseShare,
  regenerateShare,
  revokeShare,
} from "../actions";

export function ShareControls({
  tripId,
  state,
  joinEnabled,
  url,
}: {
  tripId: string;
  state: "ACTIVE" | "PAUSED" | "REVOKED" | null;
  joinEnabled: boolean;
  url: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const fullUrl = url ? `${typeof window !== "undefined" ? window.location.origin : ""}${url}` : null;

  function copyLink() {
    if (!fullUrl) return;
    navigator.clipboard.writeText(fullUrl);
    toast.success("Link copied — send it to your travel crew.");
  }

  function run(action: () => Promise<{ success: boolean; error?: string }>, successMessage: string) {
    startTransition(async () => {
      const result = await action();

      if (!result.success) {
        toast.error(result.error ?? "Something went wrong.");
        return;
      }

      toast.success(successMessage);
      router.refresh();
    });
  }

  const stateLabel =
    state === "ACTIVE"
      ? "Sharing is on"
      : state === "PAUSED"
        ? "Sharing is paused"
        : state === "REVOKED"
          ? "Sharing is off"
          : "Sharing is off";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-[40px] w-fit cursor-pointer items-center gap-2 rounded-full bg-white px-4 text-[13.5px] font-[500] text-[#2E2C48] transition-colors hover:bg-[#E8F1FE]"
      >
        <Link2 className="size-4" />
        Share trip
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-[16px] border-[#ECF2EF] sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-[20px] font-[700] text-[#141627]">
              Share this trip
            </DialogTitle>
            <DialogDescription className="text-[14px] text-[#7F7E83]">
              Anyone with the link can follow along. No account needed.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between rounded-[12px] border border-[#ECF2EF] bg-[#F9FBFC] px-3.5 py-3">
              <div className="flex items-center gap-2">
                {state === "ACTIVE" ? (
                  <Check className="size-4 text-[#2F7D32]" />
                ) : (
                  <Pause className="size-4 text-[#7F7E83]" />
                )}
                <span className="text-[14px] text-[#2E2C48]">{stateLabel}</span>
              </div>

              {state === "ACTIVE" && fullUrl && (
                <button
                  type="button"
                  onClick={copyLink}
                  className="flex h-[34px] cursor-pointer items-center gap-1.5 rounded-full bg-white px-3 text-[13px] text-[#2E2C48] transition-colors hover:bg-[#E8F1FE]"
                >
                  <Copy className="size-3.5" />
                  Copy link
                </button>
              )}
            </div>

            {state === "ACTIVE" && fullUrl && (
              <p className="text-[12.5px] break-all text-[#7F7E83]">{fullUrl}</p>
            )}

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={isPending}
                onClick={() =>
                  run(
                    () => enableShare(tripId, { joinEnabled }),
                    "Sharing is on — your link is live."
                  )
                }
                className="h-[40px] cursor-pointer rounded-full bg-[#256FF1] px-4 text-[13.5px] font-[500] text-white transition-colors hover:bg-[#1D5AD9] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {state === "ACTIVE" ? "Keep sharing" : "Start sharing"}
              </button>

              {state === "ACTIVE" && (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => run(() => pauseShare(tripId), "Sharing paused.")}
                  className="h-[40px] cursor-pointer rounded-full border border-[#ECF2EF] px-4 text-[13.5px] text-[#2E2C48] transition-colors hover:bg-[#F3F6F8] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Pause
                </button>
              )}

              <button
                type="button"
                disabled={isPending}
                onClick={() =>
                  run(() => regenerateShare(tripId), "New link created. The old one is dead.")
                }
                className="flex h-[40px] cursor-pointer items-center gap-1.5 rounded-full border border-[#ECF2EF] px-4 text-[13.5px] text-[#2E2C48] transition-colors hover:bg-[#F3F6F8] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw className="size-3.5" />
                New link
              </button>

              {state !== "REVOKED" && (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => run(() => revokeShare(tripId), "Sharing stopped.")}
                  className="flex h-[40px] cursor-pointer items-center gap-1.5 rounded-full border border-[#ECF2EF] px-4 text-[13.5px] text-[#E23636] transition-colors hover:bg-[#FDECEC] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Trash2 className="size-3.5" />
                  Stop
                </button>
              )}
            </div>
          </div>

          <DialogFooter>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="h-[40px] cursor-pointer rounded-full border border-[#ECF2EF] px-5 text-[14px] text-[#2E2C48] transition-colors hover:bg-[#F3F6F8]"
            >
              Close
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}