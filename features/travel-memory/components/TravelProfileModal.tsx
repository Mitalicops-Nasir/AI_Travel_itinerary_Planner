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
import { interests as interestOptions } from "@/constants";
import { upsertTravelProfile } from "../actions";
import type { TravelProfileView } from "../types";

const paceOptions = ["Relaxed", "Balanced", "Packed"];
const budgetOptions = ["Shoestring", "Mid-range", "Comfort", "Luxury"];

const inputClass =
  "w-full rounded-[8px] border border-[#ECF2EF] bg-white px-3 py-2 text-[14.5px] text-[#2E2C48] outline-none transition-colors focus:border-[#256FF1]";

const labelClass =
  "text-[12px] font-semibold uppercase tracking-wide text-[#7C7A8F]";

export function TravelProfileModal({
  open,
  onOpenChange,
  profile,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: TravelProfileView | null;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto rounded-[16px] border-[#ECF2EF] sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="text-[20px] font-[700] text-[#141627]">
            Your travel taste
          </DialogTitle>
          <DialogDescription className="text-[14px] text-[#7F7E83]">
            Save this once and every new trip plan is personalized for you.
            Everything here is optional.
          </DialogDescription>
        </DialogHeader>

        {/* Mounted only while open, so the form always starts from the saved values */}
        {open && (
          <TravelProfileForm
            profile={profile}
            onDone={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function TravelProfileForm({
  profile,
  onDone,
}: {
  profile: TravelProfileView | null;
  onDone: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [pace, setPace] = useState(profile?.pace ?? "");
  const [budget, setBudget] = useState(profile?.budgetStyle ?? "");
  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    profile?.interests ?? []
  );
  const [dietary, setDietary] = useState(profile?.dietaryNeeds ?? "");
  const [accessibility, setAccessibility] = useState(
    profile?.accessibilityNeeds ?? ""
  );
  const [notes, setNotes] = useState(profile?.notes ?? "");

  function toggleInterest(tag: string) {
    setSelectedInterests((current) =>
      current.includes(tag)
        ? current.filter((item) => item !== tag)
        : [...current, tag]
    );
  }

  function handleSave() {
    startTransition(async () => {
      const result = await upsertTravelProfile({
        pace: pace || undefined,
        budgetStyle: budget || undefined,
        interests: selectedInterests,
        dietaryNeeds: dietary || undefined,
        accessibilityNeeds: accessibility || undefined,
        notes: notes || undefined,
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Travel profile saved — future plans will use it.");
      onDone();
      router.refresh();
    });
  }

  return (
    <>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className={labelClass} htmlFor="profile-pace">
                Trip pace
              </label>
              <select
                id="profile-pace"
                value={pace}
                onChange={(event) => setPace(event.target.value)}
                className={inputClass}
              >
                <option value="">No preference</option>
                {paceOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelClass} htmlFor="profile-budget">
                Budget style
              </label>
              <select
                id="profile-budget"
                value={budget}
                onChange={(event) => setBudget(event.target.value)}
                className={inputClass}
              >
                <option value="">No preference</option>
                {budgetOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className={labelClass}>Things you love</span>
            <div className="flex flex-wrap gap-2">
              {interestOptions.map((tag) => {
                const selected = selectedInterests.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleInterest(tag)}
                    className={`cursor-pointer rounded-full px-3 py-1.5 text-[13px] transition-colors ${
                      selected
                        ? "bg-[#256FF1] text-white"
                        : "bg-[#F3F6F8] text-[#2E2C48] hover:bg-[#E8F1FE]"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className={labelClass} htmlFor="profile-diet">
                Food needs
              </label>
              <input
                id="profile-diet"
                value={dietary}
                onChange={(event) => setDietary(event.target.value)}
                placeholder="e.g. vegetarian, no shellfish"
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelClass} htmlFor="profile-access">
                Accessibility needs
              </label>
              <input
                id="profile-access"
                value={accessibility}
                onChange={(event) => setAccessibility(event.target.value)}
                placeholder="e.g. step-free routes"
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelClass} htmlFor="profile-notes">
              Anything else
            </label>
            <textarea
              id="profile-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={3}
              placeholder="e.g. travelling with a toddler, love early mornings"
              className={`${inputClass} resize-none`}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <button
            type="button"
            onClick={() => onDone()}
            className="h-[42px] cursor-pointer rounded-full border border-[#ECF2EF] px-5 text-[14.5px] text-[#2E2C48] transition-colors hover:bg-[#F3F6F8]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="h-[42px] cursor-pointer rounded-full bg-[#256FF1] px-6 text-[14.5px] font-[500] text-white transition-colors hover:bg-[#1D5AD9] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Saving…" : "Save my taste"}
          </button>
        </DialogFooter>
    </>
  );
}
