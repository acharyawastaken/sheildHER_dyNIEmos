"""
Epoch Guardian — FastAPI Backend
Main entry point for the API server.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.sos import router as sos_router
from routes.risk import router as risk_router

app = FastAPI(
    title="Epoch Guardian API",
    description="Privacy-first, real-time AI safety assistant backend",
    version="1.0.0",
)

# CORS middleware for mobile app access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # TODO: Restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {
        "app": "Epoch Guardian API",
        "version": "1.0.0",
        "status": "running",
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}


# Register route modules
app.include_router(sos_router, prefix="/api/sos", tags=["SOS"])
app.include_router(risk_router, prefix="/api/risk", tags=["Risk"])
