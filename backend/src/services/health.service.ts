import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CheckStatus, HealthReport } from '../interfaces';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  /** Combined health: the API is up (it answered) and the database is reachable. */
  async check(): Promise<HealthReport> {
    const database = await this.pingDatabase();
    const status = database.status === 'up' ? 'ok' : 'error';

    return {
      status,
      uptimeSeconds: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
      checks: {
        api: { status: 'up' },
        database,
      },
    };
  }

  private async pingDatabase(): Promise<{ status: CheckStatus; error?: string }> {
    try {
      await this.dataSource.query('SELECT 1');
      return { status: 'up' };
    } catch (err) {
      this.logger.warn(
        `Database health check failed: ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
      return {
        status: 'down',
        error: err instanceof Error ? err.message : 'unknown error',
      };
    }
  }
}
