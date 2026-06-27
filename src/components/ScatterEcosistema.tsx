"use client";

import { ScatterChart, Scatter, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";

interface PuntoEcosistema {
  id: string;
  eje_externo: number;
  eje_interno: number;
  color_tecnologia: number | null;
}

interface Props {
  puntoPropio: {
    eje_externo: number;
    eje_interno: number;
    color_tecnologia: number | null;
  };
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

export function ScatterEcosistema({ puntoPropio }: Props) {
  const [puntos, setPuntos] = useState<PuntoEcosistema[]>([]);

  useEffect(() => {
    supabase
      .from("scatter_ecosistema")
      .select("*")
      .then((res: { data: unknown }) => {
        if (res.data) setPuntos(res.data as PuntoEcosistema[]);
      });
  }, []);

  const todosLosPuntos = [
    ...puntos.filter((p) => p.id !== "propio"),
    { id: "propio", ...puntoPropio },
  ];

  return (
    <div className="w-full space-y-4">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Ecosistema PyME Uruguay
        </p>
        <h2 className="font-heading text-base font-semibold text-foreground">
          Así es como vos ves a tu empresa y cómo se ubica en el mapa respecto de otras.
        </h2>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 40 }}>
          <XAxis
            type="number"
            dataKey="eje_externo"
            domain={[0, 100]}
            tick={{ fontSize: 10 }}
            label={{
              value: "Cómo te movés con el mercado",
              position: "insideBottom",
              offset: -10,
              fontSize: 10,
            }}
          />
          <YAxis
            type="number"
            dataKey="eje_interno"
            domain={[0, 100]}
            tick={{ fontSize: 10 }}
            label={{
              value: "Cómo te organizás adentro",
              angle: -90,
              position: "insideLeft",
              fontSize: 10,
            }}
          />
          <Scatter data={todosLosPuntos} isAnimationActive={false}>
            {todosLosPuntos.map((p) => (
              <Cell
                key={p.id}
                fill={tecnologiaToColor(p.color_tecnologia)}
                stroke={p.id === "propio" ? "#002E68" : "transparent"}
                strokeWidth={p.id === "propio" ? 2 : 0}
                r={p.id === "propio" ? 10 : 5}
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>

      <p className="text-xs leading-relaxed text-muted-foreground">
        Cada punto es una PyME uruguaya que pasó por este diagnóstico. El tuyo está más
        grande y con borde. Más a la derecha significa más rápido para moverse con el mercado;
        más arriba significa más organizado puertas adentro. El color muestra qué tan
        digitalizado está el negocio: más intenso, más digitalizado.
      </p>
      <p className="text-xs leading-relaxed text-muted-foreground">
        No hay un cuadrante mejor que otro. Hay negocios sanos en cada zona del mapa.
        Lo que sale de acá es para charlar con tu equipo, no para compararse.
      </p>
    </div>
  );
}