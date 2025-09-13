/**
 * API endpoints and configuration constants
 */

export const API_BASE_URL = 'https://code-critic-ai-rho.vercel.app';

export const API_ENDPOINTS = {
  AI_REVIEW: '/ai/get-response',
};

export const API_CONFIG = {
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
};