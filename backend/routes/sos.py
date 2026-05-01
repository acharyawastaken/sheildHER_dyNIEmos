"""
SOS Routes — Handles emergency SOS triggers, cancellations, and test alerts.
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from services.alert_service import send_sos_alert, cancel_sos_alert, send_test_alert

router = APIRouter()


class Location(BaseModel):
    latitude: float
    longitude: float
    area: Optional[str] = None
    city: Optional[str] = None


class SOSRequest(BaseModel):
    user_id: str
    location: Location
    message: Optional[str] = "Emergency SOS triggered"
    contact_ids: Optional[List[str]] = None


class CancelSOSRequest(BaseModel):
    alert_id: str
    user_id: str


@router.post("/trigger")
async def trigger_sos(request: SOSRequest):
    """Trigger an SOS alert to emergency contacts."""
    result = await send_sos_alert(
        user_id=request.user_id,
        location=request.location.dict(),
        message=request.message,
        contact_ids=request.contact_ids,
    )
    return result


@router.post("/cancel")
async def cancel_sos(request: CancelSOSRequest):
    """Cancel an active SOS alert."""
    result = await cancel_sos_alert(
        alert_id=request.alert_id,
        user_id=request.user_id,
    )
    return result


@router.post("/test")
async def test_sos(request: SOSRequest):
    """Send a test SOS alert to verify contact delivery."""
    result = await send_test_alert(
        user_id=request.user_id,
        contact_ids=request.contact_ids,
    )
    return result


@router.get("/status/{alert_id}")
async def get_sos_status(alert_id: str):
    """Get the status of an active SOS alert."""
    # TODO: Fetch from database
    return {
        "alert_id": alert_id,
        "status": "active",
        "timestamp": datetime.utcnow().isoformat(),
    }
