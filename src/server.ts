import app from './app';
import { env } from './config/env';
import { connectDatabase, sequelize } from './config/database';

async function bootstrap(): Promise<void> {
  try {
    await connectDatabase();
    console.log('Database connection established');
  } catch (err) {
    console.error('Database connection failed:', err);
    // In production a dead DB means every route 500s; exit so Dokploy restarts the container.
    if (env.nodeEnv === 'production') process.exit(1);
    // Locally, keep the process up so /health still responds without a DB.
  }

  const server = app.listen(env.port, '0.0.0.0', () => {
    console.log(`Server listening on port ${env.port} (${env.nodeEnv})`);
  });

  // Dokploy stops containers with SIGTERM; drain in-flight requests before exiting.
  for (const signal of ['SIGTERM', 'SIGINT'] as const) {
    process.on(signal, () => {
      console.log(`${signal} received, shutting down`);
      server.close(() => {
        void sequelize.close().finally(() => process.exit(0));
      });
      setTimeout(() => process.exit(1), 10_000).unref();
    });
  }
}

bootstrap();
