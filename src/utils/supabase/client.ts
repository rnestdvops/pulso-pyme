import { createBrowserClient, type CookieMethodsBrowser } from "@supabase/ssr";

// Patrón lazy + tolerante: si faltan las env vars (build sin DB o local sin .env),
// devolvemos un stub silencioso que responde { data: null, error } a cualquier
// query encadenada. Esto evita romper el prerender de Next.js cuando las vars
// todavía no están inyectadas.
type SupabaseLike = ReturnType<typeof createBrowserClient>;

function createStub(): SupabaseLike {
  const noop = { data: null, error: { message: "Supabase no configurado" } };
  const handler: ProxyHandler<() => unknown> = {
    get(_t, prop) {
      if (prop === "then") return (resolve: (v: unknown) => void) => resolve(noop);
      return new Proxy(() => undefined, handler);
    },
    apply() {
      return new Proxy(() => undefined, handler);
    },
  };
  return new Proxy(() => undefined, handler) as unknown as SupabaseLike;
}

let _client: SupabaseLike | undefined;

function getClient(): SupabaseLike {
  if (_client) return _client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    if (typeof window !== "undefined") {
      console.warn("[Supabase] Falta NEXT_PUBLIC_SUPABASE_URL/_ANON_KEY — usando stub.");
    }
    _client = createStub();
    return _client;
  }
  _client = createBrowserClient(url, key);
  return _client;
}

export function createClient() {
  return getClient();
}

export const supabase = new Proxy({} as SupabaseLike, {
  get(_, prop, receiver) {
    return Reflect.get(getClient(), prop, receiver);
  },
});
