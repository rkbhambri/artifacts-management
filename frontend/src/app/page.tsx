import Link from 'next/link';
import { fetchSystems } from '@/lib/api';
import { System } from '@/interfaces';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let systems: System[] = [];
  let error: string | null = null;

  try {
    systems = await fetchSystems();
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load systems';
  }

  return (
    <main className="container">
      <div className="header">
        <div>
          <div className="brand">
            Pit<span>·</span>Artifacts
          </div>
          <div className="subtitle">Select a system to view its artifacts</div>
        </div>
      </div>

      {error && (
        <div className="card">
          <p className="error">{error}</p>
          <p className="subtitle">
            Is the API reachable at{' '}
            <code>
              {process.env.INTERNAL_API_URL ??
                process.env.NEXT_PUBLIC_API_URL ??
                'http://localhost:4000'}
            </code>{' '}
            from the server?
          </p>
        </div>
      )}

      {!error && systems.length === 0 && (
        <div className="card">
          <p className="empty">No systems found. Run the seed script.</p>
        </div>
      )}

      <div className="grid">
        {systems.map((system) => (
          <Link
            key={system.id}
            href={`/systems/${system.id}`}
            className="system-card"
          >
            <div className="name">{system.name}</div>
            <div className="meta">
              {system.customer?.name ?? 'Unknown customer'}
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
