from sqlalchemy.orm import Session
import models
import uuid
from datetime import datetime

def get_collecte(db: Session, collecte_id: str, user_id: str):
    return db.query(models.Collecte).filter(
        models.Collecte.id_collecte == collecte_id,
        models.Collecte.user_id == user_id
    ).first()

def get_collectes(db: Session, user_id: str, skip: int = 0, limit: int = 100):
    return db.query(models.Collecte).filter(
        models.Collecte.user_id == user_id
    ).order_by(models.Collecte.created_at.desc()).offset(skip).limit(limit).all()

def create_collecte(db: Session, collecte: models.CollecteCreate, user_id: str):
    db_collecte = models.Collecte(
        id_collecte=str(uuid.uuid4()),
        user_id=user_id,
        culture_type=collecte.culture_type,
        plantation_name=collecte.plantation_name,
        operator=collecte.operator,
        surface=collecte.surface,
        quantite_engrais=collecte.quantite_engrais,
        volume_eau=collecte.volume_eau,
        rendement_final=collecte.rendement_final,
        date_recolte=collecte.date_recolte,
        region=collecte.region,
        soil_type=collecte.soil_type,
        nom_lieu=collecte.nom_lieu,
        latitude=collecte.latitude,
        longitude=collecte.longitude,
        created_at=datetime.now(),
        updated_at=datetime.now()
    )
    db.add(db_collecte)
    db.commit()
    db.refresh(db_collecte)
    return db_collecte

def update_collecte(db: Session, collecte_id: str, collecte_update: models.CollecteUpdate, user_id: str):
    db_collecte = db.query(models.Collecte).filter(
        models.Collecte.id_collecte == collecte_id,
        models.Collecte.user_id == user_id
    ).first()
    
    if not db_collecte:
        return None
    
    update_data = collecte_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_collecte, key, value)
    
    db_collecte.updated_at = datetime.now()
    db.add(db_collecte)
    db.commit()
    db.refresh(db_collecte)
    return db_collecte

def delete_collecte(db: Session, collecte_id: str, user_id: str):
    db_collecte = db.query(models.Collecte).filter(
        models.Collecte.id_collecte == collecte_id,
        models.Collecte.user_id == user_id
    ).first()
    
    if not db_collecte:
        return None
    
    db.delete(db_collecte)
    db.commit()
    return db_collecte

def get_all_collectes_for_stats(db: Session, user_id: str):
    return db.query(models.Collecte).filter(models.Collecte.user_id == user_id).all()

