"use client";

import { useState } from "react";
import { useWizardStore } from "@/lib/wizard-store";

const RUBROS = [
  "Comercio (mayorista o minorista)",
  "Servicios a personas o empresas",
  "Producción, industria o manufactura",
  "Agro, ganadería o lechería",
  "Frigorífico, agroindustria o exportación de alimentos",
  "Software, tecnología o servicios digitales",
  "Gastronomía, hotelería o turismo",
  "Logística, transporte o comercio exterior",
  "Otro",
];

const TAMAÑOS = [
  "Solo yo",
  "2 a 5",
  "6 a 10",
  "11 a 25",
  "26 a 50",
  "Más de 50",
];

const ANTIGUEDADES = [
  "Menos de 2 años",
  "Entre 2 y 5 años",
  "Entre 6 y 15 años",
  "Más de 15 años",
];

const ROLES = [
  "Dueño o socio",
  "Gerente",
  "Encargado de un área",
  "Empleado o colaborador",
];

export function ContextoStep() {
  const { contexto, setContexto, setStep } = useWizardStore();
  const [touched, setTouched] = useState(false);

  const isValid =
    contexto.rubro !== "" &&
    contexto.empleados !== "" &&
    contexto.antiguedad !== "" &&
    contexto.rol !== "";

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (isValid) setStep("cuestionario");
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-accent">
          Paso 1 de 3
        </p>
        <h1 className="font-heading text-2xl font-bold leading-tight text-foreground sm:text-3xl">
          Contanos un poco sobre el negocio
        </h1>
        <p className="text-sm text-muted-foreground">
          Es anónimo. No te pedimos nombre, empresa ni datos personales: solo cuatro
          datos de contexto para enmarcar tu diagnóstico.
        </p>
      </header>

      <Field
        label="¿Cuánta gente trabaja en el negocio, contándote a vos?"
        error={touched && !contexto.empleados ? "Elegí una opción." : undefined}
      >
        <Select
          value={contexto.empleados}
          onChange={(v) => setContexto({ empleados: v })}
          options={TAMAÑOS}
          placeholder="Cantidad de personas"
        />
      </Field>

      <Field
        label="¿A qué rubro pertenece el negocio?"
        error={touched && !contexto.rubro ? "Elegí un rubro." : undefined}
      >
        <Select
          value={contexto.rubro}
          onChange={(v) => setContexto({ rubro: v })}
          options={RUBROS}
          placeholder="Seleccioná un rubro"
        />
      </Field>

      <Field
        label="¿Hace cuánto que el negocio está en funcionamiento?"
        error={touched && !contexto.antiguedad ? "Elegí una opción." : undefined}
      >
        <Select
          value={contexto.antiguedad}
          onChange={(v) => setContexto({ antiguedad: v })}
          options={ANTIGUEDADES}
          placeholder="Antigüedad"
        />
      </Field>

      <Field
        label="¿Cuál es tu rol en el negocio?"
        error={touched && !contexto.rol ? "Elegí una opción." : undefined}
      >
        <Select
          value={contexto.rol}
          onChange={(v) => setContexto({ rol: v })}
          options={ROLES}
          placeholder="Seleccioná tu rol"
        />
      </Field>

      <button
        type="submit"
        className="mt-2 inline-flex h-12 items-center justify-center rounded-lg bg-primary px-6 text-base font-semibold text-primary-foreground shadow-md transition hover:bg-primary/90 active:scale-[0.99] disabled:opacity-50"
      >
        Empezar cuestionario →
      </button>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-foreground">{label}</span>
      {children}
      {error && <span className="text-xs text-destructive">{error}</span>}
    </label>
  );
}

function Select({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-lg border border-input bg-card px-4 py-3 pr-10 text-base text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/30"
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <svg
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </div>
  );
}