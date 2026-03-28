def calculate_payoff(debts: list[dict], extra_monthly_payment: float) -> dict:
    """Calculate debt payoff for both avalanche and snowball strategies."""

    def run_strategy(
        debts_input: list[dict], extra: float, sort_key: str, reverse: bool = True
    ) -> dict:
        # Deep copy debts
        active_debts = [
            {
                "name": d["name"],
                "balance": d["balance"],
                "apr": d["apr"],
                "min_payment": d["min_payment"],
            }
            for d in debts_input
        ]

        # Sort by strategy
        active_debts.sort(key=lambda d: d[sort_key], reverse=reverse)

        monthly_balances = []
        payoff_schedule = []
        total_interest = 0
        month = 0
        max_months = 360  # 30 year cap

        # Record initial balances
        balance_record = {"month": month}
        for d in debts_input:
            balance_record[d["name"]] = d["balance"]
        monthly_balances.append(balance_record)

        paid_off_names = set()

        while any(d["balance"] > 0 for d in active_debts) and month < max_months:
            month += 1
            extra_remaining = extra

            # Apply interest and minimum payments first
            for d in active_debts:
                if d["balance"] <= 0:
                    continue

                # Monthly interest
                monthly_interest = d["balance"] * (d["apr"] / 100) / 12
                total_interest += monthly_interest
                d["balance"] += monthly_interest

                # Minimum payment
                payment = min(d["min_payment"], d["balance"])
                d["balance"] -= payment

                if d["balance"] <= 0:
                    d["balance"] = 0
                    extra_remaining += d["min_payment"] - payment  # freed up payment

            # Apply extra payment to priority debt
            for d in active_debts:
                if d["balance"] <= 0:
                    continue
                payment = min(extra_remaining, d["balance"])
                d["balance"] -= payment
                extra_remaining -= payment

                if d["balance"] <= 0:
                    d["balance"] = 0
                    if d["name"] not in paid_off_names:
                        paid_off_names.add(d["name"])
                        payoff_schedule.append(
                            {
                                "name": d["name"],
                                "payoff_month": month,
                                "interest_paid": 0,
                            }
                        )
                    # Freed min payment rolls to next debt
                    extra_remaining += d["min_payment"]

                if extra_remaining <= 0:
                    break

            # Record balances every month (or every few months for long payoffs)
            if month <= 120 or month % 3 == 0:
                balance_record = {"month": month}
                for d in debts_input:
                    matching = next(
                        (ad for ad in active_debts if ad["name"] == d["name"]), None
                    )
                    balance_record[d["name"]] = (
                        round(matching["balance"], 2) if matching else 0
                    )
                monthly_balances.append(balance_record)

        # Any debts not in payoff schedule are still active
        for d in active_debts:
            if d["name"] not in paid_off_names and d["balance"] <= 0:
                payoff_schedule.append(
                    {
                        "name": d["name"],
                        "payoff_month": month,
                        "interest_paid": 0,
                    }
                )

        return {
            "total_months": month,
            "total_interest_paid": round(total_interest, 2),
            "payoff_schedule": payoff_schedule,
            "monthly_balances": monthly_balances,
        }

    avalanche = run_strategy(debts, extra_monthly_payment, sort_key="apr", reverse=True)
    snowball = run_strategy(
        debts, extra_monthly_payment, sort_key="balance", reverse=False
    )

    interest_saved = round(
        snowball["total_interest_paid"] - avalanche["total_interest_paid"], 2
    )

    return {
        "avalanche": avalanche,
        "snowball": snowball,
        "interest_saved_avalanche": interest_saved,
    }
