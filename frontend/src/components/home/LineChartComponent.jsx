"use client"

import { TrendingUp } from "lucide-react"
import { CartesianGrid, LabelList, Line, LineChart, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartData = [
  { semester: "1st", cgpa: 8.9, fill: "#ffffff" }, // Orange-red
  { semester: "2nd", cgpa: 9.0, fill: "#ffffff" }, // Green
  { semester: "3rd", cgpa: 9.4, fill: "#ffffff" }, // Blue
  { semester: "4th", cgpa: 9.7, fill: "#ffffff" }, // Golden yellow
  { semester: "5th ", cgpa: 9.8, fill: "#ffffff" }, // Blue-violet
]

// Calculate the minimum CGPA value dynamically
const minCgpa = Math.min(...chartData.map((data) => data.cgpa))

const chartConfig = {
  cgpa: {
    label: "CGPA",
    color: "#3B1C32", // Dark Maroon
  },
}

export function LineChartComponent() {
  return (
    <Card className="border-none shadow-black shadow-2xl bg-white">
      <CardHeader>
        <CardTitle>CGPA Progress </CardTitle>
        <CardDescription>Tracking academic performance</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              top: 24,
              left: 24,
              right: 24,
            }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="semester" />
            <YAxis domain={[minCgpa, 10]} /> {/* Dynamic min value, fixed max at 10 */}
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="line"
                  nameKey="cgpa"
                  hideLabel
                />
              }
              className="bg-white"
            />
            <Line
              dataKey="cgpa"
              type="monotone"
              stroke="#3B1C32" // Dark Maroon
              strokeWidth={3}
              dot={{ fill: "#3B1C32" }} // Dark Maroon
              activeDot={{ r: 6 }}
            >
              <LabelList
                position="top"
                offset={12}
                className="fill-foreground"
                fontSize={12}
                dataKey="semester"
              />
            </Line>
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Trending up by 5.2% this semester <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          CGPA trend from 1st to 5th semester
        </div>
      </CardFooter>
    </Card>
  )
}
