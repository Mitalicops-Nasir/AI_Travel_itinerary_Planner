"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Lightbulb, Users } from "lucide-react";
import { resolveSuggestion } from "../actions";
import { SuggestStopModal } from "./SuggestStopModal";
import { TripMembersModal } from "./TripMembersModal";
import { VoteButtons } from "./VoteButtons";
import type { MemberView, SuggestionView } from "../types";

function ResolveButtons({ suggestionId }: { suggestionId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function resolve(decision: "approve" | "decline") {
    startTransition(async () => {
      const result = await resolveSuggestion(suggestionId, decision);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(
        decision === "approve"
          ? "Added to the trip plan!"
          : "Idea declined — the group can move on."
      );
      router.refresh();
    });
  }

  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => resolve("approve")}
        disabled={isPending}
        className="h-[34px] cursor-pointer rounded-full bg-[#256FF1] px-4 text-[13px] font-[500] text-white transition-colors hover:bg-[#1D5AD9] disabled:cursor-not-allowed disabled:opacity-60"
      >
        Add to plan
      </button>
      <button
        type="button"
        onClick={() => resolve("decline")}
        disabled={isPending}
        className="h-[34px] cursor-pointer rounded-full border border-[#ECF2EF] px-4 text-[13px] text-[#5C5A70] transition-colors hover:bg-[#F3F6F8] disabled:cursor-not-allowed disabled:opacity-60"
      >
        Decline
      </button>
    </div>
  );
}

export function SuggestionsPanel({
  tripId,
  currentUserId,
  isOwner,
  maxDay,
  suggestions,
  members,
}: {
  tripId: string;
  currentUserId: string;
  isOwner: boolean;
  maxDay: number;
  suggestions: SuggestionView[];
  members: MemberView[];
}) {
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [membersOpen, setMembersOpen] = useState(false);

  const openIdeas = suggestions.filter((suggestion) => suggestion.status === "OPEN");
  const decided = suggestions.filter((suggestion) => suggestion.status !== "OPEN");

  return (
    <div className="flex flex-col gap-4 rounded-[16px] border border-[#ECF2EF] bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-full bg-[#F4F8FF]">
            <Lightbulb className="size-5 text-[#256FF1]" />
          </span>
          <div>
            <p className="text-[16px] font-[600] text-[#1F1F36]">
              Group suggestions
            </p>
            <p className="text-[13px] text-[#5C5A70]">
              {openIdeas.length === 0
                ? "No open ideas — suggest a stop for any day."
                : `${openIdeas.length} open ${openIdeas.length === 1 ? "idea" : "ideas"} waiting for votes.`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMembersOpen(true)}
            className="flex h-[40px] cursor-pointer items-center gap-2 rounded-full border border-[#ECF2EF] px-4 text-[13.5px] font-[500] text-[#2E2C48] transition-colors hover:bg-[#F3F6F8]"
          >
            <Users className="size-4 text-[#5C5A70]" />
            Trip crew · {members.length}
          </button>
          <button
            type="button"
            onClick={() => setSuggestOpen(true)}
            className="h-[40px] cursor-pointer rounded-full bg-[#256FF1] px-4 text-[13.5px] font-[500] text-white transition-colors hover:bg-[#1D5AD9]"
          >
            Suggest a stop
          </button>
        </div>
      </div>

      {openIdeas.length > 0 && (
        <div className="flex flex-col divide-y divide-[#F0F4F2]">
          {openIdeas.map((suggestion) => (
            <div
              key={suggestion.id}
              className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 flex-1">
                <p className="text-[14.5px] font-[600] text-[#141627]">
                  Day {suggestion.day}: {suggestion.title}
                </p>
                <p className="mt-[2px] text-[13px] text-[#5C5A70]">
                  {suggestion.notes ? `${suggestion.notes} · ` : ""}
                  by {suggestion.authorName}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <VoteButtons
                  suggestionId={suggestion.id}
                  initialCount={suggestion.voteCount}
                  initialVoted={suggestion.votedByMe}
                />
                {isOwner && <ResolveButtons suggestionId={suggestion.id} />}
              </div>
            </div>
          ))}
        </div>
      )}

      {decided.length > 0 && (
        <div className="flex flex-col gap-2 border-t border-[#F0F4F2] pt-3">
          <p className="text-[12.5px] font-[600] uppercase tracking-wide text-[#A5A3B2]">
            Decided
          </p>
          {decided.map((suggestion) => (
            <div
              key={suggestion.id}
              className="flex flex-wrap items-center gap-2 text-[13.5px] text-[#5C5A70]"
            >
              <span
                className={`rounded-full px-2.5 py-[3px] text-[11.5px] font-[600] ${
                  suggestion.status === "APPROVED"
                    ? "bg-[#E8F7EC] text-[#2F7D32]"
                    : "bg-[#F3F6F8] text-[#7F7E83]"
                }`}
              >
                {suggestion.status === "APPROVED" ? "Approved" : "Declined"}
              </span>
              <span>
                Day {suggestion.day}: {suggestion.title}
              </span>
              <span className="text-[12.5px] text-[#A5A3B2]">
                · {suggestion.authorName}
              </span>
            </div>
          ))}
        </div>
      )}

      <SuggestStopModal
        open={suggestOpen}
        onOpenChange={setSuggestOpen}
        tripId={tripId}
        maxDay={maxDay}
      />

      <TripMembersModal
        open={membersOpen}
        onOpenChange={setMembersOpen}
        tripId={tripId}
        members={members}
        currentUserId={currentUserId}
      />
    </div>
  );
}
