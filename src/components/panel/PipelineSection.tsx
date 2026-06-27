"use client";

import { useEffect, useState, useTransition } from "react";
import {
  listContactRequests,
  kpisFunnel,
  topProductosSugeridos,
  updateContactRequestEstado,
  type ContactRequestRow,
  type KpisFunnel,
  type TopProductoSugerido,
} from "@/app/panel/actions";
import { catalogoMock } from "@/data/catalogo-antel-mock";

// Paleta (heredada del panel; duplico mínimo para no acoplar)
const C = {
  navy: "#002E68",
  teal: "#2E8B8B",
  texto: "#1A1A1A",
  gris: "#5C5C5C",
  borde: "#CCCCCC",
  tealSoft: "#EEF3F7",
  fondo: "#F2F4F7",
};

const ESTADO_LABEL: Record<ContactRequestRow["estado"], string> = {
  nuevo: "Nuevo",
  contactado: "Contactado",
  en_conversacion: "En conversación",
  cerrado: "Cerrado",
};

const ESTADOS: ContactRequestRow["estado"][] = [
  "nuevo",
  "contactado",
  "en_conversacion",
  "cerrado",
];

export function PipelineSection() {
  const [pwd, setPwd] = useState<string | null>(null);
  const [kpis, setKpis] = useState<KpisFunnel | null>(null);
  const [rows, setRows] = useState<ContactRequestRow[]>([]);
  const [top, setTop] = useState<TopProductoSugerido[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Levantar la pwd del sessionStorage (la guardó LoginScreen tras validar).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = sessionStorage.getItem("panel_pwd");
    setPwd(stored);
  }, []);

  // Carga inicial
  useEffect(() => {
    if (!pwd) return;
    let cancelled = false;
    setLoading(true);
    Promise.all([
      kpisFunnel(pwd),
      listContactRequests(pwd),
      topProductosSugeridos(pwd),
    ])
      .then(([kpisRes, listRes, topRes]) => {
        if (cancelled) return;
        if (kpisRes.ok) setKpis(kpisRes.kpis);
        else setError(kpisRes.error);
        if (listRes.ok) setRows(listRes.rows);
        if (topRes.ok) setTop(topRes.rows);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [pwd]);

  if (!pwd) return null;

  return (
    <section className="mt-10 space-y-6 border-t-2 border-dashed pt-10" style={{ borderColor: C.borde }}>
      <header>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider" style={{ color: C.teal }}>
          Vitrina + Contacto
        </p>
        <h2 className="font-heading text-xl font-bold" style={{ color: C.navy }}>
          Pipeline ANTEL
        </h2>
        <p className="mt-1 text-sm" style={{ color: C.gris }}>
          Solicitudes generadas a través de la vitrina adaptativa.
        </p>
      </header>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* KPIs */}
      <KpisGrid kpis={kpis} loading={loading} />

      {/* Top productos */}
      <TopProductos top={top} loading={loading} />

      {/* Tabla solicitudes */}
      <TablaContactos rows={rows} pwd={pwd} onUpdated={(updated) => setRows(updated)} loading={loading} />
    </section>
  );
}

function KpisGrid({ kpis, loading }: { kpis: KpisFunnel | null; loading: boolean }) {
  if (loading) {
    return <p className="text-sm" style={{ color: C.gris }}>Cargando KPIs…</p>;
  }
  if (!kpis) {
    return <p className="text-sm" style={{ color: C.gris }}>Sin datos aún.</p>;
  }
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Kpi label="Evaluaciones completas" value={kpis.totalEvaluaciones} />
      <Kpi label="Vieron sugerencias" value={kpis.totalVistas} hint={`${kpis.porcVistasVsEvals}% de evals`} />
      <Kpi label="Pidieron contacto" value={kpis.totalContactos} hint={`${kpis.porcContactosVsVistas}% de vistas`} />
      <Kpi label="Compartieron diagnóstico" value={kpis.totalConDiagnosticoCompartido} hint={`${kpis.porcCompartidoVsContactos}% de contactos`} />
    </div>
  );
}

function Kpi({ label, value, hint }: { label: string; value: number; hint?: string }) {
  return (
    <div className="rounded-xl border p-4" style={{ borderColor: C.borde, backgroundColor: "white" }}>
      <p className="text-xs uppercase tracking-wider" style={{ color: C.gris }}>{label}</p>
      <p className="mt-1 font-heading text-2xl font-bold" style={{ color: C.navy }}>{value}</p>
      {hint && <p className="mt-0.5 text-[11px]" style={{ color: C.gris }}>{hint}</p>}
    </div>
  );
}

function TopProductos({ top, loading }: { top: TopProductoSugerido[]; loading: boolean }) {
  if (loading) return null;
  if (top.length === 0) {
    return (
      <div className="rounded-xl border p-4" style={{ borderColor: C.borde, backgroundColor: "white" }}>
        <h3 className="mb-2 font-heading text-base font-semibold" style={{ color: C.navy }}>
          Top productos sugeridos
        </h3>
        <p className="text-sm" style={{ color: C.gris }}>
          Todavía no hay vistas de vitrina registradas.
        </p>
      </div>
    );
  }
  const titulos = new Map(catalogoMock.map((p) => [p.id, p.titulo]));
  return (
    <div className="rounded-xl border p-4" style={{ borderColor: C.borde, backgroundColor: "white" }}>
      <h3 className="mb-3 font-heading text-base font-semibold" style={{ color: C.navy }}>
        Top productos sugeridos
      </h3>
      <ul className="space-y-2">
        {top.slice(0, 10).map((p) => (
          <li key={p.productoId} className="flex items-center justify-between gap-3 text-sm">
            <span className="truncate" style={{ color: C.texto }}>
              {titulos.get(p.productoId) ?? p.productoId}
            </span>
            <span className="shrink-0" style={{ color: C.gris }}>
              mostrado <strong style={{ color: C.navy }}>{p.vecesMostrado}</strong> · elegido <strong style={{ color: C.teal }}>{p.vecesElegido}</strong>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TablaContactos({
  rows,
  pwd,
  onUpdated,
  loading,
}: {
  rows: ContactRequestRow[];
  pwd: string;
  onUpdated: (rows: ContactRequestRow[]) => void;
  loading: boolean;
}) {
  const [, startTransition] = useTransition();

  function cambiarEstado(id: string, estado: ContactRequestRow["estado"]) {
    startTransition(async () => {
      const res = await updateContactRequestEstado({ password: pwd, id, estado });
      if (res.ok) {
        // Optimistic update local
        onUpdated(rows.map((r) => (r.id === id ? { ...r, estado } : r)));
      }
    });
  }

  if (loading) {
    return <p className="text-sm" style={{ color: C.gris }}>Cargando solicitudes…</p>;
  }
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border p-4" style={{ borderColor: C.borde, backgroundColor: "white" }}>
        <h3 className="mb-2 font-heading text-base font-semibold" style={{ color: C.navy }}>
          Solicitudes de contacto
        </h3>
        <p className="text-sm" style={{ color: C.gris }}>
          Todavía no hay solicitudes. Cuando una PyME complete el formulario de contacto aparecerán acá.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border p-4" style={{ borderColor: C.borde, backgroundColor: "white" }}>
      <h3 className="mb-3 font-heading text-base font-semibold" style={{ color: C.navy }}>
        Solicitudes de contacto ({rows.length})
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr style={{ color: C.gris }} className="border-b">
              <th className="px-2 py-2">Fecha</th>
              <th className="px-2 py-2">Nombre / Empresa</th>
              <th className="px-2 py-2">Contacto</th>
              <th className="px-2 py-2">Productos</th>
              <th className="px-2 py-2">Diag.</th>
              <th className="px-2 py-2">Estado</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b align-top" style={{ color: C.texto }}>
                <td className="px-2 py-2 whitespace-nowrap">
                  {new Date(r.created_at).toLocaleDateString("es-UY", { day: "2-digit", month: "short" })}
                </td>
                <td className="px-2 py-2">
                  <div className="font-medium">{r.nombre}</div>
                  <div style={{ color: C.gris }}>{r.empresa}</div>
                </td>
                <td className="px-2 py-2">
                  <div>{r.email}</div>
                  {r.telefono && <div style={{ color: C.gris }}>{r.telefono}</div>}
                </td>
                <td className="px-2 py-2">
                  <ProductosList ids={r.productos_interes} />
                </td>
                <td className="px-2 py-2">
                  {r.evaluacion_id_compartida ? (
                    <span title="Compartió diagnóstico" className="font-semibold" style={{ color: C.teal }}>
                      ✓
                    </span>
                  ) : (
                    <span style={{ color: C.gris }}>—</span>
                  )}
                </td>
                <td className="px-2 py-2">
                  <select
                    value={r.estado}
                    onChange={(e) => cambiarEstado(r.id, e.target.value as ContactRequestRow["estado"])}
                    className="rounded border px-2 py-1 text-xs"
                    style={{ borderColor: C.borde }}
                  >
                    {ESTADOS.map((e) => (
                      <option key={e} value={e}>
                        {ESTADO_LABEL[e]}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProductosList({ ids }: { ids: string[] }) {
  if (!ids?.length) return <span style={{ color: C.gris }}>—</span>;
  const titulos = new Map(catalogoMock.map((p) => [p.id, p.titulo]));
  return (
    <ul className="space-y-0.5">
      {ids.slice(0, 3).map((id) => (
        <li key={id} className="leading-tight" style={{ color: C.texto }}>
          {titulos.get(id) ?? id}
        </li>
      ))}
      {ids.length > 3 && (
        <li className="text-[10px]" style={{ color: C.gris }}>
          +{ids.length - 3} más
        </li>
      )}
    </ul>
  );
}
