from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import collectes, stats, auth

# Création automatique des tables (Avec gestion d'erreur pour éviter le crash au démarrage)
try:
    Base.metadata.create_all(bind=engine)
    print("SUCCESS: Database tables verified/created.")
    
    # DIAGNOSTIC : On vérifie si on voit des données
    from sqlalchemy import text
    with engine.connect() as conn:
        u_count = conn.execute(text("SELECT count(*) FROM users")).scalar()
        c_count = conn.execute(text("SELECT count(*) FROM collectes")).scalar()
        print(f"DIAGNOSTIC: Found {u_count} users and {c_count} collectes in database.")
except Exception as e:
    print(f"WARNING: Could not connect to database at startup: {e}")
    # On continue pour permettre à l'API de répondre (ex: health check) même si la DB est down

app = FastAPI(title="AgroAnalytics API Pro")

# CONFIGURATION CORS RENFORCÉE
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "*" 
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(collectes.router)
app.include_router(stats.router)


@app.api_route("/", methods=["GET", "HEAD"])
def read_root():
    return {"status": "online", "version": "1.0.0"}

@app.api_route("/api/health", methods=["GET", "HEAD"])
def health_check():
    return {"status": "healthy", "service": "AgroAnalytics API"}
