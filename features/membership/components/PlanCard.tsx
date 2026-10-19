import type React from "react";

export function PlanCard({
  name,
  price,
  period,
  features,
  highlighted = false,
  tagline,
  action,
}: {
  name: string;
  price: string;
  period?: string;
  tagline?: string;
  features: string[];
  highlighted?: boolean;
  action?: React.ReactNode;
}) {
  return (
    <div
      className={`flex w-full flex-col gap-4 rounded-[18px] border bg-white p-6 ${
        highlighted ? "border-[#256FF1] shadow-[0_16px_40px_rgba(37,111,241,0.12)]" : "border-[#ECF2EF]"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-[18px] font-[700] text-[#141627]">{name}</h3>
        {highlighted && (
          <span className="rounded-full bg-[#E8F1FE] px-3 py-1 text-[12px] font-[600] text-[#256FF1]">
            Recommended
          </span>
        )}
      </div>

      {tagline && <p className="text-[13.5px] text-[#7F7E83]">{tagline}</p>}

      <p className="flex items-baseline gap-1">
        <span className="text-[32px] font-[800] text-[#141627]">{price}</span>
        {period && (
          <span className="text-[14px] text-[#7F7E83]">/ {period}</span>
        )}
      </p>

      <ul className="flex flex-col gap-2">
        {features.map((feature) => (
          <li
            key={feature}
            className="flex items-start gap-2 text-[14px] text-[#2E2C48]"
          >
            <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-[#256FF1]" />
            {feature}
          </li>
        ))}
      </ul>

      {action && <div className="mt-auto pt-2">{action}</div>}
    </div>
  );
}
