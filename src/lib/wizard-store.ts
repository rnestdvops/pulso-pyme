import { create } from "zustand";
import type { Respuestas, TechnologyReading, AIReading } from "./oc-engine/scoring";
import type { Json } from "@/integrations/supabase/types";
import {
  computeTechnologyReading,
  computeAIReading,
  buildRespuestasTec,
} from "./oc-engine/scoring";
import { PREGUNTAS, PREGUNTAS_TEC } from "./oc-engine/questionnaire";
import { supabase } from "@/utils/supabase/client";

export interface ContextData {
  rubro: string;
  empleados: string;
  antiguedad: string;
  rol: string;
}

export type Step = "intro" | "contexto" | "cuestionario" | "resultados";
export type PresetKind = "bajo" | "alto" | "medio" | "mix";

export interface WizardState {
  step: Step;
  contexto: ContextData;
  respuestas: Respuestas;
  /** Respuestas para preguntas de tecnología e IA: mapa id (Q17-Q22) -> score */
  respuestasTec: Partial<Record<string, 1 | 2 | 3 | 4>>;
  /** Respuesta multi-select de Q16 */
  respuestaQ16: { seleccionadas: string[]; otraTexto: string };
  currentQuestion: number;
  seed: number;
  /** Id de la evaluación guardada en Supabase */
  evaluacionId: string | null;
  /** Lecturas calculadas al completar */
  resultadoTec: TechnologyReading | null;
  resultadoIA: AIReading | null;

  setStep: (step: Step) => void;
  setContexto: (data: Partial<ContextData>) => void;
  setRespuesta: (numero: number, puntaje: 1 | 2 | 3 | 4) => void;
  setRespuestaTec: (id: string, score: 1 | 2 | 3 | 4) => void;
  setRespuestaQ16: (seleccionadas: string[], otraTexto: string) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  goToQuestion: (idx: number) => void;
  applyPreset: (kind: PresetKind) => void;
  persistirEvaluacion: (params: {
    iaoGeneral: number;
    nivelGeneral: string;
    iaoExterno: number;
    nivelExterno: string;
    iaoInterno: number;
    nivelInterno: string;
    dimensiones: Json;
  }) => Promise<void>;
  reset: () => void;
}

const initialState = {
  step: "intro" as Step,
  contexto: {
    rubro: "",
    empleados: "",
    antiguedad: "",
    rol: "",
  },
  respuestas: {} as Respuestas,
  respuestasTec: {} as Partial<Record<string, 1 | 2 | 3 | 4>>,
  respuestaQ16: { seleccionadas: [] as string[], otraTexto: "" },
  currentQuestion: 0,
  seed: Math.floor(Math.random() * 1_000_000),
  evaluacionId: null,
  resultadoTec: null,
  resultadoIA: null,
};

export const useWizardStore = create<WizardState>((set, get) => ({
  ...initialState,

  setStep: (step) => set({ step }),

  setContexto: (data) =>
    set((state) => ({ contexto: { ...state.contexto, ...data } })),

  setRespuesta: (numero, puntaje) =>
    set((state) => ({
      respuestas: { ...state.respuestas, [numero]: puntaje },
    })),

  setRespuestaTec: (id, score) =>
    set((state) => ({
      respuestasTec: { ...state.respuestasTec, [id]: score },
    })),

  setRespuestaQ16: (seleccionadas, otraTexto) =>
    set({ respuestaQ16: { seleccionadas, otraTexto } }),

  nextQuestion: () =>
    set((state) => ({ currentQuestion: state.currentQuestion + 1 })),

  prevQuestion: () =>
    set((state) => ({
      currentQuestion: Math.max(state.currentQuestion - 1, 0),
    })),

  goToQuestion: (idx) => set({ currentQuestion: idx }),

  persistirEvaluacion: async ({
    iaoGeneral, nivelGeneral,
    iaoExterno, nivelExterno,
    iaoInterno, nivelInterno,
    dimensiones,
  }) => {
    const { contexto, respuestasTec, respuestaQ16 } = get();
    const normTec = buildRespuestasTec(respuestasTec);
    const tecReading = computeTechnologyReading(normTec);
    const aiReading = computeAIReading(normTec);

    set({ resultadoTec: tecReading, resultadoIA: aiReading });

    const payload = {
      iao_general: iaoGeneral,
      nivel_general: nivelGeneral,
      iao_externo: iaoExterno,
      nivel_externo: nivelExterno,
      iao_interno: iaoInterno,
      nivel_interno: nivelInterno,
      dimensiones,
      rubro: contexto.rubro,
      empleados: contexto.empleados,
      antiguedad: contexto.antiguedad,
      rol: contexto.rol ?? null,
      tecnologia_puntaje: Math.round(tecReading.puntaje),
      tecnologia_nivel: tecReading.nivel,
      tecnologia_por_dimension: tecReading.porDimension,
      ia_estado: aiReading.estado,
      q16_seleccionadas: respuestaQ16.seleccionadas ?? [],
      q16_otra_texto: respuestaQ16.otraTexto || null,
      respuestas_tec: {
        Q17: respuestasTec["Q17"] ?? null,
        Q18: respuestasTec["Q18"] ?? null,
        Q19: respuestasTec["Q19"] ?? null,
        Q20: respuestasTec["Q20"] ?? null,
        Q21: respuestasTec["Q21"] ?? null,
        Q22: respuestasTec["Q22"] ?? null,
      },
    };

    const { data, error } = await supabase
      .from("evaluaciones")
      .insert(payload)
      .select("id")
      .single();

    if (!error && data?.id) {
      localStorage.setItem("pulso_pyme_evaluacion_id", data.id);
      set({ evaluacionId: data.id });
    }
  },

  applyPreset: (kind) =>
    set((state) => {
      const puntajeFor = (i: number): 1 | 2 | 3 | 4 => {
        if (kind === "bajo") return 1;
        if (kind === "alto") return 4;
        if (kind === "medio") return 3;
        return ((i % 4) + 1) as 1 | 2 | 3 | 4;
      };
      const respuestas = Object.fromEntries(
        PREGUNTAS.map((q, i) => [q.numero, puntajeFor(i)])
      ) as Respuestas;
      const respuestasTec = Object.fromEntries(
        PREGUNTAS_TEC
          .filter((p) => p.scored && p.type === "single_select")
          .map((p, i) => [p.id, puntajeFor(i)])
      ) as Partial<Record<string, 1 | 2 | 3 | 4>>;
      const contexto = state.contexto.rubro
        ? state.contexto
        : {
            rubro: "Comercio (mayorista o minorista)",
            empleados: "2 a 5",
            antiguedad: "Entre 2 y 5 años",
            rol: "Dueño o socio",
          };
      return {
        respuestas,
        respuestasTec,
        contexto,
        currentQuestion: 0,
        step: "resultados" as Step,
      };
    }),

  reset: () =>
    set({
      ...initialState,
      seed: Math.floor(Math.random() * 1_000_000),
    }),
}));
