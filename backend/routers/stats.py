from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
import pandas as pd
import numpy as np
import crud
import auth
import models
from database import get_db
import io

router = APIRouter(
    prefix="/api/stats",
    tags=["statistiques"],
)

def remove_outliers(df, column):
    """Fonction de nettoyage de données (Analyse Descriptive) : Identifie et retire les outliers via IQR."""
    Q1 = df[column].quantile(0.25)
    Q3 = df[column].quantile(0.75)
    IQR = Q3 - Q1
    lower_bound = Q1 - 1.5 * IQR
    upper_bound = Q3 + 1.5 * IQR
    return df[(df[column] >= lower_bound) & (df[column] <= upper_bound)]

@router.get("/")
def get_statistics(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    collectes = crud.get_all_collectes_for_stats(db, user_id=current_user.id)
    
    if not collectes or len(collectes) < 2:
        return {
            "message": "Pas assez de données pour les statistiques",
            "moyennes_rendement_par_culture": [],
            "matrice_correlation": {},
            "scatter_data": []
        }
    
    # Conversion en DataFrame
    df = pd.DataFrame([{
        "culture_type": c.culture_type,
        "surface": c.surface,
        "quantite_engrais": c.quantite_engrais,
        "rendement_final": c.rendement_final
    } for c in collectes])
    
    # --- NETTOYAGE DE DONNÉES (Outliers) ---
    # On nettoie le rendement pour ne pas fausser les moyennes
    df_clean = remove_outliers(df, 'rendement_final')
    
    try:
        # Moyennes et Ecart-types
        stats_par_culture = df_clean.groupby("culture_type").agg({
            "rendement_final": ["mean", "std", "count"]
        }).reset_index()
        stats_par_culture.columns = ['culture_type', 'rendement_moyen', 'rendement_ecart_type', 'nombre_echantillons']
        stats_par_culture = stats_par_culture.fillna(0)
        
        # Corrélation
        correlation_matrix = df_clean[["surface", "quantite_engrais", "rendement_final"]].corr().fillna(0).to_dict()

        # --- DONNÉES POUR SCATTER PLOT ---
        # On prépare les points (Engrais vs Rendement)
        scatter_data = df_clean[["quantite_engrais", "rendement_final", "culture_type"]].to_dict(orient="records")

        return {
            "moyennes_rendement_par_culture": stats_par_culture.to_dict(orient="records"),
            "matrice_correlation": correlation_matrix,
            "scatter_data": scatter_data,
            "total_collectes": len(df),
            "total_nettoye": len(df_clean)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/export")
def export_data(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    """Module d'Exportation : Génère un fichier CSV pour Excel/SPSS."""
    collectes = crud.get_all_collectes_for_stats(db, user_id=current_user.id)

    if not collectes:
        raise HTTPException(status_code=404, detail="Aucune donnée à exporter")
        
    df = pd.DataFrame([{
        "ID": c.id_collecte,
        "Culture": c.culture_type,
        "Region": c.region,
        "Type_Sol": c.soil_type,
        "Surface_ha": c.surface,
        "Engrais_kg": c.quantite_engrais,
        "Rendement_t": c.rendement_final,
        "Latitude": c.latitude,
        "Longitude": c.longitude,
        "Date_Saisie": c.created_at
    } for c in collectes])
    
    output = io.StringIO()
    df.to_csv(output, index=False)
    
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=agroanalytics_export.csv"}
    )
