"use client";

import { useEffect, useMemo, useRef, useCallback } from "react";
import Link from "next/link";
import { ProximoPasoBlock } from "@/components/sugerencias/ProximoPasoBlock";
import { pdf } from "@react-pdf/renderer";
import { supabase } from "@/utils/supabase/client";
import { useWizardStore } from "@/lib/wizard-store";
import {
  evaluar,
  computeTechnologyReading,
  computeAIReading,
  buildRespuestasTec,
  type Nivel,
  type NivelTecnologia,
} from "@/lib/oc-engine/scoring";
import {
  construirRecomendaciones,
  RECOMENDACIONES_TEC,
  RECOMENDACIONES_IA,
  NIVEL_TEC_LABEL,
} from "@/lib/oc-engine/recommendations";
import { CircularGauge } from "./CircularGauge";
import { ScatterEcosistema } from "./ScatterEcosistema";
import { KitConversacionPDF } from "./KitConversacionPDF";

const NIVEL_COLOR: Record<Nivel, string> = {
  bajo:  "oklch(0.58 0.20 25)",
  medio: "oklch(0.70 0.15 75)",
  alto:  "oklch(0.55 0.15 155)",
};

const NIVEL_TEC_COLOR: Record<NivelTecnologia, string> = {
  punto_de_partida: "oklch(0.58 0.20 25)",
  en_camino:        "oklch(0.70 0.15 75)",
  consolidado:      "oklch(0.55 0.15 155)",
};

const NIVEL_LABEL: Record<Nivel, string> = {
  bajo:  "Bajo",
  medio: "Medio",
  alto:  "Alto",
};

const EJE_LABEL: Record<string, string> = {
  externo:     "Externo",
  interno:     "Interno",
  transversal: "Transversal",
};

const DIM_TEC_LABEL: Record<string, string> = {
  digitalizacion:  "Digitalización",
  datos_resguardo: "Resguardo de datos",
  datos_acceso:    "Acceso a los datos",
};

export function ResultadosStep() {
  const { respuestas, respuestasTec, respuestaQ16, contexto, persistirEvaluacion, reset, evaluacionId } =
    useWizardStore();

  const resultado = useMemo(() => evaluar(respuestas), [respuestas]);
  const cards = useMemo(
    () => construirRecomendaciones(resultado.recomendaciones),
    [resultado.recomendaciones]
  );

  const respuestasTecNorm = useMemo(
    () => buildRespuestasTec(respuestasTec),
    [respuestasTec]
  );
  const techReading = useMemo(
    () => computeTechnologyReading(respuestasTecNorm),
    [respuestasTecNorm]
  );
  const aiReading = useMemo(
    () => computeAIReading(respuestasTecNorm),
    [respuestasTecNorm]
  );

  // Persistencia anónima — una sola vez por montaje.
  const guardadoRef = useRef(false);
  useEffect(() => {
    if (guardadoRef.current) return;
    if (!resultado.completo) return;
    if (!contexto.rubro || !contexto.empleados || !contexto.antiguedad) return;
    guardadoRef.current = true;
    void persistirEvaluacion({
      iaoGeneral:   resultado.iaoGeneral,
      nivelGeneral: resultado.nivelGeneral,
      iaoExterno:   resultado.ejes.externo.iao,
      nivelExterno: resultado.ejes.externo.nivel,
      iaoInterno:   resultado.ejes.interno.iao,
      nivelInterno: resultado.ejes.interno.nivel,
      dimensiones:  resultado.dimensiones.map((d) => ({
        id: d.id, eje: d.eje, iao: d.iao, nivel: d.nivel,
      })) as unknown as import("@/integrations/supabase/types").Json,
    });
  }, [resultado, contexto, persistirEvaluacion]);

  const gaugeColor = NIVEL_COLOR[resultado.nivelGeneral];

  // Handler descarga PDF
  const handleDescargarPDF = useCallback(async () => {
    const { data: puntos } = await supabase
      .from("scatter_ecosistema")
      .select("eje_externo, eje_interno, color_tecnologia");

    const dimTecRecs = (["digitalizacion", "datos_resguardo", "datos_acceso"] as const)
      .map((dim) => {
        const score = techReading.porDimension[dim];
        return {
          label: DIM_TEC_LABEL[dim],
          texto: score !== undefined ? RECOMENDACIONES_TEC[dim].recomendacion[score as 1 | 2 | 3 | 4] : "",
        };
      })
      .filter((d) => d.texto);

    const dimIAORecs = resultado.dimensiones.map((d) => {
      const card = cards.find((c) => c.dimension === d.id);
      return {
        etiqueta:          d.etiqueta,
        iao:               d.iao,
        nivel:             d.nivel,
        recomendacionTexto: card?.texto ?? "",
      };
    });

    const blob = await pdf(
      <KitConversacionPDF
        contexto={contexto}
        resultado={{
          iaoGeneral:   resultado.iaoGeneral,
          nivelGeneral: resultado.nivelGeneral,
          ejes:         resultado.ejes,
          dimensiones:  dimIAORecs,
        }}
        resultadoTec={{
          puntaje:            techReading.puntaje,
          nivel:              techReading.nivel,
          porDimension:       techReading.porDimension,
          recomendacionesDim: dimTecRecs,
        }}
        resultadoIA={{
          estado:       aiReading.estado,
          estadoLabel:  aiReading.estadoLabel,
          recomendacion: RECOMENDACIONES_IA[aiReading.estado],
        }}
        puntosEcosistema={(puntos ?? []) as Array<{
          eje_externo: number;
          eje_interno: number;
          color_tecnologia: number | null;
        }>}
        fecha={new Date().toLocaleDateString("es-UY", {
          day: "numeric", month: "long", year: "numeric",
        })}
      />
    ).toBlob();

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pulso-pyme-${new Date().toISOString().slice(0, 10)}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }, [resultado, techReading, aiReading, cards, contexto]);

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <header className="space-y-2 text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-accent">
          Resultado
        </p>
        <h1 className="font-heading text-2xl font-bold leading-tight text-foreground sm:text-3xl">
          Tu negocio
        </h1>
        <p className="text-sm text-muted-foreground">
          Índice de Adaptabilidad Organizacional (IAO)
        </p>
      </header>

      {/* Medidor principal */}
      <div className="flex flex-col items-center gap-4 rounded-2xl bg-card p-6 shadow-sm ring-1 ring-border/50">
        <CircularGauge percentage={resultado.iaoGeneral} color={gaugeColor} />
        <div className="text-center">
          <p className="font-heading text-lg font-bold" style={{ color: gaugeColor }}>
            Nivel {NIVEL_LABEL[resultado.nivelGeneral]}
          </p>
          <p className="text-xs text-muted-foreground">
            Rango {resultado.rangoTexto.rango}
          </p>
        </div>
        <p className="text-sm leading-relaxed text-foreground/90">
          {resultado.rangoTexto.diagnostico}
        </p>
      </div>

      {/* Ejes */}
      <section className="space-y-3">
        <h2 className="font-heading text-base font-semibold text-foreground">Ejes</h2>
        <div className="grid grid-cols-2 gap-3">
          <EjeCard titulo="Externo" iao={resultado.ejes.externo.iao} nivel={resultado.ejes.externo.nivel} />
          <EjeCard titulo="Interno" iao={resultado.ejes.interno.iao} nivel={resultado.ejes.interno.nivel} />
        </div>
      </section>

      {/* Recomendaciones */}
      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="font-heading text-base font-semibold text-foreground">
            ¿Por dónde empezar?
          </h2>
          <p className="text-xs text-muted-foreground">
            Máximo 3 recomendaciones. Mejor hacer una bien que dejar todo a la mitad.
          </p>
        </div>
        <div className="space-y-3">
          {cards.map((rec) => (
            <article
              key={rec.dimension}
              className="rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border/50"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className="inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-primary-foreground"
                      style={{ backgroundColor: gaugeColor }}
                    >
                      {rec.prioridad}
                    </span>
                    {rec.esLlave && (
                      <span className="inline-flex items-center rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent">
                        Llave
                      </span>
                    )}
                    <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      {EJE_LABEL[rec.eje]} · Nivel {NIVEL_LABEL[rec.nivel]}
                    </span>
                  </div>
                  <h3 className="font-heading text-base font-semibold text-foreground">
                    {rec.etiqueta}
                  </h3>
                </div>
              </div>
              <p className="mb-3 text-sm italic leading-relaxed text-muted-foreground">
                {rec.porQueImporta}
              </p>
              <p className="text-sm leading-relaxed text-foreground">{rec.texto}</p>
              <div className="mt-4 flex items-center gap-2 border-t border-border pt-3">
                <svg
                  className="text-accent"
                  width="14" height="14" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round"
                >
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
                <span className="text-xs font-semibold text-foreground">
                  Palanca: {rec.palancaNombre}
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Desglose por dimensión */}
      <section className="space-y-3">
        <h2 className="font-heading text-base font-semibold text-foreground">
          Desglose por dimensión
        </h2>
        <div className="space-y-2 rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border/50">
          {resultado.dimensiones.map((d) => (
            <div key={d.id} className="flex flex-col gap-1.5 py-1.5">
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="flex-1 text-foreground">{d.etiqueta}</span>
                <span className="font-mono text-xs font-semibold" style={{ color: NIVEL_COLOR[d.nivel] }}>
                  {d.iao}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${d.iao}%`, backgroundColor: NIVEL_COLOR[d.nivel] }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Apartado 1: Tecnología y datos ── */}
      <section className="space-y-4 rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Lectura aparte
          </p>
          <h2 className="font-heading text-base font-semibold text-foreground">
            Tecnología y datos
          </h2>
          <p className="text-xs text-muted-foreground">
            Esto no entra en el puntaje principal de adaptabilidad. Es una mirada complementaria sobre desde dónde arrancás con la tecnología.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span
            className="inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold"
            style={{
              backgroundColor: NIVEL_TEC_COLOR[techReading.nivel] + "22",
              color: NIVEL_TEC_COLOR[techReading.nivel],
            }}
          >
            {NIVEL_TEC_LABEL[techReading.nivel]}
          </span>
          <span className="font-mono text-sm text-muted-foreground">
            {Math.round(techReading.puntaje)} / 100
          </span>
        </div>

        <div className="space-y-3">
          {(["digitalizacion", "datos_resguardo", "datos_acceso"] as const).map((dim) => {
            const score = techReading.porDimension[dim];
            if (score === undefined) return null;
            const texto = RECOMENDACIONES_TEC[dim].recomendacion[score as 1 | 2 | 3 | 4];
            return (
              <div key={dim} className="rounded-xl bg-muted/40 p-4">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {DIM_TEC_LABEL[dim]}
                </p>
                <p className="text-sm leading-relaxed text-foreground">{texto}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Apartado 2: IA ── */}
      <section className="space-y-4 rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Lectura aparte
          </p>
          <h2 className="font-heading text-base font-semibold text-foreground">
            Tu punto de partida con IA
          </h2>
          <p className="text-xs text-muted-foreground">
            Esto tampoco entra en el puntaje principal. Es para saber en qué momento estás respecto a la inteligencia artificial.
          </p>
        </div>

        <div className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-sm font-semibold text-foreground">
          {aiReading.estadoLabel}
        </div>

        <div className="rounded-xl bg-muted/40 p-4">
          <p className="text-sm leading-relaxed text-foreground">
            {RECOMENDACIONES_IA[aiReading.estado]}
          </p>
        </div>
      </section>

      {/* ── Scatter del ecosistema ── */}
      <div className="border-t border-border pt-8">
        <ScatterEcosistema
          puntoPropio={{
            eje_externo:      resultado.ejes.externo.iao,
            eje_interno:      resultado.ejes.interno.iao,
            color_tecnologia: techReading.puntaje,
          }}
        />
      </div>

      {/* Botón PDF */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={handleDescargarPDF}
          className="inline-flex h-12 items-center justify-center rounded-lg bg-accent px-8 text-base font-semibold text-accent-foreground transition hover:bg-accent/90"
        >
          Descargar mi kit de conversación (PDF)
        </button>
      </div>

      {/* Próximo paso opcional — Vitrina Adaptativa (SPEC §2.2) */}
      {evaluacionId && <ProximoPasoBlock evaluacionId={evaluacionId} />}

      {/* CTA */}
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-12 items-center justify-center rounded-lg border border-border bg-card px-6 text-base font-medium text-foreground transition hover:bg-muted"
        >
          Hacer otro diagnóstico
        </button>
        <Link
          href="/panel"
          className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-6 text-base font-semibold text-primary-foreground transition hover:bg-primary/90"
        >
          Ver panel agregado →
        </Link>
      </div>

      <footer className="pb-4 text-center text-[10px] text-muted-foreground">
        Pulso PyME · ANTEL — Empresas Uruguayas Inteligentes ·{" "}
        Powered by Adaptant Studio · OC Framework v2.0
      </footer>
    </div>
  );
}

function EjeCard({ titulo, iao, nivel }: { titulo: string; iao: number; nivel: Nivel }) {
  const color = NIVEL_COLOR[nivel];
  return (
    <div className="rounded-xl bg-card p-4 shadow-sm ring-1 ring-border/50">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{titulo}</p>
      <p className="mt-1 font-heading text-3xl font-bold leading-none" style={{ color }}>{iao}</p>
      <p className="mt-1 text-xs font-semibold" style={{ color }}>Nivel {NIVEL_LABEL[nivel]}</p>
    </div>
  );
}