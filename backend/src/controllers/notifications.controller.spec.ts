import { Observable, of } from 'rxjs';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from '../services/notifications.service';
import { ArtifactCreatedEvent } from '../interfaces';

const SYSTEM_ID = '11111111-1111-1111-1111-111111111111';

describe('NotificationsController', () => {
  it('delegates the SSE stream to the service scoped to the system', () => {
    const stream = of({
      type: 'artifact.created',
      data: { systemId: SYSTEM_ID } as ArtifactCreatedEvent,
    }) as Observable<{ type: string; data: ArtifactCreatedEvent }>;
    const service = {
      subscribeToSystem: jest.fn().mockReturnValue(stream),
    };
    const controller = new NotificationsController(
      service as unknown as NotificationsService,
    );

    const result = controller.stream(SYSTEM_ID);

    expect(service.subscribeToSystem).toHaveBeenCalledWith(SYSTEM_ID);
    expect(result).toBe(stream);
  });
});
