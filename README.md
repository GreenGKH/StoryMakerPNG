# 🖼️ StoryMaker PNG

> Générateur d'histoires IA à partir d'images avec Google Gemini 2.5 Flash

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5-purple.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-cyan.svg)](https://tailwindcss.com/)
[![Google Gemini](https://img.shields.io/badge/Gemini-2.5%20Flash-orange.svg)](https://ai.google.dev/)

## ✨ Fonctionnalités

- 📸 **Upload d'images** avec prévisualisation et drag & drop
- 🎭 **Sélection de genres** (max 3): Horreur, Fantaisie, Sci-Fi, Romance, Aventure, Mystère, Comédie, Drame, Thriller, Historique
- 📏 **Curseur de longueur**: Court (100-200 mots), Moyen (300-500 mots), Long (600-1000 mots)
- 🤖 **Génération d'histoires** avec Google Gemini 2.5 Flash
- 📱 **Interface responsive** et moderne
- 💾 **Sauvegarde locale** avec Zustand pour la gestion d'état
- 🔒 **Sécurité** et validation robustes avec Express-Validator
- 🎨 **Interface moderne** avec Lucide React icons et Framer Motion
- 🧹 **Nettoyage automatique** des fichiers temporaires avec Node-Cron
- 📊 **Logging structuré** avec Winston
- ⚡ **Optimisation d'images** avec Sharp

## 🛠️ Technologies utilisées

### Frontend
- **React 18** - Interface utilisateur moderne
- **Vite** - Build tool rapide et optimisé
- **Tailwind CSS** - Framework CSS utilitaire
- **Zustand** - Gestion d'état légère
- **Framer Motion** - Animations fluides
- **React Dropzone** - Upload par glisser-déposer
- **Lucide React** - Icônes modernes
- **Axios** - Client HTTP
- **React Hot Toast** - Notifications

### Backend
- **Node.js & Express** - Serveur web robuste
- **Google Generative AI** - Intégration Gemini 2.5 Flash
- **Multer** - Upload de fichiers
- **Sharp** - Traitement d'images
- **Winston** - Logging avancé
- **Express Rate Limit** - Protection contre le spam
- **Express Validator** - Validation des données
- **Node-Cron** - Tâches programmées
- **Helmet & CORS** - Sécurité web

### Développement
- **ESLint & Prettier** - Qualité du code
- **Vitest** - Tests frontend
- **Jest & Supertest** - Tests backend
- **Nodemon** - Rechargement automatique
- **Concurrently** - Orchestration des tâches

## 🚀 Installation rapide

```bash
# Cloner le projet
git clone <repository-url>
cd story-maker-png

# Installer les dépendances
npm install

# Configuration environnement
cp .env.example .env
# Éditer .env avec votre clé API Gemini
# Obtenir votre clé sur: https://makersuite.google.com/app/apikey

# Démarrer en développement
npm run dev
```

## 🏗️ Architecture

```
Frontend (React + Vite + Tailwind) ⇄ Backend (Node.js + Express) ⇄ Google Gemini 2.5 Flash
                ↓                              ↓
        LocalStorage/Zustand            Multer + File System + Winston Logging
```

## 📁 Structure du projet

```
story-maker-png/
├── 📦 client/              # Frontend React
│   ├── src/
│   │   ├── components/     # Composants UI
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # API calls
│   │   └── utils/          # Utilitaires
├── 🖥️ server/              # Backend Node.js
│   ├── src/
│   │   ├── controllers/    # Logique métier
│   │   ├── middleware/     # Middlewares
│   │   ├── routes/         # Routes API
│   │   └── services/       # Services externes
└── 📋 docs/                # Documentation
```

## ⚙️ Configuration

### Variables d'environnement (.env)

```bash
# Environment Configuration
NODE_ENV=development
PORT=3000

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key_here

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# File Upload Settings
MAX_FILE_SIZE=2097152
UPLOAD_DIR=./uploads
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp

# Rate Limiting
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
STORY_RATE_LIMIT_MAX=5
UPLOAD_RATE_LIMIT_MAX=10

# Security
JWT_SECRET=your_jwt_secret_here
BCRYPT_ROUNDS=12

# Logging
LOG_LEVEL=info
LOG_FILE=./logs/app.log

# Cleanup Job
CLEANUP_INTERVAL=24
MAX_FILE_AGE=7

# Performance
COMPRESSION_LEVEL=6
CACHE_TTL=3600
```

### Obtenir une clé API Gemini

1. Aller sur [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Créer une nouvelle clé API
3. Ajouter la clé dans votre fichier `.env`

## 🛠️ Développement

```bash
# Démarrer en développement (client + serveur)
npm run dev

# Client seulement
npm run dev:client

# Serveur seulement  
npm run dev:server

# Tests
npm test

# Linting
npm run lint
npm run lint:fix

# Formatage
npm run format
```

## 🏭 Production

```bash
# Build client
npm run build

# Build server (validation)
npm run build:server

# Démarrer en production
npm start

# Validation complète
npm run validate
```

### Docker (Optionnel)

```bash
# Build et démarrer avec Docker Compose
docker-compose up -d

# Logs
docker-compose logs -f
```

## 📝 API Endpoints

### Stories
- `POST /api/stories/generate` - Générer une histoire
- `GET /api/stories/history` - Récupérer l'historique

### Upload
- `POST /api/upload/image` - Upload d'image
- `DELETE /api/upload/:filename` - Supprimer une image

## 🔒 Sécurité

- ✅ Validation des fichiers (type, taille, contenu)
- ✅ Rate limiting granulaire
- ✅ Sanitization des inputs
- ✅ Headers de sécurité (Helmet)
- ✅ CORS configuré
- ✅ Nettoyage automatique des fichiers

## ⚡ Performance

- ✅ Compression des assets
- ✅ Code splitting React
- ✅ Optimisation des images
- ✅ Caching stratégique
- ✅ Bundle analysis

## 🧪 Tests

```bash
# Tests client et serveur
npm run test

# Tests client seulement
npm run test:client

# Tests serveur seulement
npm run test:server

# Tests avec coverage (serveur)
npm run test:coverage

# Tests en mode watch (serveur)
npm run test:watch

# Tests avec interface graphique (client)
npm run test:ui
```

## 📊 Monitoring & Observabilité

- **Logging structuré**: Winston avec rotation des logs
- **Nettoyage automatique**: Suppression des fichiers temporaires
- **Rate limiting**: Protection contre les abus d'API
- **Validation robuste**: Contrôles de sécurité à tous les niveaux
- **Gestion d'erreurs**: Centralisation avec stack traces
- **Métriques d'upload**: Suivi des fichiers et de leur utilisation

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/amazing-feature`)
3. Commit les changements (`git commit -m 'Add amazing feature'`)
4. Push la branche (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

## 📄 Licence

MIT - Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🆘 Support

- 📖 [Documentation complète](./docs/)
- 🐛 [Signaler un bug](issues)
- 💡 [Demander une fonctionnalité](issues)

---

Fait avec ❤️ et IA