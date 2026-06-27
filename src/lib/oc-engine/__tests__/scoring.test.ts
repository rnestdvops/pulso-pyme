/**
 * Tests del motor de scoring — IAO, TechnologyReading y AIReading.
 *
 * Invariante clave: computeIAO (implementado como `evaluar` + `calcularIAO`)
 * NO SE MODIFICA. Estos tests garantizan que cualquier cambio futuro que lo
 * toque se detecte de inmediato.
 */

import { describe, it, expect } from "vitest";
import {
  calcularIAO,
  clasificarNivel,
  evaluar,
  elegirRecomendaciones,
  PARAMS,
  computeTechnologyReading,
  computeAIReading,
  type Respuestas,
  type RespuestasTec,
} from "../scoring";
import { PREGUNTAS } from "../questionnaire";

// ─── helpers ────────────────────────────────────────────────────────────────

function todasEn(puntaje: 1 | 2 | 3 | 4): Respuestas {
  return Object.fromEntries(PREGUNTAS.map((q) => [q.numero, puntaje])) as Respuestas;
}

// ─── calcularIAO ──────────────────────────────────────────────────────────────

describe("calcularIAO — casos base", () => {
  it("array vacío → 0", () => {
    expect(calcularIAO([])).toBe(0);
  });

  it("un solo puntaje 4 → 100", () => {
    expect(calcularIAO([4])).toBe(100);
  });

  it("un solo puntaje 1 → 0 (con penalización + piso)", () => {
    const geo = Math.exp(Math.log(PARAMS.PISO));
    const fAcum = 1 - PARAMS.K * Math.pow(1, PARAMS.P);
    expect(calcularIAO([1])).toBe(Math.round(100 * geo * fAcum));
  });

  it("todos 4 (15 preg) → 100", () => {
    expect(calcularIAO(Array(15).fill(4))).toBe(100);
  });

  it("todos 1 (15 preg) → valor calculable, < 40", () => {
    const r = calcularIAO(Array(15).fill(1));
    expect(r).toBeGreaterThanOrEqual(0);
    expect(r).toBeLessThan(40);
  });

  it("todos 3 → nivel medio (40..69)", () => {
    const r = calcularIAO(Array(15).fill(3));
    expect(r).toBeGreaterThanOrEqual(40);
    expect(r).toBeLessThan(70);
  });

  it("mezcla simétrica 1 y 4 → menor que solo 4", () => {
    const solo4 = calcularIAO(Array(4).fill(4));
    const mixto = calcularIAO([1, 4, 1, 4]);
    expect(mixto).toBeLessThan(solo4);
  });

  it("es determinístico: mismo input, mismo output", () => {
    const ps = [1, 2, 3, 4, 2, 3, 1, 4, 3, 2, 1, 4, 3, 2, 1];
    expect(calcularIAO(ps)).toBe(calcularIAO(ps));
  });

  it("no supera 100", () => {
    expect(calcularIAO(Array(15).fill(4))).toBeLessThanOrEqual(100);
  });

  it("no es negativo", () => {
    expect(calcularIAO(Array(15).fill(1))).toBeGreaterThanOrEqual(0);
  });

  it("media geométrica: puntaje único 2 → resultado > 0 y < 100", () => {
    const r = calcularIAO([2]);
    expect(r).toBeGreaterThan(0);
    expect(r).toBeLessThan(100);
  });

  it("penalización crece con más críticos: 2 críticos < 1 crítico (mismo n)", () => {
    const un_critico = calcularIAO([1, 4, 4, 4]);
    const dos_criticos = calcularIAO([1, 1, 4, 4]);
    expect(dos_criticos).toBeLessThan(un_critico);
  });

  it("penalización crece con más críticos: 3 críticos < 2 críticos", () => {
    const dos = calcularIAO([1, 1, 4, 4]);
    const tres = calcularIAO([1, 1, 1, 4]);
    expect(tres).toBeLessThan(dos);
  });

  it("UMBRAL_CRITICA=2: puntaje 2 cuenta como crítico", () => {
    const con2 = calcularIAO([2, 4, 4, 4]);
    const con3 = calcularIAO([3, 4, 4, 4]);
    expect(con2).toBeLessThan(con3);
  });

  it("resultado es entero (Math.round)", () => {
    const r = calcularIAO([1, 2, 3, 4, 2]);
    expect(Number.isInteger(r)).toBe(true);
  });
});

// ─── clasificarNivel ─────────────────────────────────────────────────────────

describe("clasificarNivel", () => {
  it("0 → bajo", () => expect(clasificarNivel(0)).toBe("bajo"));
  it("39 → bajo", () => expect(clasificarNivel(39)).toBe("bajo"));
  it("40 → medio", () => expect(clasificarNivel(40)).toBe("medio"));
  it("69 → medio", () => expect(clasificarNivel(69)).toBe("medio"));
  it("70 → alto", () => expect(clasificarNivel(70)).toBe("alto"));
  it("100 → alto", () => expect(clasificarNivel(100)).toBe("alto"));
});

// ─── evaluar — integridad ────────────────────────────────────────────────────

describe("evaluar — estructura de resultado", () => {
  it("respuestas completas → completo=true", () => {
    const r = evaluar(todasEn(4));
    expect(r.completo).toBe(true);
  });

  it("respuestas vacías → completo=false", () => {
    const r = evaluar({} as Respuestas);
    expect(r.completo).toBe(false);
  });

  it("respuestas parciales → completo=false", () => {
    const r = evaluar({ 1: 3, 2: 2 } as Respuestas);
    expect(r.completo).toBe(false);
  });

  it("iaoGeneral en 0..100", () => {
    const r = evaluar(todasEn(3));
    expect(r.iaoGeneral).toBeGreaterThanOrEqual(0);
    expect(r.iaoGeneral).toBeLessThanOrEqual(100);
  });

  it("ejes externo e interno presentes", () => {
    const r = evaluar(todasEn(4));
    expect(r.ejes.externo).toBeDefined();
    expect(r.ejes.interno).toBeDefined();
  });

  it("dimensiones es array no vacío cuando hay respuestas", () => {
    const r = evaluar(todasEn(3));
    expect(r.dimensiones.length).toBeGreaterThan(0);
  });

  it("dimensiones ordenadas por iao ascendente", () => {
    const r = evaluar(todasEn(2));
    for (let i = 1; i < r.dimensiones.length; i++) {
      expect(r.dimensiones[i].iao).toBeGreaterThanOrEqual(r.dimensiones[i - 1].iao);
    }
  });

  it("rangoTexto con rango y diagnostico", () => {
    const r = evaluar(todasEn(4));
    expect(r.rangoTexto.rango).toBeTruthy();
    expect(r.rangoTexto.diagnostico).toBeTruthy();
  });

  it("todos en 4 → nivelGeneral alto", () => {
    expect(evaluar(todasEn(4)).nivelGeneral).toBe("alto");
  });

  it("todos en 1 → nivelGeneral bajo", () => {
    expect(evaluar(todasEn(1)).nivelGeneral).toBe("bajo");
  });

  it("todos en 3 → nivel medio o alto", () => {
    const nivel = evaluar(todasEn(3)).nivelGeneral;
    expect(["medio", "alto"]).toContain(nivel);
  });

  it("perfilEjes presente y tiene un valor de los definidos", () => {
    const r = evaluar(todasEn(2));
    expect([
      "externo_alto_interno_bajo",
      "externo_bajo_interno_alto",
      "ambos_bajos",
      "ambos_altos",
      "mixto",
    ]).toContain(r.perfilEjes);
  });

  it("recomendaciones: entre 1 y 3", () => {
    const r = evaluar(todasEn(2));
    expect(r.recomendaciones.length).toBeGreaterThanOrEqual(1);
    expect(r.recomendaciones.length).toBeLessThanOrEqual(3);
  });

  it("es puro: mismo input → mismo output", () => {
    const r1 = evaluar(todasEn(2));
    const r2 = evaluar(todasEn(2));
    expect(r1.iaoGeneral).toBe(r2.iaoGeneral);
    expect(r1.nivelGeneral).toBe(r2.nivelGeneral);
  });
});

// ─── evaluar — IAO por eje ────────────────────────────────────────────────────

describe("evaluar — ejes", () => {
  it("todos en 4 → ambos ejes con iao=100", () => {
    const r = evaluar(todasEn(4));
    expect(r.ejes.externo.iao).toBe(100);
    expect(r.ejes.interno.iao).toBe(100);
  });

  it("todos en 4 → perfilEjes ambos_altos", () => {
    const r = evaluar(todasEn(4));
    expect(r.perfilEjes).toBe("ambos_altos");
  });

  it("todos en 1 → perfilEjes ambos_bajos", () => {
    const r = evaluar(todasEn(1));
    expect(r.perfilEjes).toBe("ambos_bajos");
  });

  it("externo alto, interno bajo → perfil externo_alto_interno_bajo", () => {
    const resp = { ...todasEn(1) };
    // Preguntas externas: 1,2,3,4,5 → puntaje 4
    [1, 2, 3, 4, 5].forEach((n) => { (resp as Record<number, number>)[n] = 4; });
    const r = evaluar(resp);
    expect(r.perfilEjes).toBe("externo_alto_interno_bajo");
  });
});

// ─── elegirRecomendaciones ────────────────────────────────────────────────────

describe("elegirRecomendaciones", () => {
  it("si acceso_informacion es bajo, va primera con esLlave=true", () => {
    const r = evaluar(todasEn(1));
    const llave = r.recomendaciones.find((rec) => rec.esLlave);
    expect(llave).toBeDefined();
    expect(llave!.dimension).toBe("acceso_informacion");
    expect(llave!.prioridad).toBe(1);
  });

  it("no más de 3 recomendaciones", () => {
    const r = evaluar(todasEn(1));
    expect(r.recomendaciones.length).toBeLessThanOrEqual(3);
  });

  it("todo alto → sin esLlave (sostenimiento)", () => {
    const r = evaluar(todasEn(4));
    const llave = r.recomendaciones.find((rec) => rec.esLlave);
    expect(llave).toBeUndefined();
  });

  it("prioridades únicas y en orden", () => {
    const r = evaluar(todasEn(2));
    const priors = r.recomendaciones.map((rec) => rec.prioridad);
    const unique = new Set(priors);
    expect(unique.size).toBe(priors.length);
    for (let i = 1; i < priors.length; i++) {
      expect(priors[i]).toBeGreaterThan(priors[i - 1]);
    }
  });
});

// ─── computeTechnologyReading ────────────────────────────────────────────────

describe("computeTechnologyReading", () => {
  it("las 3 en 1 → puntaje 0, nivel punto_de_partida", () => {
    const r = computeTechnologyReading({
      digitalizacion: 1,
      datos_resguardo: 1,
      datos_acceso: 1,
    });
    expect(r.puntaje).toBe(0);
    expect(r.nivel).toBe("punto_de_partida");
  });

  it("las 3 en 4 → puntaje 100, nivel consolidado", () => {
    const r = computeTechnologyReading({
      digitalizacion: 4,
      datos_resguardo: 4,
      datos_acceso: 4,
    });
    expect(r.puntaje).toBe(100);
    expect(r.nivel).toBe("consolidado");
  });

  it("mezcla: 1+4+4 → puntaje entre 0 y 100", () => {
    const r = computeTechnologyReading({
      digitalizacion: 1,
      datos_resguardo: 4,
      datos_acceso: 4,
    });
    expect(r.puntaje).toBeGreaterThan(0);
    expect(r.puntaje).toBeLessThan(100);
  });

  it("promedio exacto: 1+3+2 → ((2/3)-0)/1 × 100 = 44", () => {
    const r = computeTechnologyReading({
      digitalizacion: 1,
      datos_resguardo: 3,
      datos_acceso: 2,
    });
    // promedio = (1+3+2)/3 = 2; normalizado = (2-1)/3 × 100 = 33
    expect(r.puntaje).toBe(33);
  });

  it("nivel en_camino cuando puntaje 40..69", () => {
    const r = computeTechnologyReading({
      digitalizacion: 2,
      datos_resguardo: 3,
      datos_acceso: 3,
    });
    expect(["en_camino", "punto_de_partida", "consolidado"]).toContain(r.nivel);
    // promedio = (2+3+3)/3 ≈ 2.67; normalizado ≈ 55 → en_camino
    expect(r.nivel).toBe("en_camino");
  });

  it("porDimension preserva los valores", () => {
    const r = computeTechnologyReading({
      digitalizacion: 2,
      datos_resguardo: 4,
      datos_acceso: 3,
    });
    expect(r.porDimension.digitalizacion).toBe(2);
    expect(r.porDimension.datos_resguardo).toBe(4);
    expect(r.porDimension.datos_acceso).toBe(3);
  });

  it("sin respuestas de technology (solo IAO) → no crashea, puntaje 0", () => {
    const r = computeTechnologyReading({} as RespuestasTec);
    expect(r.puntaje).toBe(0);
  });

  it("solo dimensiones externas/internas pasadas → puntaje 0 (no hay tec)", () => {
    const r = computeTechnologyReading({} as RespuestasTec);
    expect(r.nivel).toBe("punto_de_partida");
  });

  it("todas en 2 → nivel punto_de_partida", () => {
    const r = computeTechnologyReading({
      digitalizacion: 2,
      datos_resguardo: 2,
      datos_acceso: 2,
    });
    // promedio=2; normalizado=(2-1)/3×100=33 → punto_de_partida (<40)
    expect(r.nivel).toBe("punto_de_partida");
  });

  it("todas en 3 → nivel en_camino", () => {
    const r = computeTechnologyReading({
      digitalizacion: 3,
      datos_resguardo: 3,
      datos_acceso: 3,
    });
    // promedio=3; normalizado=(3-1)/3×100=67 → en_camino
    expect(r.nivel).toBe("en_camino");
  });

  it("resultado entero", () => {
    const r = computeTechnologyReading({ digitalizacion: 2, datos_resguardo: 3, datos_acceso: 4 });
    expect(Number.isInteger(r.puntaje)).toBe(true);
  });
});

// ─── computeAIReading ────────────────────────────────────────────────────────

describe("computeAIReading", () => {
  it("Q20=1 → estado no_usan independientemente de Q21/Q22", () => {
    const r = computeAIReading({ ia_uso: 1, ia_alcance: 4, ia_impacto: 4 });
    expect(r.estado).toBe("no_usan");
  });

  it("Q20=2 → estado probaron", () => {
    const r = computeAIReading({ ia_uso: 2 });
    expect(r.estado).toBe("probaron");
  });

  it("Q20=3 → estado puntual", () => {
    const r = computeAIReading({ ia_uso: 3 });
    expect(r.estado).toBe("puntual");
  });

  it("Q20=4 → estado integrada", () => {
    const r = computeAIReading({ ia_uso: 4 });
    expect(r.estado).toBe("integrada");
  });

  it("sin Q20 → default no_usan", () => {
    const r = computeAIReading({});
    expect(r.estado).toBe("no_usan");
  });

  it("estadoLabel no vacío", () => {
    expect(computeAIReading({ ia_uso: 4 }).estadoLabel).toBeTruthy();
    expect(computeAIReading({ ia_uso: 1 }).estadoLabel).toBeTruthy();
  });

  it("detalleAlcance se preserva", () => {
    const r = computeAIReading({ ia_uso: 3, ia_alcance: 2, ia_impacto: 4 });
    expect(r.detalleAlcance).toBe(2);
  });

  it("detalleImpacto se preserva", () => {
    const r = computeAIReading({ ia_uso: 3, ia_alcance: 2, ia_impacto: 4 });
    expect(r.detalleImpacto).toBe(4);
  });

  it("Q20=1 con Q21=4 → detalleAlcance=4 igualmente", () => {
    const r = computeAIReading({ ia_uso: 1, ia_alcance: 4, ia_impacto: 3 });
    expect(r.estado).toBe("no_usan");
    expect(r.detalleAlcance).toBe(4);
  });

  it("sin Q21/Q22 → detalleAlcance y detalleImpacto undefined", () => {
    const r = computeAIReading({ ia_uso: 3 });
    expect(r.detalleAlcance).toBeUndefined();
    expect(r.detalleImpacto).toBeUndefined();
  });
});
