'use client';

import { useEffect, useRef, useState } from 'react';
import { eventsUrl } from './api';
import { ArtifactCreatedEvent } from '@/interfaces';

type Status = 'connecting' | 'open' | 'error';

/**
 * Subscribes to the system's SSE stream via the native EventSource API and
 * invokes `onArtifact` whenever a new artifact is announced.
 */
export function useArtifactEvents(
  systemId: string,
  onArtifact: (event: ArtifactCreatedEvent) => void,
): { status: Status } {
  const [status, setStatus] = useState<Status>('connecting');
  const callbackRef = useRef(onArtifact);
  callbackRef.current = onArtifact;

  useEffect(() => {
    const source = new EventSource(eventsUrl(systemId));

    source.onopen = () => setStatus('open');
    source.onerror = () => setStatus('error');
    source.addEventListener('artifact.created', (event) => {
      try {
        const data = JSON.parse((event as MessageEvent).data);
        callbackRef.current(data as ArtifactCreatedEvent);
      } catch {
        // ignore malformed payloads
      }
    });

    return () => source.close();
  }, [systemId]);

  return { status };
}
