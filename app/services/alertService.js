/**
 * Alert Service
 *
 * Handles sending SOS alerts to emergency contacts via SMS / push.
 * In MVP, this simulates alert delivery.
 * Will integrate with backend FastAPI endpoints in production.
 */

import { DEFAULT_CONTACTS } from "../utils/constants";

/**
 * Send SOS alert to all active emergency contacts.
 * @param {Object} params
 * @param {Object} params.location - { latitude, longitude, area, city }
 * @param {string} params.message - Alert message
 * @param {Array} [params.contacts] - Override contact list
 * @returns {Promise<Object>} Result with delivery statuses
 */
export async function sendSOSAlert({ location, message, contacts = null }) {
  const targetContacts = contacts || DEFAULT_CONTACTS.filter(c => c.active);

  // TODO: Replace with real API call
  // POST /api/sos { location, message, contacts }
  console.log("[AlertService] SOS triggered:", { location, message, targetContacts });

  return new Promise((resolve) => {
    setTimeout(() => {
      const results = targetContacts.map((contact) => ({
        name: contact.name,
        phone: contact.phone,
        status: "delivered",
        timestamp: new Date().toISOString(),
      }));

      resolve({
        success: true,
        alertId: `SOS-${Date.now()}`,
        deliveries: results,
        location,
      });
    }, 1000);
  });
}

/**
 * Send a test alert to verify contacts are reachable.
 * @param {Array} [contacts] - Override contact list
 * @returns {Promise<Object>} Result with delivery statuses
 */
export async function sendTestAlert(contacts = null) {
  const targetContacts = contacts || DEFAULT_CONTACTS.filter(c => c.active);

  // TODO: Replace with real API call
  console.log("[AlertService] Test alert sent to:", targetContacts.map(c => c.name));

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        type: "test",
        deliveries: targetContacts.map((c) => ({
          name: c.name,
          status: "delivered",
        })),
      });
    }, 500);
  });
}

/**
 * Cancel an active SOS alert.
 * @param {string} alertId - The ID of the alert to cancel
 * @returns {Promise<Object>}
 */
export async function cancelSOSAlert(alertId) {
  // TODO: Replace with real API call
  console.log("[AlertService] SOS cancelled:", alertId);

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, alertId, cancelled: true });
    }, 300);
  });
}

/**
 * Get the list of emergency contacts.
 * @returns {Array} Contact objects
 */
export function getEmergencyContacts() {
  // TODO: Fetch from database / local storage
  return [...DEFAULT_CONTACTS];
}
