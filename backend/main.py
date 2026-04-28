from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import collectes, stats, auth

# Création automatique des tables (Mise à jour effectuée)
Base.metadata.create_all(bind=engine)

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
