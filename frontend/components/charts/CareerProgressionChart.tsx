'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
  CartesianGrid,
} from 'recharts';
import { Plus, Trash2, GripVertical } from 'lucide-react';

export interface SalaryPoint {
  age: number;
  salary: number;
  label?: string;
}

interface Props {
  points: SalaryPoint[];
  onChange: (points: SalaryPoint[]) => void;
  currentAge: number;
}

const formatSalary = (value: number) => {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value}`;
};

// Custom dot that shows it's draggable
function DraggableDot(props: any) {
  const { cx, cy, index, activeIndex } = props;
  if (cx == null || cy == null) return null;
  const isActive = index === activeIndex;
  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={isActive ? 10 : 7}
        fill={isActive ? '#2563eb' : '#3b82f6'}
        stroke="#fff"
        strokeWidth={2}
        style={{ cursor: 'ns-resize', transition: 'r 0.15s' }}
      />
      {/* Vertical grip lines to hint drag */}
      <line x1={cx - 2} y1={cy - 3} x2={cx - 2} y2={cy + 3} stroke="#fff" strokeWidth={1} style={{ pointerEvents: 'none' }} />
      <line x1={cx + 2} y1={cy - 3} x2={cx + 2} y2={cy + 3} stroke="#fff" strokeWidth={1} style={{ pointerEvents: 'none' }} />
    </g>
  );
}

// Custom label rendered above each point
function PointLabel(props: any) {
  const { x, y, value, index, points } = props;
  if (x == null || y == null) return null;
  const point = points[index];
  if (!point?.label) return null;
  return (
    <text
      x={x}
      y={y - 16}
      textAnchor="middle"
      fill="#4b5563"
      fontSize={11}
      fontWeight={500}
    >
      {point.label}
    </text>
  );
}

export default function CareerProgressionChart({ points, onChange, currentAge }: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);
  const chartBoundsRef = useRef<{ top: number; bottom: number; minSalary: number; maxSalary: number } | null>(null);

  // Compute chart Y domain
  const salaries = points.map((p) => p.salary);
  const minSalary = 0;
  const maxSalary = Math.max(...salaries) * 1.3;

  // Build interpolated data for smooth line (every age)
  const sorted = [...points].sort((a, b) => a.age - b.age);
  const minAge = Math.min(currentAge, sorted[0]?.age ?? currentAge);
  const maxAge = Math.max(70, sorted[sorted.length - 1]?.age ?? 65);

  const interpolated: { age: number; salary: number }[] = [];
  for (let age = minAge; age <= maxAge; age++) {
    // Find surrounding points
    let before = sorted[0];
    let after = sorted[sorted.length - 1];
    for (let i = 0; i < sorted.length - 1; i++) {
      if (sorted[i].age <= age && sorted[i + 1].age >= age) {
        before = sorted[i];
        after = sorted[i + 1];
        break;
      }
    }
    if (age <= sorted[0].age) {
      interpolated.push({ age, salary: sorted[0].salary });
    } else if (age >= sorted[sorted.length - 1].age) {
      interpolated.push({ age, salary: sorted[sorted.length - 1].salary });
    } else {
      const t = (age - before.age) / (after.age - before.age);
      interpolated.push({ age, salary: Math.round(before.salary + t * (after.salary - before.salary)) });
    }
  }

  // Mouse handlers for drag
  const handleMouseDown = useCallback((index: number) => {
    setActiveIndex(index);
    setDragging(true);

    // Capture chart pixel bounds for mapping
    if (chartRef.current) {
      const svg = chartRef.current.querySelector('.recharts-surface');
      const plotArea = chartRef.current.querySelector('.recharts-cartesian-grid');
      if (plotArea) {
        const rect = plotArea.getBoundingClientRect();
        chartBoundsRef.current = {
          top: rect.top,
          bottom: rect.bottom,
          minSalary,
          maxSalary,
        };
      }
    }
  }, [minSalary, maxSalary]);

  useEffect(() => {
    if (!dragging || activeIndex === null) return;

    const handleMouseMove = (e: MouseEvent) => {
      const bounds = chartBoundsRef.current;
      if (!bounds) return;

      // Map pixel Y to salary
      const pct = 1 - (e.clientY - bounds.top) / (bounds.bottom - bounds.top);
      const clampedPct = Math.max(0, Math.min(1, pct));
      const newSalary = Math.round((bounds.minSalary + clampedPct * (bounds.maxSalary - bounds.minSalary)) / 1000) * 1000;

      const updated = [...points];
      updated[activeIndex] = { ...updated[activeIndex], salary: Math.max(0, newSalary) };
      onChange(updated);
    };

    const handleMouseUp = () => {
      setDragging(false);
      setActiveIndex(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, activeIndex, points, onChange]);

  // Click on chart area to add a point
  const handleChartClick = useCallback(
    (e: any) => {
      if (dragging) return;
      if (!e || !e.activeLabel) return;
      const clickedAge = Number(e.activeLabel);
      // Don't add if too close to an existing point
      if (points.some((p) => Math.abs(p.age - clickedAge) < 2)) return;

      // Interpolate salary at this age
      const match = interpolated.find((d) => d.age === clickedAge);
      const newSalary = match ? match.salary : points[0]?.salary || 50000;

      const updated = [...points, { age: clickedAge, salary: newSalary, label: `Age ${clickedAge}` }]
        .sort((a, b) => a.age - b.age);
      onChange(updated);
    },
    [dragging, points, interpolated, onChange]
  );

  const removePoint = (index: number) => {
    if (points.length <= 1) return;
    onChange(points.filter((_, i) => i !== index));
  };

  const updatePoint = (index: number, field: 'age' | 'salary', value: number) => {
    const updated = [...points];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated.sort((a, b) => a.age - b.age));
  };

  const updateLabel = (index: number, label: string) => {
    const updated = [...points];
    updated[index] = { ...updated[index], label };
    onChange(updated);
  };

  const addPoint = () => {
    const last = sorted[sorted.length - 1];
    const newAge = Math.min((last?.age || currentAge) + 5, 70);
    const newSalary = Math.round((last?.salary || 50000) * 1.2);
    const updated = [...points, { age: newAge, salary: newSalary, label: '' }].sort((a, b) => a.age - b.age);
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {/* Chart */}
      <div ref={chartRef} className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-600">
            Salary Progression — <span className="text-blue-600">drag points to adjust, click chart to add</span>
          </p>
        </div>
        <div className="h-64" style={{ userSelect: 'none' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={interpolated}
              onClick={handleChartClick}
              margin={{ top: 25, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="age"
                tick={{ fontSize: 11 }}
                tickLine={false}
                label={{ value: 'Age', position: 'insideBottomRight', offset: -5, fontSize: 11 }}
              />
              <YAxis
                tickFormatter={formatSalary}
                tick={{ fontSize: 11 }}
                tickLine={false}
                domain={[minSalary, maxSalary]}
                width={55}
              />
              <Tooltip
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Salary']}
                labelFormatter={(age) => `Age ${age}`}
              />
              {/* Interpolated line */}
              <Line
                type="monotone"
                dataKey="salary"
                stroke="#93c5fd"
                strokeWidth={2}
                dot={false}
                activeDot={false}
              />
            </LineChart>
          </ResponsiveContainer>

          {/* Overlay draggable dots using absolute positioning mapped from data */}
          {/* We use ReferenceDots rendered via a second pass */}
        </div>

        {/* Draggable point indicators rendered as overlaid SVG circles via chart */}
        {/* Since Recharts ReferenceDot doesn't support onMouseDown well, we use the dot table below */}
        <div className="flex flex-wrap gap-2 mt-2">
          {sorted.map((point, i) => (
            <span
              key={i}
              className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full cursor-ns-resize select-none ${
                activeIndex === i
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
              onMouseDown={() => handleMouseDown(i)}
            >
              <GripVertical className="w-3 h-3" />
              {point.label || `Age ${point.age}`}: {formatSalary(point.salary)}
            </span>
          ))}
        </div>
      </div>

      {/* Editable Table */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-gray-600">Career Milestones</p>
          <button
            onClick={addPoint}
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            <Plus className="w-3.5 h-3.5" /> Add Milestone
          </button>
        </div>
        <div className="space-y-2">
          {sorted.map((point, i) => {
            const originalIndex = points.findIndex((p) => p === point);
            return (
              <div key={i} className="flex items-center gap-3">
                <input
                  type="text"
                  value={point.label || ''}
                  onChange={(e) => updateLabel(originalIndex, e.target.value)}
                  placeholder="e.g. Senior SWE"
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm"
                />
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-400">Age</span>
                  <input
                    type="number"
                    value={point.age}
                    onChange={(e) => updatePoint(originalIndex, 'age', Number(e.target.value))}
                    min={currentAge}
                    max={70}
                    className="w-16 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-center"
                  />
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-400">$</span>
                  <input
                    type="number"
                    value={point.salary}
                    onChange={(e) => updatePoint(originalIndex, 'salary', Number(e.target.value))}
                    step={5000}
                    min={0}
                    className="w-28 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-right"
                  />
                </div>
                <button
                  onClick={() => removePoint(originalIndex)}
                  disabled={points.length <= 1}
                  className="text-gray-300 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
