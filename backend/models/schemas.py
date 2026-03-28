from pydantic import BaseModel
from typing import Optional


class SalaryProgression(BaseModel):
    age: int
    salary: float


class CurrentAssets(BaseModel):
    retirement_accounts: float
    taxable: float
    savings: float


class SimulateRequest(BaseModel):
    current_age: int
    retirement_target_age: int = 55
    annual_salary: float
    salary_progression: list[SalaryProgression]
    monthly_expenses: float
    monthly_debt_payments: float
    total_debt: float
    current_assets: CurrentAssets
    monthly_savings_rate: float
    employer_match_pct: float = 4.0
    safe_withdrawal_rate: float = 0.04
    desired_monthly_retirement_income: float = 5000.0
    lean_monthly_expenses: float = 2500.0


class FireMilestone(BaseModel):
    age: Optional[int]
    target_amount: float
    achievable: bool


class SimulateResponse(BaseModel):
    percentiles: dict[str, list[dict]]
    fire_milestones: dict[str, FireMilestone]
    retirement_readiness_score: int
    gap_analysis: dict


class DebtItem(BaseModel):
    name: str
    balance: float
    apr: float
    min_payment: float


class DebtPayoffRequest(BaseModel):
    debts: list[DebtItem]
    extra_monthly_payment: float = 0


class DebtPayoffResponse(BaseModel):
    avalanche: dict
    snowball: dict
    interest_saved_avalanche: float


class BudgetExpenses(BaseModel):
    rent: float = 0
    car_payment: float = 0
    groceries: float = 0
    dining: float = 0
    subscriptions: float = 0
    utilities: float = 0
    insurance: float = 0


class BudgetAnalysisRequest(BaseModel):
    monthly_take_home: float
    expenses: BudgetExpenses
    total_debt_payments: float = 0
    total_monthly_expenses: float = 0


class BudgetAnalysisResponse(BaseModel):
    surplus: float
    is_deficit: bool
    benchmarks: list[dict]
    alerts: list[dict]


class AiInsightsRequest(BaseModel):
    name: str
    annual_salary: float
    monthly_take_home: float
    expenses: dict
    debts: list[dict]
    assets: dict
    monthly_surplus: float
    career_path: str = ""
    retirement_target_age: int = 55
    desired_monthly_retirement_income: float = 5000


class AiInsightsResponse(BaseModel):
    budget_roast: str
    debt_strategy: str
    allocation_advice: str
