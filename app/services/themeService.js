import { C } from '../utils/constants';

/**
 * ThemeService — Handles Dawn/Eclipse (Light/Dark) logic.
 */
export const ThemeService = {
  // Manual override state
  manualTheme: null,

  /**
   * Get theme based on time of day (Auto) or manual override.
   * Dawn (Light): 6 AM - 6 PM
   * Eclipse (Dark): 6 PM - 6 AM
   */
  getThemeMode: () => {
    if (ThemeService.manualTheme) return ThemeService.manualTheme;

    const hour = new Date().getHours();
    if (hour >= 6 && hour < 18) {
      return 'dawn';
    }
    return 'eclipse';
  },

  /**
   * Return theme tokens based on mode
   */
  getTheme: () => {
    const mode = ThemeService.getThemeMode();
    
    // For now, our app is mostly Dark/Aesthetic, 
    // but we can swap primary background colors here.
    const isEclipse = mode === 'eclipse';

    return {
      mode,
      bg: isEclipse ? C.bg0 : '#FFFFFF',
      card: isEclipse ? C.bg2 : '#F9F9F9',
      text: isEclipse ? C.text0 : '#1A1A1A',
      border: isEclipse ? C.border : '#EAEAEA',
    };
  }
};
