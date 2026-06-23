# Supabase security

Apply `supabase/migrations/20260622_security_hardening.sql` before deploying the matching frontend/API release.

It provides:

- RLS with direct anonymous access to `properties` revoked.
- Sanitized public RPCs that never return addresses or coordinates.
- Admin-only property and Storage writes through `is_properties_admin()`.
- Private `property-images` and `backups` buckets.
- Immutable property audit history with actor and timestamp.
- Storage MIME and size restrictions.

Production configuration:

- Keep `SUPABASE_SERVICE_ROLE_KEY` only in Vercel server environment variables.
- Set `SUPABASE_ANON_KEY` for server-side public RPC calls.
- Set a long random `CRON_SECRET` for daily backups.
- Enable leaked-password protection and CAPTCHA in Supabase Auth.
- Keep email sign-ups disabled; provision administrators manually.
- Verify both admin accounts enroll TOTP during their next login.
- Enable Supabase point-in-time recovery when the project plan supports it.
- Enable GitHub secret scanning and push protection in repository settings.
