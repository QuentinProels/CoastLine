import os
import json
from anthropic import Anthropic

SYSTEM_PROMPT = """You are CoastLine's financial insight engine. You analyze a user's complete financial profile and provide three types of advice.

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

IMPORTANT: You must end every response with a brief disclaimer that this is educational content, not personalized financial advice.

Return ONLY a JSON object with these three keys:
{
  "budget_roast": "...",
  "debt_strategy": "...",
  "allocation_advice": "..."
}

No markdown, no backticks, no preamble."""


def get_ai_insights(profile_data: dict) -> dict:
    client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

    user_message = f"""Analyze this financial profile and provide insights:

Name: {profile_data.get('name', 'User')}
Annual Salary: ${profile_data.get('annual_salary', 0):,.0f}
Monthly Take-Home: ${profile_data.get('monthly_take_home', 0):,.0f}
Career Path: {profile_data.get('career_path', 'Unknown')}
Retirement Target Age: {profile_data.get('retirement_target_age', 55)}
Desired Monthly Retirement Income: ${profile_data.get('desired_monthly_retirement_income', 5000):,.0f}

Monthly Expenses: {json.dumps(profile_data.get('expenses', {}), indent=2)}

Debts: {json.dumps(profile_data.get('debts', []), indent=2)}

Assets: {json.dumps(profile_data.get('assets', {}), indent=2)}

Monthly Surplus: ${profile_data.get('monthly_surplus', 0):,.0f}
"""

    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1024,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_message}],
    )

    text = response.content[0].text.strip()

    # Try to parse JSON
    try:
        result = json.loads(text)
        return result
    except json.JSONDecodeError:
        # Try to extract JSON from response
        start = text.find("{")
        end = text.rfind("}") + 1
        if start >= 0 and end > start:
            try:
                return json.loads(text[start:end])
            except json.JSONDecodeError:
                pass

        return {
            "budget_roast": "Unable to generate insights at this time. Please try again.",
            "debt_strategy": "Unable to generate insights at this time. Please try again.",
            "allocation_advice": "Unable to generate insights at this time. Please try again.",
        }
