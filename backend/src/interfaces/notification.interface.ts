import { ARTIFACT_CREATED_EVENT } from '../events/notification.events';

export interface ArtifactCreatedEvent {
  systemId: string;
  artifactId: string;
  name: string;
  version: number;
  sizeBytes: number;
  createdAt: string;
}

export interface SseMessage {
  type: typeof ARTIFACT_CREATED_EVENT;
  data: ArtifactCreatedEvent;
}
