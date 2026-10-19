import { Star } from "lucide-react";

export function PremiumTripBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF7E6] px-3 py-[5px] text-[12px] font-[600] text-[#B54708]">
      <Star className="size-3.5 fill-[#F79009] text-[#F79009]" />
      Premium
    </span>
  );
}
