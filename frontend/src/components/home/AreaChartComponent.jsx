"use client";

import { TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartData = [
  { month: "January", faculty: 1860, students: 800 },
  { month: "February", faculty: 3050, students: 2000 },
  { month: "March", faculty: 2370, students: 1200 },
  { month: "April", faculty: 730, students: 1900 },
  { month: "May", faculty: 2090, students: 1300 },
  { month: "June", faculty: 3060, students: 2130 },
];

const chartConfig = {
  faculty: {
    label: "faculty",
    color: "#3B1C32", // Dark Maroon
  },
  students: {
    label: "students",
    color: "#6E304B", // Slightly lighter maroon
  },
};

export function AreaChartComponent() {
  return (
    <Card className="border-none shadow-black shadow-2xl bg-white">
      <CardHeader>
        <CardTitle>CampusCHAT Users</CardTitle>
        <CardDescription>
          Showing total visitors for the last 6 months
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <YAxis hide />
            <ChartTooltip cursor={false} className="bg-white" content={<ChartTooltipContent />} />
            <defs>
              <linearGradient id="fillGradient1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B1C32" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3B1C32" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillGradient2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6E304B" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#6E304B" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <Area
              dataKey="students"
              type="natural"
              fill="url(#fillGradient2)"
              fillOpacity={0.4}
              stroke="#6E304B"
              stackId="a"
            />
            <Area
              dataKey="faculty"
              type="natural"
              fill="url(#fillGradient1)"
              fillOpacity={0.4}
              stroke="#3B1C32"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              January - June 2024
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
