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

def safe_round(val, decimals=2):
    """Arrondi une valeur proprement, ou retourne None si c'est NaN/None"""
    if pd.isna(val) or val is None:
        return None
    return round(float(val), decimals)

@router.get("/")
def get_statistics(db: Session = Depends(get_db)):
    # TP VERSION: bypass authentication, get all data
    collectes = crud.get_all_collectes_for_stats(db)
    
    if not collectes or len(collectes) < 2:
        return {
            "message": "Pas assez de données pour les statistiques",
            "moyennes_rendement_par_culture": [],
            "matrice_correlation": {},
            "scatter_data": [],
            "stats_globales": None
        }
    
    # Conversion en DataFrame
    df = pd.DataFrame([{
        "culture_type": c.culture_type,
        "surface": c.surface,
        "quantite_engrais": c.quantite_engrais,
        "rendement_final": c.rendement_final
    } for c in collectes])
    
    # --- NETTOYAGE DE DONNÉES (Outliers) ---
    df_clean = remove_outliers(df, 'rendement_final')
    
    try:
        # Moyennes et Ecart-types avec ddof=1 pour l'estimateur sans biais
        def custom_std(x):
            return np.std(x, ddof=1) if len(x) > 1 else None
            
        stats_par_culture = df_clean.groupby("culture_type").agg({
            "rendement_final": ["mean", custom_std, "count"]
        }).reset_index()
        
        stats_par_culture.columns = ['culture_type', 'rendement_moyen', 'rendement_ecart_type', 'nombre_echantillons']
        
        # Arrondir et nettoyer
        stats_list = []
        for _, row in stats_par_culture.iterrows():
            stats_list.append({
                "culture_type": row["culture_type"],
                "rendement_moyen": safe_round(row["rendement_moyen"]),
                "rendement_ecart_type": safe_round(row["rendement_ecart_type"]),
                "nombre_echantillons": int(row["nombre_echantillons"])
            })
            
        # Corrélation
        correlation_matrix = df_clean[["surface", "quantite_engrais", "rendement_final"]].corr().fillna(0).to_dict()

        # Statistiques Globales Server-Side
        global_mean = df_clean["rendement_final"].mean()
        # Variance et std avec ddof=1 (estimateur de Bessel pour échantillon)
        global_var = np.var(df_clean["rendement_final"], ddof=1) if len(df_clean) > 1 else None
        global_std = np.std(df_clean["rendement_final"], ddof=1) if len(df_clean) > 1 else None
        # Erreur standard (SE) = std / sqrt(n)
        global_se = (global_std / np.sqrt(len(df_clean))) if global_std is not None else None

        stats_globales = {
            "mean": safe_round(global_mean),
            "variance": safe_round(global_var),
            "std_dev": safe_round(global_std),
            "standard_error": safe_round(global_se),
            "n_samples": len(df_clean)
        }

        # --- DONNÉES POUR SCATTER PLOT ---
        scatter_data = df_clean[["quantite_engrais", "rendement_final", "culture_type"]].to_dict(orient="records")

        return {
            "moyennes_rendement_par_culture": stats_list,
            "matrice_correlation": correlation_matrix,
            "scatter_data": scatter_data,
            "stats_globales": stats_globales,
            "total_collectes": len(df),
            "total_nettoye": len(df_clean)
        }
    except Exception as e:
        print("ERROR IN STATS:", str(e))
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/export")
def export_data(db: Session = Depends(get_db)):
    """Module d'Exportation : Génère un fichier CSV pour Excel/SPSS."""
    # TP VERSION: bypass authentication
    collectes = crud.get_all_collectes_for_stats(db)

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
