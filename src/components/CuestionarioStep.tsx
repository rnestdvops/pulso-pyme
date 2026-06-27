"use client";

import { useMemo, useState } from "react";
import { useWizardStore } from "@/lib/wizard-store";
import { PREGUNTAS, PREGUNTAS_TEC, opcionesBarajadas } from "@/lib/oc-engine/questionnaire";
import type { PreguntaTecScored } from "@/lib/oc-engine/questionnaire";

const TOTAL_IAO = PREGUNTAS.length;
const TOTAL = TOTAL_IAO + PREGUNTAS_TEC.length;

export function CuestionarioStep() {
  const {
    currentQuestion,
    respuestas,
    respuestasTec,
    respuestaQ16,
    seed,
    setRespuesta,
    setRespuestaTec,
    setRespuestaQ16,
    nextQuestion,
    prevQuestion,
    setStep,
  } = useWizardStore();

  const isIAO = currentQuestion < TOTAL_IAO;
  const tecIdx = currentQuestion - TOTAL_IAO;
  const preguntaIAO = isIAO ? PREGUNTAS[currentQuestion] : null;
  const preguntaTec = !isIAO ? PREGUNTAS_TEC[tecIdx] : null;

  const opcionesIAO = useMemo(
    () => (preguntaIAO ? opcionesBarajadas(preguntaIAO, seed) : []),
    [preguntaIAO, seed]
  );

  const respuestaActualIAO = preguntaIAO ? respuestas[preguntaIAO.numero] : undefined;
  const respuestaActualTec = preguntaTec?.scored ? respuestasTec[preguntaTec.id] : undefined;
  // Q16 multi-select: siempre considerada respondida (0 opciones también vale)
  const respuestaActualMulti = preguntaTec && !preguntaTec.scored ? true : undefined;

  const hayRespuesta = isIAO
    ? !!respuestaActualIAO
    : preguntaTec?.scored
      ? !!respuestaActualTec
      : true; // multi-select no es obligatorio

  const answered = isIAO
    ? Object.keys(respuestas).length
    : TOTAL_IAO + PREGUNTAS_TEC.slice(0, tecIdx).filter((p) => p.scored && respuestasTec[p.id]).length;

  const progreso = (currentQuestion / TOTAL) * 100;
  const isLast = currentQuestion === TOTAL - 1;
  const isFirst = currentQuestion === 0;

  const advance = () => {
    if (isLast) setStep("resultados");
    else nextQuestion();
  };

  const onSelectIAO = (puntaje: 1 | 2 | 3 | 4) => {
    if (!preguntaIAO) return;
    setRespuesta(preguntaIAO.numero, puntaje);
    setTimeout(() => {
      if (isLast) setStep("resultados");
      else nextQuestion();
    }, 320);
  };

  const onSelectTec = (score: 1 | 2 | 3 | 4) => {
    if (!preguntaTec || !preguntaTec.scored) return;
    setRespuestaTec(preguntaTec.id, score);
    setTimeout(() => {
      if (isLast) setStep("resultados");
      else nextQuestion();
    }, 320);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header con progreso */}
      <header className="space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider">
          <span className="text-accent">
            Pregunta {currentQuestion + 1} de {TOTAL}
          </span>
          <span className="text-muted-foreground">
            {Math.round(progreso)}%
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-accent transition-all duration-500 ease-out"
            style={{ width: `${progreso}%` }}
          />
        </div>
      </header>

      {/* Intro block (Q16, Q20) */}
      {preguntaTec?.intro && (
        <div className="rounded-xl bg-muted/60 px-4 py-3 text-sm leading-relaxed text-muted-foreground">
          {preguntaTec.intro}
        </div>
      )}

      {/* Pregunta */}
      <div
        key={currentQuestion}
        className="rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border/50 animate-in fade-in slide-in-from-right-2 duration-300"
      >
        <h2 className="font-heading text-lg font-semibold leading-snug text-foreground sm:text-xl">
          {isIAO ? preguntaIAO!.texto : preguntaTec!.text}
        </h2>
      </div>

      {/* Opciones */}
      {isIAO && preguntaIAO && (
        <div className="flex flex-col gap-3">
          {opcionesIAO.map((op) => {
            const seleccionada = respuestaActualIAO === op.puntaje;
            return (
              <RadioOpcion
                key={op.puntaje}
                texto={op.texto}
                seleccionada={seleccionada}
                onSelect={() => onSelectIAO(op.puntaje)}
              />
            );
          })}
        </div>
      )}

      {preguntaTec?.type === "single_select" && (
        <div className="flex flex-col gap-3">
          {(preguntaTec as PreguntaTecScored).options.map((op) => {
            const seleccionada = respuestaActualTec === op.score;
            return (
              <RadioOpcion
                key={op.score}
                texto={op.label}
                seleccionada={seleccionada}
                onSelect={() => onSelectTec(op.score)}
              />
            );
          })}
        </div>
      )}

      {preguntaTec?.type === "multi_select" && (
        <MultiSelectQ16
          seleccionadas={respuestaQ16.seleccionadas}
          otraTexto={respuestaQ16.otraTexto}
          onChange={(sel, texto) => setRespuestaQ16(sel, texto)}
          options={preguntaTec.options}
        />
      )}

      {/* Navegación */}
      <div className="mt-2 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={prevQuestion}
          disabled={isFirst}
          className="inline-flex h-11 items-center justify-center rounded-lg border border-border bg-card px-4 text-sm font-medium text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
        >
          ← Atrás
        </button>
        <button
          type="button"
          onClick={() => {
            if (!hayRespuesta) return;
            advance();
          }}
          disabled={!hayRespuesta}
          className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isLast ? "Ver resultado" : "Siguiente"} →
        </button>
      </div>
    </div>
  );
}

// ---- Sub-components ----

function RadioOpcion({
  texto,
  seleccionada,
  onSelect,
}: {
  texto: string;
  seleccionada: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`
        group flex items-start gap-3 rounded-xl border p-4 text-left transition-all
        ${
          seleccionada
            ? "border-accent bg-accent/10 ring-2 ring-accent/40"
            : "border-border bg-card hover:border-accent/50 hover:bg-accent/5"
        }
        active:scale-[0.99]
      `}
    >
      <div
        className={`
          mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition
          ${
            seleccionada
              ? "border-accent bg-accent"
              : "border-border bg-background group-hover:border-accent/60"
          }
        `}
      >
        {seleccionada && (
          <div className="h-2 w-2 rounded-full bg-accent-foreground" />
        )}
      </div>
      <span className="flex-1 text-sm leading-relaxed text-foreground sm:text-base">
        {texto}
      </span>
    </button>
  );
}

function MultiSelectQ16({
  seleccionadas,
  otraTexto,
  onChange,
  options,
}: {
  seleccionadas: string[];
  otraTexto: string;
  onChange: (sel: string[], otraTexto: string) => void;
  options: Array<{ id: string; label: string; hasFreeText?: boolean }>;
}) {
  const toggle = (id: string) => {
    const next = seleccionadas.includes(id)
      ? seleccionadas.filter((s) => s !== id)
      : [...seleccionadas, id];
    // Si deseleccionan "otra", limpiar texto libre
    const texto = next.includes("otra") ? otraTexto : "";
    onChange(next, texto);
  };

  return (
    <div className="flex flex-col gap-3">
      {options.map((op) => {
        const checked = seleccionadas.includes(op.id);
        return (
          <div key={op.id} className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => toggle(op.id)}
              className={`
                group flex items-start gap-3 rounded-xl border p-4 text-left transition-all
                ${
                  checked
                    ? "border-accent bg-accent/10 ring-2 ring-accent/40"
                    : "border-border bg-card hover:border-accent/50 hover:bg-accent/5"
                }
                active:scale-[0.99]
              `}
            >
              {/* Checkbox */}
              <div
                className={`
                  mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition
                  ${
                    checked
                      ? "border-accent bg-accent"
                      : "border-border bg-background group-hover:border-accent/60"
                  }
                `}
              >
                {checked && (
                  <svg
                    viewBox="0 0 12 10"
                    className="h-3 w-3 fill-none stroke-accent-foreground stroke-2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="1,5 4,8 11,1" />
                  </svg>
                )}
              </div>
              <span className="flex-1 text-sm leading-relaxed text-foreground sm:text-base">
                {op.label}
              </span>
            </button>
            {op.hasFreeText && checked && (
              <input
                type="text"
                value={otraTexto}
                onChange={(e) => onChange(seleccionadas, e.target.value)}
                placeholder="¿Cuál?"
                className="ml-8 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}