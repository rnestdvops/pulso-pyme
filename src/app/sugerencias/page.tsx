import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/utils/supabase/admin";
import { evaluacionDesdeRow, type EvaluacionRow } from "@/types/evaluacion";
import { obtenerSugerencias } from "@/lib/sugerencias-engine";
import { VitrinaHeader } from "@/components/sugerencias/VitrinaHeader";
import { TarjetaProducto } from "@/components/sugerencias/TarjetaProducto";
import { FormularioContacto } from "@/components/sugerencias/FormularioContacto";
import { registrarVistaSugerencias } from "./actions";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Soluciones sugeridas — Pulso PyME ANTEL",
  description:
    "Soluciones que podrían acompañar el pulso de tu PyME, basadas en tu autodiagnóstico.",
};

interface PageProps {
  searchParams: Promise<{ ev?: string }>;
}

export default async function SugerenciasPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const evaluacionId = params.ev;

  if (!evaluacionId) {
    // Sin evaluacionId no podemos personalizar. Volvemos al inicio.
    redirect("/");
  }

  // Fetch de la evaluación con admin client.
  const { data, error } = await supabaseAdmin()
    .from("evaluaciones")
    .select(
      "id, dimensiones, tecnologia_nivel, tecnologia_por_dimension, ia_estado, q16_seleccionadas, rubro, empleados",
    )
    .eq("id", evaluacionId)
    .single();

  if (error || !data) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center justify-center px-6 py-16 text-center">
        <p className="text-sm text-muted-foreground">
          No encontramos tu evaluación. Es posible que el link haya expirado o que
          alguien lo haya compartido sin querer.
        </p>
        <a
          href="/"
          className="mt-4 text-sm font-semibold text-primary underline-offset-4 hover:underline"
        >
          Volver al inicio
        </a>
      </main>
    );
  }

  const evaluacion = evaluacionDesdeRow(data as EvaluacionRow);
  const sugerencias = obtenerSugerencias(evaluacion);

  // Registrar la vista (server action, fire-and-forget). Si falla, no rompemos UX.
  const productosMostrados = [...sugerencias.tecnologia, ...sugerencias.adopcionIA].map(
    (s) => s.producto.id,
  );
  const senalesDisparadoras = [...sugerencias.tecnologia, ...sugerencias.adopcionIA].map(
    (s) => s.senalDisparadora,
  );
  registrarVistaSugerencias({
    evaluacionId,
    productosMostrados,
    senalesDisparadoras,
  }).catch((err) => console.error("[sugerencias.page] registrarVista falló:", err));

  const productosCatalogoMostrados = [
    ...sugerencias.tecnologia,
    ...sugerencias.adopcionIA,
  ].map((s) => s.producto);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-10 px-6 pb-16 pt-8 sm:gap-12">
      <VitrinaHeader evaluacionId={evaluacionId} />

      {/* Sección A — Tecnología y conectividad */}
      <section className="space-y-4">
        <h2 className="font-heading text-base font-semibold text-foreground">
          Tecnología y conectividad
        </h2>
        {sugerencias.tecnologia.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No tenemos soluciones específicas para mostrarte en esta categoría según
            tu pulso actual.
          </p>
        ) : (
          <div className="grid gap-4">
            {sugerencias.tecnologia.map((s) => (
              <TarjetaProducto key={s.producto.id} sugerencia={s} />
            ))}
          </div>
        )}
      </section>

      {/* Sección B — Adopción de IA */}
      <section className="space-y-4">
        <h2 className="font-heading text-base font-semibold text-foreground">
          Adopción de inteligencia artificial
        </h2>
        <div className="grid gap-4">
          {sugerencias.adopcionIA.map((s) => (
            <TarjetaProducto key={s.producto.id} sugerencia={s} />
          ))}
        </div>
      </section>

      {/* Segundo opt-in */}
      <FormularioContacto
        evaluacionId={evaluacionId}
        productosMostrados={productosCatalogoMostrados}
      />
    </main>
  );
}
