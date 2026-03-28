'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { BudgetBenchmark } from '@/lib/types';

const STATUS_COLORS = { green: '#22c55e', yellow: '#eab308', red: '#ef4444' };

interface Props {
  benchmarks: BudgetBenchmark[];
}

export default function BudgetBarChart({ benchmarks }: Props) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={benchmarks} margin={{ top: 10, right: 10, left: 10, bottom: 0 }} layout="vertical">
          <XAxis type="number" domain={[0, 'auto']} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} />
          <YAxis
            type="category"
            dataKey="label"
            tick={{ fontSize: 11 }}
            width={120}
          />
          <Tooltip
            formatter={(value: number) => `${value}%`}
            labelFormatter={(label) => label}
          />
          <Bar dataKey="actual_pct" name="% of Income" radius={[0, 4, 4, 0]}>
            {benchmarks.map((b, i) => (
              <Cell key={i} fill={STATUS_COLORS[b.status]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
