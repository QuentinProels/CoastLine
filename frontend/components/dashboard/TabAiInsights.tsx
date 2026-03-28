'use client';

import { useEffect, useState } from 'react';
import { getAiInsights } from '@/lib/api';
import type { FullProfile, AiInsightsResult } from '@/lib/types';
import { RefreshCw, Brain, CreditCard, PiggyBank } from 'lucide-react';

export default function TabAiInsights({ data }: { data: FullProfile }) {
  const [insights, setInsights] = useState<AiInsightsResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { profile, expenses, debts, assets } = data;

  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const totalDebtPayments = debts.reduce((s, d) => s + d.min_payment, 0);
  const surplus = profile.monthly_take_home - totalExpenses - totalDebtPayments;

  const fetchInsights = async () => {
    setLoading(true);
    setError(null);
    try {
      const expenseMap: Record<string, number> = {};
      expenses.forEach((e) => { expenseMap[e.category] = (expenseMap[e.category] || 0) + e.amount; });

      const assetMap: Record<string, number> = {};
      assets.forEach((a) => { assetMap[a.type] = (assetMap[a.type] || 0) + a.balance; });

      const result = await getAiInsights({
        name: profile.name,
        annual_salary: profile.annual_salary,
        monthly_take_home: profile.monthly_take_home,
        expenses: expenseMap,
        debts: debts.map((d) => ({ name: d.name, balance: d.balance, apr: d.apr, min_payment: d.min_payment })),
        assets: assetMap,
        monthly_surplus: surplus,
        career_path: profile.career_path,
        retirement_target_age: profile.retirement_target_age,
        desired_monthly_retirement_income: profile.desired_monthly_retirement_income,
      });
      setInsights(result as AiInsightsResult);
    } catch (err) {
      console.error('AI insights failed:', err);
      setError('Failed to generate insights. Make sure the backend is running and the Anthropic API key is configured.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInsights();
  }, [data]);

  if (loading) {
    return (
      <div className="py-16 text-center">
        <Brain className="w-12 h-12 text-blue-400 mx-auto mb-4 animate-pulse" />
        <p className="text-gray-500">Claude is analyzing your finances...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-700 mb-3">{error}</p>
        <button onClick={fetchInsights} className="text-red-600 hover:text-red-800 font-medium text-sm">
          Try Again
        </button>
      </div>
    );
  }

  const sections = [
    { key: 'budget_roast', title: 'Budget Roast', icon: Brain, color: 'border-red-200 bg-red-50', iconColor: 'text-red-500' },
    { key: 'debt_strategy', title: 'Debt Strategy', icon: CreditCard, color: 'border-blue-200 bg-blue-50', iconColor: 'text-blue-500' },
    { key: 'allocation_advice', title: 'Allocation Advice', icon: PiggyBank, color: 'border-green-200 bg-green-50', iconColor: 'text-green-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">AI-Powered Insights</h3>
        <button
          onClick={fetchInsights}
          disabled={loading}
          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {sections.map(({ key, title, icon: Icon, color, iconColor }) => (
        <div key={key} className={`rounded-xl border-2 p-6 ${color}`}>
          <div className="flex items-center gap-2 mb-3">
            <Icon className={`w-5 h-5 ${iconColor}`} />
            <h4 className="font-semibold text-gray-900">{title}</h4>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
            {insights ? insights[key as keyof AiInsightsResult] : ''}
          </p>
        </div>
      ))}

      <p className="text-xs text-gray-400 text-center">
        Powered by Claude AI. This is educational content, not personalized financial advice.
      </p>
    </div>
  );
}
