
CREATE TABLE public.evaluaciones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  iao_general SMALLINT NOT NULL CHECK (iao_general BETWEEN 0 AND 100),
  nivel_general TEXT NOT NULL CHECK (nivel_general IN ('bajo','medio','alto')),
  iao_externo SMALLINT NOT NULL CHECK (iao_externo BETWEEN 0 AND 100),
  nivel_externo TEXT NOT NULL CHECK (nivel_externo IN ('bajo','medio','alto')),
  iao_interno SMALLINT NOT NULL CHECK (iao_interno BETWEEN 0 AND 100),
  nivel_interno TEXT NOT NULL CHECK (nivel_interno IN ('bajo','medio','alto')),
  dimensiones JSONB NOT NULL,
  rubro TEXT NOT NULL,
  empleados TEXT NOT NULL,
  antiguedad TEXT NOT NULL
);

CREATE INDEX evaluaciones_created_at_idx ON public.evaluaciones (created_at DESC);
CREATE INDEX evaluaciones_rubro_idx ON public.evaluaciones (rubro);

GRANT SELECT, INSERT ON public.evaluaciones TO anon;
GRANT SELECT, INSERT ON public.evaluaciones TO authenticated;
GRANT ALL ON public.evaluaciones TO service_role;

ALTER TABLE public.evaluaciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cualquiera puede leer evaluaciones (anónimas)"
ON public.evaluaciones FOR SELECT
USING (true);

-- WITH CHECK (true) es intencional: el cuestionario es anónimo y público por diseño.
-- Cualquier visitante puede registrar una evaluación sin login. No se almacenan datos identificatorios.
-- Revisar en B3 si se requiere rate limiting o auth real.
CREATE POLICY "Cualquiera puede crear evaluaciones"
ON public.evaluaciones FOR INSERT
WITH CHECK (true);
