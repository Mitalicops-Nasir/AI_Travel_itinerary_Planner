export function ProBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full bg-[#256FF1] px-2 py-[2px] text-[10.5px] font-[700] tracking-wide text-white ${className}`}
    >
      PRO
    </span>
  );
}
