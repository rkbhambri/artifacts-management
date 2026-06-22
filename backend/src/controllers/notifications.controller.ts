import { Controller, Param, ParseUUIDPipe, Sse } from '@nestjs/common';
import { Observable } from 'rxjs';
import { MessageEvent } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { NotificationsService } from '../services/notifications.service';
import { SkipSuccessWrapper } from '../decorators/skip-success-wrapper.decorator';

@ApiTags('notifications')
@Controller('systems/:systemId/events')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * Server-Sent Events stream. Browsers subscribe with the native
   * `EventSource` API and receive an event whenever a new artifact is
   * uploaded to this system.
   */
  @Sse()
  @SkipSuccessWrapper()
  @ApiOperation({
    summary: 'Subscribe to new-artifact events for a system (SSE)',
    description:
      'Returns a text/event-stream. Each event has name "artifact.created" ' +
      'with a JSON payload describing the new artifact.',
  })
  @ApiParam({ name: 'systemId', format: 'uuid' })
  stream(
    @Param('systemId', ParseUUIDPipe) systemId: string,
  ): Observable<MessageEvent> {
    return this.notificationsService.subscribeToSystem(
      systemId,
    ) as unknown as Observable<MessageEvent>;
  }
}
