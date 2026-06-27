import { describe, it, expect } from "vitest";
import { DIMENSIONES } from "../questionnaire";
import {
  RECOMENDACIONES_EXPANDIDAS,
  getRecomendacionExpandida,
  pickTopBajas,
  PRINCIPIO_LABEL,
  type Principio,
} from "../recomendaciones-expandidas";

const ALL_DIMS = Object.keys(DIMENSIONES) as Array<keyof typeof DIMENSIONES>;

describe("RECOMENDACIONES_EXPANDIDAS — integridad de datos", () => {
  it("cubre las 10 dimensiones del IAO", () => {
    for (const dim of ALL_DIMS) {
      expect(RECOMENDACIONES_EXPANDIDAS[dim]).toBeDefined();
    }
  });

  it("cada dimensión tiene los campos obligatorios poblados", () => {
    for (const dim of ALL_DIMS) {
      const r = RECOMENDACIONES_EXPANDIDAS[dim];
      expect(r.senal.length, `senal de ${dim}`).toBeGreaterThan(50);
      expect(r.argumentoConceptual.length, `argumentoConceptual de ${dim}`).toBeGreaterThan(50);
      expect(r.costoCotidiano.length, `costoCotidiano de ${dim}`).toBeGreaterThan(50);
      expect(r.principiosConectados.length, `principios de ${dim}`).toBeGreaterThan(0);
      expect(r.comoMoverte.cliente.length, `lentes.cliente de ${dim}`).toBeGreaterThan(30);
      expect(r.comoMoverte.contexto.length, `lentes.contexto de ${dim}`).toBeGreaterThan(30);
      expect(r.comoMoverte.competitividad.length, `lentes.competitividad de ${dim}`).toBeGreaterThan(30);
    }
  });

  it("todos los principios mencionados son válidos", () => {
    const validos = new Set<Principio>(Object.keys(PRINCIPIO_LABEL) as Principio[]);
    for (const dim of ALL_DIMS) {
      const r = RECOMENDACIONES_EXPANDIDAS[dim];
      for (const p of r.principiosConectados) {
        expect(validos.has(p), `${dim} usa principio inválido: ${p}`).toBe(true);
      }
    }
  });

  it("desarmarIdea es opcional pero si está, tiene contenido", () => {
    for (const dim of ALL_DIMS) {
      const r = RECOMENDACIONES_EXPANDIDAS[dim];
      if (r.desarmarIdea !== undefined) {
        expect(r.desarmarIdea.length, `desarmarIdea de ${dim}`).toBeGreaterThan(50);
      }
    }
  });
});

describe("getRecomendacionExpandida", () => {
  it("devuelve la recomendación para una dimensión válida", () => {
    const r = getRecomendacionExpandida("velocidad_respuesta");
    expect(r).toBeDefined();
    expect(r.senal).toContain("algo cambia afuera");
  });
});

describe("pickTopBajas", () => {
  const baseDims = [
    { id: "velocidad_respuesta" as const, iao: 30, etiqueta: "Velocidad" },
    { id: "conversacion_sector" as const, iao: 45, etiqueta: "Escucha al cliente" },
    { id: "tiempo_innovacion" as const, iao: 75, etiqueta: "Innovación" }, // alto, no incluir
    { id: "estructura_valor" as const, iao: 20, etiqueta: "Estructura" },
    { id: "rumbo" as const, iao: 55, etiqueta: "Rumbo" }, // medio, no incluir
  ];

  it("solo devuelve dimensiones con score <= umbral", () => {
    const bajas = pickTopBajas(baseDims);
    const ids = bajas.map((b) => b.dimensionId);
    expect(ids).toContain("velocidad_respuesta");
    expect(ids).toContain("estructura_valor");
    expect(ids).toContain("conversacion_sector");
    expect(ids).not.toContain("tiempo_innovacion");
    expect(ids).not.toContain("rumbo");
  });

  it("las ordena por score ascendente (más crítica primero)", () => {
    const bajas = pickTopBajas(baseDims);
    expect(bajas[0].dimensionId).toBe("estructura_valor"); // 20
    expect(bajas[1].dimensionId).toBe("velocidad_respuesta"); // 30
    expect(bajas[2].dimensionId).toBe("conversacion_sector"); // 45
  });

  it("respeta el límite", () => {
    const top2 = pickTopBajas(baseDims, { limite: 2 });
    expect(top2.length).toBe(2);
    expect(top2[0].dimensionId).toBe("estructura_valor");
    expect(top2[1].dimensionId).toBe("velocidad_respuesta");
  });

  it("respeta umbral custom", () => {
    const muyBajas = pickTopBajas(baseDims, { umbral: 25 });
    expect(muyBajas.length).toBe(1);
    expect(muyBajas[0].dimensionId).toBe("estructura_valor");
  });

  it("incluye la recomendación expandida en cada resultado", () => {
    const bajas = pickTopBajas(baseDims);
    expect(bajas[0].recomendacion.senal).toBeDefined();
    expect(bajas[0].recomendacion.comoMoverte.cliente).toBeDefined();
  });
});
