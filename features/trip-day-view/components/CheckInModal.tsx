"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function CheckInModal({
  open,
  onOpenChange,
  stopTitle,
  dayNumber,
  onConfirm,
  isPending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stopTitle: string;
  dayNumber: number;
  onConfirm: (note: string) => void;
  isPending: boolean;
}) {
  const [note, setNote] = useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-[16px] border-[#ECF2EF] sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle className="text-[20px] font-[700] text-[#141627]">
            Check in
          </DialogTitle>
          <DialogDescription className="text-[14px] text-[#7F7E83]">
            Day {dayNumber} · {stopTitle}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-1.5">
          <label
            className="text-[12px] font-semibold uppercase tracking-wide text-[#7C7A8F]"
            htmlFor="checkin-note"
          >
            Add a note (optional)
          </label>
          <textarea
            id="checkin-note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={3}
            placeholder="e.g. the museum was packed, go early"
            className="w-full resize-none rounded-[8px] border border-[#ECF2EF] bg-white px-3 py-2 text-[14.5px] text-[#2E2C48] outline-none transition-colors focus:border-[#256FF1]"
          />
        </div>

        <DialogFooter className="gap-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-[42px] cursor-pointer rounded-full border border-[#ECF2EF] px-5 text-[14.5px] text-[#2E2C48] transition-colors hover:bg-[#F3F6F8]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(note)}
            disabled={isPending}
            className="h-[42px] cursor-pointer rounded-full bg-[#256FF1] px-6 text-[14.5px] font-[500] text-white transition-colors hover:bg-[#1D5AD9] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Saving…" : "Yes, I visited"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}