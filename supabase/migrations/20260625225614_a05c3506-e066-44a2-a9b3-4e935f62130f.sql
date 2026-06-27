
CREATE TABLE public.evaluaciones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  iao_general INTEGER NOT NULL,
  nivel_general TEXT NOT NULL,
  iao_externo INTEGER NOT NULL,
  nivel_externo TEXT NOT NULL,
  iao_interno INTEGER NOT NULL,
  nivel_interno TEXT NOT NULL,
  dimensiones JSONB NOT NULL,
  rubro TEXT NOT NULL,
  empleados TEXT NOT NULL,
  antiguedad TEXT,
  rol TEXT,
  tecnologia_puntaje INTEGER,
  tecnologia_nivel TEXT,
  tecnologia_por_dimension JSONB,
  ia_estado TEXT,
  q16_seleccionadas TEXT[],
  q16_otra_texto TEXT,
  respuestas_tec JSONB
);

GRANT SELECT, INSERT ON public.evaluaciones TO anon, authenticated;
GRANT ALL ON public.evaluaciones TO service_role;

ALTER TABLE public.evaluaciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cualquiera puede insertar evaluaciones"
  ON public.evaluaciones FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Cualquiera puede leer evaluaciones"
  ON public.evaluaciones FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE VIEW public.scatter_ecosistema
WITH (security_invoker = true)
AS
SELECT
  id::TEXT AS id,
  iao_externo AS eje_externo,
  iao_interno AS eje_interno,
  tecnologia_puntaje AS color_tecnologia
FROM public.evaluaciones;

GRANT SELECT ON public.scatter_ecosistema TO anon, authenticated;
