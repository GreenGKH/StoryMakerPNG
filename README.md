# 🖼️ StoryMaker PNG

> Générateur d'histoires IA à partir d'images avec Google Gemini Pro Vision

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5-purple.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-cyan.svg)](https://tailwindcss.com/)

## ✨ Fonctionnalités

- 📸 **Upload d'images** avec prévisualisation et drag & drop
- 🎭 **Sélection de genres** (max 3): Horreur, Fantaisie, Sci-Fi, Romance, Aventure, Mystère, Comédie, Drame, Thriller, Historique
- 📏 **Curseur de longueur**: Court (100-200 mots), Moyen (300-500 mots), Long (600-1000 mots)
- 🤖 **Génération d'histoires** avec Google Gemini Pro Vision
- 📱 **Interface responsive** et moderne
- 💾 **Sauvegarde locale** et partage
- 🔒 **Sécurité** et validation robustes

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

# Démarrer en développement
npm run dev
```

## 🏗️ Architecture

```
Frontend (React + Vite + Tailwind) ⇄ Backend (Node.js + Express) ⇄ Google Gemini Pro Vision
                ↓                              ↓
        LocalStorage/IndexedDB          Multer + File System
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
# API Configuration
NODE_ENV=development
PORT=3000
GEMINI_API_KEY=your_gemini_api_key_here

# Security
CORS_ORIGIN=http://localhost:5173
MAX_FILE_SIZE=2097152

# Rate Limiting
RATE_LIMIT_MAX=100
STORY_RATE_LIMIT_MAX=5
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
# Build
npm run build

# Démarrer en production
npm start
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
# Tests unitaires
npm run test

# Tests avec coverage
npm run test:coverage

# Tests E2E (si configurés)
npm run test:e2e
```

## 📊 Monitoring

- Health check: `GET /health`
- Métriques de performance intégrées
- Logging structuré avec Winston

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