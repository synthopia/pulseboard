import { config } from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

// Load environment variables first
config();

import { env } from './config/env';
import { initiateRouter } from './routes';
import swaggerDocs from './utils/swagger';
import rateLimiter from './utils/rate-limiter';
import { errorHandler, notFoundHandler } from './middleware/error-handler';

const app: express.Application = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin:
      process.env.NODE_ENV === 'production'
        ? process.env.ALLOWED_ORIGINS?.split(',') || false
        : true,
    credentials: true,
  })
);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use(rateLimiter);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// API documentation
app.use(swaggerDocs);

// Routes
initiateRouter(app);

// Error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

const server = app.listen(env.PORT, () => {
  console.log(`🚀 Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

export default app;
