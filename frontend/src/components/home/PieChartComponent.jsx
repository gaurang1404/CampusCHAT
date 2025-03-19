"use client"

import { useMemo } from "react"
import { Label, Pie, PieChart } from "recharts"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const chartData = [
  { category: "Students", count: 4500, fill: "#63144c" }, // Primary color
  { category: "Faculty", count: 1000, fill: "#a44a8d" }, // Lighter shade
]

const chartConfig = {
  count: { label: "Population" },
  Students: { label: "Students", color: "#63144c" },
  Faculty: { label: "Faculty", color: "#a44a8d" },
}

export function PieChartComponent() {
  const totalPopulation = useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.count, 0)
  }, [])

  return (
    <Card className="flex flex-col border-none shadow-xl bg-white hover:shadow-2xl transition-shadow duration-300 h-full">
      <CardHeader className="items-center pb-0">
        <CardTitle className="text-[#3B1C32] text-xl font-bold">College Distribution</CardTitle>
        <CardDescription className="text-gray-600">Faculty vs Students</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} className="bg-white" />
            <Pie data={chartData} dataKey="count" nameKey="category" innerRadius={60} strokeWidth={5}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                        <tspan x={viewBox.cx} y={viewBox.cy} className="fill-[#3B1C32] text-3xl font-bold">
                          {totalPopulation.toLocaleString()}
                        </tspan>
                        <tspan x={viewBox.cx} y={viewBox.cy + 24} className="fill-gray-500">
                          Total Population
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="leading-none text-gray-500">Total faculty & students combined</div>
      </CardFooter>
    </Card>
  )
}

