/**
 * api.js — API service for communicating with the Express proxy backend.
 */

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Send a chat message to the AI agent
 * @param {string} sessionId - Unique session identifier
 * @param {string} message - User's message
 * @returns {Promise<{response: string, session_id: string, tools_used: string[]}>}
 */
export const sendMessage = async (sessionId, message) => {
  try {
    const response = await apiClient.post('/chat', {
      session_id: sessionId,
      message,
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data?.error || error.response.data?.detail || 'Server error');
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Request timed out. The AI is taking too long to respond.');
    } else {
      throw new Error('Cannot connect to the server. Make sure the backend is running.');
    }
  }
};

/**
 * Get conversation history for a session
 * @param {string} sessionId
 * @returns {Promise<{session_id: string, history: Array}>}
 */
export const getHistory = async (sessionId) => {
  try {
    const response = await apiClient.get(`/history/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch history:', error);
    return { session_id: sessionId, history: [] };
  }
};

/**
 * Health check
 * @returns {Promise<Object>}
 */
export const checkHealth = async () => {
  try {
    const response = await apiClient.get('/health');
    return response.data;
  } catch (error) {
    return { status: 'unreachable', error: error.message };
  }
};

export default apiClient;
