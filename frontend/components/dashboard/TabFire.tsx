'use client';

import { useEffect, useState, useCallback } from 'react';
import { runSimulation } from '@/lib/api';
import type { FullProfile, SimulationResult } from '@/lib/types';
import FanChart from '@/components/charts/FanChart';
import careerPaths from '@/data/career_paths.json';
import type { CareerPaths } from '@/lib/types';

const careers = careerPaths as CareerPaths;

function buildSalaryProgression(profile: FullProfile['profile']) {
  if (profile.salary_progression && profile.salary_progression.length > 0) {
    return profile.salary_progression.map((sp) => ({ age: sp.age, salary: sp.salary }));
  }
  const path = careers[profile.career_path];
  if (!path) return [{ age: profile.current_age, salary: profile.annual_salary }];
  return path.progression.map((level) => ({
    age: profile.current_age + level.years_range[0],
    salary: level.median,
  }));
}

export default function TabFire({ data }: { data: FullProfile }) {
  const [sim, setSim] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(true);

  // What-if sliders
  const [extraIncome, setExtraIncome] = useState(0);
  const [extraSavings, setExtraSavings] = useState(0);
  const [retireAge, setRetireAge] = useState(data.profile.retirement_target_age);

  const { profile, expenses, debts, assets } = data;

  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const totalDebtPayments = debts.reduce((s, d) => s + d.min_payment, 0);
  const totalDebt = debts.reduce((s, d) => s + d.balance, 0);
  const surplus = profile.monthly_take_home - totalExpenses - totalDebtPayments;

  const fetchSimulation = useCallback(async () => {
    setLoading(true);
    try {
      const adjustedSalary = profile.annual_salary + extraIncome;
      const adjustedSavings = Math.max(0, surplus + extraSavings);

      const result = await runSimulation({
        current_age: profile.current_age,
        retirement_target_age: retireAge,
        annual_salary: adjustedSalary,
        salary_progression: buildSalaryProgression(profile).map((sp) => ({
          ...sp,
          salary: sp.salary + extraIncome,
        })),
        monthly_expenses: totalExpenses,
        monthly_debt_payments: totalDebtPayments,
        total_debt: totalDebt,
        current_assets: {
          retirement_accounts: assets.filter((a) => ['401k', 'roth_ira'].includes(a.type)).reduce((s, a) => s + a.balance, 0),
          taxable: assets.filter((a) => a.type === 'brokerage').reduce((s, a) => s + a.balance, 0),
          savings: assets.filter((a) => a.type === 'savings').reduce((s, a) => s + a.balance, 0),
        },
        monthly_savings_rate: adjustedSavings,
        employer_match_pct: profile.employer_match_pct,
        safe_withdrawal_rate: profile.safe_withdrawal_rate,
        desired_monthly_retirement_income: profile.desired_monthly_retirement_income,
        lean_monthly_expenses: totalExpenses * 0.7,
      });
      setSim(result as SimulationResult);
    } catch (err) {
      console.error('Simulation failed:', err);
    }
    setLoading(false);
  }, [data, extraIncome, extraSavings, retireAge]);

  useEffect(() => {
    const timeout = setTimeout(fetchSimulation, 500); // debounce
    return () => clearTimeout(timeout);
  }, [fetchSimulation]);

  return (
    <div className="space-y-8">
      {/* Fan Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Monte Carlo Projection</h3>
        {loading && !sim ? (
          <div className="h-80 flex items-center justify-center text-gray-400 animate-pulse">Running 1,000 simulations...</div>
        ) : sim ? (
          <FanChart data={sim} currentAge={profile.current_age} />
        ) : null}
      </div>

      {/* FIRE Milestones */}
      {sim && (
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { key: 'lean_fire', label: 'Lean FIRE', desc: '25x bare-minimum annual expenses', color: 'border-emerald-400 bg-emerald-50' },
            { key: 'coast_fire', label: 'Coast FIRE', desc: 'Growth alone covers retirement by 65', color: 'border-blue-400 bg-blue-50' },
            { key: 'barista_fire', label: 'Barista FIRE', desc: 'Part-time job covers the gap', color: 'border-purple-400 bg-purple-50' },
            { key: 'fat_fire', label: 'Fat FIRE', desc: '25x desired lifestyle expenses', color: 'border-amber-400 bg-amber-50' },
          ].map(({ key, label, desc, color }) => {
            const m = sim.fire_milestones[key as keyof typeof sim.fire_milestones];
            return (
              <div key={key} className={`rounded-xl border-2 p-4 ${color}`}>
                <p className="text-sm font-semibold text-gray-700">{label}</p>
                <p className="text-3xl font-bold text-gray-900 my-1">
                  {m.achievable && m.age ? `Age ${m.age}` : 'N/A'}
                </p>
                <p className="text-xs text-gray-500">{desc}</p>
                <p className="text-xs text-gray-400 mt-1">Target: ${(m.target_amount / 1000).toFixed(0)}k</p>
              </div>
            );
          })}
        </div>
      )}

      {/* What-If Sliders */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">What If...?</h3>
        <div className="space-y-6">
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Extra annual income: <span className="font-semibold text-blue-600">+${extraIncome.toLocaleString()}/yr</span>
            </label>
            <input type="range" min={0} max={100000} step={5000} value={extraIncome} onChange={(e) => setExtraIncome(Number(e.target.value))} className="w-full accent-blue-600" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Extra monthly savings: <span className="font-semibold text-blue-600">+${extraSavings.toLocaleString()}/mo</span>
            </label>
            <input type="range" min={0} max={3000} step={100} value={extraSavings} onChange={(e) => setExtraSavings(Number(e.target.value))} className="w-full accent-blue-600" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Retire at age: <span className="font-semibold text-blue-600">{retireAge}</span>
            </label>
            <input type="range" min={35} max={70} value={retireAge} onChange={(e) => setRetireAge(Number(e.target.value))} className="w-full accent-blue-600" />
          </div>
        </div>
        {loading && <p className="text-xs text-gray-400 mt-3 animate-pulse">Recalculating...</p>}
      </div>

      {/* Gap Analysis */}
      {sim && sim.gap_analysis?.fat_fire_by_50 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-2">Gap Analysis</h3>
          <p className="text-sm text-gray-600">
            To reach Fat FIRE by 50, you&apos;d need to reach a salary of approximately{' '}
            <span className="font-bold">
              ${Object.values(sim.gap_analysis.fat_fire_by_50.required_salary_by_age || {})[1]?.toLocaleString() || 'N/A'}
            </span>{' '}
            by age {Object.keys(sim.gap_analysis.fat_fire_by_50.required_salary_by_age || {})[1] || '?'}.
          </p>
          {sim.gap_analysis.fat_fire_by_50.suggested_roles && (
            <p className="text-sm text-gray-500 mt-2">
              Roles that typically pay this: {sim.gap_analysis.fat_fire_by_50.suggested_roles.join(', ')}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
