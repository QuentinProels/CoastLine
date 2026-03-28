'use client';

import { useRouter } from 'next/navigation';
import { TrendingUp, DollarSign, Target } from 'lucide-react';

const sampleProfiles = [
  {
    slug: 'alex',
    name: 'Alex',
    subtitle: 'High Debt / Entry Level',
    salary: '$42,000/yr',
    story: 'Junior Marketing Coordinator drowning in credit card debt with a negative monthly surplus.',
    color: 'border-red-400 bg-red-50',
    badge: 'bg-red-100 text-red-700',
    badgeText: 'Struggling',
  },
  {
    slug: 'jordan',
    name: 'Jordan',
    subtitle: 'Average / Early Career',
    salary: '$75,000/yr',
    story: 'Mid-size firm consultant with student loans, a 401k, and room to optimize.',
    color: 'border-yellow-400 bg-yellow-50',
    badge: 'bg-yellow-100 text-yellow-700',
    badgeText: 'On Track',
  },
  {
    slug: 'morgan',
    name: 'Morgan',
    subtitle: 'High Earner / Mid-Career',
    salary: '$195,000/yr',
    story: 'Senior SWE with a strong portfolio and clear path to Fat FIRE.',
    color: 'border-green-400 bg-green-50',
    badge: 'bg-green-100 text-green-700',
    badgeText: 'Thriving',
  },
];

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-16 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-3">
            Coast<span className="text-blue-600">Line</span>
          </h1>
          <p className="text-xl text-gray-500 mb-6">
            See when you retire. See what&apos;s stopping you. Fix it.
          </p>
          <p className="text-gray-600 max-w-2xl mx-auto">
            CoastLine projects four FIRE retirement timelines using Monte Carlo simulations,
            analyzes your budget against benchmarks, optimizes your debt payoff strategy,
            and provides AI-powered financial insights — all from your financial profile.
          </p>
        </div>
      </header>

      {/* Sample Profiles */}
      <main className="flex-1 max-w-5xl mx-auto px-6 py-12 w-full">
        <h2 className="text-2xl font-semibold text-center mb-8">Try a Sample Profile</h2>
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {sampleProfiles.map((profile) => (
            <button
              key={profile.slug}
              onClick={() => router.push(`/dashboard?profile=${profile.slug}`)}
              className={`rounded-xl border-2 p-6 text-left transition-all hover:shadow-lg hover:-translate-y-1 ${profile.color}`}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-bold text-gray-900">{profile.name}</h3>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${profile.badge}`}>
                  {profile.badgeText}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-700 mb-1">{profile.subtitle}</p>
              <p className="text-sm text-gray-500 mb-3">{profile.salary}</p>
              <p className="text-sm text-gray-600">{profile.story}</p>
            </button>
          ))}
        </div>

        {/* Build Your Own CTA */}
        <div className="text-center">
          <button
            onClick={() => router.push('/onboard')}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3.5 rounded-xl text-lg font-semibold hover:bg-blue-700 transition-colors shadow-md"
          >
            <Target className="w-5 h-5" />
            Build Your Own Profile
          </button>
          <p className="text-sm text-gray-500 mt-3">Pick from presets — takes under 60 seconds</p>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-4 mt-16">
          {[
            { icon: TrendingUp, text: 'Monte Carlo Projections' },
            { icon: DollarSign, text: 'Debt Payoff Optimizer' },
            { icon: Target, text: 'AI Budget Analysis' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-600">
              <Icon className="w-4 h-4 text-blue-500" />
              {text}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
