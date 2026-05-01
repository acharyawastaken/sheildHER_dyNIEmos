# 🛡️ Epoch — AI-Powered Safety Assistant

> A privacy-first, real-time AI safety assistant that **predicts, prevents, and responds** to potential danger for women in public and private spaces.

---

## 📌 Problem

Women face unpredictable safety risks — especially during travel or in isolated situations. Existing SOS solutions are **reactive** and lack real-time awareness, predictive intelligence, and continuous monitoring.

**Epoch** fills that gap with a proactive, intelligent safety system.

## 🎯 Vision

Build a real-time safety assistant that:
- Predicts potential danger using real-time signals
- Provides preventive guidance (safe routes, warnings)
- Ensures immediate emergency response
- Maintains strong privacy and user trust

---

## ✨ Features

### Core (MVP)
| Feature | Description |
|---|---|
| 🧠 Silent Guardian AI | Background risk scoring using location + time |
| 🆘 SOS Button | One-tap emergency trigger |
| 📍 Live Location Sharing | Real-time tracking shared with emergency contacts |
| 🔒 Lock Screen Access | Quick-access SOS from lock screen |
| 🗺️ Safe Route Suggestions | Basic route safety recommendations |
| 📢 Emergency Alerts | Instant alerts to pre-configured contacts |

### Advanced (Planned)
| Feature | Description |
|---|---|
| 🔀 Route Deviation Detection | Alerts when deviating from expected path |
| 📞 Fake Call Mode | Simulated incoming call to escape situations |
| 🎙️ Distress Detection | Audio-based distress recognition |
| 📸 Evidence Capture | Discreet photo/video recording |
| 📡 Live Streaming | Real-time stream to trusted contacts |

---

## 🏗️ Architecture

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

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Expo React Native |
| Backend | FastAPI (Python) |
| Maps | Google Maps API |
| Database | Firebase / Supabase |
| Notifications | SMS + Push |

---

## 📂 Project Structure

```
epoch/
├── PROBLEM_STATEMENT.md   # Core problem definition
├── MVP.md                 # Minimum viable product scope
├── PRD.md                 # Product requirements document
├── PLAN.md                # Development roadmap
├── AI_RULES.md            # AI constraints & ethics
├── ARCHITECTURE.md        # System architecture
├── README.md              # This file
│
├── /app                   # Mobile app (Expo)
│   ├── /screens
│   ├── /components
│   ├── /services
│   └── /utils
│
└── /backend               # API server (FastAPI)
    ├── main.py
    ├── /routes
    └── /services
```

---

## 🗺️ Development Roadmap

### Phase 1 – MVP ⬅️ **Current Phase**
- [x] Project documentation & planning
- [ ] SOS system
- [ ] Live tracking
- [ ] Basic risk scoring
- [ ] Emergency alerts

### Phase 2 – Intelligence
- [ ] Silent Guardian AI
- [ ] Route safety logic
- [ ] Anomaly detection

### Phase 3 – Advanced Features
- [ ] Fake call mode
- [ ] Gesture triggers
- [ ] Route deviation detection
- [ ] Check-in timer

### Phase 4 – Expansion
- [ ] AI improvements
- [ ] Wearable integration
- [ ] Partnerships (B2B, government)

---

## 🔐 AI Rules & Ethics

- **Privacy-first**: Minimal data collection, on-device processing preferred
- **Explainable AI**: No black-box decisions — threshold-based risk scoring
- **User control**: Manual override always available; no blind SOS triggers
- **No data selling**: Zero monetization of user data
- **No ads during emergencies**: Safety is never interrupted

---

## 📊 Success Metrics

| Metric | Target |
|---|---|
| SOS response time | < 3 seconds |
| Alert delivery rate | > 99% |
| False alert rate | < 5% |
| Risk calculation speed | < 1 second |

---

## 🚀 Getting Started

> _Setup instructions will be added as development progresses through each phase._

```bash
# Clone the repository
git clone <repo-url>
cd epoch

# Frontend (coming soon)
# cd app && npm install && npx expo start

# Backend (coming soon)
# cd backend && pip install -r requirements.txt && uvicorn main:app --reload
```

---

## 📄 Documentation

| Document | Description |
|---|---|
| [PROBLEM_STATEMENT.md](./PROBLEM_STATEMENT.md) | Why this project exists |
| [MVP.md](./MVP.md) | Minimum viable product definition |
| [PRD.md](./PRD.md) | Full product requirements |
| [PLAN.md](./PLAN.md) | Development roadmap |
| [AI_RULES.md](./AI_RULES.md) | AI constraints & ethical guidelines |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System architecture & file structure |

---

## 🤝 Contributing

This project is currently in active development. Contribution guidelines will be published after Phase 1 is complete.

---

## 📝 License

_License to be determined._

---

<p align="center">
  <strong>Epoch</strong> — Because safety should be proactive, not reactive.
</p>
