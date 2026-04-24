# 🎯 PLAN D'IMPLÉMENTATION - AgroAnalytics

**Créé:** 24 avril 2026  
**Durée estimée:** 3-5 jours  
**Coût:** 0€ (tiers gratuits)

---

## 📋 Résumé exécutif

Ce plan couvre le déploiement complet de l'application AgroAnalytics sur le cloud avec :
- **Frontend** sur Vercel (React/Vite)
- **Backend** sur Render (FastAPI)
- **Database** sur Supabase (PostgreSQL)
- **CI/CD** avec GitHub Actions

---

## 📅 Timeline d'implémentation

### **Jour 1 : Préparation & Sécurité (4h)**
- Audit de sécurité
- Configuration des environments
- Génération des clés de sécurité

### **Jour 2 : Déploiement Backend (6h)**
- Configuration Supabase
- Déploiement Render
- Tests des endpoints

### **Jour 3 : Déploiement Frontend (4h)**
- Build de production
- Déploiement Vercel
- Configuration des variables

### **Jour 4 : Tests & Validation (6h)**
- Tests complets
- Corrections de bugs
- Optimisations

### **Jour 5 : Monitoring & Maintenance (4h)**
- Setup des logs
- Alertes et monitoring
- Documentation

---

## 🔐 ÉTAPE 1 : Préparation & Sécurité

### 1.1 Vérifier le code

```bash
# Aller dans le répertoire du projet
cd /home/will-s-dev/Desktop/AgroAnalytics

# Lancer la vérification automatique
python3 verify_deployment.py
```

**Résultat attendu:** ✅ All checks passed

### 1.2 Générer SECRET_KEY sécurisée

```bash
python3 << 'EOF'
import secrets
secret_key = secrets.token_urlsafe(32)
print(f"SECRET_KEY={secret_key}")
EOF
```

**Sauvegarder cette clé** - Vous en aurez besoin pour Render

### 1.3 Corriger les CORS

**Fichier:** `backend/main.py`

```python
# ❌ AVANT (non sécurisé)
allow_origins=["*"]

# ✅ APRÈS (sécurisé)
allow_origins=[
    "https://agroanalytics.vercel.app",  # À remplacer par votre domaine
    "http://localhost:5173"  # Pour développement local
]
```

### 1.4 Commiter les changements

```bash
git add .
git commit -m "Préparation pour déploiement en production"
git push origin main
```

---

## 🗄️ ÉTAPE 2 : Configuration Base de Données (Supabase)

### 2.1 Créer un compte Supabase

1. Aller sur https://supabase.com
2. Cliquer sur "Start your project"
3. S'authentifier avec GitHub
4. Créer un nouveau projet:
   - **Nom:** agroanalytics
   - **Region:** Choisir le plus proche (ex: eu-west-1 pour Europe)
   - **Password:** Générer un mot de passe fort

### 2.2 Récupérer la CONNECTION STRING

1. Dans Supabase Dashboard → Settings → Database
2. Chercher "Connection String" → PostgreSQL
3. Copier l'URL (ressemble à):
   ```
   postgresql://postgres:PASSWORD@db.XXXXX.supabase.co:5432/postgres
   ```

### 2.3 Créer les tables

Aller dans "SQL Editor" → "New Query" et exécuter:

```sql
-- From: database/init.sql
-- Copier le contenu du fichier database/init.sql
-- et l'exécuter ici
```

Ou depuis terminal:
```bash
psql "postgresql://postgres:PASSWORD@db.XXXXX.supabase.co:5432/postgres" < database/init.sql
```

### 2.4 Insérer données de test

```bash
python3 << 'EOF'
import sqlite3
import psycopg2

# Copier les données de SQLite vers PostgreSQL
# (Script fourni si nécessaire)
EOF
```

**Vérifier que les données sont présentes:**
```bash
# Vérifier les utilisateurs
SELECT * FROM users;

# Vérifier les collections
SELECT COUNT(*) FROM collectes;
```

---

## 🚀 ÉTAPE 3 : Déploiement Backend (Render)

### 3.1 Créer un compte Render

1. Aller sur https://render.com
2. S'authentifier avec GitHub
3. Connecter le repository

### 3.2 Créer un Web Service

1. Dashboard Render → "New" → "Web Service"
2. Connecter le repository GitHub

### 3.3 Configurer le service

**Name:** agroanalytics-api

**Environment:** Python 3.11

**Build Command:**
```bash
cd backend && pip install -r requirements.txt
```

**Start Command:**
```bash
cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT
```

### 3.4 Ajouter variables d'environnement

Dans Render Dashboard → Environment:

```
DATABASE_URL = postgresql://postgres:PASSWORD@db.XXXXX.supabase.co:5432/postgres
SECRET_KEY = [votre_clé_générée]
ALGORITHM = HS256
ACCESS_TOKEN_EXPIRE_MINUTES = 1440
```

### 3.5 Déployer

Render déploie automatiquement quand vous pushez sur `main`.

**Vérifier le déploiement:**
```bash
# Tester l'API
curl https://agroanalytics-api.render.com/

# Voir la documentation
https://agroanalytics-api.render.com/docs
```

---

## ⚛️ ÉTAPE 4 : Déploiement Frontend (Vercel)

### 4.1 Créer un compte Vercel

1. Aller sur https://vercel.com
2. S'authentifier avec GitHub
3. Importer le project

### 4.2 Configuration du projet

**Project Settings:**

**Framework:** Vite

**Build Command:**
```bash
npm run build --prefix frontend
```

**Output Directory:**
```bash
frontend/dist
```

**Install Command:**
```bash
npm ci
```

### 4.3 Ajouter variables d'environnement

Dans Vercel Dashboard → Settings → Environment Variables:

```
VITE_API_URL = https://agroanalytics-api.render.com
```

### 4.4 Déployer

Vercel déploie automatiquement quand vous pushez sur `main`.

**Vérifier le déploiement:**
```bash
# Tester le site
https://agroanalytics.vercel.app

# Tester login avec admin00:1234
```

---

## ✅ ÉTAPE 5 : Tests Post-Déploiement

### 5.1 Tests Backend

```bash
# 1. Vérifier que l'API est en ligne
curl https://agroanalytics-api.render.com/

# 2. Vérifier la documentation
curl https://agroanalytics-api.render.com/docs

# 3. Tester le login
curl -X POST https://agroanalytics-api.render.com/api/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin00&password=1234"

# Réponse attendue: {"access_token": "...", "token_type": "bearer"}

# 4. Lister les collections
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://agroanalytics-api.render.com/api/collectes/
```

### 5.2 Tests Frontend

1. Aller sur https://agroanalytics.vercel.app
2. Se connecter avec `admin00` / `1234`
3. Vérifier que les 8 collections s'affichent
4. Tester créer une nouvelle collection
5. Tester le dashboard

### 5.3 Checklist de validation

- [ ] API en ligne et responsive
- [ ] Frontend charge sans erreurs
- [ ] Login fonctionnne (admin00:1234)
- [ ] Les 8 collections s'affichent
- [ ] Peut créer une nouvelle collection
- [ ] Dashboard affiche les données
- [ ] Export CSV fonctionne
- [ ] Pas d'erreurs dans la console du navigateur
- [ ] Pas d'erreurs dans les logs Render

---

## 🔧 Commandes Utiles

### Lancer le script de vérification

```bash
python3 verify_deployment.py
```

### Lancer le script de déploiement

```bash
chmod +x deploy.sh
./deploy.sh production
```

### Voir les logs Render

```bash
# Dans Render Dashboard → Logs
# Ou via Render CLI
render log agroanalytics-api --tail 100
```

### Voir les logs Vercel

```bash
# Dans Vercel Dashboard → Deployments → Logs
# Ou via Vercel CLI
vercel logs agroanalytics
```

### Accéder à la base de données Supabase

```bash
# Via psql
psql "postgresql://postgres:PASSWORD@db.XXXXX.supabase.co:5432/postgres"

# Via Supabase Studio
# https://app.supabase.com → SQL Editor
```

---

## 🚨 Troubleshooting

| Problème | Cause | Solution |
|----------|-------|----------|
| 502 Bad Gateway | Backend down | Vérifier DATABASE_URL, redémarrer Render service |
| CORS error | Mauvaise config | Vérifier allow_origins dans main.py |
| 401 Unauthorized | Token invalide | Vérifier SECRET_KEY |
| Collections vides | user_id mismatch | Re-run migrate_to_admin00.py |
| Build failure | Node version | Vérifier Node version dans Vercel |

---

## 📊 Architecture finale

```
Users
  ↓
https://agroanalytics.vercel.app (Frontend React)
  ↓ API calls
https://agroanalytics-api.render.com (Backend FastAPI)
  ↓ SQL queries
PostgreSQL (Supabase)
```

---

## 📞 Support

- **Render:** https://render.com/docs
- **Vercel:** https://vercel.com/docs
- **Supabase:** https://supabase.com/docs
- **FastAPI:** https://fastapi.tiangolo.com/
- **React:** https://react.dev/

---

## ✨ Prochaines étapes après déploiement

1. **Domaine personnalisé:** Configurer DNS custom
2. **SSL/HTTPS:** Automatique sur Vercel/Render
3. **Backups:** Configurer backups Supabase
4. **Monitoring:** Ajouter Sentry pour erreurs
5. **Analytics:** Google Analytics
6. **SEO:** Optimisation pour moteurs de recherche

---

## 📝 Notes importantes

- **Ne jamais** commiter les clés secrètes sur GitHub
- **Toujours** utiliser variables d'environnement
- **Tester** en staging avant production
- **Monitorer** régulièrement les logs
- **Bacuper** la base de données régulièrement

---

**Durée totale estimée:** 3-5 jours  
**Complexité:** ⭐⭐⭐ (Moyenne)  
**Coût:** 0€ (gratuit avec tiers free)

