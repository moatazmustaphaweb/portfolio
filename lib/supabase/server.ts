import "server-only";

import { createClient } from "@supabase/supabase-js";

import type { Database } from "./database.types";

/**
 * Service-role Supabase client. SERVER ONLY.
 *
 * The `server-only` import above turns any accidental client-component import
 * into a build error rather than a leaked service key — this file reads a
 * secret that must never reach the browser.
 *
 * This is the client the content layer uses for reads. That is deliberate, not
 * lazy: `translations` has RLS enabled with no policy (decision 025), so the
 * anon key cannot read any copy at all. Content reads are server-side by
 * design — rule 2 and decision 009 (ISR) already require it, and with ISR a
 * visitor never touches the database on a normal page load.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set");
}

if (!serviceRoleKey) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
}

if (serviceRoleKey.startsWith("sb_publishable_") || serviceRoleKey.length < 40) {
  throw new Error(
    "SUPABASE_SERVICE_ROLE_KEY looks like a publishable/anon key. The service " +
      "role key is required here — a publishable key cannot read translations.",
  );
}

export const supabaseServer = createClient<Database>(url, serviceRoleKey, {
  auth: {
    // No user sessions on the server: nothing to persist or refresh, and
    // persisting would be a cross-request leak in a shared runtime.
    persistSession: false,
    autoRefreshToken: false,
  },
});
