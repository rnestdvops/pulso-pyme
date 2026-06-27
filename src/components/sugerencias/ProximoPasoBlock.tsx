"use client";

import Link from "next/link";

interface Props {
  /**
   * Id de la evaluación recién creada. Se pasa como query param a /sugerencias
   * para que la página pueda fetchear datos y personalizar el matching.
   */
  evaluacionId: string;
}

/**
 * Bloque "Próximo paso opcional" al pie de ResultadosStep.
 *
 * Reglas duras del SPEC respetadas:
 *  · §1 #1: el kit de conversación se entrega ANTES de la vitrina — este
 *    bloque aparece DEBAJO del botón de descarga del PDF.
 *  · §1 #4: cero datos identificables hasta el segundo opt-in. El click
 *    en "Ver soluciones" no captura email ni manda eventos — solo navega.
 *  · §10: separación visual fuerte (fondo distinto + borde superior).
 */
export function ProximoPasoBlock({ evaluacionId }: Props) {
  if (!evaluacionId) return null;

  return (
    <section
      className="mt-12 rounded-2xl border-2 border-dashed border-border bg-secondary/30 p-6 sm:p-8"
      aria-label="Próximo paso opcional"
    >
      <header className="mb-3 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Opcional
        </p>
        <h2 className="font-heading text-xl font-bold leading-tight text-foreground sm:text-2xl">
          Tu diagnóstico termina acá
        </h2>
      </header>

      <div className="space-y-3 text-sm leading-relaxed text-foreground/80">
        <p>
          Tu kit de conversación está listo arriba. Esa es la herramienta principal.
        </p>
        <p>
          Si querés, podemos mostrarte qué tipo de soluciones podrían acompañar lo
          que mostró tu pulso. Es opcional, no afecta tu resultado, y vos elegís si
          querés conversar con alguien o no.
        </p>
      </div>

      <div className="mt-5 flex flex-col items-start gap-2">
        <Link
          href={`/sugerencias?ev=${encodeURIComponent(evaluacionId)}`}
          className="inline-flex h-11 items-center gap-1 rounded-lg border border-border bg-card px-5 text-sm font-medium text-foreground transition hover:border-accent/40 hover:bg-card"
        >
          Ver soluciones sugeridas →
        </Link>
        <p className="text-xs italic text-muted-foreground">
          No te pedimos datos para mostrártelas.
        </p>
      </div>
    </section>
  );
}
