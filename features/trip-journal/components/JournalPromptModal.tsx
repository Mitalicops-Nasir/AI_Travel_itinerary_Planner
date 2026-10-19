"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BookOpenCheck, Camera, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MAX_PHOTOS_PER_ENTRY, MAX_PHOTO_BYTES } from "../constants";
import { addJournalEntry, updateJournalEntry } from "../actions";
import type { JournalEntryView } from "../types";

type PhotoPreview = { file: File; url: string };

export function JournalEntryModal({
  tripId,
  day,
  entry,
  open,
  onOpenChange,
}: {
  tripId: string;
  day: number | null;
  entry: JournalEntryView | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [note, setNote] = useState(entry?.note ?? "");
  const [dayValue, setDayValue] = useState<string>(
    entry?.day != null ? String(entry.day) : day != null ? String(day) : ""
  );
  const [previews, setPreviews] = useState<PhotoPreview[]>([]);
  const [isPending, startTransition] = useTransition();

  const isEditing = entry != null;

  function resetForm() {
    setNote(entry?.note ?? "");
    setDayValue(
      entry?.day != null ? String(entry.day) : day != null ? String(day) : ""
    );
    previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    setPreviews([]);
  }

  function handleOpenChange(next: boolean) {
    onOpenChange(next);
    if (!next) resetForm();
  }

  function addFiles(fileList: FileList | null) {
    if (!fileList) return;

    const incoming = Array.from(fileList);

    for (const file of incoming) {
      if (!file.type.startsWith("image/")) {
        toast.error("Only photo files can be attached.");
        continue;
      }

      if (file.size > MAX_PHOTO_BYTES) {
        toast.error("One photo is bigger than 5 MB — pick a smaller one.");
        continue;
      }

      setPreviews((current) => {
        if (current.length >= MAX_PHOTOS_PER_ENTRY) {
          toast.error(`You can add up to ${MAX_PHOTOS_PER_ENTRY} photos.`);
          return current;
        }

        return [...current, { file, url: URL.createObjectURL(file) }];
      });
    }
  }

  function removePreview(url: string) {
    setPreviews((current) => {
      const target = current.find((preview) => preview.url === url);
      if (target) URL.revokeObjectURL(target.url);
      return current.filter((preview) => preview.url !== url);
    });
  }

  function save() {
    startTransition(async () => {
      if (isEditing && entry) {
        const result = await updateJournalEntry({
          id: entry.id,
          note,
          day: dayValue === "" ? null : Number(dayValue),
        });

        if (!result.success) {
          toast.error(result.error);
          return;
        }

        toast.success("Entry updated.");
        handleOpenChange(false);
        router.refresh();
        return;
      }

      const formData = new FormData();
      formData.set("tripId", tripId);
      if (dayValue !== "") formData.set("day", dayValue);
      formData.set("note", note);
      previews.forEach((preview) => formData.append("photos", preview.file));

      const result = await addJournalEntry(formData);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Memory saved — it is already on your recap.");
      handleOpenChange(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="rounded-[16px] border-[#ECF2EF] sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="text-[20px] font-[700] text-[#141627]">
            {isEditing ? "Edit this memory" : "Add a memory"}
          </DialogTitle>
          <DialogDescription className="text-[14px] text-[#7F7E83]">
            {isEditing
              ? "Update the note or the trip day. Photos stay as they are."
              : "A quick note, a few photos — your future self will thank you."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <label
              htmlFor="journal-day"
              className="text-[13.5px] font-[500] text-[#2E2C48]"
            >
              Trip day
            </label>
            <input
              id="journal-day"
              type="number"
              min={1}
              max={60}
              value={dayValue}
              onChange={(event) => setDayValue(event.target.value)}
              placeholder="Any"
              className="h-[38px] w-[90px] rounded-[10px] border border-[#ECF2EF] bg-white px-3 text-[14px] text-[#141627] outline-none focus:border-[#256FF1]"
            />
          </div>

          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={4}
            maxLength={1000}
            placeholder="What was today like?"
            className="w-full resize-none rounded-[12px] border border-[#ECF2EF] bg-[#F9FBFC] p-3.5 text-[14px] text-[#141627] outline-none placeholder:text-[#A5A3B2] focus:border-[#256FF1]"
          />

          {isEditing && entry.photos.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {entry.photos.map((photo) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={photo}
                  src={photo}
                  alt="Journal photo"
                  className="h-[72px] w-[72px] rounded-[10px] object-cover"
                />
              ))}
            </div>
          )}

          {!isEditing && (
            <div className="flex flex-col gap-2">
              <label
                htmlFor="journal-photos"
                className="flex h-[40px] w-fit cursor-pointer items-center gap-2 rounded-full border border-dashed border-[#C9D8F6] bg-[#F4F8FF] px-4 text-[13.5px] font-[500] text-[#256FF1] transition-colors hover:bg-[#E8F1FE]"
              >
                <Camera className="size-4" />
                Add photos ({previews.length}/{MAX_PHOTOS_PER_ENTRY})
              </label>
              <input
                id="journal-photos"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(event) => {
                  addFiles(event.target.files);
                  event.target.value = "";
                }}
              />

              {previews.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {previews.map((preview) => (
                    <div key={preview.url} className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={preview.url}
                        alt="Selected photo"
                        className="h-[72px] w-[72px] rounded-[10px] object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removePreview(preview.url)}
                        className="absolute -top-1.5 -right-1.5 flex size-5 cursor-pointer items-center justify-center rounded-full bg-[#141627] text-white"
                        aria-label="Remove photo"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <button
            type="button"
            onClick={() => handleOpenChange(false)}
            className="h-[40px] cursor-pointer rounded-full border border-[#ECF2EF] px-5 text-[14px] text-[#2E2C48] transition-colors hover:bg-[#F3F6F8]"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={save}
            className="h-[40px] cursor-pointer rounded-full bg-[#256FF1] px-5 text-[14px] font-[500] text-white transition-colors hover:bg-[#1D5AD9] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Saving..." : isEditing ? "Save changes" : "Save memory"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function JournalPromptModal({
  tripId,
  day,
  city,
}: {
  tripId: string;
  day: number;
  city: string;
}) {
  const [dismissed, setDismissed] = useState(false);
  const [open, setOpen] = useState(false);

  if (dismissed) return null;

  return (
    <>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[14px] border border-[#E3F1FF] bg-[#F4F8FF] px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-full bg-white">
            <BookOpenCheck className="size-4 text-[#256FF1]" />
          </span>
          <p className="text-[14px] text-[#2E2C48]">
            <span className="font-[600]">Evening check-in:</span> how was day{" "}
            {day} in {city}?
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="h-[36px] cursor-pointer rounded-full bg-[#256FF1] px-4 text-[13px] font-[500] text-white transition-colors hover:bg-[#1D5AD9]"
          >
            Add today&apos;s memory
          </button>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="h-[36px] cursor-pointer rounded-full border border-[#ECF2EF] px-4 text-[13px] text-[#5C5A70] transition-colors hover:bg-white"
          >
            Not today
          </button>
        </div>
      </div>

      <JournalEntryModal
        tripId={tripId}
        day={day}
        entry={null}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
