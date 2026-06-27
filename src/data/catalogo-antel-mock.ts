/**
 * Catálogo simulado de productos ANTEL + Adaptant.
 *
 * Este archivo es el ÚNICO punto a editar cuando ANTEL pase el catálogo real.
 * La lógica de matching (sugerencias-engine.ts) no debe cambiar.
 *
 * Convenciones — adaptadas al schema real del repo (no del SPEC):
 * - `nivelTec` usa "punto_de_partida" | "en_camino" | "consolidado"
 *   (el SPEC original usaba alias cortos, pero el código persiste estos).
 * - `estadoIA` usa "no_usan" | "probaron" | "puntual" | "integrada".
 * - `herramientasAusentes/Presentes` usan los IDs reales de Q16: papel,
 *   whatsapp, planillas, facturacion, erp, web, redes, turnos, otra.
 *   "web" en el SPEC original aparece como "sitio_web" — lo unifico acá.
 * - El "backup" no es una herramienta Q16; lo represento como una señal de
 *   tec dimension "datos_resguardo" baja (score <= 2).
 */

import type { DimensionId, NivelTecnologia, AIState } from "@/lib/oc-engine/scoring";

export type TecDimensionId = "digitalizacion" | "datos_resguardo" | "datos_acceso";

export interface MatchingRules {
  /** Dimensiones IAO con score <= umbral (0-100). */
  dimensionesBajas?: Array<{ dimension: DimensionId; umbral: number }>;
  /** Dimensiones tec con score <= umbral (1-4). */
  dimensionesTecBajas?: Array<{ dimension: TecDimensionId; umbral: number }>;
  /** Niveles de la lectura tec que disparan la sugerencia. */
  nivelTec?: NivelTecnologia[];
  /** Estados de IA que disparan la sugerencia. */
  estadoIA?: AIState[];
  /** Herramientas Q16 que NO están en el inventario (ausentes) y disparan. */
  herramientasAusentes?: string[];
  /** Herramientas Q16 PRESENTES en el inventario que disparan (complementarias). */
  herramientasPresentes?: string[];
  /** Rubros donde aplica (vacío = todos). */
  rubros?: string[];
  /** Tamaños donde aplica (vacío = todos). */
  tamanos?: string[];
}

export interface PorQueCopy {
  dimensionBaja?: Partial<Record<DimensionId, string>>;
  dimensionTecBaja?: Partial<Record<TecDimensionId, string>>;
  nivelTecPuntoDePartida?: string;
  nivelTecEnCamino?: string;
  nivelTecConsolidado?: string;
  estadoIA?: Partial<Record<AIState, string>>;
  herramientaAusente?: Record<string, string>;
  default: string;
}

export interface ProductoCatalogo {
  id: string;
  seccion: "tecnologia" | "adopcion_ia";
  titulo: string;
  descripcion: string;
  proveedor: "ANTEL" | "Adaptant";
  matching: MatchingRules;
  porQue: PorQueCopy;
}

/**
 * Catálogo mock — 8 productos.
 *
 * Cuando ANTEL pase el catálogo real, reemplazar este array manteniendo
 * la estructura. El motor de matching (sugerencias-engine.ts) no necesita
 * cambios; respeta el orden de prioridad del SPEC §4.
 */
export const catalogoMock: ProductoCatalogo[] = [
  // ─── Sección A · Tecnología y conectividad (ANTEL) ──────────────────────
  {
    id: "antel-conectividad-pyme",
    seccion: "tecnologia",
    titulo: "Conectividad PyME confiable",
    descripcion:
      "Internet de fibra con SLA pensado para negocios chicos. Para que la conexión no sea el cuello de botella cuando hay que responder rápido.",
    proveedor: "ANTEL",
    matching: {
      dimensionesBajas: [{ dimension: "velocidad_respuesta", umbral: 50 }],
      nivelTec: ["punto_de_partida"],
    },
    porQue: {
      dimensionBaja: {
        velocidad_respuesta:
          "Tu lectura mostró que reaccionar rápido a cambios externos es un punto a fortalecer. Una conectividad confiable es la base para no perder ventanas de oportunidad.",
      },
      nivelTecPuntoDePartida:
        "Tu pulso tecnológico está en etapa inicial. Conectividad estable es el primer ladrillo.",
      default: "Conectividad confiable como base operativa.",
    },
  },
  {
    id: "antel-cloud-pyme",
    seccion: "tecnologia",
    titulo: "Cloud PyME (almacenamiento + colaboración)",
    descripcion:
      "Que los archivos del negocio no vivan solo en una computadora ni en la cabeza del dueño. Acceso compartido, respaldo automático, control de quién ve qué.",
    proveedor: "ANTEL",
    matching: {
      dimensionesBajas: [
        { dimension: "estructura_valor", umbral: 50 },
        { dimension: "acceso_informacion", umbral: 50 },
      ],
      herramientasAusentes: ["erp"],
    },
    porQue: {
      dimensionBaja: {
        estructura_valor:
          "Tu lectura mostró dependencia del dueño en la operación. Sacar información clave a la nube es un paso para que el negocio funcione sin esa concentración.",
        acceso_informacion:
          "Tu lectura mostró que el acceso a información del negocio está limitado. Cloud permite que la información viva en un lugar y se comparta con criterio.",
      },
      default: "La información del negocio puede dejar de estar atada a una sola computadora.",
    },
  },
  {
    id: "antel-backup-ciberseguridad",
    seccion: "tecnologia",
    titulo: "Backup y ciberseguridad básica",
    descripcion:
      "Resguardo automático de los datos del negocio y protección contra los incidentes más comunes. Lo mínimo para que un problema no te cueste la operación.",
    proveedor: "ANTEL",
    matching: {
      // "backup ausente" se representa como tec dimensión datos_resguardo baja.
      dimensionesTecBajas: [{ dimension: "datos_resguardo", umbral: 2 }],
      dimensionesBajas: [{ dimension: "acceso_informacion", umbral: 50 }],
    },
    porQue: {
      dimensionTecBaja: {
        datos_resguardo:
          "Tu lectura mostró que si la computadora principal falla, la información del negocio queda en riesgo. Backup es la respuesta más simple a ese problema.",
      },
      default:
        "Tu lectura mostró que el resguardo de datos puede sistematizarse. Backup automático cubre lo básico.",
    },
  },
  {
    id: "antel-comunicaciones-unificadas",
    seccion: "tecnologia",
    titulo: "Comunicaciones unificadas (UC)",
    descripcion:
      "Teléfono, WhatsApp Business, video, chat —todo en un mismo lugar y conectado al negocio. Para que escuchar al cliente no dependa de quién agarró el celular.",
    proveedor: "ANTEL",
    matching: {
      dimensionesBajas: [
        { dimension: "conversacion_sector", umbral: 50 },
        { dimension: "velocidad_respuesta", umbral: 50 },
      ],
    },
    porQue: {
      dimensionBaja: {
        conversacion_sector:
          "Tu lectura mostró que la escucha al cliente puede sistematizarse. Centralizar los canales de comunicación es un paso.",
        velocidad_respuesta:
          "Cuando todos los canales viven en un lugar, los tiempos de respuesta bajan.",
      },
      default: "Centralizar los canales de comunicación con clientes.",
    },
  },
  {
    id: "antel-erp-pyme",
    seccion: "tecnologia",
    titulo: "ERP PyME (gestión integral)",
    descripcion:
      "Stock, facturación, compras, ventas, caja —todo conectado en un solo sistema. Para que los números del negocio existan y se puedan mirar.",
    proveedor: "ANTEL",
    matching: {
      dimensionesBajas: [
        { dimension: "acceso_informacion", umbral: 50 },
        { dimension: "mira_resultado", umbral: 50 },
      ],
      herramientasAusentes: ["erp"],
    },
    porQue: {
      dimensionBaja: {
        mira_resultado:
          "Tu lectura mostró que la mejora del negocio se sostiene con métricas todavía informales. Un ERP da la base para empezar a medir.",
      },
      herramientaAusente: {
        erp: "Tu inventario mostró que todavía no usan un ERP. Es el paso natural cuando los Excel sueltos empiezan a no alcanzar.",
      },
      default: "Para que la información del negocio deje de vivir en Excel sueltos.",
    },
  },
  {
    id: "antel-presencia-digital",
    seccion: "tecnologia",
    titulo: "Presencia digital (web + dominio + email)",
    descripcion:
      "Sitio web profesional, dominio propio y email corporativo. La cara digital mínima para un negocio que quiere ser encontrado.",
    proveedor: "ANTEL",
    matching: {
      herramientasAusentes: ["web"],
      nivelTec: ["punto_de_partida", "en_camino"],
    },
    porQue: {
      herramientaAusente: {
        web: "Tu inventario mostró que el negocio todavía no tiene presencia digital propia. Es uno de los pasos con mejor relación esfuerzo/impacto.",
      },
      default:
        "Una presencia digital propia (web + email del dominio) suele ser uno de los pasos más rentables al inicio.",
    },
  },
  {
    id: "antel-datacenter",
    seccion: "tecnologia",
    titulo: "Datacenter ANTEL (infraestructura empresarial)",
    descripcion:
      "Servidores, redes, virtualización con respaldo de ANTEL. Para PyMEs que ya tienen herramientas digitales y necesitan una base más robusta.",
    proveedor: "ANTEL",
    matching: {
      nivelTec: ["consolidado"],
      estadoIA: ["puntual", "integrada"],
    },
    porQue: {
      nivelTecConsolidado:
        "Tu pulso tecnológico es maduro. El próximo paso suele ser infraestructura empresarial que acompañe el crecimiento.",
      default: "Infraestructura empresarial para PyMEs con base tecnológica consolidada.",
    },
  },

  // ─── Sección B · Adopción de IA (Adaptant / OC Companion) ───────────────
  {
    id: "adaptant-oc-companion",
    seccion: "adopcion_ia",
    titulo: "OC Companion — Incorporar IA partiendo de cómo trabaja tu negocio",
    descripcion:
      "Un acompañamiento para adoptar inteligencia artificial sin frankensteinear el negocio. La IA se acopla a cómo ya trabajan, no al revés. Diseñado por Adaptant, ofrecido junto a ANTEL.",
    proveedor: "Adaptant",
    matching: {
      // Se muestra a TODOS los estados de IA, con copy distinto por estado.
      estadoIA: ["no_usan", "probaron", "puntual", "integrada"],
    },
    porQue: {
      estadoIA: {
        no_usan:
          "Tu lectura mostró que todavía no usan IA. Eso no es bueno ni malo. Si te interesa explorar el tema sin sumar herramientas sueltas, este es un camino.",
        probaron:
          "Probaron IA pero todavía no se integró al trabajo. Hay una forma de hacerlo sin que quede como prueba aislada.",
        puntual:
          "Algunas personas ya usan IA por su cuenta. El siguiente paso suele ser hacer que esa adopción sirva al negocio entero.",
        integrada:
          "La IA ya es parte del trabajo. Acá hay espacio para llevarla al siguiente nivel: que la IA aprenda del negocio, no al revés.",
      },
      default: "Una forma de incorporar IA que parte de cómo ya trabaja tu negocio.",
    },
  },
];
