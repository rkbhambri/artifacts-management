export type CheckStatus = 'up' | 'down';

export interface HealthReport {
  status: 'ok' | 'error';
  uptimeSeconds: number;
  timestamp: string;
  checks: {
    api: { status: CheckStatus };
    database: { status: CheckStatus; error?: string };
  };
}
