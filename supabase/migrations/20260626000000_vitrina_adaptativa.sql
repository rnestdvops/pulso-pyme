-- ─────────────────────────────────────────────────────────────────────────────
-- Vitrina Adaptativa + Contacto opt-in ANTEL (Pulso PyME)
--
-- Crea dos tablas nuevas SIN tocar `evaluaciones`:
--   * sugerencias_vistas   — registra el primer opt-in (vio la vitrina). Anónima.
--   * contact_requests     — registra el segundo opt-in (pidió contacto). Tiene
--     datos identificables; vive separada de `evaluaciones` y solo se cruza si
--     la PyME marca explícitamente el checkbox "compartir mi diagnóstico".
--
-- Hard rules respetadas (SPEC §1):
--  · La base del diagnóstico sigue anónima (no se toca evaluaciones).
--  · Doble opt-in: la primera tabla no captura PII; la segunda sí, con consent.
--  · El cruce con evaluaciones es opcional (evaluacion_id_compartida nullable).
--
-- ARQUITECTURA DE PRIVACIDAD (mejorada vs SPEC original):
--  Acceso a estas tablas SOLO vía Next.js Server Actions con SUPABASE_SERVICE_ROLE_KEY.
--  Para anon (browser-side), ambas tablas están totalmente bloqueadas — ni insert
--  ni select. Esto significa que datos personales de las PyMEs (nombre, email,
--  teléfono) nunca son leíbles desde el cliente, eliminando el riesgo de
--  enumeración via curl que tenía la versión anterior del SPEC.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── sugerencias_vistas ────────────────────────────────────────────────────────
create table if not exists public.sugerencias_vistas (
  id                    uuid primary key default gen_random_uuid(),
  evaluacion_id         uuid not null references public.evaluaciones(id) on delete cascade,
  vista_at              timestamptz not null default now(),
  productos_mostrados   jsonb not null,  -- array de ids del catálogo
  senales_disparadoras  jsonb not null   -- array de strings (ej: "acceso_informacion_bajo")
);

create index if not exists sugerencias_vistas_evaluacion_idx on public.sugerencias_vistas(evaluacion_id);
create index if not exists sugerencias_vistas_vista_at_idx   on public.sugerencias_vistas(vista_at desc);

alter table public.sugerencias_vistas enable row level security;

-- Sin policies para anon ni authenticated → bloqueo total para esos roles.
-- service_role bypassea RLS por defecto; usado desde Server Actions.

grant all on public.sugerencias_vistas to service_role;


-- ── contact_requests ──────────────────────────────────────────────────────────
create table if not exists public.contact_requests (
  id                          uuid primary key default gen_random_uuid(),
  created_at                  timestamptz not null default now(),
  nombre                      text not null,
  empresa                     text not null,
  email                       text not null,
  telefono                    text,
  productos_interes           jsonb not null,  -- array de ids del catálogo
  mensaje                     text,
  -- Cruce opcional con diagnóstico: NULL si la PyME no autorizó compartirlo
  evaluacion_id_compartida    uuid references public.evaluaciones(id) on delete set null,
  -- Estado de gestión interna ANTEL (workflow simple)
  estado                      text not null default 'nuevo'
    check (estado in ('nuevo','contactado','en_conversacion','cerrado')),
  notas_internas              text
);

create index if not exists contact_requests_created_at_idx on public.contact_requests(created_at desc);
create index if not exists contact_requests_estado_idx     on public.contact_requests(estado);

alter table public.contact_requests enable row level security;

-- Sin policies para anon → cero acceso desde el browser.
-- Toda escritura y lectura pasa por Server Actions que usan SUPABASE_SERVICE_ROLE_KEY.

grant all on public.contact_requests to service_role;
