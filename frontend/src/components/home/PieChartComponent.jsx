import React, { useMemo } from "react";
import { TrendingUp } from "lucide-react";
import { Label, Pie, PieChart } from "recharts";

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
  { category: "Students", count: 4500, fill: "#663059" }, // Custom color for Students
  { category: "Faculty", count: 1000, fill: "#a44a8d" }, // Custom color for Faculty
];

const chartConfig = {
  count: { label: "Population" },
  Students: { label: "Students", color: "#542a49" },
  Faculty: { label: "Faculty", color: "#1A1A1D" },
};

export function PieChartComponent() {
  const totalPopulation = useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.count, 0);
  }, []);

  return (
    <Card className="flex flex-col border-none shadow-black shadow-2xl bg-white" >
      <CardHeader className="items-center pb-0">
        <CardTitle>College Distribution</CardTitle>
        <CardDescription>Faculty vs Students</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
              className="bg-white"
            />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="category"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {totalPopulation.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy + 24}
                          className="fill-muted-foreground"
                        >
                          Total Population
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">     
        <div className="leading-none text-muted-foreground">
          Total faculty & students combined
        </div>
      </CardFooter>
    </Card>
  );
}
