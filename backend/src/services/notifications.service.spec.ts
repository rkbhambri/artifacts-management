import { firstValueFrom } from 'rxjs';
import { NotificationsService } from './notifications.service';
import { ArtifactCreatedEvent } from '../interfaces';
import { ARTIFACT_CREATED_EVENT } from '../events/notification.events';

const makeEvent = (systemId: string): ArtifactCreatedEvent => ({
  systemId,
  artifactId: 'artifact-uuid',
  name: 'schema.sql',
  version: 1,
  sizeBytes: 12,
  createdAt: '2026-01-01T00:00:00.000Z',
});

describe('NotificationsService', () => {
  let service: NotificationsService;

  beforeEach(() => {
    service = new NotificationsService();
  });

  it('delivers events to subscribers of the matching system', async () => {
    const received = firstValueFrom(service.subscribeToSystem('system-1'));

    service.handleArtifactCreated(makeEvent('system-1'));

    const message = await received;
    expect(message.type).toBe(ARTIFACT_CREATED_EVENT);
    expect(message.data.systemId).toBe('system-1');
  });

  it('does not deliver events for other systems', () => {
    const handler = jest.fn();
    const subscription = service
      .subscribeToSystem('system-1')
      .subscribe(handler);

    service.handleArtifactCreated(makeEvent('system-2'));

    expect(handler).not.toHaveBeenCalled();
    subscription.unsubscribe();
  });

  it('fans a single event out to multiple subscribers of the same system', () => {
    const first = jest.fn();
    const second = jest.fn();
    const subscriptions = [
      service.subscribeToSystem('system-1').subscribe(first),
      service.subscribeToSystem('system-1').subscribe(second),
    ];

    service.handleArtifactCreated(makeEvent('system-1'));

    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
    subscriptions.forEach((subscription) => subscription.unsubscribe());
  });
});
