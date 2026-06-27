import { describe, it, expect } from "vitest";
import { obtenerSugerencias } from "../sugerencias-engine";
import type { Evaluacion } from "@/types/evaluacion";

/**
 * Builder de evaluaciones para tests. Defaults razonables (perfil "alto en
 * todo") que cada test luego ajusta puntualmente.
 */
function evaluacion(overrides: Partial<Evaluacion> = {}): Evaluacion {
  return {
    id: "test-id",
    dimensiones: {
      velocidad_respuesta: 80,
      conversacion_sector: 80,
      tiempo_innovacion: 80,
      estructura_valor: 80,
      peso_jerarquia: 80,
      acceso_informacion: 80,
      voz: 80,
      error: 80,
      mira_resultado: 80,
      rumbo: 80,
    },
    lecturaTec: {
      nivel: "consolidado",
      porDimension: { digitalizacion: 4, datos_resguardo: 4, datos_acceso: 4 },
    },
    lecturaIA: { estado: "integrada" },
    q16Inventario: ["erp", "web", "facturacion", "redes"],
    ...overrides,
  };
}

describe("sugerencias-engine", () => {
  it("PyME con acceso_informacion bajo: ve cloud, backup y ERP", () => {
    const ev = evaluacion({
      dimensiones: { ...evaluacion().dimensiones, acceso_informacion: 30 },
      q16Inventario: [], // sin ERP también
    });
    const { tecnologia } = obtenerSugerencias(ev);
    const ids = tecnologia.map((s) => s.producto.id);
    expect(ids).toContain("antel-cloud-pyme");
    expect(ids).toContain("antel-backup-ciberseguridad");
    expect(ids).toContain("antel-erp-pyme");
  });

  it("PyME con estadoIA = 'integrada': ve OC Companion con copy de 'integrada'", () => {
    const ev = evaluacion({ lecturaIA: { estado: "integrada" } });
    const { adopcionIA } = obtenerSugerencias(ev);
    expect(adopcionIA).toHaveLength(1);
    expect(adopcionIA[0].producto.id).toBe("adaptant-oc-companion");
    expect(adopcionIA[0].porQueMostrado).toMatch(/ya es parte del trabajo/i);
    expect(adopcionIA[0].senalDisparadora).toBe("ia_integrada");
  });

  it("PyME con estadoIA = 'no_usan': ve OC Companion con copy de 'no_usan'", () => {
    const ev = evaluacion({ lecturaIA: { estado: "no_usan" } });
    const { adopcionIA } = obtenerSugerencias(ev);
    expect(adopcionIA[0].porQueMostrado).toMatch(/todavía no usan IA/i);
  });

  it("PyME con tec consolidado e IA puntual: ve datacenter, no presencia digital", () => {
    const ev = evaluacion({
      lecturaTec: {
        nivel: "consolidado",
        porDimension: { digitalizacion: 4, datos_resguardo: 4, datos_acceso: 4 },
      },
      lecturaIA: { estado: "puntual" },
      q16Inventario: ["erp", "web", "facturacion", "redes", "planillas"],
    });
    const { tecnologia } = obtenerSugerencias(ev);
    const ids = tecnologia.map((s) => s.producto.id);
    expect(ids).toContain("antel-datacenter");
    expect(ids).not.toContain("antel-presencia-digital");
  });

  it("PyME con todo alto y todas las herramientas: Sección B siempre tiene OC Companion", () => {
    const ev = evaluacion();
    const { adopcionIA } = obtenerSugerencias(ev);
    expect(adopcionIA.length).toBeGreaterThanOrEqual(1);
    expect(adopcionIA.some((s) => s.producto.id === "adaptant-oc-companion")).toBe(true);
  });

  it("PyME con todo alto: Sección A garantiza mínimo 2 tarjetas vía fallback", () => {
    const ev = evaluacion();
    const { tecnologia } = obtenerSugerencias(ev);
    expect(tecnologia.length).toBeGreaterThanOrEqual(2);
  });

  it("Backup dispara por datos_resguardo bajo, no por inventario", () => {
    const ev = evaluacion({
      lecturaTec: {
        nivel: "en_camino",
        porDimension: { digitalizacion: 3, datos_resguardo: 1, datos_acceso: 3 },
      },
    });
    const { tecnologia } = obtenerSugerencias(ev);
    const backup = tecnologia.find((s) => s.producto.id === "antel-backup-ciberseguridad");
    expect(backup).toBeDefined();
    expect(backup!.senalDisparadora).toBe("tec_datos_resguardo_bajo");
    expect(backup!.porQueMostrado).toMatch(/backup/i);
  });

  it("Presencia digital dispara cuando 'web' está ausente y tec es bajo", () => {
    const ev = evaluacion({
      lecturaTec: {
        nivel: "punto_de_partida",
        porDimension: { digitalizacion: 1, datos_resguardo: 2, datos_acceso: 2 },
      },
      q16Inventario: ["whatsapp", "papel"], // sin 'web'
    });
    const { tecnologia } = obtenerSugerencias(ev);
    const ids = tecnologia.map((s) => s.producto.id);
    expect(ids).toContain("antel-presencia-digital");
  });

  it("Prioriza dimensión IAO sobre nivel tec en la señal", () => {
    // Conectividad matchea por velocidad_respuesta baja Y por nivelTec partida.
    // La señal debería ser velocidad_respuesta_bajo (prioridad 1).
    const ev = evaluacion({
      dimensiones: { ...evaluacion().dimensiones, velocidad_respuesta: 20 },
      lecturaTec: {
        nivel: "punto_de_partida",
        porDimension: { digitalizacion: 1, datos_resguardo: 1, datos_acceso: 1 },
      },
    });
    const { tecnologia } = obtenerSugerencias(ev);
    const conectividad = tecnologia.find((s) => s.producto.id === "antel-conectividad-pyme");
    expect(conectividad).toBeDefined();
    expect(conectividad!.senalDisparadora).toBe("velocidad_respuesta_bajo");
  });
});
