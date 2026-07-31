declare const process: { readonly env: Readonly<Record<string, string | undefined>> };

interface OpenSkyTokenResponse {
  readonly access_token?: unknown;
  readonly expires_in?: unknown;
}

interface CachedToken {
  readonly value: string;
  readonly expiresAt: number;
}

const OPEN_SKY_API_URL = 'https://opensky-network.org/api/states/all';
const OPEN_SKY_TOKEN_URL = 'https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token';
const ALLOWED_QUERY_PARAMETERS = ['extended', 'lamin', 'lomin', 'lamax', 'lomax'] as const;
let cachedToken: CachedToken | null = null;

export async function GET(request: Request): Promise<Response> {
  const requestUrl = new URL(request.url);
  const upstreamUrl = new URL(OPEN_SKY_API_URL);
  for (const key of ALLOWED_QUERY_PARAMETERS) {
    const value = requestUrl.searchParams.get(key);
    if (value === null) continue;
    if (!validQueryValue(key, value)) return jsonError(400, `Parámetro inválido: ${key}`);
    upstreamUrl.searchParams.set(key, value);
  }

  const abortController = new AbortController();
  const timeoutId = setTimeout(() => abortController.abort(), 15_000);
  try {
    const token = await getAccessToken();
    const headers = new Headers({ Accept: 'application/json' });
    if (token) headers.set('Authorization', `Bearer ${token}`);
    const upstream = await fetch(upstreamUrl, { headers, signal: abortController.signal });
    const responseHeaders = new Headers({
      'Content-Type': upstream.headers.get('Content-Type') ?? 'application/json',
    });
    copyHeader(upstream.headers, responseHeaders, 'X-Rate-Limit-Remaining');
    copyHeader(upstream.headers, responseHeaders, 'X-Rate-Limit-Retry-After-Seconds');
    copyHeader(upstream.headers, responseHeaders, 'Retry-After');
    if (upstream.ok) {
      responseHeaders.set('Cache-Control', 'public, max-age=0, s-maxage=10, stale-while-revalidate=20');
      responseHeaders.set('CDN-Cache-Control', 'public, max-age=10, stale-while-revalidate=20');
      responseHeaders.set('Vercel-CDN-Cache-Control', 'public, max-age=10, stale-while-revalidate=20');
    } else {
      responseHeaders.set('Cache-Control', 'no-store');
    }
    return new Response(await upstream.arrayBuffer(), {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders,
    });
  } catch (error: unknown) {
    const message = error instanceof Error && error.name === 'AbortError'
      ? 'OpenSky tardó demasiado en responder.'
      : 'No fue posible consultar OpenSky desde el servidor.';
    return jsonError(502, message);
  } finally {
    clearTimeout(timeoutId);
  }
}

function validQueryValue(key: typeof ALLOWED_QUERY_PARAMETERS[number], value: string): boolean {
  if (key === 'extended') return value === '0' || value === '1';
  const number = Number(value);
  if (!Number.isFinite(number)) return false;
  if (key === 'lamin' || key === 'lamax') return number >= -90 && number <= 90;
  return number >= -180 && number <= 180;
}

async function getAccessToken(): Promise<string | null> {
  const clientId = process.env['OPENSKY_CLIENT_ID'];
  const clientSecret = process.env['OPENSKY_CLIENT_SECRET'];
  if (!clientId && !clientSecret) return null;
  if (!clientId || !clientSecret) throw new Error('OpenSky OAuth configuration is incomplete');
  if (cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken.value;

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
  });
  const response = await fetch(OPEN_SKY_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!response.ok) throw new Error(`OpenSky authentication failed with ${response.status}`);
  const payload = await response.json() as OpenSkyTokenResponse;
  if (typeof payload.access_token !== 'string' || payload.access_token.length === 0) throw new Error('OpenSky did not return an access token');
  const expiresIn = typeof payload.expires_in === 'number' && Number.isFinite(payload.expires_in) ? payload.expires_in : 1_800;
  cachedToken = { value: payload.access_token, expiresAt: Date.now() + Math.max(30, expiresIn - 60) * 1_000 };
  return cachedToken.value;
}

function copyHeader(source: Headers, target: Headers, name: string): void {
  const value = source.get(name);
  if (value !== null) target.set(name, value);
}

function jsonError(status: number, message: string): Response {
  return Response.json({ error: message }, { status, headers: { 'Cache-Control': 'no-store' } });
}
