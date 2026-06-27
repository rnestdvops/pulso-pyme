"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { enviarContacto } from "@/app/sugerencias/actions";
import type { ProductoCatalogo } from "@/lib/sugerencias-engine";

interface Props {
  evaluacionId: string;
  /** Productos mostrados al usuario — el form los ofrece como multi-select. */
  productosMostrados: ProductoCatalogo[];
}

export function FormularioContacto({ evaluacionId, productosMostrados }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [productosSeleccionados, setProductosSeleccionados] = useState<Set<string>>(new Set());

  function toggleProducto(id: string) {
    setProductosSeleccionados((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const fd = new FormData(e.currentTarget);
    const compartir = fd.get("compartir_diagnostico") === "on";

    const input = {
      nombre: String(fd.get("nombre") ?? ""),
      empresa: String(fd.get("empresa") ?? ""),
      email: String(fd.get("email") ?? ""),
      telefono: String(fd.get("telefono") ?? "") || null,
      productosInteres: Array.from(productosSeleccionados),
      mensaje: String(fd.get("mensaje") ?? "") || null,
      compartirDiagnostico: compartir,
      evaluacionId,
    };

    startTransition(async () => {
      const res = await enviarContacto(input);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.push("/contacto-enviado");
    });
  }

  return (
    <section className="rounded-2xl border border-border bg-secondary/30 p-6 sm:p-8">
      <header className="mb-6 space-y-2">
        <h2 className="font-heading text-2xl font-bold leading-tight text-foreground">
          ¿Te gustaría que ANTEL te contacte?
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Si te interesa conversar sobre alguna de estas soluciones, dejanos tus
          datos y alguien de ANTEL se va a poner en contacto.{" "}
          <em>(El beneficio específico para participantes del autodiagnóstico</em>{" "}
          <span className="font-mono text-foreground/60">{"{{TODO_BENEFICIO}}"}</span>
          <em> lo confirma ANTEL antes de ir a producción.)</em>
        </p>
      </header>

      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        <Field label="Nombre" name="nombre" required />
        <Field label="Empresa" name="empresa" required />
        <Field label="Email" name="email" type="email" required />
        <Field label="Teléfono (opcional)" name="telefono" type="tel" />

        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium text-foreground">
            ¿Sobre qué te gustaría conversar?
          </legend>
          <p className="text-xs text-muted-foreground">
            Elegí uno o más de los productos que viste arriba.
          </p>
          <div className="mt-1 flex flex-col gap-1.5">
            {productosMostrados.map((p) => (
              <label
                key={p.id}
                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm transition hover:bg-secondary"
              >
                <input
                  type="checkbox"
                  checked={productosSeleccionados.has(p.id)}
                  onChange={() => toggleProducto(p.id)}
                  className="size-4 rounded border-input"
                />
                <span>{p.titulo}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <Field label="Mensaje (opcional)" name="mensaje" textarea />

        <label className="flex items-start gap-2 rounded-lg border border-border bg-card p-3 text-sm">
          <input
            type="checkbox"
            name="compartir_diagnostico"
            className="mt-1 size-4 rounded border-input"
          />
          <span className="text-foreground/85">
            <strong>Compartir mi diagnóstico con ANTEL</strong> para enriquecer la
            conversación.{" "}
            <em className="text-muted-foreground">
              Si lo dejás sin marcar, ANTEL te contacta sin ver tu diagnóstico
              específico.
            </em>
          </span>
        </label>

        {error && (
          <p className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="mt-2 inline-flex h-12 items-center justify-center rounded-lg bg-primary px-6 text-base font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
        >
          {isPending ? "Enviando…" : "Enviar solicitud de contacto"}
        </button>

        <p className="text-center text-xs text-muted-foreground">
          Solo guardamos estos datos para que ANTEL pueda contactarte. No se
          cruzan con tu diagnóstico salvo que vos lo autorices arriba.
        </p>
      </form>
    </section>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
  textarea = false,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  textarea?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </span>
      {textarea ? (
        <textarea
          name={name}
          rows={3}
          className="rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/30"
        />
      ) : (
        <input
          type={type}
          name={name}
          required={required}
          className="h-11 rounded-lg border border-input bg-card px-3 text-sm text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/30"
        />
      )}
    </label>
  );
}
