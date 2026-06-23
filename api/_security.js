const rateLimitBuckets = new Map();

function getClientIp(req) {
  const forwarded = req.headers?.['x-forwarded-for'];
  if (Array.isArray(forwarded)) return forwarded[0] || 'unknown';
  return String(forwarded || req.headers?.['x-real-ip'] || 'unknown')
    .split(',')[0]
    .trim();
}

export function applyApiSecurityHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
}

export function enforceRateLimit(req, res, {
  limit = 60,
  windowMs = 60_000,
  namespace = 'api',
} = {}) {
  const now = Date.now();
  const key = `${namespace}:${getClientIp(req)}`;
  const current = rateLimitBuckets.get(key);
  const bucket = !current || current.resetAt <= now
    ? { count: 0, resetAt: now + windowMs }
    : current;

  bucket.count += 1;
  rateLimitBuckets.set(key, bucket);

  if (rateLimitBuckets.size > 5_000) {
    for (const [entryKey, entry] of rateLimitBuckets) {
      if (entry.resetAt <= now) rateLimitBuckets.delete(entryKey);
    }
  }

  res.setHeader('RateLimit-Limit', String(limit));
  res.setHeader('RateLimit-Remaining', String(Math.max(0, limit - bucket.count)));
  res.setHeader('RateLimit-Reset', String(Math.ceil(bucket.resetAt / 1000)));

  if (bucket.count <= limit) return true;

  res.setHeader('Retry-After', String(Math.ceil((bucket.resetAt - now) / 1000)));
  res.status(429).json({ error: 'Too many requests' });
  return false;
}
