alter table public.evaluaciones
  add column if not exists tecnologia_puntaje smallint,
  add column if not exists tecnologia_nivel text,
  add column if not exists tecnologia_por_dimension jsonb,
  add column if not exists ia_estado text,
  add column if not exists rol text,
  add column if not exists q16_seleccionadas text[],
  add column if not exists q16_otra_texto text,
  add column if not exists respuestas_tec jsonb;

create index if not exists evaluaciones_tecnologia_nivel_idx
  on public.evaluaciones (tecnologia_nivel);

create or replace view public.scatter_ecosistema as
select
  id,
  iao_externo        as eje_externo,
  iao_interno        as eje_interno,
  tecnologia_puntaje as color_tecnologia
from public.evaluaciones
where iao_externo is not null
  and iao_interno is not null;

grant select on public.scatter_ecosistema to anon;
grant select on public.scatter_ecosistema to authenticated;