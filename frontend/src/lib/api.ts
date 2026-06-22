import { API_KEY, API_URL, INTERNAL_API_URL } from './config';
import { ApiEnvelope, Artifact, System } from '@/interfaces';

/**
 * Resolves the API base URL for the current execution context. Server-side
 * (no `window`) requests use the internal compose-network URL; browser
 * requests use the publicly published URL.
 */
function baseUrl(): string {
  return typeof window === 'undefined' ? INTERNAL_API_URL : API_URL;
}

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = Array.isArray(body.message)
        ? body.message.join(', ')
        : body.message ?? detail;
    } catch {
      // non-JSON error body
    }
    throw new Error(`Request failed (${res.status}): ${detail}`);
  }
  const body = (await res.json()) as ApiEnvelope<T>;
  return body.entity;
}

export async function fetchSystems(): Promise<System[]> {
  return handle<System[]>(
    await fetch(`${baseUrl()}/systems`, { cache: 'no-store' }),
  );
}

export async function fetchSystem(systemId: string): Promise<System> {
  return handle<System>(
    await fetch(`${baseUrl()}/systems/${systemId}`, { cache: 'no-store' }),
  );
}

export async function fetchArtifacts(systemId: string): Promise<Artifact[]> {
  return handle<Artifact[]>(
    await fetch(`${baseUrl()}/systems/${systemId}/artifacts`, {
      cache: 'no-store',
    }),
  );
}

export async function uploadArtifact(
  systemId: string,
  file: File,
  name?: string,
): Promise<Artifact> {
  const form = new FormData();
  form.append('file', file);
  if (name && name.trim()) {
    form.append('name', name.trim());
  }
  return handle<Artifact>(
    await fetch(`${API_URL}/systems/${systemId}/artifacts`, {
      method: 'POST',
      headers: { 'x-api-key': API_KEY },
      body: form,
    }),
  );
}

export function downloadUrl(artifactId: string): string {
  return `${API_URL}/artifacts/${artifactId}/download`;
}

export function eventsUrl(systemId: string): string {
  return `${API_URL}/systems/${systemId}/events`;
}
