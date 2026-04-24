# 📋 GUIDE DE DÉPLOIEMENT - AgroAnalytics

**Date de création:** 24 avril 2026  
**Version du projet:** 1.0.0  
**Status:** Production

---

## 🎯 Vue d'ensemble du déploiement

Ce guide couvre le déploiement complet de l'application AgroAnalytics :
- **Frontend** : React + Vite déployé sur Vercel ou Netlify
- **Backend** : FastAPI déployé sur Render, Railway ou Heroku
- **Base de données** : PostgreSQL sur Supabase ou ElephantSQL

---

## 📊 Phases de déploiement

### **Phase 1 : Préparation (1-2 jours)**
- [ ] Audit de sécurité
- [ ] Optimisation des performances
- [ ] Configuration des environnements
- [ ] Tests de production

### **Phase 2 : Déploiement Backend (1 jour)**
- [ ] Configuration de la base de données PostgreSQL
- [ ] Déploiement de l'API FastAPI
- [ ] Tests des endpoints

### **Phase 3 : Déploiement Frontend (1 jour)**
- [ ] Build de production
- [ ] Déploiement sur CDN
- [ ] Tests de l'interface utilisateur

### **Phase 4 : Post-déploiement (1-2 jours)**
- [ ] Monitoring et logs
- [ ] Corrections de bugs
- [ ] Optimisation

---

## ✅ Checklist de déploiement

### 1️⃣ PRÉPARATION

#### Audit de sécurité
- [ ] Vérifier que `SECRET_KEY` n'est pas visible dans le code
- [ ] Vérifier que les données sensibles utilisent des variables d'environnement
- [ ] Vérifier les permissions CORS (actuellement trop ouvertes avec `"*"`)
- [ ] Vérifier que les mots de passe ne sont jamais en clair en production

**Action requise:**
```bash
# Générer une SECRET_KEY sécurisée
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

#### Tests
- [ ] Lancer la suite de tests complète
- [ ] Tester tous les endpoints de l'API
- [ ] Tester le flux d'authentification
- [ ] Tester les collections de données

**Commandes:**
```bash
# Backend - Tests basiques
cd backend
python -m pytest tests/ -v

# Frontend - Build de test
cd frontend
npm run build
```

---

### 2️⃣ DÉPLOIEMENT BACKEND

#### Option A : Déploiement sur **Render.com** (Recommandé - Gratuit)

**Étapes:**
1. Créer un compte sur [render.com](https://render.com)
2. Connecter votre repository GitHub
3. Créer un nouveau "Web Service"
4. Configuration:
   ```
   Name: agroanalytics-api
   Environment: Python 3.11
   Build Command: pip install -r requirements.txt
   Start Command: uvicorn main:app --host 0.0.0.0 --port $PORT
   ```
5. Ajouter les variables d'environnement:
   ```
   DATABASE_URL: postgresql://[user]:[password]@[host]:[port]/[dbname]
   SECRET_KEY: [votre_clé_générée]
   ```
6. Déployer

#### Option B : Déploiement sur **Railway.app**

**Étapes:**
1. Créer un compte sur [railway.app](https://railway.app)
2. Connecter GitHub
3. Créer un nouveau projet
4. Configuration automatique (détecte FastAPI)
5. Ajouter un service PostgreSQL
6. Configurer variables d'environnement

#### Option C : Déploiement sur **Heroku** (Payant)

**Étapes:**
1. Installer Heroku CLI
2. `heroku login`
3. `heroku create agroanalytics-api`
4. `git push heroku main`
5. `heroku config:set DATABASE_URL="postgresql://..."`

---

### 3️⃣ DÉPLOIEMENT BASE DE DONNÉES

#### Créer une base PostgreSQL sur **Supabase** (Recommandé)

**Étapes:**
1. Aller sur [supabase.com](https://supabase.com)
2. Créer un nouveau projet
3. Utiliser l'URL de connexion fournie
4. Exécuter le script SQL:
   ```bash
   psql "postgresql://[connection_string]" < database/init.sql
   ```

#### Alternative : **ElephantSQL**
- Plus simple mais moins de features

---

### 4️⃣ DÉPLOIEMENT FRONTEND

#### Option A : Déploiement sur **Vercel** (Recommandé)

**Étapes:**
1. Créer un compte sur [vercel.com](https://vercel.com)
2. Importer le projet GitHub
3. Sélectionner le dossier root: `/`
4. Framework: Vite
5. Build command: `npm run build --prefix frontend`
6. Output directory: `frontend/dist`
7. Variables d'environnement:
   ```
   VITE_API_URL: https://agroanalytics-api.render.com
   ```
8. Déployer

#### Option B : Déploiement sur **Netlify**

**Étapes:**
1. Créer un compte sur [netlify.com](https://netlify.com)
2. Connecter GitHub
3. Build settings:
   ```
   Build command: npm run build --prefix frontend
   Publish directory: frontend/dist
   ```

---

## 🔐 Configuration des variables d'environnement

### Backend (.env ou variables système)
```
DATABASE_URL=postgresql://user:password@host:port/dbname
SECRET_KEY=your_generated_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

### Frontend (.env.production)
```
VITE_API_URL=https://agroanalytics-api.render.com/api
```

---

## 🛠️ Corrections à faire AVANT déploiement

### 1. Sécurité CORS
**Fichier:** `backend/main.py`

**Avant:**
```python
allow_origins=["*"]
```

**Après:**
```python
allow_origins=[
    "https://agroanalytics-frontend.vercel.app",
    "https://www.agroanalytics.com"
]
```

### 2. Base de données
**Assurez-vous que le script `database/init.sql` crée:**
- [ ] Table `users`
- [ ] Table `collectes`
- [ ] Relations étrangères
- [ ] Index de performance

### 3. Authentification
- [ ] Vérifier que les PINs ne sont JAMAIS en clair
- [ ] Utiliser bcrypt pour hasher les mots de passe
- [ ] Tester le flux login/logout

### 4. API
- [ ] Tous les endpoints retournent le bon format JSON
- [ ] Gestion d'erreurs appropriée
- [ ] Logs structurés

---

## 📱 Processus de déploiement complet

### Jour 1 : Préparation
```bash
# 1. Vérifier la branche de déploiement
git status
git branch -a

# 2. Mettre à jour le code
git pull origin main

# 3. Lancer les tests
cd backend && python -m pytest tests/ -v
cd ../frontend && npm run build && npm run lint
```

### Jour 2 : Déploiement Backend
```bash
# 1. Créer database.env
cat > backend/.env.production << EOF
DATABASE_URL=postgresql://...
SECRET_KEY=your_key_here
EOF

# 2. Tester la connexion DB
python backend/test_db_connection.py

# 3. Pusher vers Render/Railway (auto-deploy via GitHub)
git push origin main
```

### Jour 3 : Déploiement Frontend
```bash
# 1. Créer .env.production
cat > frontend/.env.production << EOF
VITE_API_URL=https://agroanalytics-api.render.com/api
EOF

# 2. Build local
cd frontend
npm run build

# 3. Pusher vers Vercel/Netlify (auto-deploy via GitHub)
git push origin main
```

---

## ✅ Tests post-déploiement

### Backend
```bash
# Vérifier l'API
curl https://agroanalytics-api.render.com/

# Vérifier la documentation
https://agroanalytics-api.render.com/docs

# Tester login
curl -X POST https://agroanalytics-api.render.com/api/auth/login \
  -d "username=admin00&password=1234"
```

### Frontend
```bash
# Vérifier le site
https://agroanalytics-frontend.vercel.app

# Tester login avec admin00:1234
# Vérifier que les 8 collections s'affichent
# Tester la création d'une nouvelle collection
```

---

## 🚨 Troubleshooting

| Problème | Solution |
|----------|----------|
| 502 Bad Gateway Backend | Vérifier DATABASE_URL, redémarrer le service |
| CORS errors | Vérifier allow_origins dans main.py |
| Collections vides | Vérifier user_id dans la DB, re-run migrate_to_admin00.py |
| Build failure | Vérifier Node/Python versions, npm install |
| Login échoue | Vérifier SECRET_KEY, vérifier bcrypt |

---

## 📊 Architecture déployée

```
┌─────────────────────────────────────┐
│   Frontend (Vercel)                 │
│   React + Vite + TailwindCSS        │
│   https://agroanalytics.vercel.app  │
└──────────────┬──────────────────────┘
               │ API calls
               ▼
┌─────────────────────────────────────┐
│   Backend API (Render)              │
│   FastAPI + uvicorn                 │
│   https://agroanalytics.render.com  │
└──────────────┬──────────────────────┘
               │ SQL queries
               ▼
┌─────────────────────────────────────┐
│   PostgreSQL (Supabase)             │
│   Database + Auth                   │
└─────────────────────────────────────┘
```

---

## 📞 Support & Monitoring

### Logs Backend (Render/Railway)
- Vérifier les logs en temps réel
- Alertes sur erreurs HTTP 5xx

### Monitoring Frontend (Vercel)
- Analytics de performance
- Core Web Vitals
- Erreurs JavaScript

### Uptime Monitoring
- [Uptime Robot](https://uptimerobot.com) gratuit

---

## ✨ Prochaines étapes après déploiement

1. **Domaine personnalisé** : agroanalytics.com
2. **SSL/HTTPS** : Automatique sur Vercel/Render
3. **Backups** : Configurer backups automatiques Supabase
4. **CDN** : Vercel inclus, optimisation images
5. **Analytics** : Google Analytics, Sentry pour erreurs
6. **CI/CD** : GitHub Actions pour tests auto

---

**Durée estimée:** 3-5 jours  
**Coût:** Gratuit (tiers free Vercel + Render + Supabase)  
**Complexité:** ⭐⭐⭐ (Moyenne)

