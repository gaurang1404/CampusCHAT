"use client"

import { TrendingUp } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const chartData = [
  { month: "January", faculty: 1860, students: 800 },
  { month: "February", faculty: 3050, students: 2000 },
  { month: "March", faculty: 2370, students: 1200 },
  { month: "April", faculty: 730, students: 1900 },
  { month: "May", faculty: 2090, students: 1300 },
  { month: "June", faculty: 3060, students: 2130 },
]

const chartConfig = {
  faculty: {
    label: "Faculty",
    color: "#63144c", // Primary color
  },
  students: {
    label: "Students",
    color: "#a44a8d", // Lighter shade
  },
}

export function AreaChartComponent() {
  return (
    <Card className="border-none shadow-xl bg-white hover:shadow-2xl transition-shadow duration-300 h-full">
      <CardHeader>
        <CardTitle className="text-[#3B1C32] text-xl font-bold">CampusCHAT Users</CardTitle>
        <CardDescription className="text-gray-600">Showing total visitors for the last 6 months</CardDescription>
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
                <stop offset="5%" stopColor="#63144c" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#63144c" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillGradient2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a44a8d" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#a44a8d" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <Area
              dataKey="students"
              type="natural"
              fill="url(#fillGradient2)"
              fillOpacity={0.4}
              stroke="#a44a8d"
              stackId="a"
            />
            <Area
              dataKey="faculty"
              type="natural"
              fill="url(#fillGradient1)"
              fillOpacity={0.4}
              stroke="#63144c"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none text-[#3B1C32]">
              Trending up by 5.2% this month <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
            <div className="flex items-center gap-2 leading-none text-gray-500">January - June 2024</div>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}

