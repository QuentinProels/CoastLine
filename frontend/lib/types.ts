export interface Profile {
  id: string;
  name: string;
  slug: string;
  is_sample: boolean;
  current_age: number;
  career_path: string;
  career_level_index: number;
  annual_salary: number;
  monthly_take_home: number;
  employer_match_pct: number;
  retirement_target_age: number;
  desired_monthly_retirement_income: number;
  safe_withdrawal_rate: number;
  salary_progression?: { age: number; salary: number; label?: string }[] | null;
}

export interface Expense {
  id: string;
  profile_id: string;
  category: string;
  label: string;
  amount: number;
  is_custom: boolean;
}

export interface Debt {
  id: string;
  profile_id: string;
  name: string;
  balance: number;
  apr: number;
  min_payment: number;
}

export interface Asset {
  id: string;
  profile_id: string;
  type: string;
  balance: number;
}

export interface FullProfile {
  profile: Profile;
  expenses: Expense[];
  debts: Debt[];
  assets: Asset[];
}

export interface FireMilestone {
  age: number | null;
  target_amount: number;
  achievable: boolean;
}

export interface SimulationResult {
  percentiles: {
    p10: { age: number; net_worth: number }[];
    p25: { age: number; net_worth: number }[];
    p50: { age: number; net_worth: number }[];
    p75: { age: number; net_worth: number }[];
    p90: { age: number; net_worth: number }[];
  };
  fire_milestones: {
    lean_fire: FireMilestone;
    coast_fire: FireMilestone;
    barista_fire: FireMilestone;
    fat_fire: FireMilestone;
  };
  retirement_readiness_score: number;
  gap_analysis: Record<string, any>;
}

export interface DebtPayoffResult {
  avalanche: {
    total_months: number;
    total_interest_paid: number;
    payoff_schedule: { name: string; payoff_month: number; interest_paid: number }[];
    monthly_balances: Record<string, number>[];
  };
  snowball: {
    total_months: number;
    total_interest_paid: number;
    payoff_schedule: { name: string; payoff_month: number; interest_paid: number }[];
    monthly_balances: Record<string, number>[];
  };
  interest_saved_avalanche: number;
}

export interface BudgetBenchmark {
  category: string;
  label: string;
  amount: number;
  actual_pct: number;
  guideline_max_pct: number;
  status: 'green' | 'yellow' | 'red';
}

export interface BudgetAnalysisResult {
  surplus: number;
  is_deficit: boolean;
  benchmarks: BudgetBenchmark[];
  alerts: { severity: string; message: string }[];
}

export interface AiInsightsResult {
  budget_roast: string;
  debt_strategy: string;
  allocation_advice: string;
}

export interface CareerPath {
  label: string;
  progression: {
    level: string;
    years_range: number[];
    salary_range: number[];
    median: number;
  }[];
}

export interface CareerPaths {
  [key: string]: CareerPath;
}
