// API client for communicating with the SP3 backend
const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://51.21.129.98:3000';

/**
 * Generic fetch wrapper with error handling
 */
async function fetchAPI(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

/**
 * Get all available desk IDs
 * @returns {Promise<string[]>} Array of desk IDs
 */
export async function getAllDesks() {
  return fetchAPI('/api/desks');
}

/**
 * Get detailed information about a specific desk
 * @param {string} deskId - The desk identifier (e.g., "cd:fb:1a:53:fb:e6")
 * @returns {Promise<Object>} Desk data with config, state, usage, and lastErrors
 */
export async function getDeskData(deskId) {
  return fetchAPI(`/api/desks/${deskId}`);
}

/**
 * Get specific category data for a desk
 * @param {string} deskId - The desk identifier
 * @param {string} category - One of: 'config', 'state', 'usage', 'lastErrors'
 * @returns {Promise<Object>} Category-specific data
 */
export async function getDeskCategory(deskId, category) {
  return fetchAPI(`/api/desks/${deskId}/${category}`);
}

/**
 * Update desk position
 * @param {string} deskId - The desk identifier
 * @param {number} positionMm - Target position in millimeters (680-1320)
 * @returns {Promise<Object>} Response with current target position
 */
export async function updateDeskPosition(deskId, positionMm) {
  return fetchAPI(`/api/desks/${deskId}/state`, {
    method: 'PUT',
    body: JSON.stringify({ position_mm: positionMm }),
  });
}

/**
 * Health check endpoint
 * @returns {Promise<string>} Health check message
 */
export async function healthCheck() {
  const response = await fetch(`${API_BASE_URL}/`);
  return response.text();
}
