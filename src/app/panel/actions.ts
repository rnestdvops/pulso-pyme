"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/utils/supabase/admin";

// ──────────────────────────────────────────────────────────────────────────
// Auth helper — valida la password operador contra OPERADOR_PASSWORD
// (env var server-only, sin prefijo NEXT_PUBLIC_).
//
// Si no está configurada en server, hay un fallback hardcodeado igual al del
// gate de UI (pulso-uy-2026) para que el panel siga funcionando sin
// configuración. Esto NO debilita la seguridad respecto a la versión
// client-only: en ambos casos el password vive en algún lado del bundle/server.
// Para subir el listón en futuro, ANTEL setea OPERADOR_PASSWORD con un valor
// fuerte y elimina el fallback acá.
// ──────────────────────────────────────────────────────────────────────────

const PASSWORD_FALLBACK = "pulso-uy-2026";

function isValidPassword(password: string | null | undefined): boolean {
  if (!password) return false;
  const expected = process.env.OPERADOR_PASSWORD || PASSWORD_FALLBACK;
  return password === expected;
}

// ──────────────────────────────────────────────────────────────────────────
// Public types for client consumption
// ──────────────────────────────────────────────────────────────────────────

export interface ContactRequestRow {
  id: string;
  created_at: string;
  nombre: string;
  empresa: string;
  email: string;
  telefono: string | null;
  productos_interes: string[];
  mensaje: string | null;
  evaluacion_id_compartida: string | null;
  estado: "nuevo" | "contactado" | "en_conversacion" | "cerrado";
  notas_internas: string | null;
}

export interface KpisFunnel {
  totalEvaluaciones: number;
  totalVistas: number;
  totalContactos: number;
  totalConDiagnosticoCompartido: number;
  porcVistasVsEvals: number;
  porcContactosVsVistas: number;
  porcCompartidoVsContactos: number;
}

export interface TopProductoSugerido {
  productoId: string;
  vecesMostrado: number;
  vecesElegido: number;
}

// ──────────────────────────────────────────────────────────────────────────
// validatePanelPassword — endpoint específico para login server-side
//
// Útil si en el futuro queremos cookies firmadas. Por ahora solo confirma OK.
// ──────────────────────────────────────────────────────────────────────────

export async function validatePanelPassword(password: string): Promise<{ ok: boolean }> {
  return { ok: isValidPassword(password) };
}

// ──────────────────────────────────────────────────────────────────────────
// listContactRequests — devuelve las solicitudes de contacto
//
// Auth: password requerida en cada call (sin cookie todavía). Si falla,
// devuelve array vacío con error.
// ──────────────────────────────────────────────────────────────────────────

export async function listContactRequests(
  password: string,
): Promise<{ ok: true; rows: ContactRequestRow[] } | { ok: false; error: string }> {
  if (!isValidPassword(password)) {
    return { ok: false, error: "Acceso denegado" };
  }

  try {
    const { data, error } = await supabaseAdmin()
      .from("contact_requests")
      .select(
        "id, created_at, nombre, empresa, email, telefono, productos_interes, mensaje, evaluacion_id_compartida, estado, notas_internas",
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[listContactRequests] error:", error.message);
      return { ok: false, error: error.message };
    }

    return { ok: true, rows: (data ?? []) as ContactRequestRow[] };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    return { ok: false, error: message };
  }
}

// ──────────────────────────────────────────────────────────────────────────
// kpisFunnel — agregados para el bloque KPIs del panel
// ──────────────────────────────────────────────────────────────────────────

export async function kpisFunnel(
  password: string,
): Promise<{ ok: true; kpis: KpisFunnel } | { ok: false; error: string }> {
  if (!isValidPassword(password)) {
    return { ok: false, error: "Acceso denegado" };
  }

  try {
    const admin = supabaseAdmin();

    // Conteos individuales — head:true devuelve solo count
    const [evals, vistas, contactos, compartidos] = await Promise.all([
      admin.from("evaluaciones").select("*", { count: "exact", head: true }),
      admin.from("sugerencias_vistas").select("*", { count: "exact", head: true }),
      admin.from("contact_requests").select("*", { count: "exact", head: true }),
      admin
        .from("contact_requests")
        .select("*", { count: "exact", head: true })
        .not("evaluacion_id_compartida", "is", null),
    ]);

    const totalEvaluaciones = evals.count ?? 0;
    const totalVistas = vistas.count ?? 0;
    const totalContactos = contactos.count ?? 0;
    const totalConDiagnosticoCompartido = compartidos.count ?? 0;

    const pct = (n: number, d: number) => (d > 0 ? Math.round((n / d) * 100) : 0);

    return {
      ok: true,
      kpis: {
        totalEvaluaciones,
        totalVistas,
        totalContactos,
        totalConDiagnosticoCompartido,
        porcVistasVsEvals: pct(totalVistas, totalEvaluaciones),
        porcContactosVsVistas: pct(totalContactos, totalVistas),
        porcCompartidoVsContactos: pct(totalConDiagnosticoCompartido, totalContactos),
      },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    return { ok: false, error: message };
  }
}

// ──────────────────────────────────────────────────────────────────────────
// topProductosSugeridos — ranking de productos mostrados y elegidos
// ──────────────────────────────────────────────────────────────────────────

export async function topProductosSugeridos(
  password: string,
): Promise<{ ok: true; rows: TopProductoSugerido[] } | { ok: false; error: string }> {
  if (!isValidPassword(password)) {
    return { ok: false, error: "Acceso denegado" };
  }

  try {
    const admin = supabaseAdmin();

    const [vistasRes, contactosRes] = await Promise.all([
      admin.from("sugerencias_vistas").select("productos_mostrados"),
      admin.from("contact_requests").select("productos_interes"),
    ]);

    if (vistasRes.error) return { ok: false, error: vistasRes.error.message };
    if (contactosRes.error) return { ok: false, error: contactosRes.error.message };

    const mostrados = new Map<string, number>();
    const elegidos = new Map<string, number>();

    for (const v of vistasRes.data ?? []) {
      const ids = (v.productos_mostrados ?? []) as string[];
      for (const id of ids) mostrados.set(id, (mostrados.get(id) ?? 0) + 1);
    }
    for (const c of contactosRes.data ?? []) {
      const ids = (c.productos_interes ?? []) as string[];
      for (const id of ids) elegidos.set(id, (elegidos.get(id) ?? 0) + 1);
    }

    const allIds = new Set<string>([...mostrados.keys(), ...elegidos.keys()]);
    const rows: TopProductoSugerido[] = Array.from(allIds)
      .map((productoId) => ({
        productoId,
        vecesMostrado: mostrados.get(productoId) ?? 0,
        vecesElegido: elegidos.get(productoId) ?? 0,
      }))
      .sort((a, b) => b.vecesMostrado - a.vecesMostrado);

    return { ok: true, rows };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    return { ok: false, error: message };
  }
}

// ──────────────────────────────────────────────────────────────────────────
// updateContactRequestEstado — workflow ANTEL (cambiar estado, agregar notas)
// ──────────────────────────────────────────────────────────────────────────

export async function updateContactRequestEstado(input: {
  password: string;
  id: string;
  estado: "nuevo" | "contactado" | "en_conversacion" | "cerrado";
  notasInternas?: string;
}): Promise<{ ok: boolean; error?: string }> {
  if (!isValidPassword(input.password)) {
    return { ok: false, error: "Acceso denegado" };
  }
  if (!input.id) {
    return { ok: false, error: "id requerido" };
  }

  try {
    const patch: Record<string, unknown> = { estado: input.estado };
    if (input.notasInternas !== undefined) {
      patch.notas_internas = input.notasInternas.trim() || null;
    }

    const { error } = await supabaseAdmin()
      .from("contact_requests")
      .update(patch)
      .eq("id", input.id);

    if (error) {
      console.error("[updateContactRequestEstado] error:", error.message);
      return { ok: false, error: error.message };
    }

    revalidatePath("/panel");
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    return { ok: false, error: message };
  }
}
