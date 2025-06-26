"use client";

import { Area, AreaChart, CartesianGrid } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../ui/chart";
import Image from "next/image";

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

type ThePerMonthComparison = {
  ThePerMonthComparisonUser: {
    monthlyCounts: {
      month: string;
      count: number;
    }[];
    trend: TrendResult;
  };

  ThePerMonthComparisonTrip: {
    monthlyCounts: {
      month: string;
      count: number;
    }[];
    trend: TrendResult;
  };

  ThePerMontActiveUserTodayCompare:
    | {
        activeUserToday: number;
        monthlyCounts: {
          label: string;
          count: number;
        }[];
        trend: TrendResult;
      }
    | undefined;

  TotalUsersTrendStat?: string;
  TotalTripsTrendStat?: string;
  TotalActiveUserTrendStat?: string;
};

export function ChartArea({
  ThePerMonthComparisonUser,
  ThePerMonthComparisonTrip,
  ThePerMontActiveUserTodayCompare,

  TotalUsersTrendStat,
  TotalTripsTrendStat,
  TotalActiveUserTrendStat,
}: ThePerMonthComparison) {
  let TheTrendForUserGrowthOnlyFill = "";
  let TheTrendForUserGrowthOnlyStroke = "";

  let TheTrendForTripGrowthOnlyFill = "";
  let TheTrendForTripGrowthOnlyStroke = "";

  let TheTrendForActiveUserGrowthOnlyFill = "";
  let TheTrendForActiveUserGrowthOnlyStroke = "";

  switch (TotalUsersTrendStat) {
    case "decrement":
      TheTrendForUserGrowthOnlyFill = "#ffc9c9";
      TheTrendForUserGrowthOnlyStroke = "#F04438";
      break;

    case "increment":
      TheTrendForUserGrowthOnlyFill = "#b9f8cf";

      TheTrendForUserGrowthOnlyStroke = "#12B76A";
      break;

    case "no change":
      TheTrendForUserGrowthOnlyFill = "#ffb86a";

      TheTrendForUserGrowthOnlyStroke = "#ff6900";
      break;

    default:
      break;
  }

  switch (TotalTripsTrendStat) {
    case "decrement":
      TheTrendForTripGrowthOnlyFill = "#ffc9c9";
      TheTrendForTripGrowthOnlyStroke = "#F04438";
      break;

    case "increment":
      TheTrendForTripGrowthOnlyFill = "#b9f8cf";

      TheTrendForTripGrowthOnlyStroke = "#12B76A";
      break;

    case "no change":
      TheTrendForTripGrowthOnlyFill = "#ffb86a";

      TheTrendForTripGrowthOnlyStroke = "#ff6900";
      break;
    default:
      break;
  }

  switch (TotalActiveUserTrendStat) {
    case "decrement":
      TheTrendForActiveUserGrowthOnlyFill = "#ffc9c9";
      TheTrendForActiveUserGrowthOnlyStroke = "#F04438";
      break;

    case "increment":
      TheTrendForActiveUserGrowthOnlyFill = "#b9f8cf";
      TheTrendForActiveUserGrowthOnlyStroke = "#12B76A";
      break;

    case "no change":
      TheTrendForActiveUserGrowthOnlyFill = "#ffb86a";
      TheTrendForActiveUserGrowthOnlyStroke = "#ff6900";
      break;

    default:
      break;
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(270px,1fr))] gap-2">
      <div className="col-span-1 p-[19px] drop-shadow-2xl drop-shadow-[#0D0A2C14] h-full rounded-[16px]  bg-white w-full">
        <div className="grid grid-cols-2">
          <div className="flex flex-col w-full items-start gap-2 col text-sm h-full">
            <h1 className="text-[16px] font-medium">Total Users</h1>
            <span className="text-[36px] font-semibold">
              {ThePerMonthComparisonUser?.monthlyCounts
                .map((item) => item.count)
                .reduce((a, b) => a + b, 0)}
            </span>
            <div className="flex items-center gap-1">
              <div className="flex items-center">
                {ThePerMonthComparisonUser.trend.trend === "decrement" && (
                  <Image
                    src="/assets/icons/arrow-down-red.svg"
                    alt="arrow"
                    width={20}
                    height={20}
                  />
                )}

                {ThePerMonthComparisonUser.trend.trend === "increment" && (
                  <Image
                    src="/assets/icons/arrow-up-green.svg"
                    alt="arrow"
                    width={20}
                    height={20}
                  />
                )}

                <span
                  className={`text-[13px] 
                    ${ThePerMonthComparisonUser.trend.trend === "decrement" && "text-[#F04438]"}
                    ${ThePerMonthComparisonUser.trend.trend === "increment" && "text-[#12B76A]"}
                    ${ThePerMonthComparisonUser.trend.trend === "no change" && "text-orange-400"}
                    
                  
                  `}
                >
                  {ThePerMonthComparisonUser.trend.percentage}%
                </span>
              </div>

              <p className="text-[13px] font-medium">vs last month</p>
            </div>
          </div>

          <div className="h-full">
            <ChartContainer config={chartConfig} className="w-full h-full">
              <AreaChart
                accessibilityLayer
                data={ThePerMonthComparisonUser.monthlyCounts}
                margin={{
                  left: 12,
                  right: 12,
                }}
              >
                <CartesianGrid vertical={false} />

                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="line" />}
                />
                <Area
                  dataKey="count"
                  type="natural"
                  fill={TheTrendForUserGrowthOnlyFill}
                  fillOpacity={0.4}
                  stroke={TheTrendForUserGrowthOnlyStroke}
                />
              </AreaChart>
            </ChartContainer>
          </div>
        </div>
      </div>

      <div className="col-span-1 p-[19px] drop-shadow-2xl drop-shadow-[#0D0A2C14] h-full rounded-[16px]  bg-white w-full">
        <div className="grid grid-cols-2">
          <div className="flex flex-col w-full items-start gap-2 col text-sm h-full">
            <h1 className="text-[16px] font-medium">Total Trips</h1>
            <span className="text-[36px] font-semibold">
              {ThePerMonthComparisonTrip?.monthlyCounts
                .map((item) => item.count)
                .reduce((a, b) => a + b, 0)}
            </span>
            <div className="flex items-center gap-1">
              <div className="flex items-center">
                {ThePerMonthComparisonTrip.trend.trend === "decrement" && (
                  <Image
                    src="/assets/icons/arrow-down-red.svg"
                    alt="arrow"
                    width={20}
                    height={20}
                  />
                )}

                {ThePerMonthComparisonTrip.trend.trend === "increment" && (
                  <Image
                    src="/assets/icons/arrow-up-green.svg"
                    alt="arrow"
                    width={20}
                    height={20}
                  />
                )}

                <span
                  className={`text-[13px] 
                    ${ThePerMonthComparisonTrip.trend.trend === "decrement" && "text-[#F04438]"}
                    ${ThePerMonthComparisonTrip.trend.trend === "increment" && "text-[#12B76A]"}
                    ${ThePerMonthComparisonTrip.trend.trend === "no change" && "text-orange-400"}
                    
                  
                  `}
                >
                  {ThePerMonthComparisonTrip.trend.percentage}%
                </span>
              </div>

              <p className="text-[13px] font-medium">vs last month</p>
            </div>
          </div>

          <div className="h-full">
            <ChartContainer config={chartConfig} className="w-full h-full">
              <AreaChart
                accessibilityLayer
                data={ThePerMonthComparisonTrip.monthlyCounts}
                margin={{
                  left: 12,
                  right: 12,
                }}
              >
                <CartesianGrid vertical={false} />

                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="line" />}
                />
                <Area
                  dataKey="count"
                  type="natural"
                  fill={TheTrendForTripGrowthOnlyFill}
                  fillOpacity={0.4}
                  stroke={TheTrendForTripGrowthOnlyStroke}
                />
              </AreaChart>
            </ChartContainer>
          </div>
        </div>
      </div>

      <div className="col-span-1 p-[19px] drop-shadow-2xl drop-shadow-[#0D0A2C14] h-full rounded-[16px]  bg-white w-full">
        <div className="grid grid-cols-2">
          <div className="flex flex-col w-full items-start gap-2 col text-sm h-full">
            <h1 className="text-[14px] font-medium">Active Users Today</h1>
            <span className="text-[36px] font-semibold">
              {ThePerMontActiveUserTodayCompare?.activeUserToday}
            </span>
            <div className="flex items-center gap-1">
              <div className="flex items-center">
                {ThePerMontActiveUserTodayCompare?.trend.trend ===
                  "decrement" && (
                  <Image
                    src="/assets/icons/arrow-down-red.svg"
                    alt="arrow"
                    width={20}
                    height={20}
                  />
                )}

                {ThePerMontActiveUserTodayCompare?.trend.trend ===
                  "increment" && (
                  <Image
                    src="/assets/icons/arrow-up-green.svg"
                    alt="arrow"
                    width={20}
                    height={20}
                  />
                )}

                <span
                  className={`text-[13px] 
                    ${ThePerMontActiveUserTodayCompare?.trend.trend === "decrement" && "text-[#F04438]"}
                    ${ThePerMontActiveUserTodayCompare?.trend.trend === "increment" && "text-[#12B76A]"}
                    ${ThePerMontActiveUserTodayCompare?.trend.trend === "no change" && "text-orange-400"}
                    
                  
                  `}
                >
                  {ThePerMontActiveUserTodayCompare?.trend.percentage}%
                </span>
              </div>

              <p className="text-[13px] font-medium">vs last month</p>
            </div>
          </div>

          <div className="h-full">
            <ChartContainer config={chartConfig} className="w-full h-full">
              <AreaChart
                accessibilityLayer
                data={ThePerMontActiveUserTodayCompare?.monthlyCounts}
                margin={{
                  left: 12,
                  right: 12,
                }}
              >
                <CartesianGrid vertical={false} />

                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="line" />}
                />
                <Area
                  dataKey="count"
                  type="natural"
                  fill={TheTrendForActiveUserGrowthOnlyFill}
                  fillOpacity={0.4}
                  stroke={TheTrendForActiveUserGrowthOnlyStroke}
                />
              </AreaChart>
            </ChartContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
