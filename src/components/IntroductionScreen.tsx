"use client";

import {
  ArrowRight,
  Clock,
  EyeOff,
  Equal,
  Gift,
  Clock4,
  Lightbulb,
  Users,
  Target,
  Route,
  Calculator,
  UsersRound,
  Radar,
  AlertTriangle,
} from "lucide-react";
import { useWizardStore } from "@/lib/wizard-store";

/**
 * Pulso PyME — Landing Page (rediseño Adaptant + ANTEL).
 *
 * Adaptado a Next.js App Router:
 *  - Componente "use client" porque consume el store Zustand y maneja interactividad.
 *  - El CTA dispara setStep("contexto") en el wizard SPA (no hay ruta /cuestionario).
 *  - El logo se sirve desde /public/brand/Antel-logo.svg.
 *  - Incluye el manifiesto literal del SPEC §13 (regla dura §10 #8 — bienvenida + PDF p.2).
 *
 * Branding ANTEL:
 *   - Azul:     #003D7A  (--antel-blue)
 *   - Amarillo: #FFD500  (--antel-yellow)
 *
 * Co-branding al pie: ANTEL + Adaptant Studio · OC Framework v2.0.
 */

const ANTEL_BLUE = "#003D7A";
const ANTEL_BLUE_DARK = "#002A56";
const ANTEL_YELLOW = "#FFD500";
const ANTEL_YELLOW_DARK = "#FFC700";

export function IntroductionScreen() {
  const setStep = useWizardStore((s) => s.setStep);
  const startWizard = () => setStep("contexto");

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <main className="mx-auto max-w-3xl px-5 py-10 sm:px-6 sm:py-14">

        {/* ───────────── HERO ───────────── */}
        <section className="rounded-2xl bg-slate-50 p-7 sm:p-9 mb-10">
          <div className="flex items-center gap-3 mb-7">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/Antel-logo.svg"
              alt="ANTEL"
              className="h-10 w-auto"
              style={{ objectFit: "contain" }}
            />
            <div className="text-xs leading-tight text-slate-600">
              <strong className="block font-medium text-slate-900">
                ANTEL · Empresas Uruguayas Inteligentes
              </strong>
              Pulso PyME
            </div>
          </div>

          {/* Pulse animation track */}
          <PulseTrack />

          <h1 className="mb-3 text-3xl sm:text-4xl font-medium leading-[1.15] tracking-tight">
            Tu PyME tiene pulso.
            <br />
            <span style={{ color: ANTEL_BLUE }}>¿Lo estás escuchando?</span>
          </h1>

          <p className="mb-7 max-w-[92%] text-base leading-relaxed text-slate-600">
            Un autodiagnóstico hecho para que vos y tu equipo entiendan, en menos
            de 15 minutos, dónde está parado el negocio hoy — sin notas, sin
            rankings, sin nadie evaluándote desde afuera.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={startWizard}
              className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-base font-medium transition-colors"
              style={{ background: ANTEL_BLUE, color: ANTEL_YELLOW }}
              onMouseEnter={(e) => (e.currentTarget.style.background = ANTEL_BLUE_DARK)}
              onMouseLeave={(e) => (e.currentTarget.style.background = ANTEL_BLUE)}
            >
              Tomar el pulso
              <ArrowRight className="h-4 w-4" />
            </button>
            <span className="inline-flex items-center gap-1.5 text-sm text-slate-500">
              <Clock className="h-4 w-4" />
              12–15 min · anónimo · gratis
            </span>
          </div>
        </section>

        {/* ───────────── MANIFIESTO LITERAL (SPEC §13) ───────────── */}
        <section className="mb-10 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          <h2
            className="mb-4 text-xl font-medium tracking-tight"
            style={{ color: ANTEL_BLUE }}
          >
            Este diagnóstico es distinto.
          </h2>
          <div className="space-y-4 text-sm leading-relaxed text-slate-700">
            <p>
              No hay una nota al final ni un puntaje que diga si tu negocio está
              bien o mal, y nadie va a evaluarlo desde afuera.
            </p>
            <p>Este diagnóstico es para entender dónde y cómo está tu negocio.</p>
            <p>
              Es una herramienta para vos y para tu equipo. Sirve para abrir una
              conversación puertas adentro del negocio — entre el dueño y los
              que recién entraron, entre el que está con el cliente y el que
              lleva los números, entre quien conoce el rubro de toda la vida y
              quien recién llega con otra mirada.
            </p>
            <p className="font-medium">
              Lo que sale de acá no es un diagnóstico que alguien te entrega
              para que vos hagas algo.
            </p>
            <p>
              Es un mapa para que ustedes lo miren juntos. Las preguntas tocan
              temas que muchas veces no se charlan: cómo se toman las
              decisiones, qué pasa cuando alguien se equivoca, quién conoce los
              números, cómo se reacciona ante un cambio del mercado. Las
              respuestas — sobre todo donde no coincidan entre ustedes — son el
              comienzo de una mesa de trabajo honesta.
            </p>
            <p>
              No buscamos la respuesta que queda bien. Buscamos la respuesta
              verdadera, porque es la única que sirve para mejorar. Y mejorar no
              es llegar a un ideal: es entrar en un proceso de conversación,
              aprendizaje y ajuste continuo donde todos los que trabajan en el
              negocio aportan lo que saben.
            </p>
            <p>
              Para algunas cosas que aparezcan vas a necesitar formación,
              herramientas o acompañamiento de afuera. Está bien — darte cuenta
              es parte del valor de hacerse las preguntas.
            </p>
            <p className="font-medium">Contestá con honestidad, con crudeza.</p>
            <p>
              Después, sentate con tu equipo y charlen lo que aparezca. Lo que
              respondas se guarda de forma anónima: sin nombre, sin empresa,
              sin nadie que pueda identificarte.
            </p>
          </div>
        </section>

        {/* ───────────── PARA QUÉ TE SIRVE ───────────── */}
        <section className="mb-10">
          <SectionLabel>Para qué te sirve</SectionLabel>
          <SectionTitle>Tres conversaciones que tu negocio necesita tener.</SectionTitle>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Benefit
              icon={<Lightbulb className="h-5 w-5" />}
              title="Ver lo que no se charla"
              body="Cómo se deciden las cosas, quién mira los números, qué pasa cuando se traba algo."
            />
            <Benefit
              icon={<Users className="h-5 w-5" />}
              title="Alinear al equipo"
              body="Donde el dueño y los que trabajan ven distinto, ahí empieza la mesa de trabajo."
            />
            <Benefit
              icon={<Target className="h-5 w-5" />}
              title="Saber por dónde mover"
              body="Un kit de conversación con lo que importa atender primero, y por qué."
            />
          </div>
        </section>

        {/* ───────────── DIMENSIONES ───────────── */}
        <section className="mb-10">
          <SectionLabel>Qué vas a explorar</SectionLabel>
          <SectionTitle>Cinco lecturas sobre cómo funciona tu negocio.</SectionTitle>

          <div className="flex flex-wrap gap-2">
            <Dim icon={<Route className="h-3.5 w-3.5" />} label="Cómo se decide" />
            <Dim icon={<Calculator className="h-3.5 w-3.5" />} label="Quién maneja los números" />
            <Dim icon={<UsersRound className="h-3.5 w-3.5" />} label="Cómo se trabaja en equipo" />
            <Dim icon={<Radar className="h-3.5 w-3.5" />} label="Cómo reaccionás al mercado" />
            <Dim icon={<AlertTriangle className="h-3.5 w-3.5" />} label="Qué pasa cuando algo falla" />
          </div>
        </section>

        {/* ───────────── CÓMO FUNCIONA ───────────── */}
        <section className="mb-10">
          <SectionLabel>Cómo funciona</SectionLabel>
          <SectionTitle>Tres pasos. Sin vueltas.</SectionTitle>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Step
              n="01"
              title="Contestás solo"
              body="Preguntas claras, sin jerga. Honestidad cruda — nadie te va a leer las respuestas."
            />
            <Step
              n="02"
              title="Recibís tu kit"
              body="Un PDF para abrir con tu equipo. No es un veredicto, es un mapa para charlar."
            />
            <Step
              n="03"
              title="Hablan, y deciden"
              body="Donde no coincidan, ahí está la cosa interesante. Lo que sigue, lo deciden ustedes."
            />
          </div>
        </section>

        {/* ───────────── QUOTE ───────────── */}
        <section className="mb-10">
          <blockquote
            className="border-l-2 py-4 pl-5 font-serif text-lg leading-snug text-slate-900"
            style={{ borderColor: ANTEL_BLUE }}
          >
            No buscamos la respuesta que queda bien. Buscamos la verdadera — porque
            es la única que sirve para mejorar.
          </blockquote>
        </section>

        {/* ───────────── REGLAS ───────────── */}
        <section className="mb-10">
          <SectionLabel>Antes de empezar</SectionLabel>

          <div className="rounded-xl bg-slate-50 p-5 sm:p-6">
            <Rule
              icon={<EyeOff className="h-5 w-5" />}
              title="Anónimo de verdad"
              body="No te pedimos nombre, empresa ni datos personales para hacerlo."
            />
            <Rule
              icon={<Clock4 className="h-5 w-5" />}
              title="12 a 15 minutos"
              body="Contestá tranquilo, sin apuro. Podés repetirlo cuando quieras."
            />
            <Rule
              icon={<Equal className="h-5 w-5" />}
              title="No hay respuestas correctas"
              body="Contestá lo que pasa de verdad, no lo que te gustaría que pasara."
            />
            <Rule
              icon={<Gift className="h-5 w-5" />}
              title="Si querés, después te mostramos más"
              body="Al final podés ver soluciones que podrían acompañar tu pulso. Es opcional y solo si pedís contacto te pedimos datos."
              last
            />
          </div>
        </section>

        {/* ───────────── CTA FINAL ───────────── */}
        <section
          className="rounded-2xl p-7 sm:p-9 text-center text-white"
          style={{ background: ANTEL_BLUE }}
        >
          <h3 className="mb-2 text-xl font-medium tracking-tight">
            Tu negocio ya te está diciendo algo.
          </h3>
          <p className="mb-6 text-sm text-white/75">
            Llevás unos minutos y empezás a escucharlo.
          </p>
          <button
            type="button"
            onClick={startWizard}
            className="inline-flex items-center gap-2 rounded-lg px-7 py-3 text-base font-medium transition-colors"
            style={{ background: ANTEL_YELLOW, color: ANTEL_BLUE }}
            onMouseEnter={(e) => (e.currentTarget.style.background = ANTEL_YELLOW_DARK)}
            onMouseLeave={(e) => (e.currentTarget.style.background = ANTEL_YELLOW)}
          >
            Tomar el pulso ahora
            <ArrowRight className="h-4 w-4" />
          </button>
        </section>

        {/* ───────────── FOOTER ───────────── */}
        <footer className="mt-8 border-t border-slate-200 pt-6 text-xs leading-relaxed text-slate-500">
          Una iniciativa de{" "}
          <strong className="font-medium text-slate-700">ANTEL</strong> · programa
          Empresas Uruguayas Inteligentes
          <br />
          Metodología y motor de diagnóstico:{" "}
          <strong className="font-medium text-slate-700">
            Adaptant Studio · OC Framework v2.0
          </strong>
        </footer>
      </main>
    </div>
  );
}

/* ───────────────────── Subcomponents ───────────────────── */

function PulseTrack() {
  return (
    <div
      className="relative mb-5 h-14 overflow-hidden rounded-lg border border-slate-200 bg-white"
      aria-hidden="true"
    >
      <svg
        className="block h-full w-full"
        viewBox="0 0 600 56"
        preserveAspectRatio="none"
      >
        <path
          d="M0,28 L80,28 L100,28 L120,10 L140,46 L160,18 L180,38 L200,28 L300,28 L320,8 L335,48 L350,20 L365,38 L380,28 L600,28"
          fill="none"
          strokeWidth="1.5"
          style={{ stroke: ANTEL_BLUE }}
          className="pulse-draw"
        />
        <circle cx="380" cy="28" r="3" style={{ fill: ANTEL_BLUE }} className="pulse-blip" />
      </svg>
      <style>{`
        .pulse-draw {
          stroke-dasharray: 600;
          stroke-dashoffset: 600;
          animation: pulse-draw 3s ease-out infinite;
        }
        .pulse-blip {
          animation: pulse-blip 3s ease-out infinite;
          transform-origin: 380px 28px;
        }
        @keyframes pulse-draw {
          0%   { stroke-dashoffset: 600; }
          70%  { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: 0; opacity: 0.4; }
        }
        @keyframes pulse-blip {
          0%, 60%  { opacity: 0; transform: scale(0.8); }
          70%      { opacity: 1; transform: scale(1.4); }
          100%     { opacity: 0.6; transform: scale(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          .pulse-draw, .pulse-blip { animation: none; }
          .pulse-draw { stroke-dashoffset: 0; opacity: 0.4; }
          .pulse-blip { opacity: 0.6; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.12em] text-slate-400">
      {children}
    </p>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-4 text-xl font-medium leading-tight tracking-tight">
      {children}
    </h2>
  );
}

function Benefit({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-5">
      <div className="mb-2.5" style={{ color: ANTEL_BLUE }}>{icon}</div>
      <p className="mb-1 text-sm font-medium">{title}</p>
      <p className="text-sm leading-relaxed text-slate-600">{body}</p>
    </div>
  );
}

function Dim({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm"
      style={{ background: "#E6F1FB", color: ANTEL_BLUE }}
    >
      {icon}
      {label}
    </span>
  );
}

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div
        className="mb-2 font-serif text-3xl font-medium leading-none"
        style={{ color: ANTEL_BLUE }}
      >
        {n}
      </div>
      <p className="mb-1 text-sm font-medium">{title}</p>
      <p className="text-sm leading-relaxed text-slate-600">{body}</p>
    </div>
  );
}

function Rule({
  icon,
  title,
  body,
  last,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  last?: boolean;
}) {
  return (
    <div
      className={`flex items-start gap-3 py-2.5 ${
        last ? "" : "border-b border-slate-200"
      }`}
    >
      <div className="mt-0.5 flex-shrink-0" style={{ color: ANTEL_BLUE }}>
        {icon}
      </div>
      <div>
        <p className="mb-0.5 text-sm font-medium">{title}</p>
        <p className="text-sm leading-snug text-slate-600">{body}</p>
      </div>
    </div>
  );
}
