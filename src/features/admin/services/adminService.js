import { API_BASE_URL } from '../../../constants/api.js';

/**
 * Admin service for CodeCritic 2.0
 * Handles user interaction history and statistics
 */
export class AdminService {
  /**
   * Get paginated user interactions
   * @param {number} page - Page number (default: 1)
   * @param {number} limit - Items per page (default: 5)
   * @returns {Promise<Object>} - Paginated interaction data
   */
  static async getInteractions(page = 1, limit = 5) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/interactions?page=${page}&limit=${limit}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching interactions:', error);
      throw error;
    }
  }

  /**
   * Get admin dashboard statistics
   * @returns {Promise<Object>} - Dashboard statistics
   */
  static async getStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  }

  /**
   * Get interactions by IP address
   * @param {string} ip - IP address to filter by
   * @param {number} page - Page number (default: 1)
   * @param {number} limit - Items per page (default: 10)
   * @returns {Promise<Object>} - IP-filtered interaction data
   */
  static async getInteractionsByIP(ip, page = 1, limit = 10) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/interactions/ip/${encodeURIComponent(ip)}?page=${page}&limit=${limit}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching interactions by IP:', error);
      throw error;
    }
  }
}

export default AdminService;