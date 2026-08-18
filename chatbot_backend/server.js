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
const multer = require('multer');
const FormData = require('form-data');
const bcrypt = require('bcrypt');
const db = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

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
 * GET /api/library
 * Get all library documents
 */
app.get('/api/library', async (req, res) => {
  try {
    const response = await axios.get(`${AI_SERVICE_URL}/library`, { timeout: 10000 });
    res.json(response.data);
  } catch (error) {
    console.error('Library proxy error:', error.message);
    res.status(error.response?.status || 500).json({ error: 'Failed to fetch library' });
  }
});

/**
 * GET /api/images
 * Get all images
 */
app.get('/api/images', async (req, res) => {
  try {
    const response = await axios.get(`${AI_SERVICE_URL}/images`, { timeout: 10000 });
    res.json(response.data);
  } catch (error) {
    console.error('Images proxy error:', error.message);
    res.status(error.response?.status || 500).json({ error: 'Failed to fetch images' });
  }
});

/**
 * GET /api/data/*
 * Proxy static files
 */
app.get('/api/data/*', async (req, res) => {
  try {
    const filePath = req.params[0];
    const response = await axios.get(`${AI_SERVICE_URL}/data/${filePath}`, {
      responseType: 'stream',
      timeout: 30000
    });
    response.data.pipe(res);
  } catch (error) {
    console.error('Static file proxy error:', error.message);
    res.status(error.response?.status || 404).json({ error: 'File not found' });
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

/**
 * POST /api/upload
 * Proxy file upload to the AI service
 */
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const formData = new FormData();
    formData.append('file', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    const headers = formData.getHeaders();
    headers['Content-Length'] = formData.getLengthSync();

    const response = await axios.post(`${AI_SERVICE_URL}/upload`, formData, {
      headers,
      timeout: 120000 // 2 minutes timeout for large files and processing
    });

    res.json(response.data);
  } catch (error) {
    console.error('Upload proxy error:', error.message);
    if (error.response) {
      res.status(error.response.status).json({
        error: error.response.data?.detail || 'AI service error during upload',
        details: error.response.data
      });
    } else {
      res.status(500).json({
        error: 'Internal proxy error during upload',
        message: error.message
      });
    }
  }
});

/**
 * POST /api/auth/signup
 * Register a new user
 */
app.post('/api/auth/signup', async (req, res) => {
  const { name, email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    db.run(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(409).json({ error: 'Email already exists' });
          }
          return res.status(500).json({ error: 'Database error' });
        }
        
        res.status(201).json({
          message: 'User created successfully',
          user: { id: this.lastID, name, email }
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * POST /api/auth/login
 * Authenticate a user
 */
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    try {
      const match = await bcrypt.compare(password, user.password);
      if (match) {
        res.json({
          message: 'Login successful',
          user: { id: user.id, name: user.name, email: user.email }
        });
      } else {
        res.status(401).json({ error: 'Invalid email or password' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  });
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
