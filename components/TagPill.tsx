import { cn } from "@/lib/utils";

const TAG_BACKGROUNDS = [
  "#ECFDF3",
  "#F3F0FB",
  "#F0F9FF",
  "#F8F9FC",
  "#F7EDF6",
  "#FFF4ED",
  "#FFF1F3",
];

const TAG_TEXT_COLORS = [
  "#027A48",
  "#6941C6",
  "#026AA2",
  "#363F72",
  "#C11574",
  "#B93815",
  "#C01048",
];

export const TagPill = ({
  tag,
  paletteIndex,
  className,
  textClassName,
}: {
  tag: string;
  paletteIndex: number;
  className?: string;
  textClassName?: string;
}) => {
  const colorIndex = paletteIndex % TAG_BACKGROUNDS.length;

  return (
    <div
      className={cn(
        "pb-[8px] pr-[20px] pl-[20px] pt-[8px] rounded-[40px] w-fit",
        className
      )}
      style={{ backgroundColor: TAG_BACKGROUNDS[colorIndex] }}
    >
      <p
        className={cn("text-[10.5px] font-[500]", textClassName)}
        style={{ color: TAG_TEXT_COLORS[colorIndex] }}
      >
        {tag}
      </p>
    </div>
  );
};
