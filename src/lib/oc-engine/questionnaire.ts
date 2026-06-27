/**
 * questionnaire.ts
 * -----------------------------------------------------------------------------
 * Datos del cuestionario de Autoevaluaci\u00f3n de Adaptabilidad Organizacional.
 * Adaptant Studio \u00b7 OC Framework v2.0
 *
 * Esta es la \u00fanica fuente de verdad de las preguntas. El motor de scoring
 * (scoring.ts) NO conoce los textos: solo recibe los puntajes elegidos.
 *
 * El "barajado" del orden de opciones vive AC\u00cd (capa de presentaci\u00f3n),
 * no en el motor, para que el c\u00e1lculo sea siempre puro y predecible.
 * -----------------------------------------------------------------------------
 */

export type Eje = "externo" | "interno" | "transversal";
export type EjeTecnologia = "technology" | "ai";

export type DimensionId =
  | "velocidad_respuesta"
  | "conversacion_sector"
  | "tiempo_innovacion"
  | "estructura_valor"
  | "peso_jerarquia"
  | "acceso_informacion"
  | "voz"
  | "error"
  | "mira_resultado"
  | "rumbo";

export type DimensionTecId =
  | "digitalizacion"
  | "datos_resguardo"
  | "datos_acceso"
  | "ia_uso"
  | "ia_alcance"
  | "ia_impacto";

export interface Dimension {
  id: DimensionId;
  eje: Eje;
  etiqueta: string;
}

export interface Opcion {
  /** Texto que ve el usuario */
  texto: string;
  /** Puntaje 1..4 (1 = m\u00e1s r\u00edgido/Alfa, 4 = m\u00e1s adaptativo/Beta). NUNCA visible al usuario. */
  puntaje: 1 | 2 | 3 | 4;
}

export interface OpcionMulti {
  id: string;
  label: string;
  hasFreeText?: boolean;
}

/** Pregunta de los ejes IAO (Q1-Q15) */
export interface Pregunta {
  /** N\u00famero visible (1..15) */
  numero: number;
  dimension: DimensionId;
  texto: string;
  /** Opciones en su orden CAN\u00d3NICO (por puntaje). El barajado se hace al renderizar. */
  opciones: Opcion[];
}

export interface OpcionScoredTec {
  label: string;
  score: 1 | 2 | 3 | 4;
}

/** Pregunta scored de tecnolog\u00eda o IA (Q17-Q22) */
export interface PreguntaTecScored {
  id: string;
  block: string;
  text: string;
  intro?: string;
  type: "single_select";
  scored: true;
  axis: EjeTecnologia;
  dimension: DimensionTecId;
  isCritical: boolean;
  options: OpcionScoredTec[];
}

/** Pregunta multi-select no puntuada (Q16) */
export interface PreguntaMultiSelect {
  id: string;
  block: string;
  text: string;
  intro?: string;
  type: "multi_select";
  scored: false;
  options: OpcionMulti[];
}

export type PreguntaTec = PreguntaTecScored | PreguntaMultiSelect;

/** Catálogo de dimensiones, cada una asociada a su eje. */
export const DIMENSIONES: Record<DimensionId, Dimension> = {
  velocidad_respuesta: { id: "velocidad_respuesta", eje: "externo", etiqueta: "Velocidad de respuesta al mercado" },
  conversacion_sector: { id: "conversacion_sector", eje: "externo", etiqueta: "Conversaci\u00f3n con el cliente y el sector" },
  tiempo_innovacion:   { id: "tiempo_innovacion",   eje: "externo", etiqueta: "Tiempo para innovar y lanzar" },
  estructura_valor:    { id: "estructura_valor",    eje: "interno", etiqueta: "C\u00f3mo se organiza el trabajo (estructura de valor)" },
  peso_jerarquia:      { id: "peso_jerarquia",      eje: "interno", etiqueta: "Peso de la jerarqu\u00eda (y liderazgo)" },
  acceso_informacion:  { id: "acceso_informacion",  eje: "interno", etiqueta: "Acceso a la informaci\u00f3n y autonom\u00eda" },
  voz:                 { id: "voz",                 eje: "transversal", etiqueta: "La voz de la gente" },
  error:               { id: "error",               eje: "transversal", etiqueta: "El rol del error" },
  mira_resultado:      { id: "mira_resultado",      eje: "transversal", etiqueta: "C\u00f3mo se mira el resultado" },
  rumbo:               { id: "rumbo",               eje: "transversal", etiqueta: "Rumbo del negocio" },
};

/** Las 15 preguntas con sus opciones en orden can\u00f3nico (por puntaje 1..4). */
export const PREGUNTAS: Pregunta[] = [
  {
    numero: 1, dimension: "velocidad_respuesta",
    texto: "Cuando algo cambia afuera (un competidor nuevo, un proveedor que falla, un cliente que se queja), \u00bfc\u00f3mo reaccionan?",
    opciones: [
      { texto: "Tardamos mucho en darnos cuenta.", puntaje: 1 },
      { texto: "Nos damos cuenta pero nos cuesta reaccionar.", puntaje: 2 },
      { texto: "Reaccionamos cuando ya es urgente.", puntaje: 3 },
      { texto: "Reaccionamos r\u00e1pido y con criterio.", puntaje: 4 },
    ],
  },
  {
    numero: 2, dimension: "conversacion_sector",
    texto: "\u00bfC\u00f3mo escuchan a los clientes?",
    opciones: [
      { texto: "No tenemos una forma sistem\u00e1tica.", puntaje: 1 },
      { texto: "Si vienen y nos cuentan, escuchamos.", puntaje: 2 },
      { texto: "Preguntamos cuando hay un problema.", puntaje: 3 },
      { texto: "Tenemos formas activas de escucharlos seguido.", puntaje: 4 },
    ],
  },
  {
    numero: 3, dimension: "conversacion_sector",
    texto: "\u00bfCharlan con otros del mismo rubro?",
    opciones: [
      { texto: "No.", puntaje: 1 },
      { texto: "A veces, por casualidad.", puntaje: 2 },
      { texto: "Tenemos algunos contactos del rubro.", puntaje: 3 },
      { texto: "Estamos activos en c\u00e1maras, grupos o redes del rubro.", puntaje: 4 },
    ],
  },
  {
    numero: 4, dimension: "tiempo_innovacion",
    texto: "\u00bfCu\u00e1ndo cambiaron por \u00faltima vez algo importante de lo que ofrecen?",
    opciones: [
      { texto: "Hace m\u00e1s de 3 a\u00f1os.", puntaje: 1 },
      { texto: "Hace entre 1 y 3 a\u00f1os.", puntaje: 2 },
      { texto: "Hace menos de 1 a\u00f1o.", puntaje: 3 },
      { texto: "Estamos cambiando cosas constantemente.", puntaje: 4 },
    ],
  },
  {
    numero: 5, dimension: "velocidad_respuesta",
    texto: "Si ma\u00f1ana cambia la regulaci\u00f3n o aparece una tecnolog\u00eda que afecta al rubro, \u00bfqu\u00e9 tan preparados est\u00e1n?",
    opciones: [
      { texto: "Nos toma por sorpresa.", puntaje: 1 },
      { texto: "Nos enteramos pero no sabemos qu\u00e9 hacer.", puntaje: 2 },
      { texto: "Tenemos c\u00f3mo informarnos pero reaccionamos despacio.", puntaje: 3 },
      { texto: "Estamos atentos y tenemos c\u00f3mo mover.", puntaje: 4 },
    ],
  },
  {
    numero: 6, dimension: "estructura_valor",
    texto: "\u00bfQu\u00e9 pasa si el due\u00f1o se toma 15 d\u00edas de vacaciones sin computadora?",
    opciones: [
      { texto: "El negocio para o se descontrola.", puntaje: 1 },
      { texto: "El equipo lo cubre pero con problemas.", puntaje: 2 },
      { texto: "Funciona pero algunas cosas esperan.", puntaje: 3 },
      { texto: "Funciona normal sin problemas.", puntaje: 4 },
    ],
  },
  {
    numero: 7, dimension: "peso_jerarquia",
    texto: "\u00bfQui\u00e9nes toman las decisiones importantes?",
    opciones: [
      { texto: "Solo el due\u00f1o.", puntaje: 1 },
      { texto: "El due\u00f1o y un par m\u00e1s.", puntaje: 2 },
      { texto: "Un equipo chico de confianza.", puntaje: 3 },
      { texto: "Las decisiones est\u00e1n distribuidas seg\u00fan qui\u00e9n sabe del tema.", puntaje: 4 },
    ],
  },
  {
    numero: 8, dimension: "acceso_informacion",
    texto: "\u00bfQui\u00e9n conoce los n\u00fameros del negocio (ventas, costos, margen)?",
    opciones: [
      { texto: "Solo el due\u00f1o.", puntaje: 1 },
      { texto: "El due\u00f1o y el contador.", puntaje: 2 },
      { texto: "Algunos del equipo.", puntaje: 3 },
      { texto: "Cualquiera del equipo que lo necesite.", puntaje: 4 },
    ],
  },
  {
    numero: 9, dimension: "acceso_informacion",
    texto: "Cuando hay que decidir algo nuevo, \u00bfqu\u00e9 informaci\u00f3n tienen disponible?",
    opciones: [
      { texto: "Lo que cada uno recuerda.", puntaje: 1 },
      { texto: "Algunas planillas sueltas.", puntaje: 2 },
      { texto: "Tenemos n\u00fameros pero no siempre actualizados.", puntaje: 3 },
      { texto: "Informaci\u00f3n clara y a la vista cuando hace falta.", puntaje: 4 },
    ],
  },
  {
    numero: 10, dimension: "peso_jerarquia",
    texto: "\u00bfHasta d\u00f3nde puede decidir alguien del equipo por su cuenta?",
    opciones: [
      { texto: "Casi nada, todo se consulta.", puntaje: 1 },
      { texto: "Cosas chicas del d\u00eda a d\u00eda.", puntaje: 2 },
      { texto: "Decisiones razonables dentro de su \u00e1rea.", puntaje: 3 },
      { texto: "Decisiones de fondo si tiene la informaci\u00f3n.", puntaje: 4 },
    ],
  },
  {
    numero: 11, dimension: "estructura_valor",
    texto: "\u00bfCu\u00e1ndo fue la \u00faltima vez que cambi\u00f3 la forma de trabajar de algo?",
    opciones: [
      { texto: "Nunca o casi nunca.", puntaje: 1 },
      { texto: "Hace m\u00e1s de 2 a\u00f1os.", puntaje: 2 },
      { texto: "El \u00faltimo a\u00f1o.", puntaje: 3 },
      { texto: "Estamos cambiando cosas seguido.", puntaje: 4 },
    ],
  },
  {
    numero: 12, dimension: "voz",
    texto: "\u00bfC\u00f3mo describir\u00edas la relaci\u00f3n entre las personas del negocio?",
    opciones: [
      { texto: "Tensa o seca.", puntaje: 1 },
      { texto: "Cordial pero distante.", puntaje: 2 },
      { texto: "Buena pero formal.", puntaje: 3 },
      { texto: "De confianza, se conversa de verdad.", puntaje: 4 },
    ],
  },
  {
    numero: 13, dimension: "error",
    texto: "Cuando alguien del equipo se equivoca, \u00bfqu\u00e9 pasa?",
    opciones: [
      { texto: "Hay enojo, se busca culpable.", puntaje: 1 },
      { texto: "Se charla pero queda incomodidad.", puntaje: 2 },
      { texto: "Se charla con calma para entender qu\u00e9 pas\u00f3.", puntaje: 3 },
      { texto: "Se trata como aprendizaje, sin drama.", puntaje: 4 },
    ],
  },
  {
    numero: 14, dimension: "mira_resultado",
    texto: "\u00bfC\u00f3mo se mejora lo que se hace?",
    opciones: [
      { texto: "Cuando algo falla, se arregla y listo.", puntaje: 1 },
      { texto: "El due\u00f1o dice qu\u00e9 cambiar.", puntaje: 2 },
      { texto: "A veces el equipo propone.", puntaje: 3 },
      { texto: "Hay espacios regulares de conversaci\u00f3n sobre c\u00f3mo mejorar.", puntaje: 4 },
    ],
  },
  {
    numero: 15, dimension: "rumbo",
    texto: "\u00bfTienen objetivos compartidos del negocio?",
    opciones: [
      { texto: "No, cada uno hace lo suyo.", puntaje: 1 },
      { texto: "El due\u00f1o los tiene en la cabeza.", puntaje: 2 },
      { texto: "Algunos del equipo los conocen.", puntaje: 3 },
      { texto: "Est\u00e1n claros para todos y se conversan.", puntaje: 4 },
    ],
  },
];

/** Las 7 preguntas de tecnología e IA (Q16-Q22). */
export const PREGUNTAS_TEC: PreguntaTec[] = [
  {
    id: "Q16",
    block: "tecnologia_datos",
    text: "¿Cuál de estas herramientas usás hoy?",
    intro: "Estas preguntas son para entender desde dónde arrancás con la tecnología. No hay un nivel que esté bien ni uno que esté mal: hay negocios que andan muy bien llevando casi todo a mano. Contestá lo que de verdad usás hoy.",
    type: "multi_select",
    scored: false,
    options: [
      { id: "papel",       label: "Cuaderno o memoria." },
      { id: "whatsapp",    label: "WhatsApp para temas del negocio." },
      { id: "planillas",   label: "Excel o Google Sheets." },
      { id: "facturacion", label: "Facturación electrónica o sistema POS." },
      { id: "erp",         label: "ERP o sistema integrado." },
      { id: "web",         label: "Sitio web o tienda online." },
      { id: "redes",       label: "Redes sociales del negocio." },
      { id: "turnos",      label: "Sistema de turnos o reservas." },
      { id: "otra",        label: "Otra (contanos cuál):", hasFreeText: true },
    ],
  },
  {
    id: "Q17",
    block: "tecnologia_datos",
    text: "¿Cuánto del día a día está digitalizado?",
    type: "single_select",
    scored: true,
    axis: "technology",
    dimension: "digitalizacion",
    isCritical: false,
    options: [
      { label: "Casi nada, todo en papel o en la cabeza.", score: 1 },
      { label: "Algunas cosas (facturación, contacto con clientes).", score: 2 },
      { label: "La mayoría.", score: 3 },
      { label: "Todo el flujo del negocio está digitalizado.", score: 4 },
    ],
  },
  {
    id: "Q18",
    block: "tecnologia_datos",
    text: "Si mañana se rompe la computadora principal o se pierde el celular del dueño, ¿qué pasa con la información del negocio?",
    type: "single_select",
    scored: true,
    axis: "technology",
    dimension: "datos_resguardo",
    isCritical: false,
    options: [
      { label: "Se pierde todo.", score: 1 },
      { label: "Se pierden cosas importantes.", score: 2 },
      { label: "Hay copia de algunas cosas.", score: 3 },
      { label: "Está todo respaldado en la nube.", score: 4 },
    ],
  },
  {
    id: "Q19",
    block: "tecnologia_datos",
    text: "¿Quién puede acceder a la información del negocio (ventas, clientes, números)?",
    type: "single_select",
    scored: true,
    axis: "technology",
    dimension: "datos_acceso",
    isCritical: false,
    options: [
      { label: "No está claro.", score: 1 },
      { label: "El dueño y a veces alguno más.", score: 2 },
      { label: "Hay accesos definidos pero no actualizados.", score: 3 },
      { label: "Cada uno accede a lo que le corresponde.", score: 4 },
    ],
  },
  {
    id: "Q20",
    block: "inteligencia_artificial",
    text: "¿Usan hoy alguna herramienta de inteligencia artificial en el negocio?",
    intro: "Por último, sobre inteligencia artificial. No usarla no es ni bueno ni malo: muchos negocios todavía no la necesitan. Solo queremos saber en qué punto estás hoy.",
    type: "single_select",
    scored: true,
    axis: "ai",
    dimension: "ia_uso",
    isCritical: false,
    options: [
      { label: "Todavía no usamos ninguna.", score: 1 },
      { label: "La probamos alguna vez, pero no quedó incorporada.", score: 2 },
      { label: "La usamos para algunas tareas puntuales.", score: 3 },
      { label: "Ya es parte de cómo trabajamos.", score: 4 },
    ],
  },
  {
    id: "Q21",
    block: "inteligencia_artificial",
    text: "Si la usan, ¿quiénes la usan?",
    type: "single_select",
    scored: true,
    axis: "ai",
    dimension: "ia_alcance",
    isCritical: false,
    options: [
      { label: "No la usa nadie todavía.", score: 1 },
      { label: "La usa solo el dueño o una persona.", score: 2 },
      { label: "La usan algunas personas, cada una por su cuenta.", score: 3 },
      { label: "La usamos varios y compartimos lo que nos funciona.", score: 4 },
    ],
  },
  {
    id: "Q22",
    block: "inteligencia_artificial",
    text: "Si la usan, ¿notan que les cambia algo en el día a día o en los resultados?",
    type: "single_select",
    scored: true,
    axis: "ai",
    dimension: "ia_impacto",
    isCritical: false,
    options: [
      { label: "No la usamos, así que no sabríamos decir.", score: 1 },
      { label: "La usamos, pero todavía no vemos que cambie gran cosa.", score: 2 },
      { label: "Nos ayuda a ganar tiempo en algunas tareas.", score: 3 },
      { label: "Nos cambió para mejor cómo trabajamos o cómo atendemos.", score: 4 },
    ],
  },
];

/**
 * Devuelve las opciones de una pregunta en orden BARAJADO para mostrar.
 * El barajado es determinístico por `seed` (para que no cambie si el usuario
 * vuelve atrás) pero distinto por pregunta. La presentaci\u00f3n no afecta el
 * c\u00e1lculo: cada opci\u00f3n conserva su `puntaje`.
 */
export function opcionesBarajadas(pregunta: Pregunta, seed: number): Opcion[] {
  const arr = [...pregunta.opciones];
  // Fisher-Yates con PRNG simple sembrado (mulberry32)
  let s = (seed + pregunta.numero * 2654435761) >>> 0;
  const rand = () => {
    s |= 0; s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
