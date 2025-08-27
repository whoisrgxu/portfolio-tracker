from sqlalchemy import Column, String, Float, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
import uuid

from db.base import Base  # assuming `Base = declarative_base()` is in db.py

class Holding(Base):
    __tablename__ = "holdings"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    symbol = Column(String, nullable=False)
    quantity = Column(Float, nullable=False)
    avg_cost = Column(Float, nullable=False)
    user_id = Column(UUID(as_uuid=True), nullable=False)
