"use client";

import { useWizardStore } from "@/lib/wizard-store";
import { LogoANTEL } from "./LogoANTEL";

const BLOCKS = [
  {
    titulo: "Este diagnóstico es distinto.",
    contenido: (
      <>
        <p>
          No hay una nota al final ni un puntaje que diga si tu negocio está
          bien o mal, y nadie va a evaluarlo desde afuera.
        </p>
        <p>Este diagnóstico es para entender dónde y cómo está tu negocio.</p>
        <p>
          Es una herramienta para vos y para tu equipo. Sirve para abrir una
          conversación puertas adentro del negocio — entre el dueño y los que
          recién entraron, entre el que está con el cliente y el que lleva los
          números, entre quien conoce el rubro de toda la vida y quien recién
          llega con otra mirada.
        </p>
        <p>
          <strong>
            Lo que sale de acá no es un diagnóstico que alguien te entrega para
            que vos hagas algo.
          </strong>
        </p>
        <p>
          Es un mapa para que ustedes lo miren juntos. Las preguntas tocan temas
          que muchas veces no se charlan: cómo se toman las decisiones, qué pasa
          cuando alguien se equivoca, quién conoce los números, cómo se
          reacciona ante un cambio del mercado. Las respuestas — sobre todo
          donde no coincidan entre ustedes — son el comienzo de una mesa de
          trabajo honesta.
        </p>
        <p>
          No buscamos la respuesta que queda bien. Buscamos la respuesta
          verdadera, porque es la única que sirve para mejorar. Y mejorar no es
          llegar a un ideal: es entrar en un proceso de conversación,
          aprendizaje y ajuste continuo donde todos los que trabajan en el
          negocio aportan lo que saben.
        </p>
        <p>
          Para algunas cosas que aparezcan vas a necesitar formación,
          herramientas o acompañamiento de afuera. Está bien — darte cuenta es
          parte del valor de hacerse las preguntas.
        </p>
        <p>
          <strong>Contestá con honestidad, con crudeza.</strong>
        </p>
        <p>
          Después, sentate con tu equipo y charlen lo que aparezca. Lo que
          respondas se guarda de forma anónima: sin nombre, sin empresa, sin
          nadie que pueda identificarte.
        </p>
      </>
    ),
  },
  {
    titulo: "Antes de empezar",
    contenido: (
      <ul>
        <li>Tarda unos 12 a 15 minutos. Contestá tranquilo, sin apuro.</li>
        <li>Es anónimo. No te pedimos nombre, empresa, ni datos personales.</li>
        <li>
          No hay respuestas correctas ni incorrectas. Contestá lo que pasa de
          verdad, no lo que te gustaría que pasara.
        </li>
        <li>Podés repetirlo cuando quieras. La herramienta es tuya.</li>
      </ul>
    ),
  },
  {
    titulo: "Quién lo hizo",
    contenido: (
      <p>
        Pulso PyME es una iniciativa de <strong>ANTEL</strong> en el marco del programa
        <em> Empresas Uruguayas Inteligentes</em>. La metodología y el motor de
        diagnóstico fueron diseñados por Adaptant Studio · OC Framework v2.0.
      </p>
    ),
  },
];

export function IntroductionScreen() {
  const setStep = useWizardStore((s) => s.setStep);

  return (
    <div className="mx-auto flex w-full max-w-[680px] flex-col px-6 pb-16 pt-8">
      {/* Header */}
      <div className="mb-10">
        <LogoANTEL showTagline />
      </div>

      {/* Hero */}
      <header className="mb-10 space-y-3">
        <h1 className="font-heading text-3xl font-bold leading-tight text-foreground sm:text-4xl">
          Creemos que tu empresa puede ser{" "}
          <span className="text-accent">inteligente y real.</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Pulso PyME · Autodiagnóstico de Adaptabilidad Organizacional para PyMEs uruguayas
        </p>
      </header>

      {/* Bloques */}
      <div className="space-y-0 divide-y divide-border/50">
        {BLOCKS.map((block) => (
          <section key={block.titulo} className="py-8">
            <h2 className="mb-4 font-heading text-base font-semibold text-foreground">
              {block.titulo}
            </h2>
            <div className="space-y-3 text-sm leading-relaxed text-foreground/80 [&_ul]:space-y-2 [&_ul]:pl-5 [&_ul]:list-disc [&_p]:leading-relaxed">
              {block.contenido}
            </div>
          </section>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-10 flex justify-center">
        <button
          type="button"
          aria-label="Iniciar cuestionario"
          onClick={() => setStep("contexto")}
          className="inline-flex h-13 items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Iniciar cuestionario →
        </button>
      </div>
    </div>
  );
}