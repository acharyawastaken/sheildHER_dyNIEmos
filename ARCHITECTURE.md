# System Architecture

## Overview

```
Mobile App (Expo React Native)
         ↓
   API Layer (FastAPI)
         ↓
   ┌─────────────────────┐
   │   Risk Engine        │
   │   Alert System       │
   │   Location Service   │
   └─────────────────────┘
         ↓
   Database (Firebase / Supabase)
```

## File Structure

```
epoch/
├── README.md
├── PROBLEM_STATEMENT.md
├── MVP.md
├── PRD.md
├── PLAN.md
├── AI_RULES.md
├── ARCHITECTURE.md
├── guardian_app.jsx            # Original UI/UX reference design
│
├── app/                        # Frontend (Expo React Native)
│   ├── screens/
│   │   ├── HomeScreen.js       # Dashboard: risk score, signals, guardian toggle
│   │   ├── MapScreen.js        # Map with safe/fast route selection
│   │   ├── SOSScreen.js        # Hold-to-activate SOS + quick actions
│   │   ├── ContactsScreen.js   # Emergency contacts management
│   │   └── SettingsScreen.js   # Safety/privacy preferences
│   │
│   ├── components/
│   │   ├── RiskIndicator.js    # SVG arc gauge for risk score
│   │   ├── SOSButton.js        # Hold-to-activate button with progress ring
│   │   └── MapView.js          # Stylized map with routes & risk zones
│   │
│   ├── services/
│   │   ├── locationService.js  # GPS & movement tracking
│   │   ├── riskEngine.js       # Client-side risk scoring
│   │   └── alertService.js     # SOS alert dispatch
│   │
│   └── utils/
│       ├── constants.js        # Design tokens, fonts, config
│       └── helpers.js          # Risk helpers, formatting utilities
│
└── backend/                    # API Server (FastAPI)
    ├── main.py                 # App entry point, middleware, route registration
    ├── requirements.txt        # Python dependencies
    ├── routes/
    │   ├── __init__.py
    │   ├── sos.py              # SOS trigger, cancel, test endpoints
    │   └── risk.py             # Risk score & area safety endpoints
    └── services/
        ├── __init__.py
        ├── alert_service.py    # SMS/push alert dispatch logic
        └── risk_engine.py      # Server-side risk calculation engine
```

## Key Modules

### Location Service (`app/services/locationService.js`)
- Fetch GPS data via Expo Location API
- Track user movement state (walking, stationary, vehicle)
- Compute live signals for dashboard

### Risk Engine (`app/services/riskEngine.js` + `backend/services/risk_engine.py`)
- Calculate risk score using explainable, threshold-based logic
- Weighted components: location (40%), time (30%), movement (15%), crowding (15%)
- Night factor multipliers for time-based risk
- No black-box models — fully transparent scoring

### Alert System (`app/services/alertService.js` + `backend/services/alert_service.py`)
- Send SOS alerts via SMS / push notifications
- Manage emergency contacts
- Test alert verification
- SMS fallback in low network conditions

## Data Flow

```
User Action (SOS / Background)
       ↓
  Location Service
  (GPS + Movement)
       ↓
  Risk Engine (Client)
  (Quick local scoring)
       ↓
  FastAPI Backend
  (Full risk calculation)
       ↓
  Alert Service
  (SMS + Push to contacts)
       ↓
  Database
  (Log alert, track session)
```
