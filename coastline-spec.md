# CoastLine — Hackathon Build Spec (Claude Code)

**Project**: CoastLine — Personal Financial Lifecycle Planner
**Event**: Hacklanta 2026 (12-hour hackathon, March 28)
**Track**: Queen of Hearts (Finance) + King of Spades (Startup Pitch)
**Team**: 2 people
**Tagline**: "See when you retire. See what's stopping you. Fix it."

---

## 1. PROJECT OVERVIEW

CoastLine is a demo-focused personal finance app that takes a user's career, income, expenses, debts, and assets — then projects four FIRE retirement timelines (Lean, Coast, Barista, Fat FIRE) using Monte Carlo simulations, while providing actionable budgeting insights and debt payoff strategies powered by Claude AI.

**This is a hackathon demo, NOT a production app.** The app ships with 3 preset sample accounts and an interactive "build your own" mode with preset selectable options. No real user auth flows or complex form validation needed.

---

## 2. TECH STACK

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | Next.js 14 (App Router) + Tailwind CSS | Light mode only |
| Backend | Python FastAPI | Monte Carlo engine, Claude API proxy, debt calculations |
| Database | Supabase (Postgres) | Stores sample profiles; Supabase JS client on frontend |
| AI | Claude API (Sonnet) via FastAPI | Budget roast, debt narrative, allocation advice |
| Charts | Recharts | Timeline fan chart, debt payoff bars, Sankey-style flow |
| Deployment | Localhost for demo day | Frontend: `npm run dev`, Backend: `uvicorn` |

---

## 3. SAMPLE ACCOUNTS (Pre-seeded in Supabase)

### Account 1: "Alex" — High Debt / Entry Level
- **Career**: Junior Marketing Coordinator, $42,000/yr
- **Monthly take-home**: ~$2,800
- **Expenses**: Rent $1,200, Car payment $380 (6.9% APR, $18k remaining), Groceries $400, Dining $250, Subscriptions $80, Utilities $150, Insurance $180
- **Debts**: Student loans $45,000 (5.5% APR), Credit card #1 $8,200 (24.99% APR), Credit card #2 $3,400 (29.99% APR)
- **Assets**: Savings $1,200, No retirement accounts
- **Monthly surplus**: NEGATIVE (-$460) — living beyond means
- **Story**: This account demonstrates the "you're bleeding money" warnings, high-APR debt triage, and shows that retirement is currently impossible without changes.

### Account 2: "Jordan" — Average / Early Career
- **Career**: Consultant at mid-size firm, $75,000/yr
- **Monthly take-home**: ~$4,800
- **Expenses**: Rent $1,500, Car payment $320 (4.5% APR, $12k remaining), Groceries $350, Dining $200, Subscriptions $50, Utilities $120, Insurance $160
- **Debts**: Student loans $22,000 (4.5% APR)
- **Assets**: 401k $18,000 (employer matches 4%), Roth IRA $6,500, Savings $8,000
- **Monthly surplus**: ~$580
- **Story**: Demonstrates a "you're on track but could optimize" scenario. Shows Coast FIRE achievable by mid-40s, debt payoff timeline, and allocation recommendations.

### Account 3: "Morgan" — High Earner / Mid-Career
- **Career**: Senior Software Engineer at large tech company, $195,000/yr
- **Monthly take-home**: ~$10,200
- **Expenses**: Rent $2,800, Car payment $550 (3.9% APR, $28k remaining), Groceries $500, Dining $400, Subscriptions $100, Utilities $200, Insurance $250
- **Debts**: Student loans $8,000 (3.5% APR, almost paid off)
- **Assets**: 401k $142,000, Roth IRA $35,000, Brokerage $52,000, Savings $25,000
- **Monthly surplus**: ~$3,500
- **Story**: Demonstrates Fat FIRE projections, portfolio allocation advice, and the "lifestyle vs freedom" tradeoff slider.

### Account 4: "Interactive" — Build Your Own (Preset Selectors)
User picks from dropdown presets rather than typing exact numbers:

**Career preset options**:
- Entry SWE ($70-85k) | Mid SWE ($120-160k) | Senior SWE ($180-250k)
- Entry Consultant ($55-70k) | Senior Consultant ($100-140k)
- Entry Accountant/CPA ($50-65k) | Senior CPA ($85-120k)
- Investment Banking Analyst ($100-130k) | IB Associate ($150-200k)
- Nurse ($55-75k) | Teacher ($40-55k)

**Debt preset options** (selectable as "Low / Medium / High"):
- **Low debt**: $5k student loans (4%), no credit cards
- **Medium debt**: $25k student loans (5.5%), $3k credit card (22%)
- **High debt**: $55k student loans (6%), $12k credit cards across 2 cards (24.99% + 29.99%), $18k car loan (6.9%)

**Asset preset options** (selectable as "Starting Out / Building / Established"):
- **Starting out**: $2k savings, no retirement
- **Building**: $15k 401k, $5k Roth, $5k savings
- **Established**: $80k 401k, $25k Roth, $20k brokerage, $15k savings

**Expense preset options** (selectable as "Frugal / Moderate / Comfortable"):
- **Frugal**: Rent $900, minimal dining, no subscriptions — ~$2,200/mo total
- **Moderate**: Rent $1,400, some dining, basic subscriptions — ~$3,200/mo total
- **Comfortable**: Rent $2,200, regular dining, full subscriptions — ~$4,800/mo total

---

## 4. APP STRUCTURE & PAGES

### 4.1 Landing Page (`/`)
- App name "CoastLine" with tagline
- Brief value prop: 3 sentences max
- "Try a Sample Profile" — 3 cards (Alex, Jordan, Morgan) that load directly into dashboard
- "Build Your Own" button → goes to onboarding wizard
- Clean, minimal, light mode design

### 4.2 Onboarding Wizard (`/onboard`) — Multi-Step (Interactive account only)
**Step 1: Career**
- Dropdown to select career preset (e.g., "Entry SWE ($70-85k)")
- Shows the auto-generated career progression curve below the selector
- Career progression is a static JSON lookup — see Section 6

**Step 2: Monthly Budget**
- Expense level preset selector: Frugal / Moderate / Comfortable
- Shows the category breakdown below (rent, car, groceries, dining, subscriptions, utilities, insurance)
- User CAN manually adjust individual category amounts after selecting a preset

**Step 3: Debts**
- Debt level preset selector: Low / Medium / High
- Shows itemized debt list below (name, balance, APR, min payment)
- User CAN manually adjust or add/remove debts after selecting a preset

**Step 4: Assets**
- Asset level preset selector: Starting Out / Building / Established
- Shows itemized asset list below (401k, Roth, brokerage, savings)
- Optional: employer 401k match % input (default 4%)

**Step 5: Goals**
- "When do you want to retire?" — slider, default 55, range 35-70
- "Desired monthly retirement income" — slider, default $5,000, range $2,000-$15,000
- Safe withdrawal rate — selector: 3.5% / 4% (default, tagged "Recommended") / 4.5%

→ Submit → redirect to `/dashboard`

### 4.3 Dashboard (`/dashboard`) — Tabbed Layout

**Tab: Overview (default)**
- **Retirement Readiness Score**: 0-100 gauge/circle at the top. Calculated from proximity to Coast FIRE.
- **FIRE Timeline Summary**: Compact view showing estimated ages for each FIRE type (e.g., "Coast FIRE: 38 | Lean: 45 | Barista: 42 | Fat: 55"). If a type is unreachable on current trajectory, show "N/A — changes needed"
- **Monthly Cash Flow**: Income → Expenses → Debts → Surplus (or deficit). Simple horizontal bar or Sankey-style visualization.
- **Top 3 Alerts**: Hard-threshold warnings. Examples:
  - 🔴 "You're spending 43% of income on rent (guideline: ≤30%)"
  - 🔴 "Negative monthly surplus: -$460. You're going deeper into debt."
  - 🟡 "Your highest-APR debt (29.99%) is costing you $85/month in interest alone"
  - 🟢 "You're contributing to your 401k — make sure you're getting the full employer match"

**Tab: FIRE Projections**
- **Monte Carlo Fan Chart** (the hero visualization):
  - X-axis: Age (current → 80)
  - Y-axis: Net worth
  - Shows percentile bands: 10th / 25th / 50th / 75th / 90th as gradient fills
  - Four horizontal threshold lines for Lean / Coast / Barista / Fat FIRE target amounts
  - Vertical markers where the median line crosses each FIRE threshold
- **FIRE Definitions Panel**: Small info cards explaining each type:
  - Lean FIRE: 25× bare-minimum annual expenses
  - Coast FIRE: Enough invested that growth alone covers retirement by 65
  - Barista FIRE: Enough that a part-time job covers the gap
  - Fat FIRE: 25× desired comfortable lifestyle annual expenses
- **"What If" Sliders**:
  - "What if you earned $X more per year?" — adjusts salary, re-runs simulation
  - "What if you saved $X more per month?" — adjusts savings rate
  - "What if you retire at age X instead?" — adjusts target
  - Sliders update the chart in near-real-time (debounce 500ms, re-call backend)
- **Gap Analysis**: "To reach Fat FIRE by 50, you need to be earning $X by age Y. Roles that typically pay this: [Senior SWE, Engineering Manager, etc.]" — derived from career progression data.

**Tab: Budget & Debt**
- **Budget Breakdown**: Bar chart or pie chart of expense categories. Each bar color-coded:
  - Green: within recommended % of income
  - Yellow: slightly over guideline
  - Red: significantly over guideline
- **Budget Benchmarks Table**:
  | Category | You | Guideline | Status |
  |----------|-----|-----------|--------|
  | Rent | 43% | ≤30% | 🔴 Over |
  | Car | 14% | ≤10% | 🟡 Slightly over |
  | Dining | 9% | ≤5-10% | 🟢 OK |
  - Guideline percentages (as % of take-home):
    - Rent/Housing: ≤30%
    - Transportation (car + insurance): ≤15%
    - Groceries: ≤10-15%
    - Dining out: ≤5-10%
    - Subscriptions/Entertainment: ≤5-10%
    - Insurance: varies
    - Utilities: ≤5-10%

- **Debt Payoff Visualizer**:
  - Toggle: Avalanche (highest APR first) vs Snowball (lowest balance first)
  - Stacked area chart showing each debt balance over time as it decreases
  - Input at top: "Extra monthly payment toward debt: $___" (slider, default = surplus amount)
  - Shows total interest paid under each strategy
  - Shows payoff completion date for each debt
  - Shows total interest saved: Avalanche vs Snowball comparison

- **Debt Priority Table**:
  | Debt | Balance | APR | Min Payment | Monthly Interest | Priority |
  |------|---------|-----|------------|-----------------|----------|
  | CC #2 | $3,400 | 29.99% | $68 | $84.97 | 🔴 #1 |
  | CC #1 | $8,200 | 24.99% | $164 | $170.77 | 🔴 #2 |
  | Car | $18,000 | 6.9% | $380 | $103.50 | 🟡 #3 |
  | Student | $45,000 | 5.5% | $450 | $206.25 | 🟢 #4 |

**Tab: AI Insights**
- **Budget Roast**: Claude-generated analysis of spending patterns. Tone: direct but constructive, not mean. Example output:
  > "You're spending $250/month dining out while carrying $11,600 in credit card debt at 25-30% APR. Every dollar you redirect from restaurants to your Chase card saves you roughly 30 cents per year in interest. Cutting dining to $100/month and throwing that $150 at your highest-APR card would eliminate it 5 months sooner."

- **Debt Strategy Narrative**: Claude-generated plain-English payoff plan:
  > "Here's your optimal payoff order: Start with Credit Card #2 ($3,400 at 29.99%). At your current surplus, this takes ~7 months. Once that's gone, roll that payment into Credit Card #1. Both cards clear in ~19 months total. Then redirect everything to student loans. Total interest saved vs minimum payments: $4,200."

- **Allocation Advisor**: Claude-generated priority waterfall:
  > "With your $580 monthly surplus, here's where each dollar should go:
  > 1. 401k up to employer match (4%) — you're already doing this ✓
  > 2. Extra $150/mo → Credit Card #2 (29.99% APR — guaranteed 30% return on payoff)
  > 3. Build emergency fund to $14,400 (3 months expenses) — currently at $8,000
  > 4. Max Roth IRA ($7,000/yr = $583/mo) — currently contributing $541/mo
  > 5. Remaining → extra debt payments or taxable brokerage"

- **Refresh button** to re-generate insights with current data

---

## 5. BACKEND API ENDPOINTS (FastAPI)

### `POST /api/simulate`
**Purpose**: Run Monte Carlo simulation for FIRE projections
**Request body**:
```json
{
  "current_age": 25,
  "retirement_target_age": 55,
  "annual_salary": 75000,
  "salary_progression": [
    {"age": 25, "salary": 75000},
    {"age": 29, "salary": 95000},
    {"age": 33, "salary": 120000},
    {"age": 38, "salary": 145000}
  ],
  "monthly_expenses": 3200,
  "monthly_debt_payments": 650,
  "total_debt": 22000,
  "current_assets": {
    "retirement_accounts": 24500,
    "taxable": 0,
    "savings": 8000
  },
  "monthly_savings_rate": 580,
  "employer_match_pct": 4,
  "safe_withdrawal_rate": 0.04,
  "desired_monthly_retirement_income": 5000,
  "lean_monthly_expenses": 2500
}
```
**Response**:
```json
{
  "percentiles": {
    "p10": [{"age": 25, "net_worth": 32500}, ...],
    "p25": [...],
    "p50": [...],
    "p75": [...],
    "p90": [...]
  },
  "fire_milestones": {
    "lean_fire": {"age": 45, "target_amount": 750000, "achievable": true},
    "coast_fire": {"age": 38, "target_amount": 280000, "achievable": true},
    "barista_fire": {"age": 42, "target_amount": 500000, "achievable": true},
    "fat_fire": {"age": 55, "target_amount": 1500000, "achievable": true}
  },
  "retirement_readiness_score": 67,
  "gap_analysis": {
    "fat_fire_by_50": {
      "required_salary_by_age": {"35": 180000, "40": 200000},
      "suggested_roles": ["Senior SWE", "Engineering Manager"]
    }
  }
}
```

**Monte Carlo Parameters**:
- Simulations: 1,000 runs (fast enough for demo)
- Market return: 7% real (fixed), standard deviation: 15%
- Salary growth: follows career progression JSON + 2% annual inflation adjustment
- Each year: new_assets = previous_assets × (1 + random_return) + annual_savings
- FIRE thresholds:
  - Lean FIRE = 25 × lean_annual_expenses
  - Coast FIRE = fat_fire_target / (1.07)^(65 - current_age) — amount that grows to target by 65
  - Barista FIRE = amount where a $25k/yr part-time job + withdrawals cover desired expenses
  - Fat FIRE = 25 × desired_annual_retirement_income

### `POST /api/debt-payoff`
**Purpose**: Calculate debt payoff timelines for avalanche and snowball strategies
**Request body**:
```json
{
  "debts": [
    {"name": "Credit Card #2", "balance": 3400, "apr": 29.99, "min_payment": 68},
    {"name": "Credit Card #1", "balance": 8200, "apr": 24.99, "min_payment": 164},
    {"name": "Car Loan", "balance": 18000, "apr": 6.9, "min_payment": 380},
    {"name": "Student Loans", "balance": 45000, "apr": 5.5, "min_payment": 450}
  ],
  "extra_monthly_payment": 200
}
```
**Response**:
```json
{
  "avalanche": {
    "total_months": 68,
    "total_interest_paid": 12450,
    "payoff_schedule": [
      {
        "name": "Credit Card #2",
        "payoff_month": 7,
        "interest_paid": 380
      },
      ...
    ],
    "monthly_balances": [
      {"month": 0, "Credit Card #2": 3400, "Credit Card #1": 8200, "Car Loan": 18000, "Student Loans": 45000},
      {"month": 1, "Credit Card #2": 3100, ...},
      ...
    ]
  },
  "snowball": {
    "total_months": 72,
    "total_interest_paid": 14200,
    "payoff_schedule": [...],
    "monthly_balances": [...]
  },
  "interest_saved_avalanche": 1750
}
```

### `POST /api/budget-analysis`
**Purpose**: Analyze budget against benchmarks, return hard-threshold warnings
**Request body**:
```json
{
  "monthly_take_home": 4800,
  "expenses": {
    "rent": 1500,
    "car_payment": 320,
    "groceries": 350,
    "dining": 200,
    "subscriptions": 50,
    "utilities": 120,
    "insurance": 160
  },
  "total_debt_payments": 650,
  "total_monthly_expenses": 3350
}
```
**Response**:
```json
{
  "surplus": 580,
  "is_deficit": false,
  "benchmarks": [
    {"category": "rent", "actual_pct": 31.25, "guideline_max_pct": 30, "status": "yellow"},
    {"category": "dining", "actual_pct": 4.17, "guideline_max_pct": 10, "status": "green"},
    ...
  ],
  "alerts": [
    {"severity": "yellow", "message": "Rent is 31% of income (guideline: ≤30%)"},
    {"severity": "green", "message": "Dining spending is within budget"}
  ]
}
```

**Benchmark thresholds** (% of monthly take-home):
| Category | Green | Yellow | Red |
|----------|-------|--------|-----|
| Rent/Housing | ≤28% | 28-35% | >35% |
| Transportation | ≤12% | 12-18% | >18% |
| Groceries | ≤12% | 12-18% | >18% |
| Dining | ≤8% | 8-15% | >15% |
| Subscriptions | ≤5% | 5-10% | >10% |
| Utilities | ≤8% | 8-12% | >12% |

### `POST /api/ai-insights`
**Purpose**: Generate Claude-powered insights (budget roast, debt narrative, allocation advice)
**Request body**: Full profile object (all income, expenses, debts, assets, career data)
**Response**:
```json
{
  "budget_roast": "You're spending $250/month dining out while carrying...",
  "debt_strategy": "Here's your optimal payoff order...",
  "allocation_advice": "With your $580 monthly surplus, here's where each dollar should go..."
}
```

**Claude API call details**:
- Model: `claude-sonnet-4-20250514`
- Called from FastAPI backend (server-side, key in env var)
- System prompt instructs Claude to:
  1. Be direct and constructive, not preachy
  2. Always reference specific dollar amounts from the user's data
  3. Quantify the impact of recommendations ("saves you $X/year", "retire Y years sooner")
  4. Return JSON with three keys: `budget_roast`, `debt_strategy`, `allocation_advice`
  5. Each response should be 3-5 sentences, concise
  6. Priority order for allocation: 401k match → high-APR debt → emergency fund (3-6mo) → Roth IRA max → remaining debt → taxable brokerage
  7. Include a disclaimer that this is educational, not financial advice

---

## 6. CAREER PROGRESSION DATA (Static JSON)

File: `data/career_paths.json`

```json
{
  "swe": {
    "label": "Software Engineer",
    "progression": [
      {"level": "Junior/SWE I", "years_range": [0, 2], "salary_range": [70000, 90000], "median": 82000},
      {"level": "SWE II", "years_range": [2, 5], "salary_range": [90000, 130000], "median": 110000},
      {"level": "Senior SWE", "years_range": [5, 10], "salary_range": [130000, 200000], "median": 165000},
      {"level": "Staff SWE", "years_range": [10, 15], "salary_range": [180000, 280000], "median": 220000},
      {"level": "Principal/Distinguished", "years_range": [15, 25], "salary_range": [250000, 400000], "median": 310000}
    ]
  },
  "consultant": {
    "label": "Management Consultant",
    "progression": [
      {"level": "Analyst", "years_range": [0, 2], "salary_range": [55000, 75000], "median": 65000},
      {"level": "Consultant", "years_range": [2, 5], "salary_range": [75000, 110000], "median": 90000},
      {"level": "Senior Consultant", "years_range": [5, 8], "salary_range": [100000, 145000], "median": 120000},
      {"level": "Manager", "years_range": [8, 12], "salary_range": [130000, 180000], "median": 155000},
      {"level": "Senior Manager/Director", "years_range": [12, 20], "salary_range": [160000, 250000], "median": 200000}
    ]
  },
  "investment_banking": {
    "label": "Investment Banking",
    "progression": [
      {"level": "Analyst", "years_range": [0, 3], "salary_range": [100000, 140000], "median": 120000},
      {"level": "Associate", "years_range": [3, 6], "salary_range": [150000, 220000], "median": 185000},
      {"level": "VP", "years_range": [6, 10], "salary_range": [200000, 350000], "median": 275000},
      {"level": "Director/ED", "years_range": [10, 15], "salary_range": [300000, 500000], "median": 400000},
      {"level": "Managing Director", "years_range": [15, 25], "salary_range": [500000, 1000000], "median": 700000}
    ]
  },
  "cpa": {
    "label": "Accountant / CPA",
    "progression": [
      {"level": "Staff Accountant", "years_range": [0, 3], "salary_range": [48000, 65000], "median": 55000},
      {"level": "Senior Accountant", "years_range": [3, 6], "salary_range": [62000, 85000], "median": 72000},
      {"level": "Manager", "years_range": [6, 10], "salary_range": [80000, 115000], "median": 95000},
      {"level": "Senior Manager", "years_range": [10, 15], "salary_range": [100000, 140000], "median": 120000},
      {"level": "Partner/Director", "years_range": [15, 25], "salary_range": [130000, 250000], "median": 180000}
    ]
  },
  "nurse": {
    "label": "Registered Nurse",
    "progression": [
      {"level": "New Grad RN", "years_range": [0, 2], "salary_range": [52000, 68000], "median": 60000},
      {"level": "RN (experienced)", "years_range": [2, 7], "salary_range": [65000, 85000], "median": 75000},
      {"level": "Charge Nurse / Specialist", "years_range": [7, 12], "salary_range": [78000, 100000], "median": 88000},
      {"level": "Nurse Practitioner / CRNA", "years_range": [12, 20], "salary_range": [95000, 160000], "median": 120000}
    ]
  },
  "teacher": {
    "label": "K-12 Teacher",
    "progression": [
      {"level": "Entry Teacher", "years_range": [0, 5], "salary_range": [38000, 48000], "median": 43000},
      {"level": "Mid-Career Teacher", "years_range": [5, 15], "salary_range": [45000, 62000], "median": 53000},
      {"level": "Senior Teacher / Dept Head", "years_range": [15, 25], "salary_range": [55000, 75000], "median": 65000},
      {"level": "Admin / Principal", "years_range": [20, 30], "salary_range": [70000, 110000], "median": 88000}
    ]
  },
  "data_scientist": {
    "label": "Data Scientist",
    "progression": [
      {"level": "Junior DS", "years_range": [0, 2], "salary_range": [75000, 100000], "median": 88000},
      {"level": "Data Scientist", "years_range": [2, 5], "salary_range": [100000, 140000], "median": 120000},
      {"level": "Senior DS", "years_range": [5, 10], "salary_range": [135000, 190000], "median": 160000},
      {"level": "Staff/Principal DS", "years_range": [10, 15], "salary_range": [175000, 260000], "median": 210000}
    ]
  },
  "product_manager": {
    "label": "Product Manager",
    "progression": [
      {"level": "Associate PM", "years_range": [0, 2], "salary_range": [70000, 95000], "median": 82000},
      {"level": "Product Manager", "years_range": [2, 5], "salary_range": [95000, 140000], "median": 115000},
      {"level": "Senior PM", "years_range": [5, 10], "salary_range": [135000, 200000], "median": 165000},
      {"level": "Director of Product", "years_range": [10, 15], "salary_range": [180000, 280000], "median": 225000},
      {"level": "VP Product", "years_range": [15, 25], "salary_range": [250000, 400000], "median": 320000}
    ]
  }
}
```

---

## 7. SUPABASE SCHEMA

### Table: `profiles`
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL, -- "alex", "jordan", "morgan", "interactive"
  is_sample BOOLEAN DEFAULT true,
  current_age INTEGER NOT NULL,
  career_path TEXT NOT NULL, -- key from career_paths.json
  career_level_index INTEGER NOT NULL, -- which level they're currently at
  annual_salary NUMERIC NOT NULL,
  monthly_take_home NUMERIC NOT NULL,
  employer_match_pct NUMERIC DEFAULT 4,
  retirement_target_age INTEGER DEFAULT 55,
  desired_monthly_retirement_income NUMERIC DEFAULT 5000,
  safe_withdrawal_rate NUMERIC DEFAULT 0.04,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Table: `expenses`
```sql
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL, -- "rent", "car_payment", "groceries", "dining", "subscriptions", "utilities", "insurance", or custom
  label TEXT NOT NULL, -- display name
  amount NUMERIC NOT NULL, -- monthly amount
  is_custom BOOLEAN DEFAULT false
);
```

### Table: `debts`
```sql
CREATE TABLE debts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  balance NUMERIC NOT NULL,
  apr NUMERIC NOT NULL, -- as percentage, e.g., 29.99
  min_payment NUMERIC NOT NULL
);
```

### Table: `assets`
```sql
CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- "401k", "roth_ira", "brokerage", "savings"
  balance NUMERIC NOT NULL
);
```

---

## 8. FRONTEND FILE STRUCTURE

```
coastline/
├── app/
│   ├── layout.tsx              # Root layout, light mode, Tailwind
│   ├── page.tsx                # Landing page with sample profile cards
│   ├── onboard/
│   │   └── page.tsx            # Multi-step wizard (interactive account)
│   └── dashboard/
│       └── page.tsx            # Tabbed dashboard (loads profile by query param ?profile=alex)
├── components/
│   ├── landing/
│   │   └── ProfileCard.tsx     # Sample account card component
│   ├── onboard/
│   │   ├── StepCareer.tsx
│   │   ├── StepBudget.tsx
│   │   ├── StepDebts.tsx
│   │   ├── StepAssets.tsx
│   │   └── StepGoals.tsx
│   ├── dashboard/
│   │   ├── TabOverview.tsx     # Score, cash flow, alerts
│   │   ├── TabFire.tsx         # Monte Carlo chart, FIRE milestones, what-if sliders
│   │   ├── TabBudgetDebt.tsx   # Budget breakdown, debt payoff visualizer
│   │   └── TabAiInsights.tsx   # Claude-generated insights
│   └── charts/
│       ├── FanChart.tsx        # Monte Carlo percentile fan (Recharts AreaChart)
│       ├── DebtPayoffChart.tsx # Stacked area debt visualization
│       ├── BudgetBarChart.tsx  # Category spending vs benchmarks
│       └── CashFlowBar.tsx    # Income → Expenses → Surplus horizontal bar
├── lib/
│   ├── supabase.ts            # Supabase client init
│   ├── api.ts                 # Fetch helpers for FastAPI endpoints
│   └── types.ts               # TypeScript types for Profile, Debt, Asset, etc.
├── data/
│   └── career_paths.json      # Static career progression data
├── public/
├── tailwind.config.ts
├── next.config.js
└── package.json
```

---

## 9. BACKEND FILE STRUCTURE

```
backend/
├── main.py                    # FastAPI app, CORS config, route registration
├── routers/
│   ├── simulate.py            # POST /api/simulate — Monte Carlo engine
│   ├── debt.py                # POST /api/debt-payoff — avalanche/snowball calc
│   ├── budget.py              # POST /api/budget-analysis — benchmarks & alerts
│   └── insights.py            # POST /api/ai-insights — Claude API proxy
├── models/
│   └── schemas.py             # Pydantic models for request/response
├── services/
│   ├── monte_carlo.py         # NumPy simulation logic
│   ├── debt_calculator.py     # Debt payoff calculation logic
│   ├── budget_analyzer.py     # Benchmark comparison logic
│   └── claude_client.py       # Claude API wrapper
├── data/
│   └── career_paths.json      # Copy of career progression data
├── requirements.txt           # fastapi, uvicorn, numpy, anthropic, pydantic
└── .env                       # ANTHROPIC_API_KEY=sk-...
```

---

## 10. CLAUDE API SYSTEM PROMPT (for /api/ai-insights)

```
You are CoastLine's financial insight engine. You analyze a user's complete financial profile and provide three types of advice.

RULES:
1. Be direct and specific. Reference exact dollar amounts from the user's data.
2. Quantify every recommendation: "saves $X/year", "retire Y years sooner", "eliminates debt Z months faster"
3. Keep each section to 3-5 sentences. No fluff.
4. Priority order for surplus allocation:
   a. 401k contributions up to employer match (free money)
   b. Pay down highest-APR debt (guaranteed return = APR%)
   c. Emergency fund to 3-6 months of expenses
   d. Max Roth IRA ($7,000/year for 2025-2026)
   e. Pay remaining debt
   f. Taxable brokerage investments
5. For debt strategy, always recommend avalanche (highest APR first) but mention snowball as alternative for motivation
6. If the user has a negative surplus (deficit), lead with that urgently
7. Tone: like a smart friend who's good with money, not a lecturing financial advisor

Return ONLY a JSON object with these three keys:
{
  "budget_roast": "...",
  "debt_strategy": "...",
  "allocation_advice": "..."
}

No markdown, no backticks, no preamble.
```

---

## 11. KEY DESIGN DECISIONS

- **Light mode only** — saves design time
- **Recharts for all charts** — consistent API, works well with Next.js
- **No real auth** — sample accounts loaded by slug, interactive account stored in Supabase but no login flow
- **Monte Carlo on backend** — 1,000 simulations via NumPy, returns percentile bands
- **7% real return fixed** — no user toggle, simplifies model
- **Safe withdrawal rate user-adjustable** — 3.5% / 4% / 4.5%, default 4%
- **Career data is static JSON** — no external API calls during demo, reliable
- **Claude calls debounced** — AI insights tab fetches once on tab open, user can hit "Refresh" to regenerate
- **Preset selectors for interactive account** — reduces onboarding friction for demo

---

## 12. TWELVE-HOUR BUILD PLAN

Split between 2 teammates. **Person A** = Frontend. **Person B** = Backend.

| Time | Person A (Frontend) | Person B (Backend) |
|------|--------------------|--------------------|
| 9:00-9:30 | Scaffold Next.js + Tailwind, set up Supabase client | Scaffold FastAPI, set up Supabase tables, seed sample data |
| 9:30-10:30 | Build landing page with 3 sample profile cards + "Build Your Own" CTA | Build `/api/budget-analysis` endpoint (benchmarks, alerts) |
| 10:30-11:30 | Build onboarding wizard (Steps 1-5) with preset selectors | Build `/api/debt-payoff` endpoint (avalanche + snowball) |
| 11:30-12:30 | Build Dashboard shell: tab navigation, load profile data | Build `/api/simulate` Monte Carlo engine (NumPy) |
| 12:30-1:15 | LUNCH | LUNCH |
| 1:15-2:15 | Build TabOverview (score gauge, cash flow bar, alerts) | Build `/api/ai-insights` Claude integration |
| 2:15-3:30 | Build TabFire (Monte Carlo fan chart, FIRE milestones) | Add what-if slider re-simulation support, test all endpoints |
| 3:30-4:30 | Build TabBudgetDebt (budget bars, debt payoff stacked chart, toggle) | Debug, optimize Monte Carlo speed, test with all 3 sample accounts |
| 4:30-5:30 | Build TabAiInsights (display Claude responses, refresh button) | Help frontend, fix data formatting issues |
| 5:30-6:15 | Polish: transitions, loading states, responsive tweaks | Polish: error handling, response formatting |
| 6:15-6:45 | End-to-end demo walkthrough with all 3 sample accounts | Help prep pitch, test edge cases |

---

## 13. DEMO SCRIPT (for judges)

1. **Open landing page**: "CoastLine tells you when you can retire — and what's stopping you."
2. **Click "Alex" (high debt profile)**: Dashboard loads → Overview tab shows Retirement Score of 12/100, three red alerts, negative cash flow.
3. **Switch to Budget & Debt tab**: Show the debt priority table. "Alex's 29.99% credit card is costing $85/month in pure interest." Toggle between avalanche and snowball. "Avalanche saves $1,750 in interest."
4. **Switch to AI Insights tab**: Claude's budget roast appears — "You're $460 in the hole every month. Before thinking about retirement, you need to cut $500 from spending or increase income."
5. **Go back to landing, click "Morgan" (high earner)**: Dashboard shows Score of 78/100, Coast FIRE at 38, Fat FIRE at 52.
6. **Switch to FIRE tab**: Show the Monte Carlo fan chart. Drag the "save $500 more/month" slider — watch Fat FIRE age drop from 52 to 48 in real-time.
7. **Show "Build Your Own"**: Quick walkthrough of preset selectors. "Anyone can model their own path in under 60 seconds."
8. **Close with pitch**: "Every FIRE calculator online is a single static formula. CoastLine runs a thousand simulations on your actual career path and tells you not just when — but what lever to pull to get there sooner."

---

## 14. ENV VARIABLES

```bash
# Backend (.env)
ANTHROPIC_API_KEY=sk-ant-...
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJ...

# Frontend (.env.local)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 15. PACKAGES

### Frontend (package.json)
```
next, react, react-dom, tailwindcss, @supabase/supabase-js, recharts, lucide-react
```

### Backend (requirements.txt)
```
fastapi
uvicorn[standard]
numpy
anthropic
pydantic
python-dotenv
httpx
```
