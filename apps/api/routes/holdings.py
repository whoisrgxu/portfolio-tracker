from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from models.holding import Holding
from deps import get_db


from schemas.holding import HoldingIn, HoldingOut

router = APIRouter()

_DB: list[HoldingOut] = []

@router.get("/", response_model=List[HoldingOut])
def list_holdings(user_id: UUID, db: Session = Depends(get_db)):
    holdings = db.query(Holding).filter(Holding.user_id == user_id).all()
    return holdings


@router.post("/", response_model=HoldingOut)
def create_holding(h: HoldingIn, user_id: UUID, db: Session = Depends(get_db)):
    new_holding = Holding(**h.model_dump(), user_id=user_id)
    db.add(new_holding)
    db.commit()
    db.refresh(new_holding)
    return new_holding

@router.delete("/{holding_id}", response_model=dict)
def delete_holding(holding_id: UUID, db: Session = Depends(get_db)):
    holding = db.query(Holding).filter(Holding.id == holding_id).first()
    if not holding:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(holding)
    db.commit()
    return {"status": "ok"}

@router.get("/{holding_id}", response_model=HoldingOut)
def get_holding(holding_id: UUID, db: Session = Depends(get_db)):
    holding = db.query(Holding).filter(Holding.id == holding_id).first()
    if not holding:
        raise HTTPException(status_code=404, detail="Not found")
    return holding

@router.put("/{holding_id}", response_model=HoldingOut)
def update_holding(holding_id: UUID, h: HoldingIn, db: Session = Depends(get_db)):
    holding = db.query(Holding).filter(Holding.id == holding_id).first()
    if not holding:
        raise HTTPException(status_code=404, detail="Not found")
    for key, value in h.model_dump().items():
        setattr(holding, key, value)
    db.commit()
    db.refresh(holding)
    return holding
