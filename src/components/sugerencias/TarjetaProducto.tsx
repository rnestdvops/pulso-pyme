import type { SugerenciaConCopy } from "@/lib/sugerencias-engine";

interface Props {
  sugerencia: SugerenciaConCopy;
}

/**
 * Tarjeta de producto sobria — sin precios, sin "comprar ahora", sin urgencia.
 * Sigue la regla del SPEC §10: look sobrio, no de e-commerce.
 */
export function TarjetaProducto({ sugerencia }: Props) {
  const { producto, porQueMostrado } = sugerencia;
  const dimensionTag = labelSenal(sugerencia.senalDisparadora);

  return (
    <article className="rounded-xl border border-border bg-card p-5 transition hover:border-accent/40">
      <div className="mb-3 flex items-start justify-between gap-3">
        <h3 className="font-heading text-lg font-semibold leading-snug text-foreground">
          {producto.titulo}
        </h3>
        <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-secondary-foreground">
          {producto.proveedor}
        </span>
      </div>

      <p className="mb-4 text-sm leading-relaxed text-foreground/80">
        {producto.descripcion}
      </p>

      <div className="rounded-lg bg-secondary/50 p-3">
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-accent">
          ¿Por qué te lo mostramos?
        </p>
        <p className="text-xs leading-relaxed text-foreground/75">
          {porQueMostrado}
        </p>
      </div>

      {dimensionTag && (
        <p className="mt-3 text-[11px] text-muted-foreground">
          Conectado con: <strong className="text-foreground/80">{dimensionTag}</strong>
        </p>
      )}
    </article>
  );
}

/**
 * Convierte una señal interna ("acceso_informacion_bajo") en una etiqueta
 * legible para mostrar en la tarjeta. Si la señal no matchea ningún caso,
 * devuelve null (no se renderiza el tag).
 */
function labelSenal(senal: string): string | null {
  if (senal.endsWith("_bajo")) {
    const dim = senal.replace(/_bajo$/, "");
    return DIM_LABEL[dim] ?? null;
  }
  if (senal.startsWith("tec_")) {
    const nivel = senal.replace("tec_", "");
    return TEC_LABEL[nivel] ?? null;
  }
  if (senal.startsWith("ia_")) {
    const estado = senal.replace("ia_", "");
    return IA_LABEL[estado] ?? null;
  }
  if (senal.startsWith("falta_")) {
    const herramienta = senal.replace("falta_", "");
    return HERRAMIENTA_LABEL[herramienta] ?? "tu inventario de herramientas";
  }
  return null;
}

const DIM_LABEL: Record<string, string> = {
  velocidad_respuesta: "velocidad de respuesta al mercado",
  conversacion_sector: "escucha al cliente y al sector",
  tiempo_innovacion: "velocidad de innovación",
  estructura_valor: "estructura organizacional",
  peso_jerarquia: "toma de decisiones",
  acceso_informacion: "acceso a la información",
  voz: "participación del equipo",
  error: "gestión del error",
  mira_resultado: "métricas de negocio",
  rumbo: "visión compartida",
  digitalizacion: "digitalización del día a día",
  datos_resguardo: "resguardo de datos",
  datos_acceso: "control de accesos",
};

const TEC_LABEL: Record<string, string> = {
  punto_de_partida: "tu punto de partida tecnológico",
  en_camino: "tu pulso tecnológico en camino",
  consolidado: "tu base tecnológica consolidada",
};

const IA_LABEL: Record<string, string> = {
  no_usan: "tu punto de partida con IA",
  probaron: "tu exploración inicial de IA",
  puntual: "tu uso puntual de IA",
  integrada: "tu adopción consolidada de IA",
};

const HERRAMIENTA_LABEL: Record<string, string> = {
  web: "presencia digital propia",
  erp: "sistema integrado de gestión",
};
