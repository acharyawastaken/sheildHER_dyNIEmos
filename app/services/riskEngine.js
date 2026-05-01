/**
 * Risk Engine
 *
 * Calculates risk score based on location, time, and context.
 * Uses threshold-based logic (per AI_RULES.md) — no black-box models.
 */

import { RISK_THRESHOLDS } from "../utils/constants";

/* ─── Risk Weights ─── */
const WEIGHTS = {
  LOCATION: 0.4,    // 40% of score from area safety
  TIME: 0.3,        // 30% from time-of-day
  MOVEMENT: 0.15,   // 15% from movement anomaly
  CROWDING: 0.15,   // 15% from crowd density (future)
};

/* ─── Night Factor Multiplier ─── */
const NIGHT_FACTOR = {
  LATE_NIGHT: 1.6,  // 11 PM – 5 AM
  EVENING: 1.4,     // 8 PM – 11 PM
  EARLY_MORNING: 1.2, // 5 AM – 7 AM
  DAY: 1.0,         // 7 AM – 8 PM
};

/**
 * Get the night factor multiplier for the current hour.
 * @param {number} hour - Hour of day (0-23)
 * @returns {number} Night factor multiplier
 */
export function getNightFactor(hour) {
  if (hour >= 23 || hour < 5) return NIGHT_FACTOR.LATE_NIGHT;
  if (hour >= 20) return NIGHT_FACTOR.EVENING;
  if (hour < 7) return NIGHT_FACTOR.EARLY_MORNING;
  return NIGHT_FACTOR.DAY;
}

/**
 * Calculate the location risk component (0-100).
 * Inverts the area safety score (0-10) to a risk value.
 * @param {number} areaSafetyScore - Safety score of area (0-10)
 * @returns {number} Location risk component
 */
export function calculateLocationRisk(areaSafetyScore) {
  return Math.round((10 - areaSafetyScore) * 10);
}

/**
 * Calculate the time risk component (0-100).
 * @param {number} hour - Current hour of day
 * @returns {number} Time risk component
 */
export function calculateTimeRisk(hour) {
  const factor = getNightFactor(hour);
  return Math.round((factor - 1) * 100);
}

/**
 * Calculate overall risk score.
 * 
 * Formula: risk_score = location_risk * w1 + time_risk * w2 + movement_risk * w3
 * Clamped to 0-100.
 *
 * @param {Object} params
 * @param {number} params.areaSafetyScore - Area safety score (0-10)
 * @param {number} params.hour - Hour of day (0-23)
 * @param {number} [params.movementRisk=0] - Movement anomaly risk (0-100)
 * @param {number} [params.crowdingRisk=0] - Crowd density risk (0-100)
 * @returns {Object} { score, components, level }
 */
export function calculateRiskScore({ areaSafetyScore, hour, movementRisk = 0, crowdingRisk = 0 }) {
  const locationRisk = calculateLocationRisk(areaSafetyScore);
  const timeRisk = calculateTimeRisk(hour);

  const rawScore =
    locationRisk * WEIGHTS.LOCATION +
    timeRisk * WEIGHTS.TIME +
    movementRisk * WEIGHTS.MOVEMENT +
    crowdingRisk * WEIGHTS.CROWDING;

  const score = Math.min(100, Math.max(0, Math.round(rawScore)));

  let level;
  if (score < RISK_THRESHOLDS.LOW) level = "low";
  else if (score < RISK_THRESHOLDS.MODERATE) level = "moderate";
  else level = "high";

  return {
    score,
    level,
    components: {
      location: locationRisk,
      time: timeRisk,
      movement: movementRisk,
      crowding: crowdingRisk,
    },
    nightFactor: getNightFactor(hour),
  };
}

/**
 * Determine if a warning should be triggered.
 * @param {number} score - Risk score
 * @returns {boolean}
 */
export function shouldTriggerWarning(score) {
  return score >= RISK_THRESHOLDS.MODERATE;
}
