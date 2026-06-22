/**
 * Base URL of the backend API as reached from the browser. In docker-compose
 * the browser runs on the host, so this points at the published backend port.
 */
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

/**
 * Base URL used for server-side (SSR / Server Component) requests. Inside
 * docker-compose the frontend container cannot reach the backend via
 * `localhost`, so it must talk to the backend over the compose network using
 * the service name. Falls back to {@link API_URL} for local `next dev` runs
 * outside docker.
 */
export const INTERNAL_API_URL = process.env.INTERNAL_API_URL ?? API_URL;

/**
 * Demo-only API key used by the dashboard's upload form. In production the
 * browser should NOT hold a shared internal key; uploads would go through a
 * session-authenticated backend-for-frontend. See README.
 */
export const API_KEY = process.env.NEXT_PUBLIC_API_KEY ?? 'dev-internal-api-key';
