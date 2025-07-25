# 🚀 Guide d'Installation - StoryMaker PNG

## Prérequis

- **Node.js**: 18.0.0 ou supérieur
- **npm**: 9.0.0 ou supérieur
- **Clé API Google Gemini**: [Obtenir une clé](https://makersuite.google.com/app/apikey)

## Installation rapide

### 1. Cloner et installer

```bash
# Cloner le projet
git clone <repository-url>
cd story-maker-png

# Installer les dépendances (monorepo)
npm install
```

### 2. Configuration environnement

```bash
# Copier le fichier d'exemple
cp .env.example .env

# Éditer .env avec vos configurations
nano .env
```

**Variables obligatoires dans `.env`:**
```bash
GEMINI_API_KEY=your_gemini_api_key_here
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:5173
```

### 3. Démarrage développement

```bash
# Démarrer client + serveur simultanément
npm run dev

# OU démarrer séparément
npm run dev:client    # Frontend sur :5173
npm run dev:server    # Backend sur :3000
```

## Configuration détaillée

### Variables d'environnement

```bash
# Core Configuration
NODE_ENV=development|production
PORT=3000
GEMINI_API_KEY=your_gemini_api_key_here

# CORS & Security
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=your_jwt_secret_here

# File Upload
MAX_FILE_SIZE=2097152          # 2MB en bytes
UPLOAD_DIR=./uploads
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp

# Rate Limiting
RATE_LIMIT_WINDOW=900000       # 15 minutes
RATE_LIMIT_MAX=100             # Requêtes par fenêtre
STORY_RATE_LIMIT_MAX=5         # Histoires par fenêtre
UPLOAD_RATE_LIMIT_MAX=10       # Uploads par fenêtre

# Logging
LOG_LEVEL=info
LOG_FILE=./logs/app.log

# Cleanup Job
CLEANUP_INTERVAL=0 2 * * *     # Tous les jours à 2h
MAX_FILE_AGE=7                 # Âge max fichiers (jours)
```

### Structure finale

Après installation, votre projet devrait ressembler à:

```
story-maker-png/
├── 📦 package.json              # Workspace root
├── 🏗️ client/                   # Frontend React
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
├── 🖥️ server/                   # Backend Node.js
│   ├── package.json
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── app.js
│   ├── uploads/                 # Images uploadées
│   └── logs/                    # Logs serveur
├── .env                         # Variables environnement
├── .gitignore
└── README.md
```

## Vérification installation

### Tests de base

```bash
# Linter
npm run lint

# Tests (quand disponibles)
npm test

# Build de production
npm run build
```

### Health checks

1. **Frontend**: http://localhost:5173
2. **Backend**: http://localhost:3000/health
3. **API Test**: 
   ```bash
   curl http://localhost:3000/health
   ```

### Validation configuration

```bash
# Vérifier que tous les services démarrent
npm run dev

# Dans un autre terminal, tester l'API
curl -X GET http://localhost:3000/health

# Response attendue:
{
  "status": "OK",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "uptime": 30.5,
  "environment": "development"
}
```

## Déploiement production

### Build production

```bash
# Build client
npm run build

# Le serveur n'a pas de build (Node.js)
npm run build:server  # Just validation
```

### Démarrage production

```bash
# Variables d'environnement production
export NODE_ENV=production
export GEMINI_API_KEY=your_production_key
export CORS_ORIGIN=https://yourdomain.com

# Démarrer
npm start
```

### Docker (optionnel)

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - GEMINI_API_KEY=${GEMINI_API_KEY}
    volumes:
      - ./uploads:/app/uploads
      - ./logs:/app/logs
```

```bash
# Démarrer avec Docker
docker-compose up -d
```

## Dépannage

### Problèmes courants

**1. Erreur "Module not found"**
```bash
# Nettoyer et réinstaller
rm -rf node_modules
rm package-lock.json
npm install
```

**2. Port déjà utilisé**
```bash
# Changer le port dans .env
PORT=3001
```

**3. Erreur API Gemini**
```bash
# Vérifier la clé API
echo $GEMINI_API_KEY
# Tester l'API directement
curl -H "Authorization: Bearer $GEMINI_API_KEY" \
     https://generativelanguage.googleapis.com/v1/models
```

**4. Erreurs de permissions fichiers**
```bash
# Créer les dossiers nécessaires
mkdir -p server/uploads server/logs
chmod 755 server/uploads server/logs
```

### Logs utiles

```bash
# Logs serveur en temps réel
tail -f server/logs/combined.log

# Logs erreurs uniquement
tail -f server/logs/error.log

# Logs Docker
docker-compose logs -f
```

## Support

- 📖 [Documentation API](./API.md)
- 🐛 [Signaler un bug](../issues)
- 💬 [Discussions](../discussions)

---

**Installation réussie?** → Consultez le [README.md](../README.md) pour utilisation