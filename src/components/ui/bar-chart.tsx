"use client";

import {
  Bar,
  BarChart as RechartsBarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

interface BarChartProps {
  data: Array<{ name: string; hours: number }>;
  xField: string;
  yField: string;
  height?: string | number;
}

export function BarChart({
  data,
  xField,
  yField,
  height = "100%",
}: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart
        data={data}
        margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
      >
        <XAxis
          dataKey={xField}
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}h`}
          width={35}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--background))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "6px",
          }}
          cursor={{ fill: "hsl(var(--muted))" }}
        />
        <Bar
          dataKey={yField}
          fill="currentColor"
          radius={[4, 4, 0, 0]}
          className="fill-primary"
        />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}
