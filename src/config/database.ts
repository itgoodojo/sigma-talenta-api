import { Sequelize } from 'sequelize';
import { env } from './env';

const useSsl = process.env.DB_SSL === 'true';

export const sequelize = env.db.url
  ? new Sequelize(env.db.url, {
      dialect: 'postgres',
      logging: false,
      dialectOptions: useSsl ? { ssl: { require: true, rejectUnauthorized: false } } : undefined,
    })
  : new Sequelize(env.db.name, env.db.user, env.db.password, {
      host: env.db.host,
      port: env.db.port,
      dialect: 'postgres',
      logging: false,
    });

export async function connectDatabase(): Promise<void> {
  await sequelize.authenticate();
}
