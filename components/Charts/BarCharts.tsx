"use client";

import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  LabelList,
  Line,
  Rectangle,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export const description = "A bar chart";

const chartConfig = {
  desktop: {
    color: "black",
  },
} satisfies ChartConfig;

const chartConfigSecond = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-2)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--chart-2)",
  },
  label: {
    color: "var(--background)",
  },
} satisfies ChartConfig;

type TheChartStats = {
  TheChartDataSecond:
    | {
        interest: string;
        count: number;
        percentage: number;
      }[]
    | undefined;

  TheChartDataFirst: {
    monthlyCounts: {
      month: string;
      count: number;
    }[];
  };
  
};
export function ChartBarDefault({
  TheChartDataSecond,
  TheChartDataFirst,
}: TheChartStats) {
  const chartDataSecond =
    TheChartDataSecond?.map((item) => ({
      interests: item.interest,
      percent: item.percentage,
    })) || [];

  //console.log("chartDataSecond", chartDataSecond);

  const chartData = [
    { interests: "Jan", desktop: 186 },
    { interests: "Feb", desktop: 305 },
    { interests: "Mar", desktop: 237 },
    { interests: "Apr", desktop: 73 },
    { interests: "May", desktop: 73 },
    { interests: "Jun", desktop: 73 },
    { interests: "Jul", desktop: 73 },
    { interests: "Aug", desktop: 73 },
    { interests: "Sep", desktop: 73 },
    { interests: "Oct", desktop: 73 },
    { interests: "Nov", desktop: 73 },
    { interests: "Dec", desktop: 73 },
  ];
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(270px,1fr))] gap-2 mt-4">
      <div className="col-span-1 p-[19px] drop-shadow-2xl drop-shadow-[#0D0A2C14] rounded-[16px] bg-white w-full">
        <h1 className="text-[#1F1F36] text-[20px] font-semibold mb-4">
          User Growth
        </h1>

        <div className="border border-[#E5E5EF] mb-9" />

        <ChartContainer config={chartConfig}>
          <ComposedChart data={TheChartDataFirst.monthlyCounts} width={500}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />

            <YAxis
              dataKey="count"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Area type="monotone" dataKey="count" fill="#ADCBFF" />
            <Bar
              dataKey="count"
              fill="#E5EAFC"
              radius={8}
              activeBar={<Rectangle fill="#4A3AFF" />}
            />
            <Line
              type="monotone"
              dataKey="count"
              fill="#256FF1"
              stroke="#FFECED00"
            />
          </ComposedChart>
        </ChartContainer>
      </div>

      <div className="col-span-1 p-[19px] drop-shadow-2xl drop-shadow-[#0D0A2C14] h-full rounded-[16px] bg-white w-full">
        <h1 className="text-[#1F1F36] text-[20px] font-semibold mb-4">
          Trip Trends
        </h1>

        <div className="border border-[#E5E5EF] mb-9" />
        <ChartContainer config={chartConfigSecond}>
          <BarChart
            accessibilityLayer
            layout="vertical"
            data={chartDataSecond}
            margin={{
              left: 10, // <-- Increase this to create space for labels
            }}
          >
            <CartesianGrid horizontal={false} />
            {/* X Axis shows percentage scale */}
            <XAxis
              type="number"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />

            {/* Y Axis shows interest names */}
            <YAxis
              dataKey="interests"
              type="category"
              hide
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />

            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Bar
              dataKey="percent"
              fill="#E5EAFC"
              barSize={50}
              radius={8}
              activeBar={<Rectangle fill="#4A3AFF" />}
            >
              <LabelList
                dataKey="interests"
                position="insideLeft"
                offset={8}
                className="font-semibold"
                fill="#000"
                fontSize={12}
              />
              <LabelList
                dataKey="percent"
                position="right"
                offset={8}
                className="fill-foreground"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </div>
    </div>
  );
}
