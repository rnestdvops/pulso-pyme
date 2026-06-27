"use client";

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
  Tooltip,
} from "recharts";
import { IA_LABELS } from "@/hooks/usePanelData";

interface Punto {
  id: string;
  eje_externo: number;
  eje_interno: number;
  color_tecnologia: number | null;
  rubro: string;
  empleados: string;
  iao_general: number;
  tecnologia_nivel: string | null;
  ia_estado: string | null;
}

interface Props {
  puntos: Punto[];
}

function tecnologiaToColor(puntaje: number | null): string {
  if (puntaje === null) return "#EEF3F7";
  // Gradiente teal-soft (#EEF3F7) → navy (#002E68)
  const t = Math.max(0, Math.min(100, puntaje)) / 100;
  const r = Math.round(0xEE + (0x1F - 0xEE) * t);
  const g = Math.round(0xF3 + (0x3A - 0xF3) * t);
  const b = Math.round(0xF7 + (0x5F - 0xF7) * t);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

const TEC_NIVEL_LABEL: Record<string, string> = {
  punto_de_partida: "Punto de partida",
  en_camino:        "En camino",
  consolidado:      "Consolidado",
};

// Tooltip customizado: sin id, sin fecha
function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: Punto }> }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-lg border border-[#CCCCCC] bg-white p-3 shadow-md text-xs text-[#1A1A1A] space-y-0.5">
      <p className="font-semibold text-[#002E68]">{p.rubro}</p>
      <p>Tamaño: {p.empleados}</p>
      <p>IAO: <span className="font-semibold">{p.iao_general}</span></p>
      <p>Tecnología: {TEC_NIVEL_LABEL[p.tecnologia_nivel ?? ""] ?? "—"}</p>
      <p>IA: {IA_LABELS[p.ia_estado ?? ""] ?? "—"}</p>
    </div>
  );
}

export function ScatterPanel({ puntos }: Props) {
  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={380}>
        <ScatterChart margin={{ top: 16, right: 24, bottom: 40, left: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#CCCCCC" opacity={0.4} />
          <XAxis
            type="number"
            dataKey="eje_externo"
            domain={[0, 100]}
            tick={{ fontSize: 11, fill: "#1A1A1A" }}
            label={{
              value: "Cómo se mueven con el mercado (eje externo)",
              position: "insideBottom",
              offset: -12,
              fontSize: 11,
              fill: "#1A1A1A",
            }}
          />
          <YAxis
            type="number"
            dataKey="eje_interno"
            domain={[0, 100]}
            tick={{ fontSize: 11, fill: "#1A1A1A" }}
            label={{
              value: "Cómo se organizan adentro (eje interno)",
              angle: -90,
              position: "insideLeft",
              offset: 12,
              fontSize: 11,
              fill: "#1A1A1A",
            }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: "3 3" }} />
          <Scatter data={puntos} isAnimationActive={false}>
            {puntos.map((p) => (
              <Cell
                key={p.id}
                fill={tecnologiaToColor(p.color_tecnologia)}
                stroke="#002E6833"
                strokeWidth={1}
                r={6}
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>

      {/* Leyenda de color */}
      <div className="flex items-center gap-3 text-xs text-[#1A1A1A]">
        <span className="shrink-0">Menos digitalizado</span>
        <div
          className="h-3 flex-1 rounded-full"
          style={{
            background: "linear-gradient(to right, #EEF3F7, #002E68)",
          }}
        />
        <span className="shrink-0">Más digitalizado</span>
      </div>
    </div>
  );
}