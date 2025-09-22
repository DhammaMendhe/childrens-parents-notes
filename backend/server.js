const express = require("express");
const cors = require("cors");
const connection = require("./dbConnection");
const routes = require("./routes/index"); // Your routes file

const app = express();
const port = process.env.PORT || 3000;

// Connect to MongoDB
connection();

// Middleware
app.use(express.json({ limit: '50mb' })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true, limit: '50mb' })); // Parse URL-encoded bodies

// CORS configuration for Vite React frontend
app.use(cors({
  origin: [
    "http://localhost:5173", // Vite default port
    "http://localhost:3000", // Alternative port
    "http://127.0.0.1:5173", // Alternative localhost
    "http://localhost:4173", // Vite preview port
  ],
  credentials: true, // Allow cookies and auth headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin'
  ]
}));

// Security headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS,PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json,Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Routes
app.use('/api', routes); // All your routes will be prefixed with /api

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Notes App API Server',
    version: '1.0.0',
    endpoints: {
      auth: '/api/register, /api/login',
      notes: '/api/notes',
      profile: '/api/profile',
      health: '/health'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Error:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

app.listen(port, () => {
  console.log(`🚀 Server is listening on port ${port}`);
  console.log(`📍 Local: http://localhost:${port}`);
  console.log(`🔗 API Base: http://localhost:${port}/api`);
  console.log(`💚 Health Check: http://localhost:${port}/health`);
});

module.exports = app;
