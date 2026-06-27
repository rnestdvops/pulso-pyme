import Link from "next/link";

interface Props {
  /** evaluacionId para construir el link de volver con contexto preservado. */
  evaluacionId: string;
}

export function VitrinaHeader({ evaluacionId: _evaluacionId }: Props) {
  return (
    <header className="space-y-4">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition hover:text-foreground"
      >
        ← Volver a mi diagnóstico
      </Link>

      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-accent">
          Soluciones sugeridas
        </p>
        <h1 className="font-heading text-3xl font-bold leading-tight text-foreground sm:text-4xl">
          Soluciones que podrían acompañar tu pulso
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Esto <strong>NO es un veredicto ni un ranking</strong>. Son posibles
          caminos para conversar, basados en lo que respondiste. Cada uno está
          conectado con una parte específica de tu diagnóstico.
        </p>
      </div>
    </header>
  );
}
