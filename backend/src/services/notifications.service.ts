import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Observable, Subject, filter, map } from 'rxjs';
import { ARTIFACT_CREATED_EVENT } from '../events/notification.events';
import { ArtifactCreatedEvent, SseMessage } from '../interfaces';

/**
 * Fans artifact events out to connected SSE subscribers. Uses an in-process
 * RxJS Subject fed by the application event bus. For multi-instance
 * deployments this would be backed by Redis pub/sub (see README).
 */
@Injectable()
export class NotificationsService {
  private readonly stream$ = new Subject<SseMessage>();

  @OnEvent(ARTIFACT_CREATED_EVENT)
  handleArtifactCreated(event: ArtifactCreatedEvent): void {
    this.stream$.next({ type: ARTIFACT_CREATED_EVENT, data: event });
  }

  /** Stream of events scoped to a single system, formatted for `@Sse`. */
  subscribeToSystem(
    systemId: string,
  ): Observable<{ type: string; data: ArtifactCreatedEvent }> {
    return this.stream$.asObservable().pipe(
      filter((message) => message.data.systemId === systemId),
      map((message) => ({ type: message.type, data: message.data })),
    );
  }
}
