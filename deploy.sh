#!/bin/bash

# 🚀 Script de déploiement complet AgroAnalytics
# Usage: ./deploy.sh [environment]
# Environments: development, staging, production

set -e

ENVIRONMENT=${1:-development}
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

echo "================================"
echo "🚀 AgroAnalytics Deployment"
echo "================================"
echo "Environment: $ENVIRONMENT"
echo "Timestamp: $TIMESTAMP"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Pre-deployment checks
echo -e "${YELLOW}[1/6] Pré-vérifications...${NC}"
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 not found${NC}"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Python et Node.js détectés${NC}"

# 2. Backend preparation
echo -e "${YELLOW}[2/6] Préparation du backend...${NC}"
cd backend

# Create virtual environment if not exists
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi

source venv/bin/activate
pip install -r requirements.txt -q
echo -e "${GREEN}✓ Dépendances backend installées${NC}"

# 3. Backend tests
echo -e "${YELLOW}[3/6] Tests du backend...${NC}"
if [ -d "tests" ]; then
    python -m pytest tests/ -v
else
    echo -e "${YELLOW}⚠ Pas de tests trouvés${NC}"
fi

deactivate
cd ..

# 4. Frontend preparation
echo -e "${YELLOW}[4/6] Préparation du frontend...${NC}"
cd frontend

npm ci -q
echo -e "${GREEN}✓ Dépendances frontend installées${NC}"

# 5. Frontend linting & build
echo -e "${YELLOW}[5/6] Linting et build du frontend...${NC}"
npm run lint --silent 2>/dev/null || echo -e "${YELLOW}⚠ Linting warnings${NC}"
npm run build
echo -e "${GREEN}✓ Build frontend réussi${NC}"

cd ..

# 6. Final checks
echo -e "${YELLOW}[6/6] Vérifications finales...${NC}"

if [ -f "backend/main.py" ] && [ -f "frontend/dist/index.html" ]; then
    echo -e "${GREEN}✓ Tous les fichiers de déploiement présents${NC}"
else
    echo -e "${RED}❌ Fichiers de déploiement manquants${NC}"
    exit 1
fi

# 7. Git operations
if [ "$ENVIRONMENT" = "production" ]; then
    echo -e "${YELLOW}Commit et push en cours...${NC}"
    git add .
    git commit -m "Deploy: $TIMESTAMP - $ENVIRONMENT"
    git push origin main
    echo -e "${GREEN}✓ Code poussé vers GitHub${NC}"
fi

echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}✅ Déploiement prêt !${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "Prochaines étapes:"
echo "1. Backend (Render): Connecter GitHub → Auto-deploy"
echo "2. Frontend (Vercel): Connecter GitHub → Auto-deploy"
echo "3. Base de données: Créer PostgreSQL sur Supabase"
echo "4. Variables d'environnement: Configurer dans les dashboards"
echo ""
