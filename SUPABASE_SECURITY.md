# Supabase security checklist

The browser must use only the anon key. Keep `SUPABASE_SERVICE_ROLE_KEY` server-side.

Required production checks:

- Enable RLS on `properties` and `storage.objects`.
- Allow anonymous reads only for rows whose JSON data has `listed = true`.
- Restrict property writes to authenticated admin users.
- Restrict uploads and deletes in `property-images` to authenticated admin users.
- Never expose exact addresses or coordinates through `/api/public-properties`.
- Keep the service-role key only in Vercel/Supabase server environment variables.
