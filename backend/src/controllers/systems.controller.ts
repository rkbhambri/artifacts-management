import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { SystemsService } from '../services/systems.service';
import { SystemEntity } from '../entities/system.entity';

@ApiTags('systems')
@Controller('systems')
export class SystemsController {
  constructor(private readonly systemsService: SystemsService) {}

  @Get()
  @ApiOperation({ summary: 'List all systems with their owning customer' })
  @ApiOkResponse({ type: SystemEntity, isArray: true })
  findAll(): Promise<SystemEntity[]> {
    return this.systemsService.findAll();
  }

  @Get(':systemId')
  @ApiOperation({ summary: 'Get a single system' })
  @ApiParam({ name: 'systemId', format: 'uuid' })
  @ApiOkResponse({ type: SystemEntity })
  findOne(
    @Param('systemId', ParseUUIDPipe) systemId: string,
  ): Promise<SystemEntity> {
    return this.systemsService.findOneOrFail(systemId);
  }
}
