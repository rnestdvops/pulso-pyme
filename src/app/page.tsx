"use client";

export const dynamic = "force-dynamic";

import { useWizardStore } from "@/lib/wizard-store";
import { StepIndicator } from "@/components/StepIndicator";
import { ContextoStep } from "@/components/ContextoStep";
import { CuestionarioStep } from "@/components/CuestionarioStep";
import { ResultadosStep } from "@/components/ResultadosStep";
import { DevPresets } from "@/components/DevPresets";
import { IntroductionScreen } from "@/components/IntroductionScreen";
import { LogoANTEL } from "@/components/LogoANTEL";

export default function Home() {
  const step = useWizardStore((s) => s.step);
  const isDev = process.env.NODE_ENV === "development";

  if (step === "intro") {
    return (
      <main className="min-h-screen bg-background">
        <IntroductionScreen />
        {isDev && <DevPresets />}
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen w-full max-w-xl flex-col px-4 pb-8 pt-6 sm:px-6">
        <div className="mb-2 flex items-center justify-between">
          <LogoANTEL showTagline />
        </div>
        <StepIndicator />
        <section className="mt-4 flex-1">
          {step === "contexto" && <ContextoStep />}
          {step === "cuestionario" && <CuestionarioStep />}
          {step === "resultados" && <ResultadosStep />}
        </section>
      </div>
      {isDev && <DevPresets />}
    </main>
  );
}
