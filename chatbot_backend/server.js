/**
 * server.js — Express proxy server
 * 
 * Bridges the React frontend to the Python FastAPI AI service.
 * This separation mirrors real production architecture where
 * the JS web layer and Python inference service are separate services.
 */

const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} | ${req.method} ${req.path}`);
  next();
});

// --- Routes ---

/**
 * POST /api/chat
 * Proxy chat messages to the AI service
 */
app.post('/api/chat', async (req, res) => {
  try {
    const { session_id, message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    if (!session_id) {
      return res.status(400).json({ error: 'session_id is required' });
    }

    const response = await axios.post(`${AI_SERVICE_URL}/chat`, {
      session_id,
      message: message.trim()
    }, {
      timeout: 60000 // 60s timeout for LLM + tool calls
    });

    res.json(response.data);
  } catch (error) {
    console.error('Chat proxy error:', error.message);
    
    if (error.response) {
      // AI service returned an error
      res.status(error.response.status).json({
        error: error.response.data?.detail || 'AI service error',
        details: error.response.data
      });
    } else if (error.code === 'ECONNREFUSED') {
      res.status(503).json({
        error: 'AI service is not running. Start the FastAPI server on port 8000.'
      });
    } else {
      res.status(500).json({
        error: 'Internal proxy error',
        message: error.message
      });
    }
  }
});

/**
 * GET /api/history/:sessionId
 * Get conversation history for a session
 */
app.get('/api/history/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const response = await axios.get(`${AI_SERVICE_URL}/history/${sessionId}`, {
      timeout: 10000
    });
    res.json(response.data);
  } catch (error) {
    console.error('History proxy error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      res.status(503).json({ error: 'AI service is not running.' });
    } else {
      res.status(error.response?.status || 500).json({
        error: error.response?.data?.detail || 'Failed to fetch history'
      });
    }
  }
});

/**
 * GET /api/sessions
 * Get all active sessions
 */
app.get('/api/sessions', async (req, res) => {
  try {
    const response = await axios.get(`${AI_SERVICE_URL}/sessions`, {
      timeout: 10000
    });
    res.json(response.data);
  } catch (error) {
    console.error('Sessions proxy error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      res.status(503).json({ error: 'AI service is not running.' });
    } else {
      res.status(error.response?.status || 500).json({
        error: 'Failed to fetch sessions'
      });
    }
  }
});

/**
 * GET /api/health
 * Health check — also checks AI service connectivity
 */
app.get('/api/health', async (req, res) => {
  try {
    const aiHealth = await axios.get(`${AI_SERVICE_URL}/health`, {
      timeout: 5000
    });
    
    res.json({
      status: 'healthy',
      service: 'Express Proxy',
      ai_service: aiHealth.data
    });
  } catch (error) {
    res.json({
      status: 'degraded',
      service: 'Express Proxy',
      ai_service: { status: 'unreachable', error: error.message }
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Express proxy server running on http://localhost:${PORT}`);
  console.log(`📡 Proxying to AI service at ${AI_SERVICE_URL}`);
  console.log(`\nEndpoints:`);
  console.log(`  POST /api/chat          → Send a message`);
  console.log(`  GET  /api/history/:id   → Get session history`);
  console.log(`  GET  /api/sessions      → List all sessions`);
  console.log(`  GET  /api/health        → Health check\n`);
});
