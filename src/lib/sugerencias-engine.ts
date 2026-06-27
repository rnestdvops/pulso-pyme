/**
 * Motor de sugerencias — matching de productos contra una Evaluación.
 *
 * Orden de prioridad para elegir el "porQue" mostrado (SPEC §4):
 *   1. Dimensión IAO baja específica
 *   2. Dimensión tec baja específica
 *   3. Nivel tec global
 *   4. Estado IA
 *   5. Herramienta ausente (Q16)
 *   6. Default
 *
 * Garantías:
 * - Sección B (adopcion_ia) siempre devuelve ≥ 1 sugerencia (OC Companion
 *   matchea contra los 4 estados de IA, así que siempre dispara).
 * - Sección A (tecnologia) intenta devolver ≥ 2 sugerencias. Si nada
 *   matchea, agrega "antel-conectividad-pyme" como fallback universal con
 *   copy default ("primer ladrillo").
 */

import { catalogoMock, type ProductoCatalogo, type TecDimensionId } from "@/data/catalogo-antel-mock";
import type { Evaluacion } from "@/types/evaluacion";
import type { DimensionId, NivelTecnologia, AIState } from "@/lib/oc-engine/scoring";

export interface SugerenciaConCopy {
  producto: ProductoCatalogo;
  /** Texto que se muestra como "¿Por qué te lo mostramos?" */
  porQueMostrado: string;
  /** Señal disparadora (para tracking en panel). Ej: "acceso_informacion_bajo". */
  senalDisparadora: string;
}

export interface SugerenciasResult {
  tecnologia: SugerenciaConCopy[];
  adopcionIA: SugerenciaConCopy[];
}

const MIN_TECNOLOGIA = 2;

export function obtenerSugerencias(ev: Evaluacion): SugerenciasResult {
  const matched: SugerenciaConCopy[] = [];

  for (const producto of catalogoMock) {
    const match = evaluarMatch(producto, ev);
    if (match) {
      matched.push({ producto, porQueMostrado: match.copy, senalDisparadora: match.senal });
    }
  }

  const tecnologia = matched.filter((s) => s.producto.seccion === "tecnologia");
  const adopcionIA = matched.filter((s) => s.producto.seccion === "adopcion_ia");

  // Fallback Sección A: si quedó con < 2, agregar conectividad como primer ladrillo universal
  if (tecnologia.length < MIN_TECNOLOGIA) {
    const conectividad = catalogoMock.find((p) => p.id === "antel-conectividad-pyme");
    const yaEsta = tecnologia.some((s) => s.producto.id === "antel-conectividad-pyme");
    if (conectividad && !yaEsta) {
      tecnologia.push({
        producto: conectividad,
        porQueMostrado: conectividad.porQue.default,
        senalDisparadora: "fallback_minimo",
      });
    }
  }

  return { tecnologia, adopcionIA };
}

function evaluarMatch(
  p: ProductoCatalogo,
  ev: Evaluacion,
): { copy: string; senal: string } | null {
  // 1. Dimensión IAO baja
  if (p.matching.dimensionesBajas) {
    for (const dim of p.matching.dimensionesBajas) {
      const score = ev.dimensiones[dim.dimension];
      if (score !== undefined && score <= dim.umbral) {
        const copy = p.porQue.dimensionBaja?.[dim.dimension] ?? p.porQue.default;
        return { copy, senal: `${dim.dimension}_bajo` };
      }
    }
  }

  // 2. Dimensión tec baja
  if (p.matching.dimensionesTecBajas) {
    for (const dim of p.matching.dimensionesTecBajas) {
      const score = ev.lecturaTec.porDimension[dim.dimension];
      if (score !== undefined && score <= dim.umbral) {
        const copy = p.porQue.dimensionTecBaja?.[dim.dimension] ?? p.porQue.default;
        return { copy, senal: `tec_${dim.dimension}_bajo` };
      }
    }
  }

  // 3. Nivel tec
  if (p.matching.nivelTec?.includes(ev.lecturaTec.nivel)) {
    const key = nivelTecCopyKey(ev.lecturaTec.nivel);
    const copy = (p.porQue[key] as string | undefined) ?? p.porQue.default;
    return { copy, senal: `tec_${ev.lecturaTec.nivel}` };
  }

  // 4. Estado IA
  if (p.matching.estadoIA?.includes(ev.lecturaIA.estado)) {
    const copy = p.porQue.estadoIA?.[ev.lecturaIA.estado] ?? p.porQue.default;
    return { copy, senal: `ia_${ev.lecturaIA.estado}` };
  }

  // 5. Herramientas ausentes
  if (p.matching.herramientasAusentes) {
    const inventario = new Set(ev.q16Inventario);
    for (const h of p.matching.herramientasAusentes) {
      if (!inventario.has(h)) {
        const copy = p.porQue.herramientaAusente?.[h] ?? p.porQue.default;
        return { copy, senal: `falta_${h}` };
      }
    }
  }

  // 6. Herramientas presentes (complementarias)
  if (p.matching.herramientasPresentes) {
    const inventario = new Set(ev.q16Inventario);
    for (const h of p.matching.herramientasPresentes) {
      if (inventario.has(h)) {
        return { copy: p.porQue.default, senal: `tiene_${h}` };
      }
    }
  }

  return null;
}

function nivelTecCopyKey(
  nivel: NivelTecnologia,
): "nivelTecPuntoDePartida" | "nivelTecEnCamino" | "nivelTecConsolidado" {
  switch (nivel) {
    case "punto_de_partida":
      return "nivelTecPuntoDePartida";
    case "en_camino":
      return "nivelTecEnCamino";
    case "consolidado":
      return "nivelTecConsolidado";
  }
}

// Re-export types for convenience
export type { ProductoCatalogo, DimensionId, NivelTecnologia, AIState, TecDimensionId };
