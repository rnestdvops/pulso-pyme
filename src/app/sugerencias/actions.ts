"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/utils/supabase/admin";

// ──────────────────────────────────────────────────────────────────────────
// registrarVistaSugerencias — primer opt-in (vio la vitrina)
//
// La PyME entró a /sugerencias para una evaluación dada. Registra:
//   - evaluacion_id
//   - productos mostrados (array de ids del catálogo)
//   - señales disparadoras (array de strings: "acceso_informacion_bajo", etc.)
//
// Sin PII. No falla la UX si la inserción falla (solo loguea).
// ──────────────────────────────────────────────────────────────────────────

export async function registrarVistaSugerencias(input: {
  evaluacionId: string;
  productosMostrados: string[];
  senalesDisparadoras: string[];
}): Promise<{ ok: boolean; error?: string }> {
  if (!input.evaluacionId || typeof input.evaluacionId !== "string") {
    return { ok: false, error: "evaluacionId requerido" };
  }
  if (!Array.isArray(input.productosMostrados) || !Array.isArray(input.senalesDisparadoras)) {
    return { ok: false, error: "productos y señales deben ser arrays" };
  }

  try {
    const { error } = await supabaseAdmin()
      .from("sugerencias_vistas")
      .insert({
        evaluacion_id: input.evaluacionId,
        productos_mostrados: input.productosMostrados,
        senales_disparadoras: input.senalesDisparadoras,
      });

    if (error) {
      console.error("[registrarVistaSugerencias] insert error:", error.message);
      return { ok: false, error: error.message };
    }

    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    console.error("[registrarVistaSugerencias] exception:", message);
    return { ok: false, error: message };
  }
}

// ──────────────────────────────────────────────────────────────────────────
// enviarContacto — segundo opt-in (PyME pidió contacto)
//
// Inserta en contact_requests. Datos personales (nombre, empresa, email,
// teléfono) nunca son leídos desde el browser — solo entran por esta action.
//
// Valida shape mínimo. Si compartirDiagnostico=true, persiste evaluacion_id
// para que ANTEL pueda cruzar con el diagnóstico. Si false, queda NULL.
// ──────────────────────────────────────────────────────────────────────────

export interface ContactoInput {
  nombre: string;
  empresa: string;
  email: string;
  telefono?: string | null;
  productosInteres: string[];
  mensaje?: string | null;
  compartirDiagnostico: boolean;
  evaluacionId?: string | null;
}

export async function enviarContacto(input: ContactoInput): Promise<
  | { ok: true; contactId: string }
  | { ok: false; error: string }
> {
  // Validación mínima
  const nombre = input.nombre?.trim();
  const empresa = input.empresa?.trim();
  const email = input.email?.trim();

  if (!nombre || !empresa || !email) {
    return { ok: false, error: "Nombre, empresa y email son requeridos." };
  }
  // Email syntax sanity (no regex perfecto, solo evita strings claramente rotas)
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "El email no parece válido." };
  }
  if (!Array.isArray(input.productosInteres)) {
    return { ok: false, error: "productosInteres debe ser array." };
  }

  try {
    const payload = {
      nombre,
      empresa,
      email,
      telefono: input.telefono?.trim() || null,
      productos_interes: input.productosInteres,
      mensaje: input.mensaje?.trim() || null,
      evaluacion_id_compartida:
        input.compartirDiagnostico && input.evaluacionId ? input.evaluacionId : null,
    };

    const { data, error } = await supabaseAdmin()
      .from("contact_requests")
      .insert(payload)
      .select("id")
      .single();

    if (error) {
      console.error("[enviarContacto] insert error:", error.message);
      return { ok: false, error: error.message };
    }

    // Invalidar cache del panel para que ANTEL vea la nueva solicitud al refrescar
    revalidatePath("/panel");

    return { ok: true, contactId: data.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    console.error("[enviarContacto] exception:", message);
    return { ok: false, error: message };
  }
}
