# SafeKid 🛡️

Application mobile de protection et de localisation d'enfants en temps réel.

## Architecture

```
safekid/
├── app/          # Application mobile (React Native + Expo)
├── backend/      # Serveur API + temps réel (Node.js + Socket.io)
└── README.md
```

## Fonctionnalités

- **Carte en temps réel** — Position exacte des enfants sur carte
- **Zones de sécurité** — Définir des zones (maison, école, famille) avec alertes
- **Alertes instantanées** — Notification push dès qu'une zone est franchie
- **Navigation GPS** — Mode navigation à pied ou en voiture vers l'enfant
- **Rapports** — Historique des déplacements (semaine / mois / trimestre)
- **Multi-parents** — Inviter d'autres membres de confiance
- **Multi-enfants** — Gérer plusieurs enfants avec une seule application

## Démarrage rapide

### Application mobile

```bash
cd app
npm install
npm start
```

Puis scanner le QR code avec l'application Expo Go sur votre téléphone.

### Serveur backend

```bash
cd backend
npm install
cp .env.example .env
# Éditer .env avec vos clés API
npm run dev
```

## Configuration requise

### Clés API à obtenir

1. **Google Maps API Key** — [console.cloud.google.com](https://console.cloud.google.com)
   - Activer Maps SDK for Android
   - Activer Maps SDK for iOS
   - Placer les clés dans `app/app.json`

2. **EAS Build** (optionnel pour builds natifs)
   ```bash
   npm install -g eas-cli
   eas login
   eas build:configure
   ```

## Technologies

### Frontend
- React Native + Expo SDK 51
- React Navigation 6 (navigation fluide)
- react-native-maps (cartes)
- Zustand (état global)
- TypeScript

### Backend
- Node.js + Express + TypeScript
- Socket.io (temps réel)
- JWT (authentification)
- bcryptjs (sécurité mots de passe)

## Puce GPS (hardware)

La puce SafeKid communique avec le backend via :
- **MQTT** ou **WebSocket** pour les mises à jour de position
- **Endpoint HTTP POST** `/api/tracking/location` pour les envois moins fréquents
- **SOS** via Socket event `chip:sos`

Voir `backend/src/socket/index.ts` et `backend/src/routes/tracking.ts` pour les détails du protocole.
