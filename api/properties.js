import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

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

  const candidates = [
    join(__dirname, '..', 'data', 'properties.csv'),
    join(process.cwd(), 'data', 'properties.csv'),
  ];

  for (const filePath of candidates) {
    try {
      const csv = readFileSync(filePath, 'utf-8');
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Cache-Control', 'private, no-store');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      return res.status(200).send(csv);
    } catch {
      continue;
    }
  }

  console.error('[properties] CSV not found. Tried:', candidates);
  return res.status(500).json({ error: 'CSV file not found' });
}