import Link from "next/link";

export const metadata = {
  title: "Solicitud enviada — Pulso PyME ANTEL",
  description: "Tu solicitud de contacto quedó registrada.",
};

export default function ContactoEnviadoPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 px-6 py-16">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-accent">
          Listo
        </p>
        <h1 className="font-heading text-3xl font-bold leading-tight text-foreground sm:text-4xl">
          Tu solicitud quedó registrada
        </h1>
      </header>

      <div className="space-y-4 text-sm leading-relaxed text-foreground/85">
        <p>
          Alguien del equipo ANTEL te va a contactar en los próximos días hábiles
          al email o teléfono que dejaste.
        </p>
        <p>
          Mientras tanto, tu <strong>kit de conversación</strong> sigue
          disponible. Te recomendamos llevarlo a una mesa con tu equipo —ese es el
          verdadero valor del diagnóstico.
        </p>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-6 text-base font-semibold text-primary-foreground transition hover:bg-primary/90"
        >
          Volver a mis resultados
        </Link>
      </div>
    </main>
  );
}
