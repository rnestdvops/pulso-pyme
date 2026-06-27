-- Tanda B1: ampliar evaluaciones con datos de tecnología, IA y respuestas crudas

-- Eje tecnología (lectura aparte, no entra al IAO)
alter table public.evaluaciones
  add column if not exists tecnologia_puntaje smallint,
  add column if not exists tecnologia_nivel text,
  add column if not exists tecnologia_por_dimension jsonb,

-- Lectura IA (solo estado descriptivo)
  add column if not exists ia_estado text,

-- Contexto adicional (rol faltaba en la migración original)
  add column if not exists rol text,

-- Q16: inventario de herramientas (multi-select, no puntúa)
  add column if not exists q16_seleccionadas text[],
  add column if not exists q16_otra_texto text,

-- Respuestas crudas Q17-Q22 (scores 1-4, para análisis futuro)
  add column if not exists respuestas_tec jsonb;

-- Índice para filtrar por nivel de tecnología en el panel ANTEL (B2)
create index if not exists evaluaciones_tecnologia_nivel_idx
  on public.evaluaciones (tecnologia_nivel);

-- Vista para el scatter: solo los tres números que dibujan el punto
-- Sin metadatos identificatorios
create or replace view public.scatter_ecosistema as
select
  id,
  iao_externo   as eje_externo,
  iao_interno   as eje_interno,
  tecnologia_puntaje as color_tecnologia
from public.evaluaciones
where iao_externo is not null
  and iao_interno is not null;

-- Acceso anónimo de solo lectura a la vista
grant select on public.scatter_ecosistema to anon;
