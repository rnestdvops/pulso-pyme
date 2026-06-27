"use client";

import { useWizardStore } from "@/lib/wizard-store";

const STEPS = [
  { key: "contexto" as const, label: "Contexto" },
  { key: "cuestionario" as const, label: "Cuestionario" },
  { key: "resultados" as const, label: "Resultados" },
];

export function StepIndicator() {
  const currentStep = useWizardStore((s) => s.step);
  const currentIndex = STEPS.findIndex((s) => s.key === currentStep);

  return (
    <div className="flex w-full items-center justify-between px-2 py-4">
      {STEPS.map((step, idx) => {
        const isActive = idx === currentIndex;
        const isCompleted = idx < currentIndex;
        const isLast = idx === STEPS.length - 1;

        return (
          <div key={step.key} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`
                  flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold
                  transition-colors duration-300
                  ${
                    isActive
                      ? "bg-primary text-primary-foreground ring-2 ring-primary/30 ring-offset-2 ring-offset-background"
                      : isCompleted
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                  }
                `}
              >
                {isCompleted ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  idx + 1
                )}
              </div>
              <span
                className={`text-xs font-medium transition-colors ${
                  isActive
                    ? "text-foreground"
                    : isCompleted
                      ? "text-foreground/70"
                      : "text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
            </div>
            {!isLast && (
              <div
                className={`mx-2 h-0.5 flex-1 rounded transition-colors duration-500 ${
                  isCompleted ? "bg-primary" : "bg-muted"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}