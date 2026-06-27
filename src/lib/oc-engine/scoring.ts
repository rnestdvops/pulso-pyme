/**
 * scoring.ts
 * -----------------------------------------------------------------------------
 * Motor de c\u00e1lculo del \u00cdndice de Adaptabilidad Organizacional (IAO).
 * Adaptant Studio \u00b7 OC Framework v2.0
 *
 * FUNCI\u00d3N PURA: mismas respuestas => mismo resultado, siempre.
 * No depende de UI, ni de red, ni de aleatoriedad. As\u00ed se puede testear y
 * migrar de plataforma sin romperse.
 *
 * Modelo NO-LINEAL (decisi\u00f3n de dise\u00f1o central):
 *   Las brechas de adaptabilidad NO se suman: se multiplican y se vuelven
 *   bloqueantes al acumularse. Por eso:
 *     1) media geom\u00e9trica (sensible al "eslab\u00f3n m\u00e1s d\u00e9bil"), y
 *     2) factor de acumulaci\u00f3n convexo que penaliza la cantidad de tensiones cr\u00edticas.
 *
 *   IAO = 100 \u00d7 mediaGeom\u00e9trica(normalizados) \u00d7 [1 \u2212 K \u00d7 (cr\u00edticas/total)^P]
 * -----------------------------------------------------------------------------
 */

import { PREGUNTAS, DIMENSIONES, PREGUNTAS_TEC, type DimensionId, type Eje, type DimensionTecId } from "./questionnaire";
export type { DimensionId, Eje, DimensionTecId } from "./questionnaire";

// ----------------------------- Par\u00e1metros del modelo -----------------------------
// Calibrables con datos de campo. Documentados en el Documento de Definici\u00f3n.
export const PARAMS = {
  /** Piso de normalizaci\u00f3n: evita que un \u00fanico m\u00ednimo anule todo el \u00edndice. */
  PISO: 0.10,
  /** Intensidad de la penalizaci\u00f3n por acumulaci\u00f3n (0..1). */
  K: 0.40,
  /** Exponente convexo: >1 hace que cada brecha pese m\u00e1s que la anterior. */
  P: 1.6,
  /** Una respuesta es "cr\u00edtica" si su puntaje es <= este umbral (1 o 2). */
  UMBRAL_CRITICA: 2,
} as const;

// ----------------------------- Tipos p\u00fablicos -----------------------------
/** Respuestas: mapa n\u00famero de pregunta -> puntaje elegido (1..4). */
export type Respuestas = Record<number, 1 | 2 | 3 | 4>;

export type Nivel = "bajo" | "medio" | "alto";

export interface ResultadoDimension {
  id: DimensionId;
  etiqueta: string;
  eje: Eje;
  iao: number;          // 0..100
  nivel: Nivel;
  preguntas: number[];  // qu\u00e9 preguntas la componen
}

export interface ResultadoEje {
  eje: Eje;
  iao: number;          // 0..100
  nivel: Nivel;
}

export interface RecomendacionDisparada {
  dimension: DimensionId;
  etiqueta: string;
  eje: Eje;
  nivel: Nivel;
  prioridad: number;    // 1 = m\u00e1s prioritaria
  esLlave: boolean;     // true si es acceso_informacion en nivel bajo (destraba al resto)
}

export interface ResultadoIAO {
  iaoGeneral: number;               // 0..100
  nivelGeneral: Nivel;
  rangoTexto: RangoTexto;           // texto de devoluci\u00f3n por rango
  ejes: {
    externo: ResultadoEje;
    interno: ResultadoEje;
  };
  perfilEjes: PerfilEjes;           // lectura combinada de ambos ejes
  dimensiones: ResultadoDimension[];
  recomendaciones: RecomendacionDisparada[];
  /** Diagn\u00f3stico de integridad: faltan respuestas, etc. */
  completo: boolean;
}

// ----------------------------- Helpers internos -----------------------------
/** Normaliza un puntaje 1..4 al rango [0,1]: 1->0, 4->1. */
function normalizar(puntaje: number): number {
  return (puntaje - 1) / 3;
}

/** Clasifica un IAO 0..100 en nivel. Umbrales: <40 bajo, 40-69 medio, >=70 alto. */
export function clasificarNivel(iao: number): Nivel {
  if (iao < 40) return "bajo";
  if (iao < 70) return "medio";
  return "alto";
}

/**
 * N\u00facleo del modelo no-lineal. Recibe una lista de puntajes (1..4) y devuelve
 * un IAO 0..100. Es la MISMA f\u00f3rmula para el general, por eje y por dimensi\u00f3n.
 */
export function calcularIAO(puntajes: number[]): number {
  if (puntajes.length === 0) return 0;

  const norm = puntajes.map(normalizar);
  const ajustados = norm.map((x) => Math.max(x, PARAMS.PISO));

  // (1) Media geom\u00e9trica
  const sumaLog = ajustados.reduce((acc, x) => acc + Math.log(x), 0);
  const geo = Math.exp(sumaLog / ajustados.length);

  // (2) Factor de acumulaci\u00f3n convexo
  const criticas = puntajes.filter((p) => p <= PARAMS.UMBRAL_CRITICA).length;
  const fAcum = 1 - PARAMS.K * Math.pow(criticas / puntajes.length, PARAMS.P);

  return Math.round(100 * geo * fAcum);
}

// ----------------------------- Textos de rango -----------------------------
export interface RangoTexto {
  rango: string;
  diagnostico: string;
}

function textoPorRango(iao: number): RangoTexto {
  if (iao >= 80) return { rango: "80\u2013100", diagnostico: "Tu negocio se mueve r\u00e1pido y decide cerca de donde pasan las cosas. La gente sabe, participa y no todo depende de una sola persona. Vas muy bien: el desaf\u00edo es no perder esa agilidad cuando crezcas." };
  if (iao >= 60) return { rango: "60\u201379", diagnostico: "Vas por buen camino. Hay varias cosas que funcionan, pero todav\u00eda quedan decisiones que se traban o informaci\u00f3n que no circula. Si soltás un poco m\u00e1s el control y abr\u00eds los n\u00fameros, gan\u00e1s velocidad." };
  if (iao >= 40) return { rango: "40\u201359", diagnostico: "Conviven dos formas de trabajar: una m\u00e1s abierta y \u00e1gil, y otra donde todo pasa por arriba. Eso genera roces y demoras. El primer paso es hacer visible ese choque y empezar a destrabar de a poco." };
  if (iao >= 20) return { rango: "20\u201339", diagnostico: "Hoy el negocio depende demasiado de una sola persona y suele reaccionar tarde. No es por falta de ganas: es por c\u00f3mo est\u00e1 armado. Hay mucho para ganar abriendo informaci\u00f3n y dejando decidir a quien est\u00e1 cerca del problema." };
  return { rango: "0\u201319", diagnostico: "El negocio est\u00e1 muy frenado: casi todo depende del due\u00f1o, la informaci\u00f3n no circula y cuesta reaccionar a los cambios. La buena noticia es que cualquier paso que des en abrir y soltar va a tener un impacto grande." };
}

// ----------------------------- Perfil combinado de ejes -----------------------------
export type PerfilEjes =
  | "externo_alto_interno_bajo"
  | "externo_bajo_interno_alto"
  | "ambos_bajos"
  | "ambos_altos"
  | "mixto";

function perfilEjes(ext: Nivel, intn: Nivel): { perfil: PerfilEjes; lectura: string } {
  const altoExt = ext === "alto", bajoExt = ext === "bajo";
  const altoInt = intn === "alto", bajoInt = intn === "bajo";
  if (altoExt && bajoInt) return { perfil: "externo_alto_interno_bajo", lectura: "Le\u00e9s bien el mercado, pero por dentro est\u00e1s armado de forma r\u00edgida: las buenas lecturas se traban antes de convertirse en acci\u00f3n. El cuello de botella es interno." };
  if (bajoExt && altoInt) return { perfil: "externo_bajo_interno_alto", lectura: "Por dentro funcionan \u00e1giles, pero est\u00e1n mirando para adentro: corr\u00e9s el riesgo de adaptarte r\u00e1pido a un mercado que ya no le\u00e9s bien. Hay que abrir la mirada al afuera." };
  if (bajoExt && bajoInt) return { perfil: "ambos_bajos", lectura: "El negocio est\u00e1 frenado en las dos caras. Conviene empezar por el eje interno \u2014 abrir la informaci\u00f3n y soltar decisiones \u2014 porque sin eso, mejorar la lectura del mercado no se traduce en nada." };
  if (altoExt && altoInt) return { perfil: "ambos_altos", lectura: "El negocio lee bien el afuera y est\u00e1 armado para responder. El foco pasa a sostener esa agilidad mientras crece." };
  return { perfil: "mixto", lectura: "El negocio tiene un desarrollo intermedio y disparejo entre lo que pasa puertas afuera y puertas adentro. Conviene mirar dimensi\u00f3n por dimensi\u00f3n d\u00f3nde est\u00e1n las mayores tensiones." };
}

// ----------------------------- C\u00e1lculo principal -----------------------------
/**
 * Calcula el resultado completo a partir de las respuestas del usuario.
 * @param respuestas mapa { numeroPregunta: puntaje 1..4 }
 */
export function evaluar(respuestas: Respuestas): ResultadoIAO {
  // --- Integridad ---
  const completo = PREGUNTAS.every((q) => respuestas[q.numero] >= 1 && respuestas[q.numero] <= 4);

  // --- Puntajes por dimensi\u00f3n ---
  const porDimension = new Map<DimensionId, number[]>();
  for (const q of PREGUNTAS) {
    const p = respuestas[q.numero];
    if (!p) continue;
    if (!porDimension.has(q.dimension)) porDimension.set(q.dimension, []);
    porDimension.get(q.dimension)!.push(p);
  }

  const dimensiones: ResultadoDimension[] = [];
  for (const [id, puntajes] of porDimension.entries()) {
    const meta = DIMENSIONES[id];
    const iao = calcularIAO(puntajes);
    dimensiones.push({
      id, etiqueta: meta.etiqueta, eje: meta.eje,
      iao, nivel: clasificarNivel(iao),
      preguntas: PREGUNTAS.filter((q) => q.dimension === id).map((q) => q.numero),
    });
  }

  // --- IAO general: todas las preguntas contestadas, peso parejo ---
  const todos = PREGUNTAS.map((q) => respuestas[q.numero]).filter((p): p is 1|2|3|4 => !!p);
  const iaoGeneral = calcularIAO(todos);

  // --- IAO por eje (solo preguntas de ese eje; transversales no cuentan al eje) ---
  function iaoDeEje(eje: Eje): number {
    const ps = PREGUNTAS.filter((q) => DIMENSIONES[q.dimension].eje === eje)
      .map((q) => respuestas[q.numero]).filter((p): p is 1|2|3|4 => !!p);
    return calcularIAO(ps);
  }
  const iaoExt = iaoDeEje("externo");
  const iaoInt = iaoDeEje("interno");
  const nivelExt = clasificarNivel(iaoExt);
  const nivelInt = clasificarNivel(iaoInt);
  const { perfil } = perfilEjes(nivelExt, nivelInt);

  // --- Recomendaciones disparadas ---
  const recomendaciones = elegirRecomendaciones(dimensiones, nivelExt, nivelInt);

  return {
    iaoGeneral,
    nivelGeneral: clasificarNivel(iaoGeneral),
    rangoTexto: textoPorRango(iaoGeneral),
    ejes: {
      externo: { eje: "externo", iao: iaoExt, nivel: nivelExt },
      interno: { eje: "interno", iao: iaoInt, nivel: nivelInt },
    },
    perfilEjes: perfil,
    dimensiones: dimensiones.sort((a, b) => a.iao - b.iao), // peor primero
    recomendaciones,
    completo,
  };
}

/**
 * L\u00f3gica de selecci\u00f3n de recomendaciones (m\u00e1ximo 3), seg\u00fan el documento:
 *  1) Si acceso_informacion est\u00e1 bajo, va primera SIEMPRE (es la llave).
 *  2) Luego, las dimensiones con peor puntaje (excluida la llave si ya entr\u00f3).
 *  3) Si todo est\u00e1 alto, se devuelven recomendaciones de sostenimiento.
 * El \u00e9nfasis por eje lo decide la UI con perfilEjes; ac\u00e1 ordenamos por necesidad.
 */
export function elegirRecomendaciones(
  dimensiones: ResultadoDimension[],
  _nivelExt: Nivel,
  _nivelInt: Nivel
): RecomendacionDisparada[] {
  const MAX = 3;
  const out: RecomendacionDisparada[] = [];

  const llave = dimensiones.find((d) => d.id === "acceso_informacion");
  const ordenadas = [...dimensiones].sort((a, b) => a.iao - b.iao);

  // 1) Llave primero si est\u00e1 baja
  if (llave && llave.nivel === "bajo") {
    out.push(toRec(llave, 1, true));
  }

  // 2) Peores dimensiones (sin repetir la llave ya incluida)
  for (const d of ordenadas) {
    if (out.length >= MAX) break;
    if (out.some((r) => r.dimension === d.id)) continue;
    // Solo recomendamos activamente lo que no est\u00e9 ya "alto"
    if (d.nivel === "alto") continue;
    out.push(toRec(d, out.length + 1, false));
  }

  // 3) Si no se dispar\u00f3 ninguna (todo alto), sostenimiento con las 2 mejores
  if (out.length === 0) {
    const mejores = [...dimensiones].sort((a, b) => b.iao - a.iao).slice(0, 2);
    mejores.forEach((d, i) => out.push(toRec(d, i + 1, false)));
  }

  return out.slice(0, MAX);
}

function toRec(d: ResultadoDimension, prioridad: number, esLlave: boolean): RecomendacionDisparada {
  return { dimension: d.id, etiqueta: d.etiqueta, eje: d.eje, nivel: d.nivel, prioridad, esLlave };
}

// ============================= LECTURAS APARTE =============================

// ---- Technology Reading ----

export type NivelTecnologia = "punto_de_partida" | "en_camino" | "consolidado";

export interface TechnologyReading {
  puntaje: number; // 0..100
  nivel: NivelTecnologia;
  porDimension: {
    digitalizacion: number | undefined;
    datos_resguardo: number | undefined;
    datos_acceso: number | undefined;
  };
}

/** Respuestas para las lecturas de tecnología/IA: mapa dimensionId -> score. */
export type RespuestasTec = Partial<Record<DimensionTecId, 1 | 2 | 3 | 4>>;

function nivelTecnologia(puntaje: number): NivelTecnologia {
  if (puntaje < 40) return "punto_de_partida";
  if (puntaje < 70) return "en_camino";
  return "consolidado";
}

export function computeTechnologyReading(respuestas: RespuestasTec): TechnologyReading {
  const dims: DimensionTecId[] = ["digitalizacion", "datos_resguardo", "datos_acceso"];
  const scored = dims.map((d) => respuestas[d]).filter((s): s is 1|2|3|4 => s !== undefined);

  const puntaje = scored.length === 0
    ? 0
    : ((scored.reduce((acc, s) => acc + s, 0) / scored.length) - 1) / 3 * 100;

  return {
    puntaje: Math.round(puntaje),
    nivel: nivelTecnologia(puntaje),
    porDimension: {
      digitalizacion: respuestas["digitalizacion"],
      datos_resguardo: respuestas["datos_resguardo"],
      datos_acceso: respuestas["datos_acceso"],
    },
  };
}

// ---- AI Reading ----

export type AIState = "no_usan" | "probaron" | "puntual" | "integrada";

export interface AIReading {
  estado: AIState;
  estadoLabel: string;
  detalleAlcance: number | undefined;
  detalleImpacto: number | undefined;
}

function estadoIA(score: number | undefined): AIState {
  switch (score) {
    case 1: return "no_usan";
    case 2: return "probaron";
    case 3: return "puntual";
    case 4: return "integrada";
    default: return "no_usan";
  }
}

const AI_STATE_LABEL: Record<AIState, string> = {
  no_usan:   "Todavía no la están usando",
  probaron:  "La probaron pero no quedó",
  puntual:   "Uso puntual",
  integrada: "Parte del trabajo",
};

export function computeAIReading(respuestas: RespuestasTec): AIReading {
  const estado = estadoIA(respuestas["ia_uso"]);
  return {
    estado,
    estadoLabel: AI_STATE_LABEL[estado],
    detalleAlcance: respuestas["ia_alcance"],
    detalleImpacto: respuestas["ia_impacto"],
  };
}

/**
 * Construye un RespuestasTec a partir de las respuestas crudas al cuestionario
 * de tecnología (PREGUNTAS_TEC). Helper para la UI.
 */
export function buildRespuestasTec(
  respuestasTecRaw: Partial<Record<string, 1 | 2 | 3 | 4>>
): RespuestasTec {
  const out: RespuestasTec = {};
  for (const p of PREGUNTAS_TEC) {
    if (p.scored && p.type === "single_select") {
      const val = respuestasTecRaw[p.id];
      if (val !== undefined) {
        out[p.dimension as DimensionTecId] = val;
      }
    }
  }
  return out;
}
