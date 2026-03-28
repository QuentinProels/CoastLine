from fastapi import APIRouter
from models.schemas import DebtPayoffRequest
from services.debt_calculator import calculate_payoff

router = APIRouter()


@router.post("/api/debt-payoff")
async def debt_payoff(req: DebtPayoffRequest):
    debts = [d.model_dump() for d in req.debts]
    result = calculate_payoff(debts, req.extra_monthly_payment)
    return result
