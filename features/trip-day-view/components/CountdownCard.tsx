import { CalendarClock } from "lucide-react";

export function CountdownCard({
  destination,
  daysUntilStart,
}: {
  destination: string;
  daysUntilStart: number;
}) {
  return (
    <div className="rounded-[16px] border border-[#E3F1FF] bg-[#F3F8FF] p-4 max-[600px]:p-3.5">
      <div className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white">
          <CalendarClock className="size-5 text-[#256FF1]" />
        </span>

        <div className="min-w-0">
          <p className="text-[15px] font-semibold text-[#1F1F36]">
            {daysUntilStart === 0
              ? `Your trip to ${destination} starts today`
              : daysUntilStart === 1
                ? `Your trip to ${destination} starts tomorrow`
                : `Your trip to ${destination} starts in ${daysUntilStart} days`}
          </p>
          <p className="text-[13px] text-[#5C5A70]">
            Add dates to get your day-by-day view while you travel.
          </p>
        </div>
      </div>
    </div>
  );
}