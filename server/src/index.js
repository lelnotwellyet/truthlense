import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import env from './config/env.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import errorHandler from './middleware/errorHandler.js';
import { startCronJobs } from './services/cronJobs.js';
import logger from './utils/logger.js';

// Route imports
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import newsRoutes from './routes/news.js';
import verifyRoutes from './routes/verify.js';
import bookmarkRoutes from './routes/bookmarks.js';
import voteRoutes from './routes/votes.js';
import sourceRoutes from './routes/sources.js';
import notificationRoutes from './routes/notifications.js';
import adminRoutes from './routes/admin.js';

const app = express();

// Security & parsing middleware
app.use(helmet());
const allowedOrigins = env.FRONTEND_URL.split(',').map(o => o.trim());
if (env.NODE_ENV === 'development') {
  allowedOrigins.push('http://localhost:5174');
  allowedOrigins.push('http://127.0.0.1:5173');
  allowedOrigins.push('http://127.0.0.1:5174');
}

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(generalLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString(), service: 'truthlens-api' });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/verify', verifyRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/sources', sourceRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use(errorHandler);

// Start server
let server;
if (env.NODE_ENV !== 'test') {
  server = app.listen(env.PORT, () => {
    logger.info(`truthlens API server running on port ${env.PORT} (${env.NODE_ENV})`);
    startCronJobs();
  });
}

// Graceful shutdown
const shutdown = (signal) => {
  logger.info(`${signal} received. Shutting down...`);
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

export default app;
