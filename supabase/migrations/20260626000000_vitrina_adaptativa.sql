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
-- DEUDA EXPLÍCITA — privacidad de contact_requests:
--  RLS de select para `anon` queda abierta porque el panel operador lee
--  Supabase directo desde el cliente (no hay backend). Esto significa que
--  cualquier persona con la URL de la app puede listar nombre/email/teléfono
--  vía fetch directo a la API. La migración correcta es mover el acceso del
--  panel a una edge function autenticada por password. Ver memoria
--  [[reference-lovable-secrets]] para el contexto de auth con Lovable Cloud.
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

create policy "Cualquiera puede registrar que vio la vitrina"
  on public.sugerencias_vistas for insert
  with check (true);

create policy "Lectura pública de vistas (anónimo, solo evaluacion_id)"
  on public.sugerencias_vistas for select
  using (true);

grant select, insert on public.sugerencias_vistas to anon;
grant select, insert on public.sugerencias_vistas to authenticated;
grant all          on public.sugerencias_vistas to service_role;


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

create policy "Cualquiera puede solicitar contacto (segundo opt-in)"
  on public.contact_requests for insert
  with check (true);

-- DEUDA: select abierto a anon para que el panel funcione sin backend.
-- Migrar a edge function autenticada cuando Lovable Cloud lo permita.
create policy "Lectura pública de contact_requests (DEUDA: cerrar)"
  on public.contact_requests for select
  using (true);

grant select, insert on public.contact_requests to anon;
grant select, insert, update on public.contact_requests to authenticated;
grant all                    on public.contact_requests to service_role;
