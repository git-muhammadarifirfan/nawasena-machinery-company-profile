// Supabase Edge Function: invite-admin
// Creates a new Supabase Auth user (admin) + inserts into public.admins
// SECURITY: Uses SERVICE_ROLE on server-side. Caller must already be admin.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  if (!token) return json({ error: "Missing auth" }, 401);

  const userClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data: u, error: ue } = await userClient.auth.getUser();
  if (ue || !u?.user) return json({ error: "Invalid session" }, 401);

  // Check admin
  const { data: isAdmin, error: ae } = await userClient.rpc("is_admin", { uid: u.user.id });
  if (ae || !isAdmin) return json({ error: "Forbidden (admin only)" }, 403);

  const { email, password } = await req.json().catch(() => ({}));

  if (!email || !password) return json({ error: "email & password required" }, 400);

  const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE);

  // Create user
  const { data: created, error: ce } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (ce || !created?.user) return json({ error: ce?.message ?? "createUser failed" }, 400);

  // Insert into admins table
  const { error: ie } = await adminClient.from("admins").insert({ user_id: created.user.id });
  if (ie) return json({ error: ie.message }, 400);

  return json({ ok: true, user_id: created.user.id });
});
