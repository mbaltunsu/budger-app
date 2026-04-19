"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const CATEGORY_COLORS = [
  "#F4633A", "#F4A33A", "#2D7A4F", "#4A90D9", "#9B59B6",
  "#E74C3C", "#1ABC9C", "#F39C12", "#2ECC71", "#3498DB",
];

interface CategorySlice {
  category: string;
  total: string; // minor units as string
}

interface DonutChartProps {
  data: CategorySlice[];
  currency: string;
}

function formatMinor(minor: string, currency: string): string {
  const major = Number(minor) / 100;
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(major);
}

function formatLabel(label: string): string {
  return label.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

interface TooltipProps {
  active?: boolean;
  payload?: { name: string; value: number; payload: { totalMinor: string } }[];
}

function CustomTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.[0]) return null;
  const item = payload[0];
  return (
    <div className="rounded-xl bg-[#FEF9F4] px-3 py-2 text-xs font-semibold shadow-lg">
      <div className="text-[#3A2E28]/70">{formatLabel(item.name)}</div>
      <div className="text-[#3A2E28]">{formatMinor(item.payload.totalMinor, "USD")}</div>
    </div>
  );
}

export function DonutChart({ data, currency }: DonutChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-[#3A2E28]/40">
        No expenses this month
      </div>
    );
  }

  const chartData = data.map((d) => ({
    name: d.category,
    value: Number(d.total),
    totalMinor: d.total,
  }));

  const total = chartData.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            innerRadius={70}
            outerRadius={110}
            paddingAngle={2}
            startAngle={90}
            endAngle={-270}
            isAnimationActive
          >
            {chartData.map((_, i) => (
              <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(value) => (
              <span className="text-xs text-[#3A2E28]/70">{formatLabel(value)}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
      {/* Center total */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xs font-semibold text-[#3A2E28]/50">Total spent</span>
        <span className="text-lg font-extrabold text-[#3A2E28]">
          {formatMinor(String(total), currency)}
        </span>
      </div>
    </div>
  );
}
