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

def safe_round(value, decimals=4):
    """Arrondi sûr : retourne None si la valeur est NaN/Inf."""
    if value is None:
        return None
    try:
        if np.isnan(value) or np.isinf(value):
            return None
        return round(float(value), decimals)
    except (TypeError, ValueError):
        return None

@router.get("/")
def get_statistics(db: Session = Depends(get_db)):
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
    
    # Nettoyage des outliers sur le rendement
    df_clean = remove_outliers(df, 'rendement_final')
    
    # Fallback si le nettoyage vide trop le jeu
    if len(df_clean) < 2:
        df_clean = df
    
    try:
        rendements = df_clean["rendement_final"].dropna().values
        n = len(rendements)

        # --- STATISTIQUES GLOBALES CORRECTES ---
        # ddof=1 = estimateur sans biais de Bessel (variance d'échantillon)
        mean_global     = float(np.mean(rendements))
        min_global      = float(np.min(rendements))
        max_global      = float(np.max(rendements))
        variance_global = float(np.var(rendements, ddof=1)) if n >= 2 else None
        std_global      = float(np.std(rendements, ddof=1)) if n >= 2 else None
        # Erreur Standard = σ / √n
        se_global = (std_global / np.sqrt(n)) if (std_global is not None and n >= 2) else None

        stats_globales = {
            "n":              n,
            "moyenne":        safe_round(mean_global, 4),
            "minimum":        safe_round(min_global, 4),
            "maximum":        safe_round(max_global, 4),
            "variance":       safe_round(variance_global, 4),
            "ecart_type":     safe_round(std_global, 4),
            "erreur_standard": safe_round(se_global, 6),
        }

        # --- STATISTIQUES PAR CULTURE (ddof=1, None si n=1) ---
        def culture_stats(g):
            vals = g["rendement_final"].dropna().values
            cnt  = len(vals)
            mn   = float(np.mean(vals)) if cnt >= 1 else None
            sd   = float(np.std(vals, ddof=1)) if cnt >= 2 else None
            return pd.Series({
                "rendement_moyen":      safe_round(mn, 4),
                "rendement_ecart_type": safe_round(sd, 4),
                "nombre_echantillons":  cnt
            })

        stats_par_culture = (
            df_clean.groupby("culture_type")
            .apply(culture_stats)
            .reset_index()
        )

        # --- CORRÉLATION PEARSON ---
        corr_cols = ["surface", "quantite_engrais", "rendement_final"]
        correlation_matrix = (
            df_clean[corr_cols]
            .corr(method="pearson")
            .round(6)
            .fillna(0)
            .to_dict()
        )

        # --- SCATTER PLOT ---
        scatter_data = (
            df_clean[["quantite_engrais", "rendement_final", "culture_type"]]
            .to_dict(orient="records")
        )

        return {
            "moyennes_rendement_par_culture": stats_par_culture.to_dict(orient="records"),
            "matrice_correlation":            correlation_matrix,
            "scatter_data":                   scatter_data,
            "total_collectes":                len(df),
            "total_nettoye":                  len(df_clean),
            "stats_globales":                 stats_globales
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/export")
def export_data(db: Session = Depends(get_db)):
    """Module d'Exportation : Génère un fichier CSV pour Excel/SPSS."""
    collectes = crud.get_all_collectes_for_stats(db)

    if not collectes:
        raise HTTPException(status_code=404, detail="Aucune donnée à exporter")
        
    df = pd.DataFrame([{
        "ID":          c.id_collecte,
        "Culture":     c.culture_type,
        "Region":      c.region,
        "Type_Sol":    c.soil_type,
        "Surface_ha":  c.surface,
        "Engrais_kg":  c.quantite_engrais,
        "Rendement_t": c.rendement_final,
        "Latitude":    c.latitude,
        "Longitude":   c.longitude,
        "Date_Saisie": c.created_at
    } for c in collectes])
    
    output = io.StringIO()
    df.to_csv(output, index=False)
    
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=agroanalytics_export.csv"}
    )
