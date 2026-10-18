import { calculateTrendPercentage, type TrendResult } from "@/lib/utils";

export type MonthlyTrend = {
  monthlyCounts: { month: string; count: number }[];
  trend: TrendResult;
};

/**
 * Buckets dates into the 12 months of the current year and compares the
 * current month against the previous one.
 */
export function buildMonthlyTrend(dates: Date[]): MonthlyTrend {
  const monthlyCounts = Array.from({ length: 12 }, (_, month) => ({
    month: new Date(2024, month).toLocaleString("default", { month: "short" }),
    count: dates.filter((date) => date.getMonth() === month).length,
  }));

  const currentMonth = new Date().getMonth();

  return {
    monthlyCounts,
    trend: calculateTrendPercentage(
      monthlyCounts[currentMonth]?.count ?? 0,
      monthlyCounts[currentMonth - 1]?.count ?? 0
    ),
  };
}
