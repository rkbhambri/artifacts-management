import { ServiceUnavailableException } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthService } from '../services/health.service';
import { HealthReport } from '../interfaces';

const okReport: HealthReport = {
  status: 'ok',
  uptimeSeconds: 1,
  timestamp: '2026-01-01T00:00:00.000Z',
  checks: {
    api: { status: 'up' },
    database: { status: 'up' },
  },
};

describe('HealthController', () => {
  let controller: HealthController;
  let service: jest.Mocked<Pick<HealthService, 'check'>>;

  beforeEach(() => {
    service = { check: jest.fn() };
    controller = new HealthController(service as unknown as HealthService);
  });

  it('returns the report when status is ok', async () => {
    service.check.mockResolvedValue(okReport);

    expect(await controller.check()).toBe(okReport);
  });

  it('throws 503 when the report status is not ok', async () => {
    service.check.mockResolvedValue({
      ...okReport,
      status: 'error',
      checks: {
        api: { status: 'up' },
        database: { status: 'down', error: 'unreachable' },
      },
    });

    await expect(controller.check()).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });
});
