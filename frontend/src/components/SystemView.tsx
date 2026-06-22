'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchArtifacts, fetchSystem } from '@/lib/api';
import {
  Artifact,
  ArtifactCreatedEvent,
  System,
  SystemViewProps,
} from '@/interfaces';
import { useArtifactEvents } from '@/lib/useArtifactEvents';
import UploadForm from './UploadForm';
import ArtifactTable from './ArtifactTable';

export default function SystemView({ systemId }: SystemViewProps) {
  const [system, setSystem] = useState<System | null>(null);
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const loadArtifacts = useCallback(async () => {
    try {
      setArtifacts(await fetchArtifacts(systemId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load artifacts');
    }
  }, [systemId]);

  useEffect(() => {
    fetchSystem(systemId)
      .then(setSystem)
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Failed to load system'),
      );
    loadArtifacts();
  }, [systemId, loadArtifacts]);

  const onArtifact = useCallback(
    (event: ArtifactCreatedEvent) => {
      setToast(`New artifact "${event.name}" (v${event.version}) is available`);
      setHighlightedId(event.artifactId);
      loadArtifacts();
      setTimeout(() => setToast(null), 5000);
    },
    [loadArtifacts],
  );

  const { status } = useArtifactEvents(systemId, onArtifact);

  return (
    <main className="container">
      <div className="header">
        <div>
          <div className="brand">
            <Link href="/">Pit·Artifacts</Link>
          </div>
          <div className="subtitle">
            {system
              ? `${system.customer?.name ?? ''} / ${system.name}`
              : 'Loading…'}
          </div>
        </div>
        <span className="status">
          <span className={`dot ${status}`} />
          {status === 'open'
            ? 'Live'
            : status === 'error'
              ? 'Disconnected'
              : 'Connecting…'}
        </span>
      </div>

      {error && <div className="card"><p className="error">{error}</p></div>}

      <div className="card">
        <h2>Upload artifact</h2>
        <UploadForm systemId={systemId} onUploaded={loadArtifacts} />
      </div>

      <div className="card">
        <h2>Artifacts ({artifacts.length})</h2>
        {toast && <div className="toast">{toast}</div>}
        <ArtifactTable artifacts={artifacts} highlightedId={highlightedId} />
      </div>
    </main>
  );
}
