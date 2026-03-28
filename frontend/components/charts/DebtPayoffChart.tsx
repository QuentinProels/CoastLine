'use client';

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'];

interface Props {
  data: {
    monthly_balances: Record<string, number>[];
    total_months: number;
    payoff_schedule: { name: string; payoff_month: number }[];
  };
  debtNames: string[];
}

export default function DebtPayoffChart({ data, debtNames }: Props) {
  const formatDollar = (value: number) => {
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  };

  // Sample every N months for large datasets
  const step = data.monthly_balances.length > 60 ? Math.ceil(data.monthly_balances.length / 60) : 1;
  const chartData = data.monthly_balances.filter((_, i) => i % step === 0 || i === data.monthly_balances.length - 1);

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11 }}
            tickLine={false}
            label={{ value: 'Months', position: 'insideBottomRight', offset: -5, fontSize: 11 }}
          />
          <YAxis tickFormatter={formatDollar} tick={{ fontSize: 11 }} tickLine={false} width={50} />
          <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
          <Legend />
          {debtNames.map((name, i) => (
            <Area
              key={name}
              type="monotone"
              dataKey={name}
              stackId="1"
              stroke={COLORS[i % COLORS.length]}
              fill={COLORS[i % COLORS.length]}
              fillOpacity={0.6}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
