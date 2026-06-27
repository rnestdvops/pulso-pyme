/**
 * Tipo "facade" de Evaluación para consumir desde el motor de sugerencias.
 *
 * Adapta el shape persistido en Supabase (`dimensiones` como array,
 * `tecnologia_por_dimension` como JSONB) a una forma cómoda para matching:
 * dimensiones como Record por id, y tecPorDimension como Record tipado.
 *
 * El adapter `evaluacionDesdeRow` vive en este mismo archivo para mantener
 * la conversión en un solo lugar.
 */

import type { DimensionId, NivelTecnologia, AIState } from "@/lib/oc-engine/scoring";

export interface Evaluacion {
  id: string;
  /** Score 0-100 por cada dimensión IAO, indexado por id. */
  dimensiones: Partial<Record<DimensionId, number>>;
  lecturaTec: {
    /** Nivel descriptivo (no entra al IAO). */
    nivel: NivelTecnologia;
    /** Score 1-4 por cada dimensión tec (digitalización, resguardo, acceso). */
    porDimension: Partial<Record<"digitalizacion" | "datos_resguardo" | "datos_acceso", number>>;
  };
  lecturaIA: {
    /** Estado descriptivo de uso de IA. */
    estado: AIState;
  };
  /** Inventario Q16: ids de herramientas marcadas. */
  q16Inventario: string[];
  /** Contexto opcional para reglas de matching por segmento. */
  contexto?: {
    rubro?: string;
    empleados?: string;
  };
}

/**
 * Adapter desde la fila cruda de Supabase a la forma `Evaluacion`.
 * No depende de Supabase para que sea testeable con fixtures.
 */
export interface EvaluacionRow {
  id: string;
  dimensiones: unknown;
  tecnologia_nivel: string | null;
  tecnologia_por_dimension: unknown;
  ia_estado: string | null;
  q16_seleccionadas: string[] | null;
  rubro?: string | null;
  empleados?: string | null;
}

export function evaluacionDesdeRow(row: EvaluacionRow): Evaluacion {
  const dimsArray = Array.isArray(row.dimensiones)
    ? (row.dimensiones as Array<{ id: string; iao: number }>)
    : [];
  const dimensiones: Partial<Record<DimensionId, number>> = {};
  for (const d of dimsArray) {
    dimensiones[d.id as DimensionId] = d.iao;
  }

  const tecPorDim = (row.tecnologia_por_dimension ?? {}) as Record<string, number>;

  return {
    id: row.id,
    dimensiones,
    lecturaTec: {
      nivel: (row.tecnologia_nivel as NivelTecnologia) ?? "punto_de_partida",
      porDimension: {
        digitalizacion: tecPorDim.digitalizacion,
        datos_resguardo: tecPorDim.datos_resguardo,
        datos_acceso: tecPorDim.datos_acceso,
      },
    },
    lecturaIA: {
      estado: (row.ia_estado as AIState) ?? "no_usan",
    },
    q16Inventario: row.q16_seleccionadas ?? [],
    contexto: {
      rubro: row.rubro ?? undefined,
      empleados: row.empleados ?? undefined,
    },
  };
}
