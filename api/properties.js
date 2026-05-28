import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default function handler(req, res) {
  const cwd = process.cwd();
  const dirName = __dirname;

  const candidates = [
    join(dirName, '..', 'data', 'properties.csv'),
    join(dirName, 'data', 'properties.csv'),
    join(cwd, 'data', 'properties.csv'),
    join(cwd, 'properties.csv'),
    join(dirName, '..', 'properties.csv'),
  ];

  const debug = {
    cwd,
    __dirname: dirName,
    cwdContents: (() => { try { return readdirSync(cwd); } catch { return 'error'; } })(),
    dirnameContents: (() => { try { return readdirSync(dirName); } catch { return 'error'; } })(),
    dirnameParentContents: (() => { try { return readdirSync(join(dirName, '..')); } catch { return 'error'; } })(),
    candidates: candidates.map(p => ({ path: p, exists: existsSync(p) })),
  };

  return res.status(200).json(debug);
}