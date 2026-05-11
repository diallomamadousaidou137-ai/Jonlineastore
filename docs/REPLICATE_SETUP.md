# Configuration de Replicate API

Ce guide vous explique comment configurer et utiliser l'intégration Replicate dans le projet.

## Prérequis

- Compte [Replicate](https://replicate.com)
- Token API Replicate
- Model Version ID du modèle à utiliser

## Configuration

### 1. Obtenir vos credentials Replicate

1. Allez sur [Replicate Dashboard](https://replicate.com/account/api-tokens)
2. Copiez votre API Token
3. Choisissez un modèle sur [Replicate Models](https://replicate.com/models)
4. Copiez le **Version ID** du modèle

### 2. Configuration des variables d'environnement

```bash
# Copier le template
cp .env.example .env

# Éditer .env et ajouter :
REPLICATE_API_TOKEN=your_api_token_here
REPLICATE_MODEL_VERSION_ID=your_model_version_id_here
PORT=3000
```

### 3. Installation des dépendances

```bash
npm install
```

### 4. Lancer l'application

```bash
# Mode développement
npm run dev

# Mode production
npm run build
npm start
```

## Utilisation

### 1. Vérifier la configuration

```bash
curl http://localhost:3000/api/ia-home/health
```

Réponse attendue :
```json
{
  "status": "ok",
  "hasReplicateToken": true,
  "hasModelVersionId": true,
  "configured": true,
  "timestamp": "2026-05-11T18:50:00Z"
}
```

### 2. Traiter une image

```bash
curl -X POST http://localhost:3000/api/ia-home/process \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://example.com/image.jpg",
    "prompt": "Your prompt here"
  }'
```

Réponse attendue :
```json
{
  "success": true,
  "result": "https://example.com/output.jpg",
  "message": "Image processed successfully"
}
```

## Modèles recommandés

### Image to Image
- **Instruct Pix2Pix** : Édition d'images basée sur instructions textuelles
  - Version: `c7d5e1c1-1999-4f60-8738-cc84acb75c20`

- **ControlNet** : Contrôle précis de la génération d'images
  - Voir : https://replicate.com/models?collection=controlnet

### Style Transfer
- **FILM** : Interpolation vidéo de haute qualité
  - Voir : https://replicate.com/google-research/film

### Super Resolution
- **Real-ESRGAN** : Amélioration de résolution d'images
  - Voir : https://replicate.com/xinntao/real-esrgan

## Gestion des erreurs

### Erreur : "REPLICATE_API_TOKEN is not set"
```bash
# Solution : Vérifier que .env contient le token
echo $REPLICATE_API_TOKEN
```

### Erreur : "Prediction timeout"
- Augmentez `maxAttempts` dans l'appel à `processIAHome()`
- Vérifiez que le modèle n'est pas surchargé

### Erreur : "Invalid imageUrl format"
- Assurez-vous que l'URL de l'image est accessible publiquement
- Vérifiez que l'URL est valide (commence par `http://` ou `https://`)

## Architecture

```
src/
├── services/
│   └── replicate.ts          # Logique du service Replicate
├── api/
│   └── routes/
│       └── ia-home.ts        # Routes API
├── types/
│   └── replicate.ts          # Types TypeScript
└── index.ts                  # Point d'entrée
```

## Optimisations

### Caching
Ajoutez Redis pour cacher les résultats :
```typescript
const cacheKey = `ia-home:${imageUrl}:${prompt}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);
```

### Queue System
Utilisez Bull ou RabbitMQ pour gérer les files d'attente :
```typescript
const queue = new Queue('ia-home-processing');
await queue.add({ imageUrl, prompt });
```

### Webhooks
Configurez des webhooks Replicate pour les notifications :
```typescript
// Dans la requête API
webhook: process.env.WEBHOOK_URL,
webhook_events_filter: ["completed", "failed"]
```

## Ressources

- [Documentation Replicate](https://replicate.com/docs)
- [API Reference](https://replicate.com/docs/api/python)
- [Models Hub](https://replicate.com/models)
- [Pricing](https://replicate.com/pricing)

## Support

Pour plus d'aide :
- Issues : https://github.com/diallomamadousaidou137-ai/Jonlineastore/issues
- Replicate Support : https://replicate.com/support
