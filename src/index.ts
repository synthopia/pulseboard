import { config } from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';

// Load environment variables first
config();

import { env } from './config/env';
import { initiateRouter } from './routes';
import swaggerDocs from './utils/swagger';
import rateLimiter from './utils/rate-limiter';
import { errorHandler, notFoundHandler } from './middleware/error-handler';
import { services } from './config/services';
import { config as appConfig } from './config';
import db from './db';
import axios from 'axios';
import { logger } from './utils/logger';

// Helper to upsert services from config
async function syncServices() {
  for (const svc of services) {
    await db.service.upsert({
      where: { url: svc.url },
      update: {
        name: svc.name,
        method: svc.method,
        headers: svc.headers || {},
        body: svc.body || {},
      },
      create: {
        name: svc.name,
        url: svc.url,
        method: svc.method,
        headers: svc.headers || {},
        body: svc.body || {},
      },
    });
  }
}

function categorize(status: number, error?: any) {
  if (error) return 'err';
  if (status >= 500) return 'err';
  if (status >= 400) return 'warn';
  if (status >= 200 && status < 300) return 'ok';
  return 'unknown';
}

async function checkAllServices() {
  logger.info('Starting service checks...');
  await syncServices();
  for (const svc of services) {
    logger.info(`Checking service: ${svc.name} (${svc.method} ${svc.url})`);
    const start = Date.now();
    let status = 0;
    let error: string | undefined = undefined;
    let rawResponse: any = null;
    try {
      const resp = await axios({
        url: svc.url,
        method: svc.method,
        ...(svc.headers ? { headers: svc.headers } : {}),
        ...(svc.body ? { data: svc.body } : {}),
        timeout: 10000,
        validateStatus: () => true,
      });
      status = resp.status;
      rawResponse = { data: resp.data };
    } catch (err: any) {
      error = err.message || String(err);
      logger.error(`Failed to check ${svc.name}:`, error);
    }
    const responseTime = Date.now() - start;
    const category = categorize(status, error);
    const service = await db.service.findUnique({ where: { url: svc.url } });
    if (!service) {
      logger.error('Service not found in DB after sync:', svc.url);
      continue;
    }
    await db.serviceCheck.create({
      data: {
        serviceId: service.id,
        status,
        responseTime,
        error: error ?? null,
        category,
        rawResponse,
      },
    });
    logger.info(
      `Result saved: ${svc.name} status=${status} time=${responseTime}ms category=${category}`
    );
  }
}

// Start CRON job
setInterval(checkAllServices, appConfig.period);
logger.info(`Service check CRON started, period: ${appConfig.period / 1000}s`);

const app: express.Application = express();

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          'https://cdn.tailwindcss.com', // or your CDN
          "'unsafe-inline'", // allows inline scripts (not secure)
        ],
        styleSrc: [
          "'self'",
          'https://cdn.tailwindcss.com', // for Tailwind CSS
          "'unsafe-inline'", // allows inline styles
        ],
      },
    },
  })
);

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

// Serve the entire public folder as static assets
app.use(express.static(path.join(__dirname, 'public')));

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
