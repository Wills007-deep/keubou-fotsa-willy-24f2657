from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import crud
import models
from database import get_db

router = APIRouter(
    prefix="/api/collectes",
    tags=["collectes"],
)

@router.post("/", response_model=models.CollecteResponse, status_code=status.HTTP_201_CREATED)
def create_collecte(collecte: models.CollecteCreate, db: Session = Depends(get_db)):
    try:
        return crud.create_collecte(db=db, collecte=collecte)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la création de la collecte: {str(e)}")

@router.get("/", response_model=List[models.CollecteResponse])
def read_collectes(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    collectes = crud.get_collectes(db, skip=skip, limit=limit)
    return collectes

@router.get("/{collecte_id}", response_model=models.CollecteResponse)
def read_collecte(collecte_id: str, db: Session = Depends(get_db)):
    db_collecte = crud.get_collecte(db, collecte_id=collecte_id)
    if db_collecte is None:
        raise HTTPException(status_code=404, detail="Collecte non trouvée")
    return db_collecte

@router.put("/{collecte_id}", response_model=models.CollecteResponse, status_code=status.HTTP_200_OK)
def update_collecte(collecte_id: str, collecte: models.CollecteUpdate, db: Session = Depends(get_db)):
    try:
        db_collecte = crud.update_collecte(db=db, collecte_id=collecte_id, collecte_update=collecte)
        if db_collecte is None:
            raise HTTPException(status_code=404, detail="Collecte non trouvée")
        return db_collecte
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la mise à jour: {str(e)}")

@router.delete("/{collecte_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_collecte(collecte_id: str, db: Session = Depends(get_db)):
    try:
        db_collecte = crud.delete_collecte(db=db, collecte_id=collecte_id)
        if db_collecte is None:
            raise HTTPException(status_code=404, detail="Collecte non trouvée")
        return None
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la suppression: {str(e)}")
