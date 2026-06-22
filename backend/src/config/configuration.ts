import { AppConfig } from '../interfaces';

const DEFAULT_MAX_UPLOAD_MB = 25;

export const loadConfiguration = (): AppConfig => ({
  port: parseInt(process.env.PORT ?? '4000', 10),
  apiKey: process.env.API_KEY ?? 'dev-internal-api-key',
  corsOrigin: process.env.CORS_ORIGIN ?? '*',
  maxUploadBytes:
    parseInt(process.env.MAX_UPLOAD_MB ?? `${DEFAULT_MAX_UPLOAD_MB}`, 10) *
    1024 *
    1024,
  database: {
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5436', 10),
    username: process.env.DB_USERNAME ?? 'pit',
    password: process.env.DB_PASSWORD ?? 'pit',
    name: process.env.DB_NAME ?? 'artifacts',
  },
});
