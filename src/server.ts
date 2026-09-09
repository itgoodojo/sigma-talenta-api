import app from './app';
import { env } from './config/env';
import { connectDatabase } from './config/database';

async function bootstrap(): Promise<void> {
  try {
    await connectDatabase();
    console.log('Database connection established');
  } catch (err) {
    // Keep the process up so /health still responds during local dev without a DB.
    console.error('Database connection failed:', err);
  }

  app.listen(env.port, () => {
    console.log(`Server listening on port ${env.port} (${env.nodeEnv})`);
  });
}

bootstrap();
