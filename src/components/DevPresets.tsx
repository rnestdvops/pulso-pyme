"use client";

import { useState } from "react";
import { useWizardStore, type PresetKind } from "@/lib/wizard-store";

const PRESETS: Array<{ kind: PresetKind; label: string; hint: string }> = [
  { kind: "bajo", label: "Todo bajo", hint: "IAO ≈ 6 · llave: acceso" },
  { kind: "medio", label: "Todo medio", hint: "puntaje 3" },
  { kind: "alto", label: "Todo alto", hint: "IAO = 100" },
  { kind: "mix", label: "Mix 1-2-3-4", hint: "ciclando" },
];

export function DevPresets() {
  const [open, setOpen] = useState(false);
  const applyPreset = useWizardStore((s) => s.applyPreset);
  const reset = useWizardStore((s) => s.reset);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      {open && (
        <div className="w-56 rounded-xl border border-border bg-card p-3 shadow-lg ring-1 ring-border/50">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-wider text-accent">
              Dev · Presets QA
            </p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Cerrar"
            >
              ×
            </button>
          </div>
          <div className="flex flex-col gap-1.5">
            {PRESETS.map((p) => (
              <button
                key={p.kind}
                type="button"
                onClick={() => {
                  applyPreset(p.kind);
                  setOpen(false);
                }}
                className="flex flex-col items-start rounded-md border border-border bg-background px-2.5 py-1.5 text-left transition hover:border-accent hover:bg-accent/5"
              >
                <span className="text-xs font-semibold text-foreground">
                  {p.label}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {p.hint}
                </span>
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                reset();
                setOpen(false);
              }}
              className="mt-1 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg ring-2 ring-background transition hover:bg-primary/90 active:scale-95"
        aria-label="Abrir presets de desarrollo"
        title="Presets para QA"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>
    </div>
  );
}