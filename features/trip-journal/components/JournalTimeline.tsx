"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { NotebookPen, Pencil, Plus, Trash2 } from "lucide-react";
import { deleteJournalEntry } from "../actions";
import { JournalEntryModal, JournalPromptModal } from "./JournalPromptModal";
import type { JournalEntryView } from "../types";

export function JournalTimeline({
  tripId,
  userId,
  entries,
  promptDay,
  city,
}: {
  tripId: string;
  userId: string;
  entries: JournalEntryView[];
  promptDay: number | null;
  city: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<JournalEntryView | null>(null);
  const [isPending, startTransition] = useTransition();

  function openNew() {
    setEditing(null);
    setOpen(true);
  }

  function openEdit(entry: JournalEntryView) {
    setEditing(entry);
    setOpen(true);
  }

  function remove(entry: JournalEntryView) {
    if (!window.confirm("Delete this memory? Its photos will be removed too.")) {
      return;
    }

    startTransition(async () => {
      const result = await deleteJournalEntry(entry.id);

      if (!result.success) {
        toast.error(result.error ?? "We could not delete that entry.");
        return;
      }

      toast.success("Entry deleted.");
      router.refresh();
    });
  }

  const sorted = [...entries].sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
  );

  return (
    <section className="mt-[30px] rounded-[16px] border border-[#ECF2EF] bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-full bg-[#F4F8FF]">
            <NotebookPen className="size-5 text-[#256FF1]" />
          </span>
          <div>
            <h2 className="text-[20px] font-semibold text-[#1F1F36]">
              Trip journal
            </h2>
            <p className="text-[13px] text-[#7F7E83]">
              Photos and notes from the road — they feed your end-of-trip recap.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={openNew}
          className="flex h-[40px] cursor-pointer items-center gap-2 rounded-full bg-[#256FF1] px-4 text-[13.5px] font-[500] text-white transition-colors hover:bg-[#1D5AD9]"
        >
          <Plus className="size-4" />
          Add memory
        </button>
      </div>

      {promptDay != null && <JournalPromptModal tripId={tripId} day={promptDay} city={city} />}

      {sorted.length === 0 ? (
        <p className="mt-4 rounded-[12px] border border-dashed border-[#ECF2EF] bg-[#F9FBFC] px-4 py-6 text-center text-[14px] text-[#7C7A8F]">
          No memories yet. Add your first note or photo from the road.
        </p>
      ) : (
        <ol className="mt-5 flex flex-col gap-5">
          {sorted.map((entry) => (
            <li
              key={entry.id}
              className="rounded-[14px] border border-[#ECF2EF] bg-[#F9FBFC] p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-[#E8F1FE] px-3 py-1 text-[12.5px] font-[600] text-[#256FF1]">
                    {entry.day != null ? `Day ${entry.day}` : "Memory"}
                  </span>
                  <span className="text-[12.5px] text-[#A5A3B2]">
                    {entry.createdAt.toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>

                {entry.userId === userId && (
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => openEdit(entry)}
                      className="flex size-8 cursor-pointer items-center justify-center rounded-full text-[#5C5A70] transition-colors hover:bg-white disabled:opacity-50"
                      aria-label="Edit entry"
                    >
                      <Pencil className="size-4" />
                    </button>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => remove(entry)}
                      className="flex size-8 cursor-pointer items-center justify-center rounded-full text-[#E23636] transition-colors hover:bg-[#FDECEC] disabled:opacity-50"
                      aria-label="Delete entry"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                )}
              </div>

              {entry.note && (
                <p className="mt-3 text-[14.5px] leading-[24px] text-[#2E2C48]">
                  {entry.note}
                </p>
              )}

              {entry.photos.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {entry.photos.map((photo) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={photo}
                      src={photo}
                      alt="Journal photo"
                      className="h-[96px] w-[96px] rounded-[10px] object-cover"
                    />
                  ))}
                </div>
              )}
            </li>
          ))}
        </ol>
      )}

      <JournalEntryModal
        key={editing?.id ?? "new"}
        tripId={tripId}
        day={editing?.day ?? promptDay ?? null}
        entry={editing}
        open={open}
        onOpenChange={setOpen}
      />
    </section>
  );
}
