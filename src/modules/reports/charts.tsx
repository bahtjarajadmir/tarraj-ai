"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatMoney } from "@/lib/money";

const tooltipStyle = {
  backgroundColor: "#151d24",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 8,
  color: "#ffffff",
};

function compact(cents: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(cents / 100);
}

export function MonthlyChart({
  data,
  currency,
}: {
  data: { label: string; income: number; expenses: number }[];
  currency: string;
}) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis
            dataKey="label"
            stroke="#8b98a5"
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#8b98a5"
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => compact(Number(v))}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
            formatter={(value) => formatMoney(Number(value), currency)}
          />
          <Bar
            dataKey="income"
            name="Income"
            fill="#10b981"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="expenses"
            name="Expenses"
            fill="#ef4444"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CategoryChart({
  data,
  currency,
}: {
  data: { name: string; amount: number }[];
  currency: string;
}) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 8 }}>
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="name"
            width={110}
            stroke="#8b98a5"
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
            formatter={(value) => formatMoney(Number(value), currency)}
          />
          <Bar
            dataKey="amount"
            name="Spent"
            fill="#10b981"
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}