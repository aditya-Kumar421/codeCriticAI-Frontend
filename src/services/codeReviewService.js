import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS, API_CONFIG } from '../constants/api.js';

/**
 * Create axios instance with default configuration
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  ...API_CONFIG,
});

/**
 * API service for code review functionality
 */
export class CodeReviewService {
  /**
   * Send code for AI review
   * @param {string} code - The code to be reviewed
   * @returns {Promise<string>} - The review response
   */
  static async reviewCode(code) {
    try {
      if (!code || !code.trim()) {
        throw new Error('Code cannot be empty');
      }

      const response = await apiClient.post(API_ENDPOINTS.AI_REVIEW, {
        prompt: code,
      });

      return response.data;
    } catch (error) {
      console.error('Error reviewing code:', error);
      
      if (error.response) {
        // Server responded with error status
        throw new Error(`Server error: ${error.response.status} - ${error.response.statusText}`);
      } else if (error.request) {
        // Request made but no response received
        throw new Error('Network error: No response from server');
      } else {
        // Something else happened
        throw new Error(error.message || 'Unknown error occurred');
      }
    }
  }
}

export default CodeReviewService;