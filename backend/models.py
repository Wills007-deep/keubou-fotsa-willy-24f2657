import uuid
from sqlalchemy import Column, String, Float, DateTime, func
from database import Base
from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class Collecte(Base):
    __tablename__ = "collectes"
    id_collecte = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    culture_type = Column(String(100), nullable=False)
    plantation_name = Column(String(255), nullable=True)
    operator = Column(String(255), nullable=True)
    surface = Column(Float, nullable=False)
    quantite_engrais = Column(Float, nullable=False)
    volume_eau = Column(Float, nullable=True)
    rendement_final = Column(Float, nullable=False)
    date_recolte = Column(DateTime, nullable=True)
    nom_lieu = Column(String(255), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)


class CollecteBase(BaseModel):
    culture_type: str
    plantation_name: Optional[str] = None
    operator: Optional[str] = None
    surface: float
    quantite_engrais: float
    volume_eau: Optional[float] = None
    rendement_final: float
    date_recolte: Optional[datetime] = None
    nom_lieu: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class CollecteCreate(CollecteBase):
    pass

class CollecteUpdate(BaseModel):
    culture_type: Optional[str] = None
    plantation_name: Optional[str] = None
    operator: Optional[str] = None
    surface: Optional[float] = None
    quantite_engrais: Optional[float] = None
    volume_eau: Optional[float] = None
    rendement_final: Optional[float] = None
    date_recolte: Optional[datetime] = None
    nom_lieu: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class CollecteResponse(CollecteBase):
    id_collecte: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)
