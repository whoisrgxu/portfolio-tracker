from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

app = FastAPI(title="Portfolio API")

# allow frontend dev origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class HoldingIn(BaseModel):
    symbol: str
    shares: float
    avgCost: float
    currency: str = "USD"

class HoldingOut(HoldingIn):
    id: str

_DB: list[HoldingOut] = []

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/holdings", response_model=List[HoldingOut])
def list_holdings():
    return _DB

@app.post("/holdings", response_model=HoldingOut)
def create_holding(h: HoldingIn):
    new = HoldingOut(id=str(len(_DB)+1), **h.model_dump())
    _DB.append(new)
    return new
@app.delete("/holdings/{holding_id}", response_model=dict)
def delete_holding(holding_id: str):
    global _DB
    _DB = [h for h in _DB if h.id != holding_id]
    return {"status": "ok"}
@app.get("/holdings/{holding_id}", response_model=HoldingOut)
def get_holding(holding_id: str):
    for h in _DB:
        if h.id == holding_id:
            return h
    return None
@app.put("/holdings/{holding_id}", response_model=HoldingOut)
def update_holding(holding_id: str, h: HoldingIn):
    for i, existing in enumerate(_DB):
        if existing.id == holding_id:
            updated = HoldingOut(id=holding_id, **h.model_dump())
            _DB[i] = updated
            return updated
    return None
@app.get("/")
def root():
    return {"message": "Welcome to the Portfolio API"}
