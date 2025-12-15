import os
import requests
from datetime import datetime, timedelta, timezone

ALPHA_VANTAGE_API_KEY = os.getenv("ALPHA_VANTAGE_API_KEY")

def get_unix_timestamp_days_ago(days: int) -> int:
    return int(datetime.now(timezone.utc).timestamp() - (days * 86400))

def fetch_stock_history(symbol: str, from_unix: int, to_unix: int):
    # Use timezone-aware datetime objects
    from_date = datetime.fromtimestamp(from_unix, timezone.utc).date()
    to_date = datetime.fromtimestamp(to_unix, timezone.utc).date()

    url = (
        f"https://www.alphavantage.co/query?"
        f"function=TIME_SERIES_DAILY&symbol={symbol}&apikey={ALPHA_VANTAGE_API_KEY}"
    )
    resp = requests.get(url)
    data = resp.json()

    if "Time Series (Daily)" not in data:
        raise Exception(data.get("Note") or data.get("Error Message") or data.get("Information") or str(data))

    time_series = data["Time Series (Daily)"]
    result = []

    for date_str, day_data in time_series.items():
        try:
            date_obj = datetime.strptime(date_str, "%Y-%m-%d").date()
            if from_date <= date_obj <= to_date:
                result.append({
                    "date": date_obj,
                    "close": float(day_data["4. close"])
                })
        except Exception as e:
            print(f"Skipping invalid data point {date_str}: {e}")
            continue

    return sorted(result, key=lambda x: x["date"])
