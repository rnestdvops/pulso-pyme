import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase con SERVICE ROLE — bypasea RLS.
 *
 * SOLO usar desde Server Actions o Server Components. Nunca importar desde
 * un archivo con "use client" ni desde un componente cliente. La directiva
 * `import "server-only"` lo fuerza en build.
 *
 * Lee credenciales de env vars sin prefijo NEXT_PUBLIC_:
 *   - SUPABASE_URL  (o NEXT_PUBLIC_SUPABASE_URL como fallback, ya está set)
 *   - SUPABASE_SERVICE_ROLE_KEY  (server-only secret)
 *
 * Si alguna falta, lanza Error en runtime. No degradamos a stub porque las
 * server actions DEBEN tener acceso real al DB para hacer su trabajo.
 */

let _admin: SupabaseClient | undefined;

export function supabaseAdmin(): SupabaseClient {
  if (_admin) return _admin;

  const url =
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    const missing = [
      !url ? "SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL" : null,
      !serviceRoleKey ? "SUPABASE_SERVICE_ROLE_KEY" : null,
    ]
      .filter(Boolean)
      .join(", ");
    throw new Error(
      `[supabaseAdmin] Falta env var(s): ${missing}. Configurar en Vercel Settings → Environment Variables.`,
    );
  }

  _admin = createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return _admin;
}
