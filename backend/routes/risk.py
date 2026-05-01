"""
Risk Routes — Handles risk score calculation and area safety queries.
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

from services.risk_engine import calculate_risk_score, get_area_safety

router = APIRouter()


class RiskRequest(BaseModel):
    latitude: float
    longitude: float
    hour: Optional[int] = None  # Will use current hour if not provided
    movement_risk: Optional[float] = 0.0
    crowding_risk: Optional[float] = 0.0


class AreaSafetyRequest(BaseModel):
    latitude: float
    longitude: float


@router.post("/score")
async def get_risk_score(request: RiskRequest):
    """Calculate the risk score for a given location and context."""
    result = await calculate_risk_score(
        latitude=request.latitude,
        longitude=request.longitude,
        hour=request.hour,
        movement_risk=request.movement_risk,
        crowding_risk=request.crowding_risk,
    )
    return result


@router.post("/area-safety")
async def get_area_safety_score(request: AreaSafetyRequest):
    """Get the safety score for a specific area."""
    result = await get_area_safety(
        latitude=request.latitude,
        longitude=request.longitude,
    )
    return result


@router.get("/factors")
async def get_risk_factors():
    """Get the current risk factor weights and thresholds (for explainability)."""
    return {
        "weights": {
            "location": 0.4,
            "time": 0.3,
            "movement": 0.15,
            "crowding": 0.15,
        },
        "thresholds": {
            "low": 35,
            "moderate": 65,
        },
        "night_factors": {
            "late_night": 1.6,
            "evening": 1.4,
            "early_morning": 1.2,
            "day": 1.0,
        },
    }
