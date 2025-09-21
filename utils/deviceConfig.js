/**
 * Device Configuration Utility
 * Centralized configuration for allowed device EUIs
 */

// Default device EUIs if none are configured in environment
const DEFAULT_DEVICE_EUIS = [
  'a8404151518379f9',
  'a8404181e18379fd', 
  'a8404152a1837a0e',
  'a840417eb1837a01',
  'a84041c2718379fe',
  'a84041b931837a0a'
];

/**
 * Get allowed device EUIs from environment variable
 * Falls back to default list if not configured
 * @returns {string[]} Array of allowed device EUIs
 */
export function getAllowedDeviceEUIs() {
  // Server-side: use DEVICE_EUIS
  if (typeof window === 'undefined') {
    const deviceEuisEnv = process.env.DEVICE_EUIS;
    if (deviceEuisEnv) {
      return deviceEuisEnv.split(',').map(eui => eui.trim());
    }
  } else {
    // Client-side: use NEXT_PUBLIC_DEVICE_EUIS
    const deviceEuisEnv = process.env.NEXT_PUBLIC_DEVICE_EUIS;
    if (deviceEuisEnv) {
      return deviceEuisEnv.split(',').map(eui => eui.trim());
    }
  }
  
  return DEFAULT_DEVICE_EUIS;
}

/**
 * Check if a device EUI is allowed
 * @param {string} devEUI - Device EUI to check
 * @returns {boolean} Whether the device EUI is allowed
 */
export function isDeviceEUIAllowed(devEUI) {
  const allowedEUIs = getAllowedDeviceEUIs();
  return allowedEUIs.includes(devEUI);
}

/**
 * Filter devices array to only include allowed EUIs
 * @param {Array} devices - Array of device objects with devEUI property
 * @returns {Array} Filtered array of allowed devices
 */
export function filterAllowedDevices(devices) {
  if (!Array.isArray(devices)) return [];
  
  const allowedEUIs = getAllowedDeviceEUIs();
  return devices.filter(device => allowedEUIs.includes(device.devEUI));
}
