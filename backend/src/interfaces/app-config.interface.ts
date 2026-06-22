export interface AppConfig {
  port: number;
  apiKey: string;
  corsOrigin: string;
  maxUploadBytes: number;
  database: {
    host: string;
    port: number;
    username: string;
    password: string;
    name: string;
  };
}
