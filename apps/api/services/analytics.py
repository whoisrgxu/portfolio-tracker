# services/analytics.py
from typing import List, Dict
import pandas as pd

def merge_portfolio_history(raw_data: Dict[str, List[Dict]]) -> pd.Series:
    df_list = []
    for symbol, history in raw_data.items():
        df = pd.DataFrame(history)
        
        # Convert to datetime if it's in UNIX timestamp
        df["date"] = pd.to_datetime(df["date"], unit="s", errors="coerce")
        df = df.set_index("date")[["value"]]
        df.columns = [symbol]
        df_list.append(df)

    merged = pd.concat(df_list, axis=1).fillna(0)
    portfolio_series = merged.sum(axis=1).sort_index()
    portfolio_series.name = "total_value"
    return portfolio_series

def calculate_daily_returns(portfolio_series: pd.Series) -> pd.Series:
    return portfolio_series.pct_change().dropna()

def calculate_sharpe_ratio(daily_returns: pd.Series, risk_free_rate=0.01):
    excess_returns = daily_returns - (risk_free_rate / 252)
    sharpe = (excess_returns.mean() / excess_returns.std()) * (252 ** 0.5)
    return round(sharpe, 2)

def calculate_var(daily_returns: pd.Series, confidence_level=0.05):
    var = daily_returns.quantile(confidence_level)
    return round(var * 100, 2)

def calculate_max_drawdown(portfolio_series: pd.Series):
    running_max = portfolio_series.cummax()
    drawdown = (portfolio_series - running_max) / running_max
    return round(drawdown.min() * 100, 2)

def compute_portfolio_analytics(raw_data: Dict[str, List[Dict]]):
    portfolio_series = merge_portfolio_history(raw_data)
    daily_returns = calculate_daily_returns(portfolio_series)

    return {
        "sharpe_ratio": calculate_sharpe_ratio(daily_returns),
        "value_at_risk": f"{calculate_var(daily_returns)}%",
        "max_drawdown": f"{calculate_max_drawdown(portfolio_series)}%"
    }
