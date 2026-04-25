from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
import database, models, auth, crud
import uuid

router = APIRouter(
    prefix="/api/auth",
    tags=["auth"],
)

@router.post("/register", response_model=models.UserResponse)
def register(user: models.UserCreate, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pwd = auth.get_password_hash(user.password)
    new_user = models.User(
        email=user.email,
        hashed_password=hashed_pwd,
        full_name=user.full_name
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=models.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    identifier = form_data.username.lower()
    provided_pin = form_data.password
    
    user = db.query(models.User).filter(models.User.email == identifier).first()
    
    # Validation du pattern identifiant (lettres + 2 chiffres)
    import re
    if not re.match(r"^[a-zA-Z]{3,}\d{2}$", identifier):
        raise HTTPException(status_code=400, detail="L'identifiant doit être composé d'au moins 3 lettres suivies de 2 chiffres (ex: jean01)")

    # Nouvel utilisateur → créer le compte avec le PIN en clair (mode TP)
    if not user:
        if len(provided_pin) != 4 or not provided_pin.isdigit():
            raise HTTPException(status_code=400, detail="Le PIN doit contenir 4 chiffres")
        user = models.User(
            id=str(uuid.uuid4()),
            email=identifier,
            hashed_password=provided_pin,  # PIN stocké en clair pour le TP
            full_name=identifier.capitalize()
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    
    # Utilisateur existant → vérifier le PIN (stocké en clair ou bcrypt)
    else:
        stored = user.hashed_password
        # Si le hash ressemble à bcrypt (commence par $2b$), on bypasse pour le TP
        if stored.startswith('$2b$') or stored.startswith('$2a$'):
            # Réinitialiser avec le nouveau PIN en clair
            user.hashed_password = provided_pin
            db.commit()
        elif stored != provided_pin:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="PIN incorrect",
                headers={"WWW-Authenticate": "Bearer"},
            )
    
    access_token = auth.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=models.UserResponse)
def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user
