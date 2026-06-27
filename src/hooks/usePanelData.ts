import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/utils/supabase/client";
import type { Json } from "@/integrations/supabase/types";

// ── Tipos públicos ──────────────────────────────────────────────────────────

export interface PanelRow {
  id: string;
  created_at: string;
  iao_general: number;
  nivel_general: string;
  iao_externo: number;
  iao_interno: number;
  tecnologia_puntaje: number | null;
  tecnologia_nivel: string | null;
  tecnologia_por_dimension: Json | null;
  ia_estado: string | null;
  rubro: string;
  empleados: string;
  dimensiones: Json;
  respuestas_tec: Json | null;
  q16_seleccionadas: string[] | null;
}

/**
 * Umbral de oclusión para visualizaciones públicas del panel (SPEC §9.3, §10 #7).
 * Cualquier segmento (universo total filtrado) con N < OCCLUSION_THRESHOLD se ocluye
 * automáticamente. La regla vive en el motor; el operador NO puede desactivarla
 * desde el panel.
 */
export const OCCLUSION_THRESHOLD = 30;

export interface PanelData {
  rows: PanelRow[];
  /** True si el segmento filtrado existe pero tiene menos de OCCLUSION_THRESHOLD respuestas. */
  isOccluded: boolean;
  // KPIs
  totalRespuestas: number;
  promedioIAO: number;
  promedioTecnologia: number;
  adopcionIA: number; // % con algún uso de IA (no "no_usan")
  distribucionNiveles: { bajo: number; medio: number; alto: number };
  // Scatter
  puntosScatter: Array<{
    id: string;
    eje_externo: number;
    eje_interno: number;
    color_tecnologia: number | null;
    rubro: string;
    empleados: string;
    iao_general: number;
    tecnologia_nivel: string | null;
    ia_estado: string | null;
  }>;
  // Dimensiones
  promediosPorDimension: Array<{ dimension: string; promedio: number }>;
  // Tecnología
  distribucionTecNivel: { punto_de_partida: number; en_camino: number; consolidado: number };
  promTecDigitalizacion: number;
  promTecResguardo: number;
  promTecAcceso: number;
  // IA
  distribucionIAEstado: { no_usan: number; probaron: number; puntual: number; integrada: number };
  // Q16
  topHerramientas: Array<{ herramienta: string; count: number; pct: number }>;
  // Evolución (universo completo, sin filtros)
  evolucionTemporal: Array<{ semana: string; count: number; promedioIAO: number }>;
  // Selectores
  rubrosDisponibles: string[];
  empleadosDisponibles: string[];
}

export interface Filtros {
  rubro: string | null;
  empleados: string | null;
  nivel: string | null;
}

// ── Helpers internos ────────────────────────────────────────────────────────

const IA_LABELS: Record<string, string> = {
  no_usan:  "Todavía no la están usando",
  probaron: "La probaron pero no quedó",
  puntual:  "Uso puntual",
  integrada: "Parte del trabajo",
};

export { IA_LABELS };

const DIM_ORDER = [
  "velocidad_respuesta",
  "conversacion_sector",
  "tiempo_innovacion",
  "velocidad_respuesta",
  "estructura_valor",
  "peso_jerarquia",
  "acceso_informacion",
  "voz",
  "error",
  "mira_resultado",
  "rumbo",
];

const DIM_LABELS: Record<string, string> = {
  velocidad_respuesta: "Velocidad de respuesta",
  conversacion_sector: "Escucha al cliente y sector",
  tiempo_innovacion:   "Velocidad de innovación",
  estructura_valor:    "Estructura organizacional",
  peso_jerarquia:      "Toma de decisiones",
  acceso_informacion:  "Transparencia de información",
  voz:                 "Participación",
  error:               "Gestión del error",
  mira_resultado:      "Métricas de negocio",
  rumbo:               "Visión compartida",
};

export { DIM_LABELS };

const Q16_LABELS: Record<string, string> = {
  papel:       "Cuaderno / memoria",
  whatsapp:    "WhatsApp",
  planillas:   "Excel / Google Sheets",
  facturacion: "Facturación electrónica",
  erp:         "Sistema de gestión (ERP)",
  web:         "Página web / tienda online",
  redes:       "Redes sociales",
  turnos:      "Sistema de turnos / reservas",
  otra:        "Otra herramienta",
};

function avg(nums: number[]): number {
  if (!nums.length) return 0;
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
}

function isoWeekStart(dateStr: string): string {
  const d = new Date(dateStr);
  const day = d.getUTCDay(); // 0=sun
  const diff = (day === 0 ? -6 : 1 - day);
  const mon = new Date(d);
  mon.setUTCDate(d.getUTCDate() + diff);
  return mon.toISOString().slice(0, 10);
}

function buildPanelData(rows: PanelRow[], allRows: PanelRow[]): PanelData {
  const n = rows.length;

  // KPIs
  const promedioIAO = avg(rows.map((r) => r.iao_general));
  const tecRows = rows.filter((r) => r.tecnologia_puntaje !== null);
  const promedioTecnologia = avg(tecRows.map((r) => r.tecnologia_puntaje as number));
  const conIA = rows.filter((r) => r.ia_estado && r.ia_estado !== "no_usan").length;
  const adopcionIA = n ? Math.round((conIA / n) * 100) : 0;

  const distribucionNiveles = { bajo: 0, medio: 0, alto: 0 };
  for (const r of rows) {
    const k = r.nivel_general as keyof typeof distribucionNiveles;
    if (k in distribucionNiveles) distribucionNiveles[k]++;
  }

  // Scatter
  const puntosScatter = rows.map((r) => ({
    id: r.id,
    eje_externo: r.iao_externo,
    eje_interno: r.iao_interno,
    color_tecnologia: r.tecnologia_puntaje,
    rubro: r.rubro,
    empleados: r.empleados,
    iao_general: r.iao_general,
    tecnologia_nivel: r.tecnologia_nivel,
    ia_estado: r.ia_estado,
  }));

  // Dimensiones — agregar desde el JSONB
  const dimSums: Record<string, number[]> = {};
  for (const r of rows) {
    if (!Array.isArray(r.dimensiones)) continue;
    for (const d of r.dimensiones as Array<{ id: string; iao: number }>) {
      if (!dimSums[d.id]) dimSums[d.id] = [];
      dimSums[d.id].push(d.iao);
    }
  }
  const promediosPorDimension = Object.entries(dimSums)
    .map(([dimension, vals]) => ({ dimension, promedio: avg(vals) }))
    .sort((a, b) => {
      const ia = DIM_ORDER.indexOf(a.dimension);
      const ib = DIM_ORDER.indexOf(b.dimension);
      if (ia === -1 && ib === -1) return a.dimension.localeCompare(b.dimension);
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    });

  // Tecnología
  const distribucionTecNivel = { punto_de_partida: 0, en_camino: 0, consolidado: 0 };
  for (const r of rows) {
    const k = r.tecnologia_nivel as keyof typeof distribucionTecNivel;
    if (k && k in distribucionTecNivel) distribucionTecNivel[k]++;
  }

  const digVals: number[] = [];
  const resVals: number[] = [];
  const accVals: number[] = [];
  for (const r of rows) {
    const pd = r.tecnologia_por_dimension as Record<string, number> | null;
    if (!pd) continue;
    if (pd.digitalizacion  != null) digVals.push(pd.digitalizacion);
    if (pd.datos_resguardo != null) resVals.push(pd.datos_resguardo);
    if (pd.datos_acceso    != null) accVals.push(pd.datos_acceso);
  }
  // porDimension guarda el score 1-4, normalizar a 0-100
  const normScore = (s: number) => Math.round(((s - 1) / 3) * 100);
  const promTecDigitalizacion = digVals.length ? avg(digVals.map(normScore)) : 0;
  const promTecResguardo      = resVals.length ? avg(resVals.map(normScore)) : 0;
  const promTecAcceso         = accVals.length ? avg(accVals.map(normScore)) : 0;

  // IA
  const distribucionIAEstado = { no_usan: 0, probaron: 0, puntual: 0, integrada: 0 };
  for (const r of rows) {
    const k = r.ia_estado as keyof typeof distribucionIAEstado;
    if (k && k in distribucionIAEstado) distribucionIAEstado[k]++;
  }

  // Q16 — top herramientas
  const herramientaCount: Record<string, number> = {};
  for (const r of rows) {
    for (const h of r.q16_seleccionadas ?? []) {
      herramientaCount[h] = (herramientaCount[h] ?? 0) + 1;
    }
  }
  const topHerramientas = Object.entries(herramientaCount)
    .filter(([k]) => k !== "otra")
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([k, count]) => ({
      herramienta: Q16_LABELS[k] ?? k,
      count,
      pct: n ? Math.round((count / n) * 100) : 0,
    }));

  // Evolución temporal (universo completo)
  const semMap = new Map<string, { count: number; suma: number }>();
  for (const r of allRows) {
    const sem = isoWeekStart(r.created_at);
    const cur = semMap.get(sem) ?? { count: 0, suma: 0 };
    cur.count++;
    cur.suma += r.iao_general;
    semMap.set(sem, cur);
  }
  const evolucionTemporal = Array.from(semMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([semana, { count, suma }]) => ({
      semana,
      count,
      promedioIAO: Math.round(suma / count),
    }));

  // Selectores
  const rubrosDisponibles = Array.from(new Set(allRows.map((r) => r.rubro))).sort();
  const empleadosDisponibles = Array.from(new Set(allRows.map((r) => r.empleados))).sort();

  return {
    rows,
    isOccluded: n > 0 && n < OCCLUSION_THRESHOLD,
    totalRespuestas: n,
    promedioIAO,
    promedioTecnologia,
    adopcionIA,
    distribucionNiveles,
    puntosScatter,
    promediosPorDimension,
    distribucionTecNivel,
    promTecDigitalizacion,
    promTecResguardo,
    promTecAcceso,
    distribucionIAEstado,
    topHerramientas,
    evolucionTemporal,
    rubrosDisponibles,
    empleadosDisponibles,
  };
}

// ── Hook público ────────────────────────────────────────────────────────────

export function usePanelData(filtros: Filtros) {
  const [data, setData]     = useState<PanelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);
  const [tick, setTick]     = useState(0);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    async function load() {
      // Query con filtros (para todo excepto evolución temporal)
      let q = supabase
        .from("evaluaciones")
        .select(
          "id, created_at, iao_general, nivel_general, iao_externo, iao_interno, tecnologia_puntaje, tecnologia_nivel, tecnologia_por_dimension, ia_estado, rubro, empleados, dimensiones, respuestas_tec, q16_seleccionadas"
        )
        .order("created_at", { ascending: true })
        .limit(2000);

      if (filtros.rubro)    q = q.eq("rubro", filtros.rubro);
      if (filtros.empleados) q = q.eq("empleados", filtros.empleados);
      if (filtros.nivel)    q = q.eq("nivel_general", filtros.nivel);

      // Query sin filtros (para evolución temporal y selectores)
      const allQ = supabase
        .from("evaluaciones")
        .select(
          "id, created_at, iao_general, nivel_general, iao_externo, iao_interno, tecnologia_puntaje, tecnologia_nivel, tecnologia_por_dimension, ia_estado, rubro, empleados, dimensiones, respuestas_tec, q16_seleccionadas"
        )
        .order("created_at", { ascending: true })
        .limit(2000);

      const [{ data: filtered, error: err1 }, { data: all, error: err2 }] =
        await Promise.all([q, allQ]);

      if (cancelled) return;
      if (err1 || err2) {
        setError((err1 ?? err2)!.message);
        setLoading(false);
        return;
      }

      setData(buildPanelData(
        (filtered ?? []) as PanelRow[],
        (all ?? []) as PanelRow[],
      ));
      setError(null);
      setLoading(false);
    }

    void load();
    return () => { cancelled = true; };
  }, [filtros.rubro, filtros.empleados, filtros.nivel, tick]);

  return { data, loading, error, refetch };
}
