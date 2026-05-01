import { C, RISK_THRESHOLDS } from "./constants";

/**
 * Get the color corresponding to a risk score.
 * @param {number} score - Risk score (0-100)
 * @returns {string} Hex color string
 */
export function getRiskColor(score) {
  if (score < RISK_THRESHOLDS.LOW) return C.safe;
  if (score < RISK_THRESHOLDS.MODERATE) return C.warn;
  return C.accent;
}

/**
 * Get the dim/background color corresponding to a risk score.
 * @param {number} score - Risk score (0-100)
 * @returns {string} RGBA color string
 */
export function getRiskDimColor(score) {
  if (score < RISK_THRESHOLDS.LOW) return C.safeDim;
  if (score < RISK_THRESHOLDS.MODERATE) return C.warnDim;
  return C.accentDim;
}

/**
 * Get the human-readable label for a risk score.
 * @param {number} score - Risk score (0-100)
 * @returns {string} Risk label
 */
export function getRiskLabel(score) {
  if (score < RISK_THRESHOLDS.LOW) return "SAFE";
  if (score < RISK_THRESHOLDS.MODERATE) return "MODERATE";
  return "HIGH RISK";
}

/**
 * Get the current greeting based on hour of day.
 * @returns {string} Greeting string
 */
export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 5) return "LATE NIGHT";
  if (hour < 12) return "GOOD MORNING";
  if (hour < 17) return "GOOD AFTERNOON";
  if (hour < 21) return "GOOD EVENING";
  return "GOOD NIGHT";
}

/**
 * Format a Date to HH:MM string.
 * @param {Date} date
 * @returns {string}
 */
export function formatTime(date) {
  return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });
}
