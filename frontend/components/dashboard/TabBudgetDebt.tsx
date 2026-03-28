'use client';

import { useEffect, useState } from 'react';
import { getBudgetAnalysis, getDebtPayoff } from '@/lib/api';
import type { FullProfile, BudgetAnalysisResult, DebtPayoffResult } from '@/lib/types';
import BudgetBarChart from '@/components/charts/BudgetBarChart';
import DebtPayoffChart from '@/components/charts/DebtPayoffChart';

export default function TabBudgetDebt({ data }: { data: FullProfile }) {
  const [budget, setBudget] = useState<BudgetAnalysisResult | null>(null);
  const [debtResult, setDebtResult] = useState<DebtPayoffResult | null>(null);
  const [strategy, setStrategy] = useState<'avalanche' | 'snowball'>('avalanche');
  const [extraPayment, setExtraPayment] = useState(0);
  const [loading, setLoading] = useState(true);

  const { profile, expenses, debts } = data;

  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const totalDebtPayments = debts.reduce((s, d) => s + d.min_payment, 0);
  const surplus = profile.monthly_take_home - totalExpenses - totalDebtPayments;

  useEffect(() => {
    setExtraPayment(Math.max(0, Math.round(surplus)));
  }, [surplus]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const expenseMap: Record<string, number> = {};
        expenses.forEach((e) => { expenseMap[e.category] = (expenseMap[e.category] || 0) + e.amount; });

        const results = await Promise.all([
          getBudgetAnalysis({
            monthly_take_home: profile.monthly_take_home,
            expenses: expenseMap,
            total_debt_payments: totalDebtPayments,
            total_monthly_expenses: totalExpenses,
          }),
          debts.length > 0
            ? getDebtPayoff({
                debts: debts.map((d) => ({
                  name: d.name,
                  balance: d.balance,
                  apr: d.apr,
                  min_payment: d.min_payment,
                })),
                extra_monthly_payment: extraPayment,
              })
            : null,
        ]);

        setBudget(results[0] as BudgetAnalysisResult);
        if (results[1]) setDebtResult(results[1] as DebtPayoffResult);
      } catch (err) {
        console.error('Failed to load budget/debt data:', err);
      }
      setLoading(false);
    }
    fetchData();
  }, [data, extraPayment]);

  if (loading && !budget) {
    return <div className="animate-pulse text-gray-400 py-12 text-center">Analyzing budget and debts...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Budget Breakdown */}
      {budget && (
        <>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Budget Breakdown</h3>
            <BudgetBarChart benchmarks={budget.benchmarks} />
          </div>

          {/* Benchmarks Table */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Budget Benchmarks</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 text-gray-500 font-medium">Category</th>
                    <th className="text-right py-2 text-gray-500 font-medium">Amount</th>
                    <th className="text-right py-2 text-gray-500 font-medium">% of Income</th>
                    <th className="text-right py-2 text-gray-500 font-medium">Guideline</th>
                    <th className="text-right py-2 text-gray-500 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {budget.benchmarks.map((b) => (
                    <tr key={b.category} className="border-b border-gray-100">
                      <td className="py-2.5 text-gray-900">{b.label}</td>
                      <td className="text-right py-2.5 text-gray-900">${b.amount.toLocaleString()}</td>
                      <td className="text-right py-2.5 text-gray-700">{b.actual_pct}%</td>
                      <td className="text-right py-2.5 text-gray-500">&le;{b.guideline_max_pct}%</td>
                      <td className="text-right py-2.5">
                        <span className={`inline-block w-3 h-3 rounded-full ${
                          b.status === 'red' ? 'bg-red-500' : b.status === 'yellow' ? 'bg-yellow-500' : 'bg-green-500'
                        }`} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Debt Section */}
      {debts.length > 0 && debtResult && (
        <>
          {/* Strategy Toggle + Extra Payment */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Debt Payoff Strategy</h3>
              <div className="flex bg-gray-100 rounded-lg p-1">
                {(['avalanche', 'snowball'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStrategy(s)}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${
                      strategy === s ? 'bg-white shadow text-gray-900' : 'text-gray-500'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm text-gray-600 mb-1">
                Extra monthly payment: <span className="font-semibold text-blue-600">${extraPayment}</span>
              </label>
              <input
                type="range"
                min={0}
                max={Math.max(2000, surplus * 2)}
                step={50}
                value={extraPayment}
                onChange={(e) => setExtraPayment(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>

            <DebtPayoffChart
              data={strategy === 'avalanche' ? debtResult.avalanche : debtResult.snowball}
              debtNames={debts.map((d) => d.name)}
            />

            {/* Comparison */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-gray-200">
              <div className="text-center">
                <p className="text-xs text-gray-500">Avalanche Total Interest</p>
                <p className="text-lg font-bold text-gray-900">${debtResult.avalanche.total_interest_paid.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">Snowball Total Interest</p>
                <p className="text-lg font-bold text-gray-900">${debtResult.snowball.total_interest_paid.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">Avalanche Saves</p>
                <p className="text-lg font-bold text-green-600">${debtResult.interest_saved_avalanche.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Debt Priority Table */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Debt Priority</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 text-gray-500 font-medium">Debt</th>
                    <th className="text-right py-2 text-gray-500 font-medium">Balance</th>
                    <th className="text-right py-2 text-gray-500 font-medium">APR</th>
                    <th className="text-right py-2 text-gray-500 font-medium">Min Payment</th>
                    <th className="text-right py-2 text-gray-500 font-medium">Monthly Interest</th>
                    <th className="text-right py-2 text-gray-500 font-medium">Priority</th>
                  </tr>
                </thead>
                <tbody>
                  {[...debts]
                    .sort((a, b) => b.apr - a.apr)
                    .map((d, i) => {
                      const monthlyInterest = (d.balance * d.apr / 100 / 12);
                      return (
                        <tr key={d.id} className="border-b border-gray-100">
                          <td className="py-2.5 text-gray-900">{d.name}</td>
                          <td className="text-right py-2.5">${d.balance.toLocaleString()}</td>
                          <td className="text-right py-2.5">{d.apr}%</td>
                          <td className="text-right py-2.5">${d.min_payment}</td>
                          <td className="text-right py-2.5">${monthlyInterest.toFixed(2)}</td>
                          <td className="text-right py-2.5">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                              i === 0 ? 'bg-red-100 text-red-700' : i === 1 ? 'bg-red-50 text-red-600' : 'bg-yellow-50 text-yellow-700'
                            }`}>
                              #{i + 1}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {debts.length === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
          <p className="text-green-700 font-semibold">No debts — you&apos;re debt-free!</p>
        </div>
      )}
    </div>
  );
}
