from fastapi import APIRouter
from models.schemas import BudgetAnalysisRequest
from services.budget_analyzer import analyze_budget

router = APIRouter()


@router.post("/api/budget-analysis")
async def budget_analysis(req: BudgetAnalysisRequest):
    expenses = req.expenses.model_dump()
    result = analyze_budget(
        monthly_take_home=req.monthly_take_home,
        expenses=expenses,
        total_debt_payments=req.total_debt_payments,
        total_monthly_expenses=req.total_monthly_expenses,
    )
    return result
