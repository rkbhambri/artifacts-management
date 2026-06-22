import {
  Controller,
  Get,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { HealthService } from '../services/health.service';
import { HealthReport } from '../interfaces';

@ApiTags('health')
@Controller()
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  /** Single health endpoint reporting both API and database health. */
  @Get()
  @ApiOperation({
    summary: 'Health check (API + database)',
    description:
      'Returns the overall status plus per-component checks. Responds 503 ' +
      'when the database is unreachable so load balancers stop routing here.',
  })
  async check(): Promise<HealthReport> {
    const report = await this.healthService.check();
    if (report.status !== 'ok') {
      throw new ServiceUnavailableException(report);
    }
    return report;
  }
}
