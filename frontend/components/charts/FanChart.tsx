'use client';

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import type { SimulationResult } from '@/lib/types';

interface Props {
  data: SimulationResult;
  currentAge: number;
}

export default function FanChart({ data, currentAge }: Props) {
  // Merge percentile data into a single array
  const chartData = data.percentiles.p50.map((point, i) => ({
    age: point.age,
    p10: data.percentiles.p10[i]?.net_worth || 0,
    p25: data.percentiles.p25[i]?.net_worth || 0,
    p50: data.percentiles.p50[i]?.net_worth || 0,
    p75: data.percentiles.p75[i]?.net_worth || 0,
    p90: data.percentiles.p90[i]?.net_worth || 0,
  }));

  const formatDollar = (value: number) => {
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  };

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
          <XAxis dataKey="age" tick={{ fontSize: 12 }} tickLine={false} />
          <YAxis tickFormatter={formatDollar} tick={{ fontSize: 12 }} tickLine={false} width={60} />
          <Tooltip
            formatter={(value: number) => formatDollar(value)}
            labelFormatter={(age) => `Age ${age}`}
          />

          {/* Percentile bands - layered from widest to narrowest */}
          <Area type="monotone" dataKey="p90" stroke="none" fill="#dbeafe" fillOpacity={0.5} name="90th %ile" />
          <Area type="monotone" dataKey="p75" stroke="none" fill="#93c5fd" fillOpacity={0.5} name="75th %ile" />
          <Area type="monotone" dataKey="p50" stroke="#2563eb" strokeWidth={2} fill="#60a5fa" fillOpacity={0.3} name="Median" />
          <Area type="monotone" dataKey="p25" stroke="none" fill="#f0f9ff" fillOpacity={0.8} name="25th %ile" />
          <Area type="monotone" dataKey="p10" stroke="none" fill="#ffffff" fillOpacity={0.9} name="10th %ile" />

          {/* FIRE threshold lines */}
          {data.fire_milestones.lean_fire.achievable && (
            <ReferenceLine y={data.fire_milestones.lean_fire.target_amount} stroke="#10b981" strokeDasharray="5 5" label={{ value: 'Lean', position: 'right', fontSize: 11 }} />
          )}
          {data.fire_milestones.coast_fire.achievable && (
            <ReferenceLine y={data.fire_milestones.coast_fire.target_amount} stroke="#3b82f6" strokeDasharray="5 5" label={{ value: 'Coast', position: 'right', fontSize: 11 }} />
          )}
          {data.fire_milestones.barista_fire.achievable && (
            <ReferenceLine y={data.fire_milestones.barista_fire.target_amount} stroke="#8b5cf6" strokeDasharray="5 5" label={{ value: 'Barista', position: 'right', fontSize: 11 }} />
          )}
          {data.fire_milestones.fat_fire.target_amount < (chartData[chartData.length - 1]?.p90 || 0) * 1.2 && (
            <ReferenceLine y={data.fire_milestones.fat_fire.target_amount} stroke="#f59e0b" strokeDasharray="5 5" label={{ value: 'Fat', position: 'right', fontSize: 11 }} />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
