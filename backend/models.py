import uuid
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from database import Base
from pydantic import BaseModel, ConfigDict, EmailStr
from typing import List, Optional
from datetime import datetime

class User(Base):
    __tablename__ = "users"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.now)

    collectes = relationship("Collecte", back_populates="owner")

class Collecte(Base):
    __tablename__ = "collectes"
    id_collecte = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    culture_type = Column(String(100), nullable=False)
    plantation_name = Column(String(255), nullable=True)
    operator = Column(String(255), nullable=True)
    surface = Column(Float, nullable=False)
    quantite_engrais = Column(Float, nullable=False)
    volume_eau = Column(Float, nullable=True)
    rendement_final = Column(Float, nullable=False)
    date_recolte = Column(DateTime, nullable=True)
    region = Column(String(100), nullable=True)
    soil_type = Column(String(100), nullable=True)
    nom_lieu = Column(String(255), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    owner = relationship("User", back_populates="collectes")


# --- User Schemas ---
class UserBase(BaseModel):
    email: str
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None


# --- Collecte Schemas ---
class CollecteBase(BaseModel):
    culture_type: str
    plantation_name: Optional[str] = None
    operator: Optional[str] = None
    surface: float
    quantite_engrais: float
    volume_eau: Optional[float] = None
    rendement_final: float
    date_recolte: Optional[datetime] = None
    region: Optional[str] = None
    soil_type: Optional[str] = None
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
    region: Optional[str] = None
    soil_type: Optional[str] = None
    nom_lieu: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class CollecteResponse(CollecteBase):
    id_collecte: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)
