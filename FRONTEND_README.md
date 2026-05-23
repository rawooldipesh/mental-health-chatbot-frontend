# FEELFree — Frontend

> Cross-platform mobile application for the FEELFree AI-powered mental health chatbot. Built with React Native and Expo.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native + Expo (SDK 54) |
| Navigation | Expo Router v5 + React Navigation |
| Language | TypeScript |
| State Management | Zustand |
| Storage | Expo SecureStore + AsyncStorage |
| Charts | react-native-chart-kit + react-native-svg |
| Calendar | react-native-calendars |
| Animations | react-native-reanimated |
| Sentiment (client) | sentiment.js |
| Icons | Expo Vector Icons |

---

## 📁 Folder Structure

```
mental-health-chatbot-frontend/
├── app/                        # Expo Router screens (file-based routing)
├── assets/                     # Images, fonts, static files
├── components/                 # Reusable UI components
├── services/                   # API call functions (axios/fetch wrappers)
├── store/                      # Zustand global state stores
├── utils/
│   ├── config.ts               # App-wide config (API base URL etc.)
│   ├── sentimentHelper.ts      # Client-side sentiment utilities
│   └── storage.ts              # AsyncStorage / SecureStore helpers
├── .expo/
├── .env                        # Environment variables (never commit)
├── app.json                    # Expo app config
├── expo-env.d.ts               # Expo TypeScript env declarations
├── eslint.config.js
├── tsconfig.json
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- Expo CLI: `npm install -g expo-cli`
- Expo Go app on your phone (Android/iOS) — OR an emulator

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/mental-health-chatbot-frontend.git
cd mental-health-chatbot-frontend

# 2. Install dependencies
npm install

# 3. Create your .env file
cp .env.example .env
# Fill in your API base URL (see Environment Variables below)

# 4. Start the development server
npm start
```

### Running on a Device / Emulator

```bash
# Android
npm run android

# iOS
npm run ios

# Web
npm run web
```

> 📱 For physical device testing — make sure your phone and development machine are on the **same WiFi network**. Update `API_BASE_URL` in `.env` to your machine's local IP (e.g. `http://192.168.1.x:5000`).

---

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:5000
```

> ⚠️ In Expo, only variables prefixed with `EXPO_PUBLIC_` are exposed to the client. Never store secret keys in the frontend `.env`.

---

## 📱 App Screens

| Screen | Description |
|---|---|
| **Login / Register** | Secure auth with JWT; anonymous login option available |
| **Home Dashboard** | Overview of recent mood and quick access to all features |
| **Chat** | Real-time AI conversation with empathetic responses |
| **Mood Calendar** | Log daily mood; entries auto-tagged Positive / Neutral / Negative |
| **Sentiment Dashboard** | Weekly bar graph and pie chart of emotional trends |
| **Journal & Goals** | Free-write journal entries and personal goal tracking |
| **Meditation** | Guided breathing and mindfulness resources |
| **SOS** | Emergency mental health helpline contacts |

---

## 🗂️ Key Dependencies Explained

| Package | Purpose |
|---|---|
| `expo-router` | File-based navigation (like Next.js for React Native) |
| `zustand` | Lightweight global state management |
| `expo-secure-store` | Securely stores JWT token on device |
| `@react-native-async-storage/async-storage` | Persists non-sensitive app data locally |
| `react-native-calendars` | Mood calendar UI component |
| `react-native-chart-kit` | Bar graphs and pie charts for sentiment visualization |
| `react-native-reanimated` | Smooth animations across the app |
| `sentiment` | Client-side basic sentiment scoring utility |
| `expo-linear-gradient` | Gradient backgrounds and UI elements |
| `expo-haptics` | Haptic feedback for better UX |

---

## 🏗️ Architecture Overview

```
User Action (Screen)
       ↓
  Zustand Store (Global State)
       ↓
  Services Layer (API calls to backend)
       ↓
  FEELFree Backend (Node.js + Express)
       ↓
  MongoDB + OpenAI API
```

- **Screens** handle UI and user interaction
- **Store** manages global state (auth token, mood data, chat history)
- **Services** contain all API call logic — keeping screens clean
- **Utils** handle storage, config, and sentiment helpers

---

## 🔒 Security Notes

- JWT token is stored using **Expo SecureStore** (encrypted, not AsyncStorage)
- No sensitive keys are stored in the frontend
- All API calls include the `Authorization: Bearer <token>` header
- Anonymous login option available for privacy-conscious users

---

## 🧪 Linting

```bash
npm run lint
```

Uses `eslint-config-expo` for React Native / Expo best practices.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "Add your feature"`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 👥 Authors

- **Shreya Sawant** — Frontend development, UI/UX & system integration
- **Nikhil Patil** — API integration & backend connectivity
- **Dipesh Rawool** — Database & sentiment module

**Guided by:** Mrs. Manasi Deore & Mrs. Radhika Pachghare
A.C. Patil College of Engineering, Kharghar, Navi Mumbai

---

## 📄 License

This project is for academic purposes — A.C. Patil College of Engineering, Mumbai University.
