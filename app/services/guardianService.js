import { Accelerometer } from 'expo-sensors';
import { Alert } from 'react-native';

/**
 * GuardianService — Sensor-based AI for anomaly detection.
 */
export const GuardianService = {
  subscription: null,
  isMonitoring: false,

  /**
   * Start monitoring for sudden impact or high-G force events (snatching/falls).
   */
  startMonitoring: (onAnomalyDetected) => {
    if (GuardianService.isMonitoring) return;

    Accelerometer.setUpdateInterval(100); // 10Hz
    GuardianService.subscription = Accelerometer.addListener(data => {
      const totalForce = Math.sqrt(data.x ** 2 + data.y ** 2 + data.z ** 2);
      
      // SHAKE DETECTION
      // A quick shake usually produces multiple rapid changes > 2.0
      if (totalForce > 2.5) {
        console.log("🧠 [GUARDIAN AI] Shake/Impact detected:", totalForce);
        onAnomalyDetected(totalForce);
      }
    });

    GuardianService.isMonitoring = true;
    console.log("🧠 [GUARDIAN AI] Passive monitoring active.");
  },

  /**
   * Stop monitoring
   */
  stopMonitoring: () => {
    if (GuardianService.subscription) {
      GuardianService.subscription.remove();
      GuardianService.subscription = null;
    }
    GuardianService.isMonitoring = false;
    console.log("🧠 [GUARDIAN AI] Passive monitoring disabled.");
  }
};
