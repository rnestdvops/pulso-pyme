"use client";

export const dynamic = "force-dynamic";

/**
 * /panel — Panel ANTEL de Adaptabilidad del Ecosistema PyME uruguayo
 *
 * Acceso protegido por contraseña. Lectura:
 *   1. VITE_OPERADOR_PASSWORD si está definida (Lovable Cloud → Secrets).
 *   2. Fallback hardcodeado para no quedar bloqueados si el secret no existe.
 *
 * La sesión dura mientras el tab esté abierto (sessionStorage, no localStorage).
 *
 * Para cambiar la contraseña en producción: crear/editar el secret
 * `VITE_OPERADOR_PASSWORD` en Lovable Cloud y redeployar.
 */
const PANEL_PASSWORD_FALLBACK = "pulso-uy-2026";

import Link from "next/link";
import { useState, useMemo, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  ComposedChart,
  Line,
  Legend,
} from "recharts";
import { usePanelData, DIM_LABELS, IA_LABELS, OCCLUSION_THRESHOLD, type Filtros } from "@/hooks/usePanelData";
import { ScatterPanel } from "@/components/ScatterPanel";

export default function PanelPage() {
  return <PanelRoute />;
}

// ── Colores Pulso PyME · ANTEL ────────────────────────────────────────────────
const C = {
  navy:        "#002E68",
  navyDark:    "#162B47",
  teal:        "#2E8B8B",
  tealSoft:    "#EEF3F7",
  texto:       "#1A1A1A",
  gris:        "#5C5C5C",
  borde:       "#CCCCCC",
  fondo:       "#F2F4F7",
  blanco:      "#FFFFFF",
};

const TEC_NIVEL_COLOR: Record<string, string> = {
  punto_de_partida: "#EEF3F7",
  en_camino:        "#7AB0B0",
  consolidado:      "#2E8B8B",
};
const TEC_NIVEL_LABEL: Record<string, string> = {
  punto_de_partida: "Punto de partida",
  en_camino:        "En camino",
  consolidado:      "Consolidado",
};
const IA_COLOR: Record<string, string> = {
  no_usan:   "#EEF3F7",
  probaron:  "#A8C8C8",
  puntual:   "#5BAAAA",
  integrada: "#2E8B8B",
};

// ── Login ─────────────────────────────────────────────────────────────────────
function LoginScreen({ onAuth }: { onAuth: () => void }) {
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState(false);

  const submit = () => {
    const expected = process.env.NEXT_PUBLIC_OPERADOR_PASSWORD || PANEL_PASSWORD_FALLBACK;
    if (pwd === expected) {
      sessionStorage.setItem("panel_auth", "ok");
      onAuth();
    } else {
      setError(true);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center" style={{ backgroundColor: C.fondo }}>
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-md">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider" style={{ color: C.teal }}>
          ANTEL · Panel institucional
        </p>
        <h1 className="mb-6 font-heading text-xl font-bold" style={{ color: C.navy }}>
          Acceso al panel de adaptabilidad
        </h1>
        <label className="mb-4 flex flex-col gap-1 text-sm">
          <span className="font-medium" style={{ color: C.texto }}>Contraseña</span>
          <input
            type="password"
            value={pwd}
            onChange={(e) => { setPwd(e.target.value); setError(false); }}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            className="rounded-lg border px-3 py-2 text-sm outline-none focus:border-current"
            style={{ borderColor: C.borde }}
            autoFocus
          />
          {error && <span className="text-xs text-red-500">Contraseña incorrecta.</span>}
        </label>
        <button
          type="button"
          onClick={submit}
          className="w-full rounded-lg py-2.5 text-sm font-semibold text-white transition"
          style={{ backgroundColor: C.navy }}
        >
          Ingresar
        </button>
      </div>
    </main>
  );
}

// ── Componentes de UI reutilizables ───────────────────────────────────────────
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl bg-white p-5 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-4 font-heading text-base font-semibold text-[#1A1A1A]">
      {children}
    </h2>
  );
}

function KpiCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-[#CCCCCC]">{label}</p>
      <p className="mt-1 font-heading text-3xl font-bold" style={{ color: C.navy }}>{value}</p>
      {sub && <p className="text-xs text-[#CCCCCC]">{sub}</p>}
    </div>
  );
}

function Select({
  label, value, onChange, options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-[#1A1A1A]">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-[#CCCCCC] bg-white px-3 py-2 text-sm text-[#1A1A1A] focus:border-[#002E68] outline-none"
      >
        <option value="">Todos</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}

// ── Tabla paginada ────────────────────────────────────────────────────────────
type SortDir = "asc" | "desc";

function TablaRespuestas({ rows }: { rows: import("@/hooks/usePanelData").PanelRow[] }) {
  const [page, setPage]       = useState(0);
  const [sortCol, setSortCol] = useState<string>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const PAGE = 20;

  const sorted = useMemo(() => {
    return [...rows].sort((a, b) => {
      const va = (a as unknown as Record<string, unknown>)[sortCol];
      const vb = (b as unknown as Record<string, unknown>)[sortCol];
      const cmp = typeof va === "number" && typeof vb === "number"
        ? va - vb
        : String(va ?? "").localeCompare(String(vb ?? ""));
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [rows, sortCol, sortDir]);

  const totalPages = Math.ceil(sorted.length / PAGE);
  const slice = sorted.slice(page * PAGE, (page + 1) * PAGE);

  const toggleSort = (col: string) => {
    if (sortCol === col) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("asc"); }
  };

  const exportCSV = useCallback(() => {
    const cols = ["#", "Rubro", "Tamaño", "IAO", "Nivel", "Tec.", "Nivel tec.", "IA", "Fecha"];
    const rowsCSV = sorted.map((r, i) => [
      i + 1,
      r.rubro,
      r.empleados,
      r.iao_general,
      r.nivel_general,
      r.tecnologia_puntaje ?? "",
      r.tecnologia_nivel ?? "",
      IA_LABELS[r.ia_estado ?? ""] ?? "",
      r.created_at.slice(0, 10),
    ].join(","));
    const csv = [cols.join(","), ...rowsCSV].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pulso-pyme-panel-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [sorted]);

  const Th = ({ col, label }: { col: string; label: string }) => (
    <th
      onClick={() => toggleSort(col)}
      className="cursor-pointer whitespace-nowrap px-3 py-2 text-left text-xs font-semibold text-[#1A1A1A] hover:text-[#002E68] select-none"
    >
      {label} {sortCol === col ? (sortDir === "asc" ? "↑" : "↓") : ""}
    </th>
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-[#CCCCCC]">{sorted.length} registros</p>
        <button
          type="button"
          onClick={exportCSV}
          className="rounded-lg border border-[#CCCCCC] px-3 py-1.5 text-xs font-medium text-[#1A1A1A] hover:border-[#002E68] hover:text-[#002E68] transition"
        >
          Exportar CSV
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#CCCCCC]">
        <table className="w-full text-xs">
          <thead className="border-b border-[#CCCCCC] bg-[#F2F4F7]">
            <tr>
              <Th col="_idx" label="#" />
              <Th col="rubro" label="Rubro" />
              <Th col="empleados" label="Tamaño" />
              <Th col="iao_general" label="IAO" />
              <Th col="nivel_general" label="Nivel" />
              <Th col="tecnologia_puntaje" label="Tec." />
              <Th col="tecnologia_nivel" label="Nivel tec." />
              <Th col="ia_estado" label="IA" />
              <Th col="created_at" label="Fecha" />
            </tr>
          </thead>
          <tbody>
            {slice.map((r, i) => (
              <tr key={r.id} className="border-b border-[#F2F4F7] hover:bg-[#EEF3F7]">
                <td className="px-3 py-2 text-[#CCCCCC]">{page * PAGE + i + 1}</td>
                <td className="px-3 py-2 text-[#1A1A1A]">{r.rubro}</td>
                <td className="px-3 py-2 text-[#1A1A1A]">{r.empleados}</td>
                <td className="px-3 py-2 font-semibold" style={{ color: C.navy }}>{r.iao_general}</td>
                <td className="px-3 py-2 text-[#1A1A1A] capitalize">{r.nivel_general}</td>
                <td className="px-3 py-2 text-[#1A1A1A]">{r.tecnologia_puntaje ?? "—"}</td>
                <td className="px-3 py-2 text-[#1A1A1A]">{TEC_NIVEL_LABEL[r.tecnologia_nivel ?? ""] ?? "—"}</td>
                <td className="px-3 py-2 text-[#1A1A1A]">{IA_LABELS[r.ia_estado ?? ""] ?? "—"}</td>
                <td className="px-3 py-2 text-[#CCCCCC]">{r.created_at.slice(0, 10)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(p - 1, 0))}
            disabled={page === 0}
            className="rounded px-2 py-1 border border-[#CCCCCC] disabled:opacity-30"
          >
            ←
          </button>
          <span className="text-[#1A1A1A]">
            {page + 1} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
            disabled={page === totalPages - 1}
            className="rounded px-2 py-1 border border-[#CCCCCC] disabled:opacity-30"
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}

// ── Panel principal ───────────────────────────────────────────────────────────
function PanelContent() {
  const [filtros, setFiltros] = useState<Filtros>({ rubro: null, empleados: null, nivel: null });
  const { data, loading, error, refetch } = usePanelData(filtros);

  const setF = (k: keyof Filtros) => (v: string) =>
    setFiltros((f) => ({ ...f, [k]: v || null }));

  const ahora = new Date().toLocaleString("es-UY", {
    day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

  return (
    <main className="min-h-screen" style={{ backgroundColor: C.fondo }}>
      <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-6 sm:px-6">

        {/* ── Header ── */}
        <header className="mb-6 space-y-4">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: C.teal }}>
                ANTEL · Datos anónimos
              </p>
              <h1 className="font-heading text-2xl font-bold sm:text-3xl" style={{ color: C.navy }}>
                Panel de Adaptabilidad del Ecosistema PyME Uruguay
              </h1>
              <p className="mt-1 text-xs" style={{ color: C.gris }}>
                Última actualización: {ahora}
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                type="button"
                onClick={refetch}
                className="rounded-lg border px-4 py-2 text-sm font-medium transition"
                style={{ borderColor: C.navy, color: C.navy }}
              >
                Actualizar datos
              </button>
              <Link
                href="/"
                className="rounded-lg border px-4 py-2 text-sm font-medium transition"
                style={{ borderColor: C.gris, color: C.texto }}
              >
                ← Volver
              </Link>
            </div>
          </div>

          {/* Filtros */}
          {data && (
            <div className="flex flex-wrap gap-4">
              <Select
                label="Rubro"
                value={filtros.rubro ?? ""}
                onChange={setF("rubro")}
                options={data.rubrosDisponibles}
              />
              <Select
                label="Tamaño"
                value={filtros.empleados ?? ""}
                onChange={setF("empleados")}
                options={data.empleadosDisponibles}
              />
              <Select
                label="Nivel IAO"
                value={filtros.nivel ?? ""}
                onChange={setF("nivel")}
                options={["bajo", "medio", "alto"]}
              />
            </div>
          )}
        </header>

        {error && (
          <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600 mb-6">
            No se pudieron cargar los datos. Verificá tu conexión e intentá de nuevo.
          </div>
        )}

        {loading && (
          <p className="text-sm" style={{ color: C.gris }}>Cargando…</p>
        )}

        {data && data.totalRespuestas === 0 && (
          <Card>
            <p className="text-center text-sm" style={{ color: C.gris }}>
              No hay evaluaciones que coincidan con los filtros seleccionados.
            </p>
          </Card>
        )}

        {data && data.isOccluded && (
          <Card>
            <p className="mb-2 text-center font-heading text-base font-semibold" style={{ color: C.navy }}>
              Muestra insuficiente para mostrar este segmento.
            </p>
            <p className="text-center text-sm" style={{ color: C.gris }}>
              Hay {data.totalRespuestas} respuesta{data.totalRespuestas === 1 ? "" : "s"} que coinciden con estos filtros.
              Para preservar el anonimato, el panel oculta cualquier segmento con menos de {OCCLUSION_THRESHOLD} respuestas.
              Quitá uno o más filtros para ver datos agregados.
            </p>
          </Card>
        )}

        {data && data.totalRespuestas >= OCCLUSION_THRESHOLD && (
          <div className="flex flex-col gap-6">

            {/* ── Sección 2: KPIs ── */}
            <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <KpiCard
                label="Empresas evaluadas"
                value={data.totalRespuestas}
              />
              <KpiCard
                label="IAO promedio"
                value={data.promedioIAO}
                sub="/ 100"
              />
              <KpiCard
                label="Madurez tecnológica"
                value={data.promedioTecnologia}
                sub="/ 100"
              />
              <KpiCard
                label="Con algún uso de IA"
                value={`${data.adopcionIA}%`}
              />
            </section>

            {/* ── Sección 3: Scatter ── */}
            <Card>
              <SectionTitle>
                Ecosistema PyME uruguayo — Adaptabilidad
              </SectionTitle>
              <p className="mb-4 text-xs" style={{ color: C.gris }}>
                Cada punto es una empresa. El color indica nivel de digitalización.
                Pasá el mouse sobre un punto para ver el detalle.
              </p>
              <ScatterPanel puntos={data.puntosScatter} />
            </Card>

            {/* ── Sección 4: Dimensiones ── */}
            <Card>
              <SectionTitle>Distribución por dimensiones IAO</SectionTitle>
              <p className="mb-4 text-xs" style={{ color: C.gris }}>
                Promedio de cada dimensión sobre las respuestas seleccionadas (0–100).
              </p>
              <div className="h-96 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.promediosPorDimension.map((d) => ({
                      name: DIM_LABELS[d.dimension] ?? d.dimension,
                      promedio: d.promedio,
                    }))}
                    layout="vertical"
                    margin={{ top: 4, right: 32, bottom: 4, left: 160 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={C.gris} opacity={0.4} />
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fontSize: 10, fill: C.texto }}
                      width={155}
                    />
                    <Tooltip
                      formatter={(v) => [`${v as number} / 100`, "Promedio"]}
                      contentStyle={{ fontSize: 11 }}
                    />
                    <Bar dataKey="promedio" fill={C.navy} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* ── Sección 5: Tecnología e IA ── */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Tecnología */}
              <Card>
                <SectionTitle>Madurez tecnológica</SectionTitle>
                <div className="space-y-2 mb-6">
                  {(["punto_de_partida", "en_camino", "consolidado"] as const).map((k) => {
                    const n = data.distribucionTecNivel[k];
                    const pct = data.totalRespuestas ? Math.round((n / data.totalRespuestas) * 100) : 0;
                    return (
                      <div key={k} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span style={{ color: C.texto }}>{TEC_NIVEL_LABEL[k]}</span>
                          <span style={{ color: C.gris }}>{n} ({pct}%)</span>
                        </div>
                        <div className="h-2 w-full rounded-full overflow-hidden" style={{ backgroundColor: C.fondo }}>
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${pct}%`, backgroundColor: TEC_NIVEL_COLOR[k] }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="mb-2 text-xs font-semibold" style={{ color: C.texto }}>
                  Promedio por dimensión
                </p>
                {[
                  { label: "Digitalización de procesos",   val: data.promTecDigitalizacion },
                  { label: "Resguardo de datos",           val: data.promTecResguardo },
                  { label: "Acceso y gobierno de datos",   val: data.promTecAcceso },
                ].map(({ label, val }) => (
                  <div key={label} className="space-y-1 mb-2">
                    <div className="flex justify-between text-xs">
                      <span style={{ color: C.texto }}>{label}</span>
                      <span style={{ color: C.gris }}>{val}/100</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ backgroundColor: C.fondo }}>
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${val}%`, backgroundColor: C.navy }}
                      />
                    </div>
                  </div>
                ))}
              </Card>

              {/* IA */}
              <Card>
                <SectionTitle>Inteligencia artificial</SectionTitle>
                <div className="space-y-2 mb-6">
                  {(["no_usan", "probaron", "puntual", "integrada"] as const).map((k) => {
                    const n = data.distribucionIAEstado[k];
                    const pct = data.totalRespuestas ? Math.round((n / data.totalRespuestas) * 100) : 0;
                    return (
                      <div key={k} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span style={{ color: C.texto }}>{IA_LABELS[k]}</span>
                          <span style={{ color: C.gris }}>{n} ({pct}%)</span>
                        </div>
                        <div className="h-2 w-full rounded-full overflow-hidden" style={{ backgroundColor: C.fondo }}>
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${pct}%`, backgroundColor: IA_COLOR[k] }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Q16 herramientas */}
                {data.topHerramientas.length > 0 && (
                  <>
                    <p className="mb-2 text-xs font-semibold" style={{ color: C.texto }}>
                      Herramientas más usadas (Q16)
                    </p>
                    {data.topHerramientas.map(({ herramienta, pct }) => (
                      <div key={herramienta} className="space-y-1 mb-2">
                        <div className="flex justify-between text-xs">
                          <span style={{ color: C.texto }}>{herramienta}</span>
                          <span style={{ color: C.gris }}>{pct}%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ backgroundColor: C.fondo }}>
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${pct}%`, backgroundColor: C.teal }}
                          />
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </Card>
            </div>

            {/* ── Sección 7: Evolución temporal ── */}
            <Card>
              <SectionTitle>Evolución de la participación y el IAO promedio</SectionTitle>
              <p className="mb-4 text-xs" style={{ color: C.gris }}>
                Universo completo (sin filtros). Barras = nuevas respuestas por semana.
                Línea = IAO promedio semanal.
              </p>
              {data.evolucionTemporal.length > 0 ? (
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={data.evolucionTemporal}
                      margin={{ top: 8, right: 32, bottom: 8, left: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke={C.gris} opacity={0.4} />
                      <XAxis dataKey="semana" tick={{ fontSize: 10 }} />
                      <YAxis yAxisId="left" tick={{ fontSize: 10 }} />
                      <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fontSize: 10 }} />
                      <Tooltip contentStyle={{ fontSize: 11 }} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Bar yAxisId="left" dataKey="count" fill={C.teal} name="Respuestas" />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="promedioIAO"
                        stroke={C.navy}
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        name="IAO promedio"
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-sm" style={{ color: C.gris }}>
                  No hay datos de evolución todavía.
                </p>
              )}
            </Card>

            {/* ── Sección 6: Tabla ── */}
            <Card>
              <SectionTitle>Respuestas individuales</SectionTitle>
              <p className="mb-4 text-xs" style={{ color: C.gris }}>
                Sin identificadores. Ordenable por columna. Exportable a CSV.
              </p>
              <TablaRespuestas rows={data.rows} />
            </Card>

          </div>
        )}

        <footer className="mt-8 text-center text-[10px]" style={{ color: C.gris }}>
          ANTEL · Pulso PyME — Empresas Uruguayas Inteligentes · Datos anónimos y agregados
        </footer>
      </div>
    </main>
  );
}

// ── Ruta raíz: controla auth ──────────────────────────────────────────────────
function PanelRoute() {
  const [authed, setAuthed] = useState(
    () => typeof window !== "undefined" && sessionStorage.getItem("panel_auth") === "ok"
  );
  if (!authed) return <LoginScreen onAuth={() => setAuthed(true)} />;
  return <PanelContent />;
}