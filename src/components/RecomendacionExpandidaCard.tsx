"use client";

import { useState } from "react";
import type { DimensionBaja } from "@/lib/oc-engine/recomendaciones-expandidas";
import { PRINCIPIO_LABEL } from "@/lib/oc-engine/recomendaciones-expandidas";

interface Props {
  item: DimensionBaja;
  /** Si true, arranca expandido. Default false. */
  defaultExpanded?: boolean;
}

/**
 * Recomendación expandida (marco 4 capas del Anexo) con UI colapsable.
 *
 * Visible siempre: Capa 1 (Señal).
 * Expandible: Capas 2 (opcional), 3 (argumento + costo + principios) y
 * 4 (3 lentes: cliente, contexto, competitividad).
 */
export function RecomendacionExpandidaCard({ item, defaultExpanded = false }: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const { etiqueta, score, recomendacion: r } = item;

  return (
    <article className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      {/* Header con etiqueta de dimensión + score */}
      <header className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-destructive">
            Bajo · {score}/100
          </p>
          <h3 className="mt-0.5 font-heading text-lg font-semibold leading-snug text-foreground">
            {etiqueta}
          </h3>
        </div>
      </header>

      {/* Capa 1 — Señal (siempre visible) */}
      <section className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Lo que mostró tu pulso
        </p>
        <p className="text-sm leading-relaxed text-foreground/85">{r.senal}</p>
      </section>

      {/* Toggle */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent transition hover:text-accent/80"
        aria-expanded={expanded}
      >
        {expanded ? "Cerrar" : "Profundizar"}
        <span aria-hidden className="text-xs">
          {expanded ? "↑" : "↓"}
        </span>
      </button>

      {expanded && (
        <div className="mt-5 space-y-6 border-t border-border pt-5">
          {/* Capa 2 — Desarmar idea común (opcional) */}
          {r.desarmarIdea && (
            <section className="space-y-1.5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-accent">
                Desarmar una idea común
              </p>
              <p className="text-sm leading-relaxed text-foreground/80">{r.desarmarIdea}</p>
            </section>
          )}

          {/* Capa 3 — Por qué importa: argumento + costo + principios */}
          <section className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-accent">
              Por qué importa
            </p>
            <p className="text-sm leading-relaxed text-foreground/80">{r.argumentoConceptual}</p>
            <div className="rounded-lg bg-secondary/40 p-3">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-foreground/70">
                Cómo se siente en el día a día
              </p>
              <p className="text-sm leading-relaxed text-foreground/80">{r.costoCotidiano}</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {r.principiosConectados.map((p) => (
                <span
                  key={p}
                  className="rounded-full border border-accent/30 bg-accent/5 px-2.5 py-0.5 text-[11px] font-medium text-accent"
                >
                  {PRINCIPIO_LABEL[p]}
                </span>
              ))}
            </div>
          </section>

          {/* Capa 4 — Cómo moverte (3 lentes) */}
          <section className="space-y-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-accent">
              Cómo moverte
            </p>
            <Lente titulo="Mirando al cliente" texto={r.comoMoverte.cliente} />
            <Lente titulo="Mirando al contexto" texto={r.comoMoverte.contexto} />
            <Lente titulo="Mirando la competitividad" texto={r.comoMoverte.competitividad} />
          </section>
        </div>
      )}
    </article>
  );
}

function Lente({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <div className="border-l-2 border-accent/40 pl-3">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground/65">
        {titulo}
      </p>
      <p className="mt-0.5 text-sm leading-relaxed text-foreground/80">{texto}</p>
    </div>
  );
}
