# MVP (Minimum Viable Product)

## Goal
Build a functional safety system that can detect risk and respond to emergencies.

## Core Features
- Silent Guardian AI (basic risk scoring)
- SOS button (manual trigger)
- Live location sharing
- Lock screen quick access
- Basic safe route suggestion
- Emergency alerts to contacts

## MVP Workflow
1. App runs in background
2. Location + time used to compute risk score
3. User presses SOS
4. Backend receives request
5. Alerts sent to emergency contacts
6. Live tracking begins

## Risk Logic (Simple)
```
risk_score = location_risk + night_factor

If risk_score > threshold:
    trigger warning / alert
```

## Tech Stack
- Expo React Native (frontend)
- FastAPI (backend)
- Google Maps API
- Firebase / Supabase (database)
