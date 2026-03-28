from fastapi import APIRouter, HTTPException
from models.schemas import AiInsightsRequest
from services.claude_client import get_ai_insights

router = APIRouter()


@router.post("/api/ai-insights")
async def ai_insights(req: AiInsightsRequest):
    try:
        result = get_ai_insights(req.model_dump())
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"AI insights generation failed: {str(e)}"
        )
