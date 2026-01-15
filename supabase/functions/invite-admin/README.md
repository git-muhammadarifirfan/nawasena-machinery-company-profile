# invite-admin Edge Function

Deploy:
```bash
supabase functions deploy invite-admin
```

Set secrets:
```bash
supabase secrets set SUPABASE_URL="https://<project>.supabase.co"
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="<service_role>"
supabase secrets set SUPABASE_ANON_KEY="<anon_key>"
```

Frontend calls:
POST /functions/v1/invite-admin
Authorization: Bearer <access_token>
Body: { "email": "...", "password": "..." }
