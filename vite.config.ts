import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

function resolveSupabaseSecretKey(value = '') {
  const key = value.trim()
  const jwtStart = key.indexOf('eyJ')

  return jwtStart > 0 ? key.slice(jwtStart) : key
}

function localPublicPropertiesApi(mode: string): Plugin {
  const env = loadEnv(mode, process.cwd(), '')
  const supabaseUrl = (env.SUPABASE_URL || env.VITE_SUPABASE_URL || '').replace(/\/$/, '')
  const serviceKey = resolveSupabaseSecretKey(
    env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_KEY || ''
  )
  const table = env.SUPABASE_PROPERTIES_TABLE || env.VITE_SUPABASE_PROPERTIES_TABLE || 'properties'

  return {
    name: 'local-public-properties-api',
    configureServer(server) {
      server.middlewares.use('/api/public-properties', async (req, res) => {
        if (req.method !== 'GET') {
          res.statusCode = 405
          res.setHeader('Allow', 'GET')
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          res.end(JSON.stringify({ error: 'Method not allowed' }))
          return
        }

        if (!supabaseUrl || !serviceKey || !table) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          res.end(JSON.stringify({ error: 'Supabase server config missing' }))
          return
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
          )

          if (!response.ok) {
            const detail = await response.text()
            res.statusCode = response.status
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            res.end(JSON.stringify({ error: detail || 'Failed to load properties' }))
            return
          }

          const rows = await response.json()
          const properties = Array.isArray(rows)
            ? rows
                .map((row) => {
                  const data =
                    row?.data && typeof row.data === 'object' ? row.data : {}

                  return {
                    ...data,
                    id: Number(data.id || row.id),
                  }
                })
                .filter((property) => property.listed !== false)
            : []

          res.statusCode = 200
          res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
          res.setHeader('X-Content-Type-Options', 'nosniff')
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          res.end(JSON.stringify(properties))
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown error'

          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          res.end(JSON.stringify({ error: message }))
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), localPublicPropertiesApi(mode)],
  base: '/',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
}))
