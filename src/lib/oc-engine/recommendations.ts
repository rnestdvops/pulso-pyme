/**
 * recommendations.ts
 * -----------------------------------------------------------------------------
 * Textos de las recomendaciones por dimensi\u00f3n y nivel.
 * Adaptant Studio \u00b7 OC Framework v2.0
 *
 * INTERVENIBLE: este archivo est\u00e1 pensado para que edites los textos a mano.
 * Cambiá las palabras libremente; mientras respetes la estructura (las claves
 * de dimensi\u00f3n y los tres niveles), el motor y la UI siguen funcionando.
 *
 * No hay l\u00f3gica de c\u00e1lculo ac\u00e1: solo contenido. El motor (scoring.ts) decide
 * QU\u00c9 recomendaci\u00f3n mostrar; este archivo dice QU\u00c9 TEXTO tiene.
 * -----------------------------------------------------------------------------
 */

import type { DimensionId, Nivel, DimensionTecId, NivelTecnologia, AIState } from "./scoring";
import type { Eje } from "./questionnaire";

/** Las tres palancas de mejora. */
export type Palanca = "acceso_informacion" | "inteligencia_artificial" | "rediseno_organizacional";

export const PALANCAS: Record<Palanca, { nombre: string; descripcion: string }> = {
  acceso_informacion: {
    nombre: "Acceso a la informaci\u00f3n",
    descripcion: "Que los n\u00fameros y datos del negocio dejen de vivir en la cabeza del due\u00f1o y pasen a ser un bien com\u00fan que el equipo puede ver. Es la palanca llave: la que m\u00e1s destraba a las dem\u00e1s.",
  },
  inteligencia_artificial: {
    nombre: "Inteligencia artificial",
    descripcion: "Usar IA para leer mejor el mercado, ganar tiempo y resumir informaci\u00f3n \u2014 siempre con una persona decidiendo. La IA ayuda a coordinar; no reemplaza la confianza ni el criterio.",
  },
  rediseno_organizacional: {
    nombre: "Redise\u00f1o organizacional",
    descripcion: "Cambiar c\u00f3mo se decide y qui\u00e9n decide. Soltar el control del due\u00f1o, dejar que cada uno resuelva lo suyo. Es la palanca m\u00e1s profunda; las otras dos la empujan.",
  },
};

/** Estructura del contenido de una dimensi\u00f3n. */
export interface ContenidoDimension {
  /** Por qu\u00e9 importa, en palabras simples (de "Distintas"). */
  porQueImporta: string;
  /** Ley de BetaCodex que fundamenta la dimensi\u00f3n. */
  leyBeta: string;
  /** Palanca principal que empuja esta dimensi\u00f3n. */
  palanca: Palanca;
  /** Texto de recomendaci\u00f3n por nivel. */
  recomendacion: Record<Nivel, string>;
}

/**
 * Contenido completo por dimensi\u00f3n.
 * Edit\u00e1 los textos libremente. Las claves (velocidad_respuesta, etc.) deben
 * coincidir con las de questionnaire.ts / scoring.ts.
 */
export const RECOMENDACIONES: Record<DimensionId, ContenidoDimension> = {
  // ---------------- EJE EXTERNO ----------------
  velocidad_respuesta: {
    porQueImporta: "Si tu negocio reacciona tarde, casi siempre es porque la decisi\u00f3n est\u00e1 lejos de donde pasan las cosas. No es lento por falta de ganas: es lento por dise\u00f1o.",
    leyBeta: "\u00a76 Orientaci\u00f3n al mercado y \u00a79 Ritmo: el mercado marca el ritmo, no el calendario interno.",
    palanca: "rediseno_organizacional",
    recomendacion: {
      bajo: "Empez\u00e1 por una sola cosa: que la persona que atiende al cliente pueda resolver en el momento, sin pedir permiso para todo. Eleg\u00ed tres decisiones chicas que hoy pasan por vos (un descuento, un cambio, un pedido urgente) y deleg\u00e1 esas tres. Vas a ganar velocidad sin perder control de lo importante.",
      medio: "Ya reaccion\u00e1s, pero todav\u00eda esper\u00e1s a \u201ccharlarlo\u201d. Acort\u00e1 ese tiempo: defin\u00ed de antemano qu\u00e9 puede decidir cada uno cuando algo cambia, as\u00ed no se frena todo hasta la pr\u00f3xima reuni\u00f3n. Una herramienta de IA puede avisarte de cambios (precios, demanda) antes de que te peguen.",
      alto: "Vas muy bien. El riesgo es perder esa agilidad cuando crezcas. Cuid\u00e1 que las decisiones sigan cerca del cliente y no se vayan acumulando \u201carriba\u201d a medida que sum\u00e1s gente.",
    },
  },
  conversacion_sector: {
    porQueImporta: "El que est\u00e1 cerca del cliente sabe cosas que el due\u00f1o no se entera. Si esa informaci\u00f3n no circula, el negocio decide a ciegas sobre lo que la gente realmente quiere.",
    leyBeta: "\u00a71 Autonom\u00eda del equipo y \u00a712 Coordinaci\u00f3n de flujos: la direcci\u00f3n viene del mercado (\u201cpull\u201d), no de adentro.",
    palanca: "inteligencia_artificial",
    recomendacion: {
      bajo: "Hoy casi no escuch\u00e1s al mercado. Arranc\u00e1 simple: una vez por semana, anot\u00e1 las tres cosas que m\u00e1s te pidieron o reclamaron los clientes. Sin sistema, en un cuaderno o en el celular. En un mes vas a ver patrones que hoy se te escapan.",
      medio: "Escuch\u00e1s cuando vienen, pero no sal\u00eds a buscar. Pas\u00e1 a preguntar activamente: a tus mejores clientes, qu\u00e9 m\u00e1s necesitan; a los que se fueron, por qu\u00e9. Una IA puede ayudarte a resumir comentarios, rese\u00f1as o chats para detectar qu\u00e9 se repite.",
      alto: "Excelente: ya dej\u00e1s que el cliente te marque el rumbo. Asegurate de que esa escucha llegue a todo el equipo y no quede solo en vos, para que las decisiones del d\u00eda a d\u00eda tambi\u00e9n la usen.",
    },
  },
  tiempo_innovacion: {
    porQueImporta: "Las buenas ideas que quedan dando vueltas sin concretarse son dinero que no entra. Muchas veces no se lanzan por miedo a equivocarse, no por falta de ideas.",
    leyBeta: "\u00a78 Claridad mental / preparaci\u00f3n: prob\u00e1, prototip\u00e1, iter\u00e1; los errores inteligentes ense\u00f1an.",
    palanca: "inteligencia_artificial",
    recomendacion: {
      bajo: "Casi no cambian lo que hacen. El primer paso no es planificar m\u00e1s: es probar chico. Eleg\u00ed una idea y pone\u00e9la a prueba en una semana, con poca inversi\u00f3n, para ver si funciona. Si sale mal, aprendiste barato. Si sale bien, ya arrancaste.",
      medio: "Innovan, pero despu\u00e9s de planificar mucho. Baj\u00e1 el tama\u00f1o de la primera prueba: en vez de un gran lanzamiento, hac\u00e9 una versi\u00f3n m\u00ednima y mostr\u00e1sela a unos pocos clientes. La IA puede acelerarte el armado (textos, im\u00e1genes, ideas) para que el costo de probar sea casi cero.",
      alto: "Muy bien: ya prueban r\u00e1pido y sin tanta vuelta. Cuid\u00e1 que el error siga siendo bien visto adentro, porque es lo que mantiene viva esa capacidad de innovar.",
    },
  },
  // ---------------- EJE INTERNO ----------------
  estructura_valor: {
    porQueImporta: "Si todo pasa por el due\u00f1o, el negocio no puede crecer m\u00e1s all\u00e1 de lo que una persona aguanta. El cuello de botella sos vos.",
    leyBeta: "\u00a72 Federalizaci\u00f3n (c\u00e9lulas, no silos): equipos chicos que entienden todo el negocio, no puestos aislados.",
    palanca: "rediseno_organizacional",
    recomendacion: {
      bajo: "Hoy sin vos no se mueve nada. Empez\u00e1 a armar peque\u00f1os equipos que se hagan cargo de una parte completa del negocio (no de una tarea suelta), y que entiendan c\u00f3mo lo que hacen impacta en el resultado. Aunque sean dos personas, que sepan para qu\u00e9 sirve lo suyo.",
      medio: "Hay roles m\u00e1s o menos claros. El salto es que cada equipo o persona se sienta due\u00f1o de un resultado, no solo de una tarea. Pregunt\u00e1: \u00bfqui\u00e9n se hace cargo de que esto salga bien de punta a punta? Si la respuesta siempre sos vos, hay margen para soltar.",
      alto: "Muy bien: la gente sabe qu\u00e9 aporta y se organiza por lo que hay que lograr. Es la base de un negocio que no depende de una sola persona.",
    },
  },
  peso_jerarquia: {
    porQueImporta: "La jerarqu\u00eda existe para coordinar, no para controlar qui\u00e9n puede saber o decidir. Cuando todo necesita el visto bueno del due\u00f1o, el negocio se mueve a la velocidad de una sola persona.",
    leyBeta: "\u00a73 Liderazgo (autoorganizaci\u00f3n) y \u00a710 Decisiones basadas en la maestr\u00eda: decide quien sabe del tema, no quien tiene el cargo.",
    palanca: "rediseno_organizacional",
    recomendacion: {
      bajo: "Nada se hace sin tu aprobaci\u00f3n. Eso te tiene atrapado y frena al equipo. Eleg\u00ed un \u00e1rea donde la persona que m\u00e1s sabe pueda decidir sola dentro de su tema. Empez\u00e1 por lo que menos riesgo tiene, y ampli\u00e1 a medida que veas que funciona.",
      medio: "Consult\u00e1s al equipo, pero al final decid\u00eds vos. D\u00e1 un paso m\u00e1s: en los temas donde otro sabe m\u00e1s que vos, dej\u00e1 que decida \u00e9l. Liderar no es tener la \u00faltima palabra en todo, es que el que tiene la maestr\u00eda lleve la posta en su tema.",
      alto: "Muy bien: el que sabe de cada tema es el que decide en ese tema. As\u00ed funcionan las organizaciones que se adaptan r\u00e1pido.",
    },
  },
  acceso_informacion: {
    porQueImporta: "Esta es la dimensi\u00f3n llave. Cuando la informaci\u00f3n del negocio es un bien com\u00fan \u2014 y no un secreto del due\u00f1o \u2014 la gente puede decidir bien sin preguntar todo. Abrir los n\u00fameros suele destrabar todas las dem\u00e1s dimensiones de un saque.",
    leyBeta: "\u00a75 Transparencia: la informaci\u00f3n empodera a todos; restringirla solo protege el poder, no el negocio.",
    palanca: "acceso_informacion",
    recomendacion: {
      bajo: "Hoy los n\u00fameros viven en tu cabeza o solo los ve el contador. Ese es el freno m\u00e1s grande. Empez\u00e1 por compartir con tu equipo lo b\u00e1sico: c\u00f3mo venimos de ventas, qu\u00e9 nos cuesta, c\u00f3mo vamos este mes. No hace falta un sistema caro: una pizarra o una planilla compartida ya cambia todo. \u201cSi todos pudieran ver todo ser\u00eda un caos\u201d es mentira: el caos viene de decidir sin informaci\u00f3n, no de tenerla.",
      medio: "La informaci\u00f3n llega a algunos. Ampli\u00e1 el c\u00edrculo y hacela f\u00e1cil de leer: pocos n\u00fameros, claros, actualizados, que cualquiera del equipo pueda mirar cuando los necesita. Ac\u00e1 la tecnolog\u00eda ayuda de verdad: un tablero simple al que todos accedan.",
      alto: "Excelente: la informaci\u00f3n es abierta. Es la base de todo lo dem\u00e1s. Cuid\u00e1 que se mantenga fresca y simple, porque informaci\u00f3n vieja o confusa vuelve a concentrar el poder sin querer.",
    },
  },
  // ---------------- TRANSVERSALES ----------------
  voz: {
    porQueImporta: "Si las personas sienten que su opini\u00f3n no cuenta, ninguna otra mejora se sostiene.",
    leyBeta: "\u00a71 Autonom\u00eda del equipo: quienes hacen el trabajo participan de las decisiones que los afectan.",
    palanca: "rediseno_organizacional",
    recomendacion: {
      bajo: "Hac\u00e9 que quienes hacen el trabajo participen de las decisiones que los afectan. No es asamble\u00edsmo: es que el que conoce el problema tenga lugar para decir lo que ve.",
      medio: "Se escucha, pero todav\u00eda no deciden. Dales lugar real en al menos una decisi\u00f3n que los afecte directamente, y que se vea que su opini\u00f3n cambi\u00f3 algo.",
      alto: "Muy bien: la gente siente que su voz cuenta. Es lo que sostiene todas las dem\u00e1s mejoras.",
    },
  },
  error: {
    porQueImporta: "Si cuando algo sale mal se busca al culpable, la gente esconde los problemas y el negocio deja de aprender.",
    leyBeta: "\u00a78 Claridad mental: el error es informaci\u00f3n, no amenaza.",
    palanca: "rediseno_organizacional",
    recomendacion: {
      bajo: "Trat\u00e1 el error como informaci\u00f3n, no como amenaza. Ante un problema, en vez de \u201c\u00bfqui\u00e9n fue?\u201d, pregunt\u00e1 cinco veces \u201c\u00bfpor qu\u00e9 pas\u00f3?\u201d hasta llegar a la causa de fondo.",
      medio: "Ya lo charlan, pero todav\u00eda con foco en que no se repita. Pas\u00e1 a verlo como aprendizaje compartido: qu\u00e9 nos ense\u00f1a este error sobre c\u00f3mo trabajamos.",
      alto: "Muy bien: el error se toma como aprendizaje y se habla abiertamente. Es lo que permite mejorar sin miedo.",
    },
  },
  mira_resultado: {
    porQueImporta: "Las metas fijas de principio de a\u00f1o suelen medir un mundo que ya cambi\u00f3.",
    leyBeta: "\u00a74 Transparencia de resultados y \u00a711 Desempe\u00f1o relativo: compararse consigo mismo y con pares, no con un n\u00famero fijo.",
    palanca: "acceso_informacion",
    recomendacion: {
      bajo: "Compar\u00e1 tu desempe\u00f1o con vos mismo (c\u00f3mo venimos esta semana o este mes contra el anterior) y con negocios parecidos, en vez de perseguir un n\u00famero que alguien fij\u00f3 hace meses. Pocos n\u00fameros, simples y actuales.",
      medio: "Ya mir\u00e1s algunos n\u00fameros. Hacelos peri\u00f3dicos y compar\u00e1 contra tu propia historia, no contra una meta fija. Que el equipo los vea tambi\u00e9n.",
      alto: "Muy bien: revis\u00e1s seguido y aprend\u00e9s sobre la marcha. As\u00ed se mejora de verdad.",
    },
  },
  rumbo: {
    porQueImporta: "Si el rumbo lo decide el due\u00f1o solo, en su cabeza, el equipo no lo hace propio.",
    leyBeta: "\u00a77 Gobernanza distribuida: la estrategia se construye y ajusta con quienes la ejecutan.",
    palanca: "rediseno_organizacional",
    recomendacion: {
      bajo: "Arm\u00e1 el rumbo entre varios y ajustalo sobre la marcha, sin grandes planes anuales que quedan viejos a los tres meses. La estrategia \u00fatil es la que se revisa seguido, no la que se guarda en un caj\u00f3n.",
      medio: "Ya lo charl\u00e1s con algunos. Ampli\u00e1 esa conversaci\u00f3n y conectala con el d\u00eda a d\u00eda, para que el rumbo no sea un documento sino algo que gu\u00eda decisiones reales.",
      alto: "Muy bien: el rumbo se arma entre varios y se ajusta sin burocracia. As\u00ed el equipo lo hace propio.",
    },
  },
};

// ============================= LECTURAS APARTE =============================

export interface ContenidoDimensionTec {
  recomendacion: Record<1 | 2 | 3 | 4, string>;
}

export const RECOMENDACIONES_TEC: Record<Exclude<DimensionTecId, "ia_uso" | "ia_alcance" | "ia_impacto">, ContenidoDimensionTec> = {
  digitalizacion: {
    recomendacion: {
      1: "Hoy llevás el negocio sobre todo en cabeza, papel y memoria. Eso te da intuición y agilidad, pero también te hace dependiente de vos. Un primer paso bajo: una planilla compartida de ventas y stock libera tiempo y deja registro.",
      2: "Tenés algo digitalizado pero sueltos. El próximo salto no es sumar herramientas, es decidir cuál es la fuente única de la verdad: ¿dónde está el dato real de stock, de ventas, de clientes?",
      3: "Estás bien digitalizado pero las herramientas no se hablan entre sí. La oportunidad ahora es la integración: que lo que vendés en redes baje el stock del sistema automáticamente, por ejemplo.",
      4: "Tenés una base sólida. Lo que sigue no es más tecnología, es usar mejor la que tenés: dashboards que mire todo el equipo, no solo el dueño.",
    },
  },
  datos_resguardo: {
    recomendacion: {
      1: "Estás expuesto: si algo se rompe, perdés información que vale dinero y tiempo. Es uno de los arreglos más rápidos y baratos: un backup automático a la nube cuesta menos que una cena.",
      2: "Tenés copias pero salteadas. El riesgo bajó pero no es cero. Pasar a automático elimina la dependencia de acordarse.",
      3: "Resguardo razonable. Conviene chequear cada tanto que la copia se pueda recuperar (no sirve un backup que no se restaura).",
      4: "Bien cubierto. Documentá dónde está cada cosa para que otros del equipo puedan recuperar si vos no estás.",
    },
  },
  datos_acceso: {
    recomendacion: {
      1: "Hoy cualquiera que se sienta en la compu ve todo. Esto no es solo un tema de seguridad: es un freno para crecer, porque cuando entra gente nueva no podés diferenciar qué le mostrás.",
      2: "Está todo en tu cabeza. Es seguro porque sos vos, pero es cuello de botella: nadie puede resolver sin pedirte.",
      3: "Buen criterio: cada uno ve lo que necesita. Para escalar, ayudaría documentar las reglas (qué rol ve qué cosa) en vez de decidirlo caso por caso.",
      4: "Gobierno de acceso maduro. Si crece el equipo, este es uno de los menos dolores de cabeza que vas a tener.",
    },
  },
};

export const RECOMENDACIONES_IA: Record<AIState, string> = {
  no_usan:   "No usar IA hoy no es un problema. Pero conviene mirarla de reojo: probar gratis ChatGPT con una tarea concreta (redactar un mail difícil, ordenar una lista, resumir un texto largo) te da idea de para qué sirve sin compromiso.",
  probaron:  "La probaron y no quedó. Pasa mucho — la IA rinde cuando se usa con una tarea repetitiva y concreta. Conviene volver a probar con un caso específico del negocio, no con curiosidad general.",
  puntual:   "Ya están sacándole valor en cosas puntuales. El próximo paso es compartir hallazgos: si una persona descubre un buen uso, que el equipo se entere y lo replique.",
  integrada: "Están adelantados en el ecosistema. La oportunidad ahora es documentar buenas prácticas — cómo usan IA sin reemplazar el criterio humano — y eventualmente mentorizar a otros del ecosistema.",
};

export const NIVEL_TEC_LABEL: Record<NivelTecnologia, string> = {
  punto_de_partida: "Punto de partida",
  en_camino:        "En camino",
  consolidado:      "Consolidado",
};

/** Mensaje de cierre cuando al negocio le fue bien en todo. */
export const MENSAJE_SOSTENIMIENTO =
  "Tu negocio est\u00e1 bien encaminado en casi todo. El foco ahora no es arreglar, sino sostener: cuid\u00e1 que la agilidad y la apertura no se pierdan a medida que crec\u00e9s o sum\u00e1s gente.";

/** Regla de oro de la devoluci\u00f3n (para mostrar al usuario o tener presente). */
export const REGLA_DE_ORO =
  "Nunca m\u00e1s de tres recomendaciones por vez. Mejor arrancar por una y hacerla, que recibir veinte y no hacer ninguna.";

/**
 * Helper de conveniencia: dado el resultado del motor, arma la lista de
 * recomendaciones con su TEXTO listo para mostrar.
 *
 * Uso:
 *   import { evaluar } from "./scoring";
 *   import { construirRecomendaciones } from "./recommendations";
 *   const r = evaluar(respuestas);
 *   const cards = construirRecomendaciones(r.recomendaciones);
 */
export interface RecomendacionConTexto {
  dimension: DimensionId;
  etiqueta: string;
  eje: Eje;
  nivel: Nivel;
  prioridad: number;
  esLlave: boolean;
  texto: string;
  porQueImporta: string;
  palanca: Palanca;
  palancaNombre: string;
}

export function construirRecomendaciones(
  disparadas: Array<{ dimension: DimensionId; etiqueta: string; eje: Eje; nivel: Nivel; prioridad: number; esLlave: boolean }>
): RecomendacionConTexto[] {
  return disparadas.map((d) => {
    const contenido = RECOMENDACIONES[d.dimension];
    return {
      dimension: d.dimension,
      etiqueta: d.etiqueta,
      eje: d.eje,
      nivel: d.nivel,
      prioridad: d.prioridad,
      esLlave: d.esLlave,
      texto: contenido.recomendacion[d.nivel],
      porQueImporta: contenido.porQueImporta,
      palanca: contenido.palanca,
      palancaNombre: PALANCAS[contenido.palanca].nombre,
    };
  });
}
