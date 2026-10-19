"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { suggestStop } from "../actions";

export function SuggestStopModal({
  open,
  onOpenChange,
  tripId,
  maxDay,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tripId: string;
  maxDay: number;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [day, setDay] = useState("1");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");

  function submit() {
    startTransition(async () => {
      const result = await suggestStop({
        tripId,
        day: Number(day),
        title,
        notes: notes.trim() === "" ? undefined : notes,
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Idea added — the group can vote now.");
      setTitle("");
      setNotes("");
      setDay("1");
      onOpenChange(false);
      router.refresh();
    });
  }

  const days = Array.from({ length: Math.max(maxDay, 1) }, (_, i) => i + 1);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-[16px] border-[#ECF2EF] sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle className="text-[20px] font-[700] text-[#141627]">
            Suggest a stop
          </DialogTitle>
          <DialogDescription className="text-[14px] text-[#7F7E83]">
            Share an idea for a day. The group votes, the owner approves.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1.5 text-[13.5px] font-[500] text-[#2E2C48]">
            Which day?
            <select
              value={day}
              onChange={(event) => setDay(event.target.value)}
              className="h-[42px] cursor-pointer rounded-[10px] border border-[#ECF2EF] bg-white px-3 text-[14px] text-[#141627] outline-none focus:border-[#256FF1]"
            >
              {days.map((value) => (
                <option key={value} value={String(value)}>
                  Day {value}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5 text-[13.5px] font-[500] text-[#2E2C48]">
            Your idea
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Sunset kayaking at the pier"
              maxLength={120}
              className="h-[42px] rounded-[10px] border border-[#ECF2EF] px-3 text-[14px] text-[#141627] outline-none focus:border-[#256FF1]"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-[13.5px] font-[500] text-[#2E2C48]">
            Notes (optional)
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Why is it worth it? Best time to go?"
              maxLength={500}
              rows={3}
              className="resize-none rounded-[10px] border border-[#ECF2EF] p-3 text-[14px] text-[#141627] outline-none focus:border-[#256FF1]"
            />
          </label>
        </div>

        <DialogFooter>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-[40px] cursor-pointer rounded-full border border-[#ECF2EF] px-5 text-[14px] text-[#2E2C48] transition-colors hover:bg-[#F3F6F8]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={isPending || title.trim().length < 2}
            className="h-[40px] cursor-pointer rounded-full bg-[#256FF1] px-5 text-[14px] font-[500] text-white transition-colors hover:bg-[#1D5AD9] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Adding..." : "Add idea"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
