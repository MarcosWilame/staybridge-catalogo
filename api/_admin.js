const SUPABASE_URL = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

export const ADMIN_SESSION_COOKIE = 'staybridge_admin_access';
export const ADMIN_REFRESH_COOKIE = 'staybridge_admin_refresh';
export const ADMIN_PENDING_COOKIE = 'staybridge_admin_pending';

export function getSupabaseConfig() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) throw new Error('Supabase server config missing');
  return { url: SUPABASE_URL, anonKey: SUPABASE_ANON_KEY };
}

export function parseCookies(req) {
  return String(req.headers?.cookie || '')
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((cookies, part) => {
      const separator = part.indexOf('=');
      if (separator < 0) return cookies;
      cookies[decodeURIComponent(part.slice(0, separator))] = decodeURIComponent(part.slice(separator + 1));
      return cookies;
    }, {});
}

export function createSecureCookie(name, value, maxAge) {
  return `${encodeURIComponent(name)}=${encodeURIComponent(value)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${Math.max(0, Math.floor(maxAge))}`;
}

export function clearAdminCookies(res) {
  res.setHeader('Set-Cookie', [
    createSecureCookie(ADMIN_SESSION_COOKIE, '', 0),
    createSecureCookie(ADMIN_REFRESH_COOKIE, '', 0),
    createSecureCookie(ADMIN_PENDING_COOKIE, '', 0),
  ]);
}

export function assertSameOrigin(req) {
  const origin = req.headers?.origin;
  if (!origin) return true;
  const host = req.headers?.['x-forwarded-host'] || req.headers?.host;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function supabaseRequest(path, { token, method = 'GET', body, headers = {} } = {}) {
  const { url, anonKey } = getSupabaseConfig();
  const response = await fetch(`${url}${path}`, {
    method,
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${token || anonKey}`,
      Accept: 'application/json',
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    ...(body !== undefined ? { body: typeof body === 'string' ? body : JSON.stringify(body) } : {}),
  });
  return response;
}

export function getJwtAal(token) {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString('utf8'));
    return payload.aal || '';
  } catch {
    return '';
  }
}

export async function verifyAdminToken(token, { requireAal2 = true } = {}) {
  if (!token || (requireAal2 && getJwtAal(token) !== 'aal2')) return null;

  const userResponse = await supabaseRequest('/auth/v1/user', { token });
  if (!userResponse.ok) return null;
  const user = await userResponse.json();

  const permissionResponse = await supabaseRequest('/rest/v1/rpc/is_properties_admin', {
    token,
    method: 'POST',
    body: {},
  });
  if (!permissionResponse.ok || (await permissionResponse.json()) !== true) return null;
  return user;
}

export async function requireAdmin(req, res) {
  const cookies = parseCookies(req);
  let accessToken = cookies[ADMIN_SESSION_COOKIE] || '';
  let user = await verifyAdminToken(accessToken);

  if (!user && cookies[ADMIN_REFRESH_COOKIE]) {
    const refreshResponse = await supabaseRequest('/auth/v1/token?grant_type=refresh_token', {
      method: 'POST',
      body: { refresh_token: cookies[ADMIN_REFRESH_COOKIE] },
    });
    if (refreshResponse.ok) {
      const refreshed = await refreshResponse.json();
      accessToken = refreshed.access_token || '';
      user = await verifyAdminToken(accessToken);
      if (user) {
        res.setHeader('Set-Cookie', [
          createSecureCookie(ADMIN_SESSION_COOKIE, accessToken, refreshed.expires_in || 3600),
          createSecureCookie(ADMIN_REFRESH_COOKIE, refreshed.refresh_token || cookies[ADMIN_REFRESH_COOKIE], 60 * 60 * 24 * 7),
        ]);
      }
    }
  }

  if (!user) {
    clearAdminCookies(res);
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }

  return { accessToken, user };
}
