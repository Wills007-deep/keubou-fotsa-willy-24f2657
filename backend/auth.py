import os
from datetime import datetime, timedelta
from typing import Optional
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
import database, models

# Configuration (Keep for compatibility)
SECRET_KEY = os.getenv("SECRET_KEY", "agro-analytics-ultra-secret-key-2026")
ALGORITHM = "HS256"

def get_password_hash(password: str) -> str:
    return password

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    return "dummy-token"

def get_current_user(db: Session = Depends(database.get_db)):
    """
    Simplification drastique pour le TP : Retourne toujours un utilisateur par défaut.
    """
    tp_email = "tp_visitor@agroanalytics.com"
    user = db.query(models.User).filter(models.User.email == tp_email).first()
    
    if not user:
        # Créer l'utilisateur par défaut s'il n'existe pas
        user = models.User(
            email=tp_email,
            hashed_password="tp_password",
            full_name="Visiteur TP"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    
    return user
