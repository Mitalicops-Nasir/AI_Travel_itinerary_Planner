"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ImportPreviewForm } from "./ImportPreviewForm";
import { previewImport } from "../actions";
import type { ImportDraft } from "../types";

type Mode = "text" | "url" | "image";

const inputClass =
  "w-full rounded-[8px] border border-[#ECF2EF] bg-white px-3 py-2 text-[14.5px] text-[#2E2C48] outline-none transition-colors focus:border-[#256FF1]";

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

export function ImportTripModal({
  open,
  onOpenChange,
  onApply,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: (draft: ImportDraft) => void;
}) {
  const [isPending, startTransition] = useTransition();

  const [mode, setMode] = useState<Mode>("text");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [dataUrl, setDataUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [draft, setDraft] = useState<ImportDraft | null>(null);

  function reset() {
    setMode("text");
    setText("");
    setUrl("");
    setDataUrl("");
    setFileName("");
    setError("");
    setDraft(null);
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset();
    onOpenChange(next);
  }

  function handleFile(file: File | undefined) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file (JPG, PNG or similar).");
      return;
    }

    if (file.size > MAX_IMAGE_BYTES) {
      setError("That image is bigger than 4 MB. Please pick a smaller one.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setDataUrl(typeof reader.result === "string" ? reader.result : "");
      setFileName(file.name);
      setError("");
    };

    reader.onerror = () => setError("We could not read that image. Try another one.");

    reader.readAsDataURL(file);
  }

  function handleRead() {
    setError("");

    if (mode === "text" && text.trim().length < 10) {
      setError("Paste a bit more text so we can read the trip.");
      return;
    }

    if (mode === "url") {
      if (!url.trim() || !/^https?:\/\//i.test(url.trim())) {
        setError("Please paste a full link starting with http:// or https://");
        return;
      }
    }

    if (mode === "image" && !dataUrl) {
      setError("Choose an image first.");
      return;
    }

    startTransition(async () => {
      const request =
        mode === "text"
          ? ({ kind: "text", text: text.trim() } as const)
          : mode === "url"
            ? ({ kind: "url", url: url.trim() } as const)
            : ({ kind: "image", dataUrl } as const);

      const result = await previewImport(request);

      if (!result.success) {
        setError(result.error);
        return;
      }

      setDraft(result.draft);
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto rounded-[16px] border-[#ECF2EF] sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="text-[20px] font-[700] text-[#141627]">
            Import a trip
          </DialogTitle>
          <DialogDescription className="text-[14px] text-[#7F7E83]">
            Paste a travel blog, a link, or a photo of a plan. We will fill the
            trip form for you. You can always edit it afterwards.
          </DialogDescription>
        </DialogHeader>

        {draft ? (
          <ImportPreviewForm
            draft={draft}
            onBack={() => setDraft(null)}
            onApply={(finalDraft) => {
              onApply(finalDraft);
              reset();
              onOpenChange(false);
            }}
          />
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex gap-2">
              {(
                [
                  { id: "text", label: "Paste text" },
                  { id: "url", label: "Paste a link" },
                  { id: "image", label: "Upload a photo" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setMode(tab.id);
                    setError("");
                  }}
                  className={`h-[38px] cursor-pointer rounded-full px-4 text-[13.5px] transition-colors ${
                    mode === tab.id
                      ? "bg-[#256FF1] text-white"
                      : "bg-[#F3F6F8] text-[#2E2C48] hover:bg-[#E8F1FE]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {mode === "text" && (
              <textarea
                value={text}
                onChange={(event) => setText(event.target.value)}
                rows={7}
                placeholder="Paste anything about the trip — a blog post, notes, a message with the plan…"
                className={`${inputClass} resize-none`}
              />
            )}

            {mode === "url" && (
              <input
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="https://example.com/my-trip"
                className={inputClass}
              />
            )}

            {mode === "image" && (
              <div className="flex flex-col gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => handleFile(event.target.files?.[0])}
                  className="block w-full cursor-pointer text-[13.5px] text-[#5C5A70] file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-[#F3F6F8] file:px-4 file:py-2 file:text-[13.5px] file:text-[#2E2C48]"
                />
                {dataUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={dataUrl}
                    alt="Chosen trip"
                    className="max-h-[180px] w-fit rounded-[10px] border border-[#ECF2EF]"
                  />
                )}
                {fileName && (
                  <p className="text-[12.5px] text-[#7C7A8F]">Ready: {fileName}</p>
                )}
              </div>
            )}

            {error && <p className="text-[13.5px] text-[#E23636]">{error}</p>}

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => handleOpenChange(false)}
                className="h-[42px] cursor-pointer rounded-full border border-[#ECF2EF] px-5 text-[14.5px] text-[#2E2C48] transition-colors hover:bg-[#F3F6F8]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRead}
                disabled={isPending}
                className="h-[42px] cursor-pointer rounded-full bg-[#256FF1] px-6 text-[14.5px] font-[500] text-white transition-colors hover:bg-[#1D5AD9] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending ? "Reading…" : "Read this"}
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}