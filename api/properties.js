import { readFileSync } from 'fs';
import { join } from 'path';

export default function handler(req, res) {
  const origin = req.headers.origin;
  const host = req.headers.host || '';
  const allowedHost = process.env.ALLOWED_HOST || host;

  if (origin) {
    try {
      const originHost = new URL(origin).host;
      if (originHost !== allowedHost) {
        return res.status(403).json({ error: 'Forbidden' });
      }
    } catch {
      return res.status(403).json({ error: 'Forbidden' });
    }
  }

  try {
    const filePath = join(process.cwd(), 'data', 'properties.csv');
    const csv = readFileSync(filePath, 'utf-8');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Cache-Control', 'private, no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');

    return res.status(200).send(csv);
  } catch (err) {
    console.error('[properties] failed to read CSV:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}