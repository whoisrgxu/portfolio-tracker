# api/api/routes/quotes.py
from fastapi import APIRouter, HTTPException
import finnhub
import os

from schemas.quote import QuoteOut, SearchResult

router = APIRouter()

finnhub_client = finnhub.Client(api_key=os.getenv("FINNHUB_API_KEY"))

@router.get("/", response_model=QuoteOut)
def get_quote(symbol: str):
    try:
        data = finnhub_client.quote(symbol.upper())
        return {
            "symbol": symbol.upper(),
            "price": data.get("c"),
            "day_change": data.get("d"),
            "day_change_percent": data.get("dp"),
        }
    except Exception as e:
        print("Finnhub quote error:", e)
        raise HTTPException(status_code=500, detail="Failed to fetch quote data")

@router.get("/search/{symbol}", response_model=list[SearchResult])
def search_symbol(symbol: str):
    try:
        data = finnhub_client.symbol_lookup(symbol)
        return [
            {"symbol": item["symbol"], "description": item["description"]}
            for item in data.get("result", [])[:1]
        ]
    except Exception as e:
        print("Error during symbol lookup:", e)
        raise HTTPException(status_code=500, detail="Failed to search symbol")
