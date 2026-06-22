import { Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { HealthService } from './health.service';

const makeService = (query: jest.Mock): HealthService =>
  new HealthService({ query } as unknown as DataSource);

describe('HealthService', () => {
  beforeEach(() => {
    // The error-path test intentionally triggers a warning; keep output clean.
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('reports ok when the database responds', async () => {
    const query = jest.fn().mockResolvedValue([{ '?column?': 1 }]);
    const service = makeService(query);

    const report = await service.check();

    expect(query).toHaveBeenCalledWith('SELECT 1');
    expect(report.status).toBe('ok');
    expect(report.checks.api.status).toBe('up');
    expect(report.checks.database.status).toBe('up');
    expect(report.checks.database.error).toBeUndefined();
    expect(typeof report.uptimeSeconds).toBe('number');
  });

  it('reports error and surfaces the message when the query fails', async () => {
    const query = jest.fn().mockRejectedValue(new Error('connection refused'));
    const service = makeService(query);

    const report = await service.check();

    expect(report.status).toBe('error');
    expect(report.checks.database.status).toBe('down');
    expect(report.checks.database.error).toBe('connection refused');
  });
});
