import './models'; // registers model associations on startup
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { errorHandler } from './middlewares/errorHandler';
import { notFoundHandler } from './middlewares/notFound';
import { requestLogger } from './middlewares/requestLogger';
import routes from './routes';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './docs/swagger';
import path from 'path';

const app = express();

// Dokploy fronts the container with Traefik; trust one hop so req.ip and
// express-rate-limit see the real client address instead of the proxy's.
app.set('trust proxy', 1);

app.use(helmet());
// In production CORS_ORIGINS is set by Dokploy; reflecting in dev keeps local dev frictionless.
app.use(
  cors({
    origin: env.corsOrigins.length > 0 ? env.corsOrigins : true,
    credentials: true,
  }),
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve locally-stored media during development (S3/R2 in production).
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

app.use(requestLogger);

// In-memory rate limiting (single-instance). No Redis.
app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api', routes);

// API documentation — disabled in production.
if (env.nodeEnv !== 'production') {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get('/api/docs.json', (_req, res) => res.json(swaggerSpec));
}

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
