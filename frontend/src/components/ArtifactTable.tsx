'use client';

import { downloadUrl } from '@/lib/api';
import { formatBytes, formatDate } from '@/lib/format';
import { ArtifactTableProps } from '@/interfaces';

export default function ArtifactTable({
  artifacts,
  highlightedId,
}: ArtifactTableProps) {
  if (artifacts.length === 0) {
    return <p className="empty">No artifacts yet. Upload one above.</p>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Version</th>
          <th>Size</th>
          <th>Uploaded</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {artifacts.map((artifact) => (
          <tr
            key={artifact.id}
            className={artifact.id === highlightedId ? 'row-new' : undefined}
          >
            <td>
              <div>{artifact.name}</div>
              {artifact.name !== artifact.filename && (
                <div className="subtitle">{artifact.filename}</div>
              )}
            </td>
            <td>
              <span className="badge">v{artifact.version}</span>
            </td>
            <td>{formatBytes(artifact.sizeBytes)}</td>
            <td>{formatDate(artifact.createdAt)}</td>
            <td>
              <a
                className="btn-link"
                href={downloadUrl(artifact.id)}
                target="_blank"
                rel="noopener noreferrer"
              >
                Download
              </a>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
