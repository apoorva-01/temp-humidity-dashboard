/**
 * Date utility functions to prevent hydration errors
 * These functions ensure consistent date formatting between server and client
 */

/**
 * Format a date consistently for display
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string
 */
export function formatDateConsistent(date) {
  if (!date) return 'Never';
  
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return 'Invalid Date';
    
    // Use ISO string and format it consistently
    return dateObj.toISOString().replace('T', ' ').substring(0, 19);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
}

/**
 * Calculate minutes since a given timestamp
 * @param {Date|string} timestamp - Timestamp to calculate from
 * @returns {number} Minutes elapsed
 */
export function getMinutesSince(timestamp) {
  if (!timestamp) return Infinity;
  
  try {
    const now = new Date();
    const then = new Date(timestamp);
    
    if (isNaN(then.getTime())) return Infinity;
    
    return Math.floor((now - then) / (1000 * 60));
  } catch (error) {
    console.error('Error calculating minutes since:', error);
    return Infinity;
  }
}

/**
 * Format last seen time in a human-readable way
 * @param {Date|string} timestamp - Last seen timestamp
 * @returns {string} Formatted last seen string
 */
export function formatLastSeen(timestamp) {
  const minutes = getMinutesSince(timestamp);
  
  if (minutes === Infinity) return 'Never';
  
  if (minutes < 60) {
    return `${minutes}m ago`;
  } else if (minutes < 1440) { // less than 24 hours
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  } else {
    const days = Math.floor(minutes / 1440);
    return `${days}d ago`;
  }
}

/**
 * Check if a device is online based on last seen timestamp
 * @param {Date|string} timestamp - Last seen timestamp
 * @param {number} thresholdMinutes - Minutes threshold for online status (default: 10)
 * @returns {boolean} Whether device is online
 */
export function isDeviceOnline(timestamp, thresholdMinutes = 10) {
  const minutes = getMinutesSince(timestamp);
  return minutes <= thresholdMinutes;
}

/**
 * Format date for display in tables (more readable format)
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string
 */
export function formatDateForDisplay(date) {
  if (!date) return 'Never';
  
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return 'Invalid Date';
    
    // Format as YYYY-MM-DD HH:MM:SS
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    const seconds = String(dateObj.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  } catch (error) {
    console.error('Error formatting date for display:', error);
    return 'Invalid Date';
  }
}
