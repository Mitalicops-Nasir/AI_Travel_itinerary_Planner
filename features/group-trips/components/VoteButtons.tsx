"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { ThumbsUp } from "lucide-react";
import { voteSuggestion } from "../actions";

export function VoteButtons({
  suggestionId,
  initialCount,
  initialVoted,
  disabled = false,
}: {
  suggestionId: string;
  initialCount: number;
  initialVoted: boolean;
  disabled?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [count, setCount] = useState(initialCount);
  const [voted, setVoted] = useState(initialVoted);

  function toggle() {
    const nextVoted = !voted;
    const previous = { count, voted };

    setVoted(nextVoted);
    setCount((current) => Math.max(0, current + (nextVoted ? 1 : -1)));

    startTransition(async () => {
      const result = await voteSuggestion(suggestionId);

      if (!result.success) {
        setVoted(previous.voted);
        setCount(previous.count);
        toast.error(result.error);
        return;
      }

      setVoted(result.voted);
      setCount(result.voteCount);
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={isPending || disabled}
      className={`flex h-[36px] cursor-pointer items-center gap-2 rounded-full border px-3.5 text-[13.5px] font-[500] transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
        voted
          ? "border-[#256FF1] bg-[#E8F1FE] text-[#256FF1]"
          : "border-[#ECF2EF] bg-white text-[#5C5A70] hover:bg-[#F3F6F8]"
      }`}
      aria-label={voted ? "Remove your vote" : "Vote for this idea"}
    >
      <ThumbsUp className="size-4" />
      {count}
    </button>
  );
}
