from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from models.holding import Holding
from deps import get_db


from schemas.holding import HoldingIn, HoldingOut

router = APIRouter()

_DB: list[HoldingOut] = []

@router.get("/holdings", response_model=List[HoldingOut])
def list_holdings(user_id: UUID, db: Session = Depends(get_db)):
    holdings = db.query(Holding).filter(Holding.user_id == user_id).all()
    return holdings


@router.post("/holdings", response_model=HoldingOut)
def create_holding(h: HoldingIn, user_id: UUID, db: Session = Depends(get_db)):
    new_holding = Holding(**h.model_dump(), user_id=user_id)
    db.add(new_holding)
    db.commit()
    db.refresh(new_holding)
    return new_holding

@router.delete("/{holding_id}", response_model=dict)
def delete_holding(holding_id: str):
    global _DB
    _DB = [h for h in _DB if h.id != holding_id]
    return {"status": "ok"}

@router.get("/{holding_id}", response_model=HoldingOut)
def get_holding(holding_id: str):
    for h in _DB:
        if h.id == holding_id:
            return h
    raise HTTPException(status_code=404, detail="Not found")

@router.put("/{holding_id}", response_model=HoldingOut)
def update_holding(holding_id: str, h: HoldingIn):
    for i, existing in enumerate(_DB):
        if existing.id == holding_id:
            updated = HoldingOut(id=holding_id, **h.model_dump())
            _DB[i] = updated
            return updated
    raise HTTPException(status_code=404, detail="Not found")
