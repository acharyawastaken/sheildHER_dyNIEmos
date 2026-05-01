"""
Alert Service — Handles sending SOS alerts via SMS / push notifications.
Simulated for MVP. Will integrate with Twilio / Firebase Cloud Messaging in production.
"""

from datetime import datetime
from typing import List, Optional
import uuid


async def send_sos_alert(
    user_id: str,
    location: dict,
    message: str = "Emergency SOS triggered",
    contact_ids: Optional[List[str]] = None,
) -> dict:
    """
    Send SOS alert to emergency contacts.
    
    Args:
        user_id: The user triggering the alert
        location: Dict with latitude, longitude, area, city
        message: Alert message
        contact_ids: Specific contact IDs to notify (None = all active)
    
    Returns:
        Alert result with delivery statuses
    """
    alert_id = f"SOS-{uuid.uuid4().hex[:8]}"
    
    # TODO: Fetch contacts from database
    # TODO: Send real SMS via Twilio
    # TODO: Send push notification via Firebase Cloud Messaging
    
    print(f"[AlertService] SOS triggered by {user_id} at {location}")
    
    # Simulated deliveries
    mock_contacts = ["Meera Sharma", "Rohan Sharma", "Divya Nair"]
    deliveries = [
        {
            "name": name,
            "status": "delivered",
            "channel": "sms",
            "timestamp": datetime.utcnow().isoformat(),
        }
        for name in mock_contacts
    ]
    
    return {
        "success": True,
        "alert_id": alert_id,
        "user_id": user_id,
        "location": location,
        "message": message,
        "deliveries": deliveries,
        "timestamp": datetime.utcnow().isoformat(),
    }


async def cancel_sos_alert(alert_id: str, user_id: str) -> dict:
    """
    Cancel an active SOS alert.
    
    Args:
        alert_id: The alert to cancel
        user_id: The user cancelling
    
    Returns:
        Cancellation result
    """
    # TODO: Update alert status in database
    # TODO: Notify contacts about cancellation
    
    print(f"[AlertService] SOS {alert_id} cancelled by {user_id}")
    
    return {
        "success": True,
        "alert_id": alert_id,
        "cancelled": True,
        "timestamp": datetime.utcnow().isoformat(),
    }


async def send_test_alert(
    user_id: str,
    contact_ids: Optional[List[str]] = None,
) -> dict:
    """
    Send a test alert to verify contact reachability.
    
    Args:
        user_id: The user sending the test
        contact_ids: Specific contacts to test (None = all active)
    
    Returns:
        Test result with delivery statuses
    """
    # TODO: Send actual test messages
    
    print(f"[AlertService] Test alert from {user_id}")
    
    return {
        "success": True,
        "type": "test",
        "user_id": user_id,
        "deliveries": [
            {"name": "Meera Sharma", "status": "delivered"},
            {"name": "Rohan Sharma", "status": "delivered"},
            {"name": "Divya Nair", "status": "delivered"},
        ],
        "timestamp": datetime.utcnow().isoformat(),
    }
