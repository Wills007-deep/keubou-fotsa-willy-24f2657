import uuid
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from database import Base
from pydantic import BaseModel, ConfigDict, EmailStr, field_validator, ValidationInfo
import re
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
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True) # Rendu optionnel
    participant_name = Column(String(255), nullable=True) # Nouveau champ
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

    @field_validator('email')
    @classmethod
    def validate_username_pattern(cls, v: str) -> str:
        # Pattern: at least 3 letters followed by exactly 2 digits
        if not re.match(r"^[a-zA-Z]{3,}\d{2}$", v):
            raise ValueError("L'identifiant doit être composé d'au moins 3 lettres suivies de 2 chiffres (ex: jean01)")
        return v.lower()

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
    participant_name: Optional[str] = None
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
    @field_validator('culture_type')
    @classmethod
    def validate_culture_type(cls, v: str) -> str:
        if len(v.strip()) < 3:
            raise ValueError("Le type de culture doit contenir au moins 3 caractères cohérents.")
        if any(char.isdigit() for char in v):
            raise ValueError("Le type de culture ne peut pas contenir de chiffres. Veuillez entrer un nom de plante valide.")
        return v.strip()

    @field_validator('surface', 'quantite_engrais', 'rendement_final')
    @classmethod
    def validate_positive_values(cls, v: float, info: ValidationInfo) -> float:
        if info.field_name == 'surface' and v <= 0:
            raise ValueError("La surface doit être strictement supérieure à zéro.")
        if v < 0:
            raise ValueError(f"Le champ {info.field_name} ne peut pas être négatif.")
        return v

class CollecteUpdate(BaseModel):
    culture_type: Optional[str] = None
    participant_name: Optional[str] = None
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
    user_id: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)
