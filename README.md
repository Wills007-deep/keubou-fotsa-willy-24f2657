# AgroAnalytics

Application Fullstack pour la collecte et l'analyse de données agricoles, conformément au Cahier des Charges.

## Prérequis

Pour lancer l'application sur votre ordinateur, assurez-vous d'avoir installé :
1. **Python** (version 3.10+ recommandée) pour le Backend.
2. **Node.js** (qui inclut `npm`) pour le Frontend.

---

## 1. Lancement du Backend (API FastAPI)

Le backend utilise Python et FastAPI. Par défaut, il utilise une base de données **SQLite locale** (`agroanalytics.db`), ce qui signifie qu'aucune configuration de base de données complexe n'est nécessaire pour démarrer.

Ouvrez un terminal et suivez ces étapes :

```bash
# 1. Se déplacer dans le dossier backend
cd backend

# 2. (Optionnel mais recommandé) Créer et activer un environnement virtuel
python -m venv venv
# Sur Windows : venv\Scripts\activate
# Sur Mac/Linux : source venv/bin/activate

# 3. Installer les dépendances
pip install -r requirements.txt

# 4. Lancer le serveur de développement
uvicorn main:app --reload
```
Le backend sera alors accessible sur : `http://127.0.0.1:8000`.
*(Vous pouvez voir la documentation interactive de l'API sur `http://127.0.0.1:8000/docs`)*.

---

## 2. Lancement du Frontend (React.js)

Le frontend a été créé avec React et Vite.

Ouvrez un **nouveau** terminal (ne fermez pas celui du backend) et suivez ces étapes :

```bash
# 1. Se déplacer dans le dossier frontend
cd frontend

# 2. Installer les paquets (React, Recharts, etc.)
npm install

# 3. Lancer le serveur de développement
npm run dev
```
Le frontend sera alors accessible sur : `http://localhost:5173`.
Ouvrez ce lien dans votre navigateur pour utiliser l'application.

---

## 3. Configuration de la base de données PostgreSQL (Supabase) - Optionnel

Si vous souhaitez utiliser Supabase ou un autre PostgreSQL pour la production au lieu de la base SQLite locale :
1. Connectez-vous à votre base de données via votre outil favori et exécutez le script SQL fourni dans `database/init.sql` pour créer les tables.
2. Définissez la variable d'environnement `DATABASE_URL` avant de lancer le backend :
   * Sur Linux/Mac : `export DATABASE_URL="postgresql://user:password@host/dbname"`
   * Sur Windows (Powershell) : `$env:DATABASE_URL="postgresql://user:password@host/dbname"`
   * Puis relancez `uvicorn main:app --reload`. Le backend se connectera automatiquement à votre Postgres !

---
*Projet réalisé pour le cours INF 232.*
