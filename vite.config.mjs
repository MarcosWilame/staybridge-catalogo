import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { toPublicProperty } from './api/public-property-fields.js';

function localPublicPropertiesApi() {
  return {
    name: 'local-public-properties-api',
    configureServer(server) {
      const env = loadEnv(server.config.mode, process.cwd(), '');
      const supabaseUrl = (
        env.SUPABASE_URL ||
        env.VITE_SUPABASE_URL ||
        ''
      ).replace(/\/$/, '');
      const serviceKey =
        env.SUPABASE_SERVICE_ROLE_KEY ||
        env.SUPABASE_SERVICE_KEY ||
        '';
      const table =
        env.SUPABASE_PROPERTIES_TABLE ||
        env.VITE_SUPABASE_PROPERTIES_TABLE ||
        'properties';

      server.middlewares.use('/api/public-properties', async (req, res) => {
        if (req.method !== 'GET') {
          res.statusCode = 405;
          res.setHeader('Allow', 'GET');
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.setHeader('X-Content-Type-Options', 'nosniff');

        if (!supabaseUrl || !serviceKey || !table) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: 'Supabase server config missing' }));
          return;
        }

        try {
          const response = await fetch(
            `${supabaseUrl}/rest/v1/${table}?select=id,data&order=id.asc`,
            {
              headers: {
                apikey: serviceKey,
                Authorization: `Bearer ${serviceKey}`,
                Accept: 'application/json',
              },
            }
          );

          if (!response.ok) {
            const detail = await response.text();
            res.statusCode = response.status;
            res.end(JSON.stringify({ error: detail || 'Failed to load properties' }));
            return;
          }

          const rows = await response.json();
          const properties = Array.isArray(rows)
            ? rows.map(toPublicProperty).filter(Boolean)
            : [];

          res.statusCode = 200;
          res.end(JSON.stringify(properties));
        } catch (error) {
          const message =
            error instanceof Error ? error.message : 'Unknown error';

          res.statusCode = 500;
          res.end(JSON.stringify({ error: message }));
        }
      });

      server.middlewares.use('/sitemap.xml', async (_req, res) => {
        const now = new Date().toISOString();
        res.setHeader('Content-Type', 'application/xml; charset=utf-8');
        res.statusCode = 200;
        res.end(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://staybridgelondon.com/</loc>
    <lastmod>${now}</lastmod>
  </url>
  <url>
    <loc>https://staybridgelondon.com/properties</loc>
    <lastmod>${now}</lastmod>
  </url>
</urlset>`);
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), localPublicPropertiesApi()],
  base: '/',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
