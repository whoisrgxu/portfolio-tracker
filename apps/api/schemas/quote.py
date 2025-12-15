# api/schemas/holding.py
from pydantic import BaseModel, Field
from typing import List

class QuoteOut(BaseModel):
    symbol: str
    price: float | None
    day_change: float | None
    day_change_percent: float | None

class SearchResult(BaseModel):
    symbol: str
    description: str
