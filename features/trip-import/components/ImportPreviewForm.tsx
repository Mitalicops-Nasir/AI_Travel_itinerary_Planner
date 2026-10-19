"use client";

import { useState } from "react";
import { interests as interestOptions } from "@/constants";
import type { ImportDraft } from "../types";

const inputClass =
  "w-full rounded-[8px] border border-[#ECF2EF] bg-white px-3 py-2 text-[14.5px] text-[#2E2C48] outline-none transition-colors focus:border-[#256FF1]";

const labelClass =
  "text-[12px] font-semibold uppercase tracking-wide text-[#7C7A8F]";

const confidenceCopy: Record<ImportDraft["confidence"], string> = {
  high: "We found a clear trip in that.",
  medium: "We found most of the trip — please check the details.",
  low: "We could not read much. Fill in what you know, the rest is optional.",
};

export function ImportPreviewForm({
  draft,
  onBack,
  onApply,
}: {
  draft: ImportDraft;
  onBack: () => void;
  onApply: (draft: ImportDraft) => void;
}) {
  const [country, setCountry] = useState(draft.country ?? "");
  const [duration, setDuration] = useState(
    draft.suggestedDuration ? String(draft.suggestedDuration) : ""
  );
  const [selected, setSelected] = useState<string[]>(
    draft.suggestedInterests.filter((tag) =>
      interestOptions.includes(tag)
    ).length > 0
      ? draft.suggestedInterests.filter((tag) =>
          interestOptions.includes(tag)
        )
      : draft.suggestedInterests.slice(0, 1)
  );

  const matchedInterest =
    selected.length === 0 && draft.suggestedInterests.length > 0;

  function toggleInterest(tag: string) {
    setSelected((current) =>
      current.includes(tag)
        ? current.filter((item) => item !== tag)
        : [...current, tag]
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-[12px] border border-[#E3F1FF] bg-[#F9FBFC] p-3">
        <p className="text-[13.5px] text-[#2E2C48]">
          {confidenceCopy[draft.confidence]}
        </p>
        {draft.note && (
          <p className="mt-1 text-[13px] text-[#7C7A8F]">{draft.note}</p>
        )}
      </div>

      {draft.places.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <span className={labelClass}>Places we found</span>
          <div className="flex flex-wrap gap-2">
            {draft.places.map((place) => (
              <span
                key={place}
                className="rounded-full bg-[#F3F6F8] px-3 py-1 text-[13px] text-[#2E2C48]"
              >
                {place}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="import-country">
            Country
          </label>
          <input
            id="import-country"
            value={country}
            onChange={(event) => setCountry(event.target.value)}
            placeholder="e.g. Portugal"
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="import-duration">
            Days
          </label>
          <input
            id="import-duration"
            value={duration}
            inputMode="numeric"
            onChange={(event) =>
              setDuration(event.target.value.replace(/[^0-9]/g, "").slice(0, 2))
            }
            placeholder="e.g. 7"
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className={labelClass}>Interest (pick one)</span>
        {matchedInterest && (
          <p className="text-[12.5px] text-[#7C7A8F]">
            We read &ldquo;{draft.suggestedInterests.join(", ")}&rdquo; — pick the
            closest match below.
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          {interestOptions.map((tag) => {
            const isSelected = selected.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleInterest(tag)}
                className={`cursor-pointer rounded-full px-3 py-1.5 text-[13px] transition-colors ${
                  isSelected
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

      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onBack}
          className="h-[42px] cursor-pointer rounded-full border border-[#ECF2EF] px-5 text-[14.5px] text-[#2E2C48] transition-colors hover:bg-[#F3F6F8]"
        >
          Back
        </button>
        <button
          type="button"
          onClick={() =>
            onApply({
              ...draft,
              country: country.trim() || null,
              suggestedDuration: duration ? Number(duration) : null,
              suggestedInterests: selected,
            })
          }
          disabled={!country.trim()}
          className="h-[42px] cursor-pointer rounded-full bg-[#256FF1] px-6 text-[14.5px] font-[500] text-white transition-colors hover:bg-[#1D5AD9] disabled:cursor-not-allowed disabled:opacity-60"
        >
          Use these details
        </button>
      </div>
    </div>
  );
}