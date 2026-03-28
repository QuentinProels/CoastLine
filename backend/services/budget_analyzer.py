BENCHMARKS = {
    "rent": {"label": "Rent/Housing", "green_max": 28, "yellow_max": 35},
    "car_payment": {"label": "Transportation", "green_max": 12, "yellow_max": 18},
    "groceries": {"label": "Groceries", "green_max": 12, "yellow_max": 18},
    "dining": {"label": "Dining Out", "green_max": 8, "yellow_max": 15},
    "subscriptions": {"label": "Subscriptions", "green_max": 5, "yellow_max": 10},
    "utilities": {"label": "Utilities", "green_max": 8, "yellow_max": 12},
    "insurance": {"label": "Insurance", "green_max": 10, "yellow_max": 15},
}


def analyze_budget(
    monthly_take_home: float,
    expenses: dict,
    total_debt_payments: float = 0,
    total_monthly_expenses: float = 0,
) -> dict:
    if monthly_take_home <= 0:
        monthly_take_home = 1  # prevent division by zero

    benchmarks = []
    alerts = []

    for category, benchmark in BENCHMARKS.items():
        amount = expenses.get(category, 0)
        if amount == 0:
            continue

        actual_pct = round((amount / monthly_take_home) * 100, 2)

        if actual_pct <= benchmark["green_max"]:
            status = "green"
        elif actual_pct <= benchmark["yellow_max"]:
            status = "yellow"
        else:
            status = "red"

        benchmarks.append(
            {
                "category": category,
                "label": benchmark["label"],
                "amount": amount,
                "actual_pct": actual_pct,
                "guideline_max_pct": benchmark["green_max"],
                "status": status,
            }
        )

        if status == "red":
            alerts.append(
                {
                    "severity": "red",
                    "message": f"{benchmark['label']} is {actual_pct}% of income (guideline: <={benchmark['green_max']}%)",
                }
            )
        elif status == "yellow":
            alerts.append(
                {
                    "severity": "yellow",
                    "message": f"{benchmark['label']} is {actual_pct}% of income (guideline: <={benchmark['green_max']}%)",
                }
            )
        else:
            alerts.append(
                {
                    "severity": "green",
                    "message": f"{benchmark['label']} spending is within budget at {actual_pct}%",
                }
            )

    # Calculate surplus
    if total_monthly_expenses == 0:
        total_monthly_expenses = sum(expenses.get(k, 0) for k in BENCHMARKS)

    total_outflow = total_monthly_expenses + total_debt_payments
    surplus = round(monthly_take_home - total_outflow, 2)

    if surplus < 0:
        alerts.insert(
            0,
            {
                "severity": "red",
                "message": f"Negative monthly surplus: -${abs(surplus):.0f}. You're going deeper into debt.",
            },
        )

    return {
        "surplus": surplus,
        "is_deficit": surplus < 0,
        "benchmarks": benchmarks,
        "alerts": alerts,
    }
