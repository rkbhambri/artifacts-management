'use client';

import { useRef, useState } from 'react';
import { uploadArtifact } from '@/lib/api';
import { UploadFormProps } from '@/interfaces';

export default function UploadForm({ systemId, onUploaded }: UploadFormProps) {
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError('Please choose a file to upload.');
      return;
    }
    setBusy(true);
    try {
      await uploadArtifact(systemId, file, name);
      setName('');
      if (fileRef.current) fileRef.current.value = '';
      onUploaded();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="upload-row">
        <input ref={fileRef} type="file" aria-label="Artifact file" />
        <input
          type="text"
          placeholder="Logical name (optional, defaults to filename)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button className="btn" type="submit" disabled={busy}>
          {busy ? 'Uploading…' : 'Upload artifact'}
        </button>
      </div>
      {error && <p className="error" style={{ marginTop: 10 }}>{error}</p>}
    </form>
  );
}
