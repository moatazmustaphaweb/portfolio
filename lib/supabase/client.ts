import { createClient } from "@supabase/supabase-js";

import type { Database } from "./database.types";

/**
 * Anon Supabase client, browser-safe.
 *
 * ⚠️ This client has NO content role. `translations` denies anon entirely
 * (decision 025), so it cannot read a single human-readable string. Every
 * content read goes through `lib/content/*` on the server.
 *
 * It exists for Layer 3 (comments) and any future browser-side write that is
 * genuinely safe to expose. If you find yourself reaching for it to render
 * content, that is the wrong layer — use a server component.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set");
}

if (!anonKey) {
  throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY is not set");
}

export const supabaseClient = createClient<Database>(url, anonKey);
