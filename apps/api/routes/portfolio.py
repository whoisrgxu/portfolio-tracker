from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict
from services.finnhub_client import fetch_stock_history, get_unix_timestamp_days_ago
from services.analytics import compute_portfolio_analytics
import os

router = APIRouter()

# Mock user data for now (replace with DB query later)
USER_HOLDINGS = {
    "123": [
        {"symbol": "AAPL", "shares": 10},
        {"symbol": "MSFT", "shares": 5},
        {"symbol": "TSLA", "shares": 3}
    ],
    "456": [
        {"symbol": "NVDA", "shares": 4},
        {"symbol": "AMZN", "shares": 2}
    ],
    "ebfa40f4-2a13-4a8e-ba58-0599546af55c": [
        {"symbol": "AAPL", "shares": 10},
        {"symbol": "MSFT", "shares": 5}
    ]

}

@router.get("/analytics")
async def get_analytics(user_id: str = Query(...)):
    holdings = USER_HOLDINGS.get(user_id)

    if not holdings:
        raise HTTPException(status_code=404, detail="User not found or no holdings")

    from_unix = get_unix_timestamp_days_ago(365)
    to_unix = get_unix_timestamp_days_ago(0)

    raw_data: Dict[str, List[Dict]] = {}

    for holding in holdings:
        try:
            history = fetch_stock_history(holding["symbol"], from_unix, to_unix)
            raw_data[holding["symbol"]] = [
                {
                    **day,
                    "shares": holding["shares"],
                    "value": day["close"] * holding["shares"]
                }
                for day in history
            ]
        except Exception as e:
            print(f"[ERROR] Failed to fetch history for {holding['symbol']}: {e}")
            raise HTTPException(status_code=500, detail=f"{holding['symbol']}: {str(e)}")


    analytics = compute_portfolio_analytics(raw_data)

    # Optionally inject placeholders to match frontend fields
    analytics.update({
        "sharpe_ratio_change": "+0.12",  # You can leave as static or calculate
        "beta": 1.1,
        "beta_change": "+0.03",
        "volatility": 15.6,
        "volatility_change": "-0.7",
        "drawdown_change": "-1.5",
        "expected_shortfall": 4.2,
        "correlation_to_sp500": 0.88,
        "information_ratio": 0.67,
        "sector_exposure": [
            {"name": "Technology", "percentage": 60},
            {"name": "Consumer", "percentage": 25},
            {"name": "Healthcare", "percentage": 15}
        ]
    })


    return analytics
