import {
  ADMIN_PENDING_COOKIE,
  ADMIN_REFRESH_COOKIE,
  ADMIN_SESSION_COOKIE,
  assertSameOrigin,
  clearAdminCookies,
  createSecureCookie,
  getJwtAal,
  parseCookies,
  requireAdmin,
  supabaseRequest,
  verifyAdminToken,
} from './_admin.js';
import { applyApiSecurityHeaders, enforceRateLimit } from './_security.js';

function safeUser(user) {
  return { email: typeof user?.email === 'string' ? user.email : '' };
}

export default async function handler(req, res) {
  applyApiSecurityHeaders(res);
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'GET') {
    const admin = await requireAdmin(req, res);
    if (!admin) return;
    return res.status(200).json({ user: safeUser(admin.user) });
  }

  if (req.method === 'DELETE') {
    if (!assertSameOrigin(req)) return res.status(403).json({ error: 'Invalid origin' });
    clearAdminCookies(res);
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST, DELETE');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!assertSameOrigin(req)) return res.status(403).json({ error: 'Invalid origin' });
  if (!enforceRateLimit(req, res, { limit: 10, windowMs: 15 * 60_000, namespace: 'admin-auth' })) return;

  const action = req.body?.action;
  if (action === 'login') {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().slice(0, 254) : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    if (!email || password.length < 8 || password.length > 256) {
      return res.status(400).json({ error: 'Credenciais invalidas' });
    }

    const loginResponse = await supabaseRequest('/auth/v1/token?grant_type=password', {
      method: 'POST',
      body: { email, password },
    });
    if (!loginResponse.ok) return res.status(401).json({ error: 'Credenciais invalidas' });
    const login = await loginResponse.json();
    const user = await verifyAdminToken(login.access_token, { requireAal2: false });
    if (!user) return res.status(403).json({ error: 'Conta sem permissao administrativa' });

    res.setHeader('Set-Cookie', [
      createSecureCookie(ADMIN_SESSION_COOKIE, login.access_token, login.expires_in || 3600),
      createSecureCookie(ADMIN_REFRESH_COOKIE, login.refresh_token || '', 60 * 60 * 24 * 7),
      createSecureCookie(ADMIN_PENDING_COOKIE, '', 0),
    ]);
    return res.status(200).json({ user: safeUser(user) });

    const factor = user.factors?.find(
      (item) => item.factor_type === 'totp' && item.status === 'verified'
    );
    let factorId = factor?.id;
    let qrCode;
    let secret;
    let isEnrollment = false;

    if (!factorId) {
      const enrollResponse = await supabaseRequest('/auth/v1/factors', {
        token: login.access_token,
        method: 'POST',
        body: { factor_type: 'totp', friendly_name: 'Staybridge Admin' },
      });
      if (!enrollResponse.ok) return res.status(502).json({ error: 'Nao foi possivel configurar MFA' });
      const enrollment = await enrollResponse.json();
      factorId = enrollment.id;
      qrCode = enrollment.totp?.qr_code;
      secret = enrollment.totp?.secret;
      isEnrollment = true;
    }

    const challengeResponse = await supabaseRequest(`/auth/v1/factors/${encodeURIComponent(factorId)}/challenge`, {
      token: login.access_token,
      method: 'POST',
      body: {},
    });
    if (!challengeResponse.ok) return res.status(502).json({ error: 'Nao foi possivel iniciar MFA' });
    const challenge = await challengeResponse.json();
    res.setHeader('Set-Cookie', createSecureCookie(ADMIN_PENDING_COOKIE, login.access_token, 600));
    return res.status(200).json({
      mfaRequired: true,
      factorId,
      challengeId: challenge.id,
      qrCode,
      secret,
      isEnrollment,
    });
  }

  if (action === 'verify') {
    const cookies = parseCookies(req);
    const pendingToken = cookies[ADMIN_PENDING_COOKIE] || '';
    const factorId = typeof req.body?.factorId === 'string' ? req.body.factorId : '';
    const challengeId = typeof req.body?.challengeId === 'string' ? req.body.challengeId : '';
    const code = typeof req.body?.code === 'string' ? req.body.code.replace(/\D/g, '') : '';
    if (!pendingToken || !factorId || !challengeId || !/^\d{6}$/.test(code)) {
      return res.status(400).json({ error: 'Verificacao invalida' });
    }

    const verifyResponse = await supabaseRequest(`/auth/v1/factors/${encodeURIComponent(factorId)}/verify`, {
      token: pendingToken,
      method: 'POST',
      body: { challenge_id: challengeId, code },
    });
    if (!verifyResponse.ok) return res.status(401).json({ error: 'Codigo invalido' });
    const verified = await verifyResponse.json();
    if (getJwtAal(verified.access_token) !== 'aal2') {
      return res.status(401).json({ error: 'MFA nao concluido' });
    }
    const user = await verifyAdminToken(verified.access_token);
    if (!user) return res.status(403).json({ error: 'Conta sem permissao administrativa' });

    res.setHeader('Set-Cookie', [
      createSecureCookie(ADMIN_SESSION_COOKIE, verified.access_token, verified.expires_in || 3600),
      createSecureCookie(ADMIN_REFRESH_COOKIE, verified.refresh_token || '', 60 * 60 * 24 * 7),
      createSecureCookie(ADMIN_PENDING_COOKIE, '', 0),
    ]);
    return res.status(200).json({ user: safeUser(user) });
  }

  return res.status(400).json({ error: 'Invalid action' });
}
