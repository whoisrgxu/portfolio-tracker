# api/schemas/holding.py
from pydantic import BaseModel, Field
from uuid import UUID

class HoldingIn(BaseModel):
    symbol: str
    quantity: float
    avg_cost: float = Field(..., alias="avg_cost")
    model_config = {
        "from_attributes": True,
        "populate_by_name": True,
    }

class HoldingOut(HoldingIn):
    id: UUID
    user_Id: UUID = Field(..., alias="user_id")

    model_config = {
        "from_attributes": True,
        "populate_by_name": True,
    }