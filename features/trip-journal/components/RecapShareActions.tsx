"use client";

import { Download, Link2 } from "lucide-react";
import { toast } from "sonner";

export function RecapShareActions({ imageUrl }: { imageUrl: string }) {
  function copyLink() {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Recap link copied — share away.");
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={copyLink}
        className="flex h-[40px] cursor-pointer items-center gap-2 rounded-full bg-[#256FF1] px-4 text-[13.5px] font-[500] text-white transition-colors hover:bg-[#1D5AD9]"
      >
        <Link2 className="size-4" />
        Copy recap link
      </button>
      <a
        href={imageUrl}
        download="trip-recap.png"
        className="flex h-[40px] items-center gap-2 rounded-full border border-[#ECF2EF] bg-white px-4 text-[13.5px] font-[500] text-[#2E2C48] transition-colors hover:bg-[#F3F6F8]"
      >
        <Download className="size-4" />
        Download image
      </a>
    </div>
  );
}
