"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Svg,
  Circle,
  Line,
} from "@react-pdf/renderer";

// Paleta Pulso PyME · ANTEL (placeholder hasta manual de marca oficial)
const C = {
  navy:    "#002E68",
  teal:    "#2E8B8B",
  tealSoft:"#EEF3F7",
  texto:   "#1A1A1A",
  gris:    "#5C5C5C",
  borde:   "#CCCCCC",
  blanco:  "#FFFFFF",
};

const styles = StyleSheet.create({
  page:        { padding: 48, fontFamily: "Helvetica", backgroundColor: C.blanco },
  banda:       { position: "absolute", bottom: 0, left: 0, right: 0, height: 8, backgroundColor: C.navy },
  titulo:      { fontSize: 26, fontFamily: "Helvetica-Bold", color: C.navy, marginBottom: 8 },
  subtitulo:   { fontSize: 14, color: C.teal, marginBottom: 24 },
  h2:          { fontSize: 16, fontFamily: "Helvetica-Bold", color: C.navy, marginBottom: 6, marginTop: 16 },
  h3:          { fontSize: 12, fontFamily: "Helvetica-Bold", color: C.teal, marginBottom: 4 },
  body:        { fontSize: 10, color: C.texto, lineHeight: 1.6, marginBottom: 8 },
  badge:       { backgroundColor: C.tealSoft, color: C.navy, fontSize: 10, padding: "4 10", borderRadius: 4, alignSelf: "flex-start", marginBottom: 8 },
  separador:   { borderBottom: `1 solid ${C.borde}`, marginVertical: 12 },
  fila:        { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  label:       { fontSize: 10, color: C.texto },
  valor:       { fontSize: 10, fontFamily: "Helvetica-Bold", color: C.navy },
  linea_compromiso: { borderBottom: `1 solid ${C.borde}`, height: 24, marginBottom: 8 },
});

function nivelLabel(nivel: string) {
  return ({ bajo: "Bajo", medio: "Medio", alto: "Alto" } as Record<string, string>)[nivel] ?? nivel;
}

function tecLabel(nivel: string) {
  return ({
    punto_de_partida: "Punto de partida",
    en_camino:        "En camino",
    consolidado:      "Consolidado",
  } as Record<string, string>)[nivel] ?? nivel;
}

function tecColor(puntaje: number | null): string {
  if (puntaje === null) return C.tealSoft;
  // Gradiente teal-soft (#EEF3F7) → navy (#002E68)
  const t = Math.max(0, Math.min(100, puntaje)) / 100;
  const r = Math.round(0xEE + (0x1F - 0xEE) * t);
  const g = Math.round(0xF3 + (0x3A - 0xF3) * t);
  const b = Math.round(0xF7 + (0x5F - 0xF7) * t);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

function ScatterPDF({
  puntos,
  propio,
}: {
  puntos: Array<{ eje_externo: number; eje_interno: number; color_tecnologia: number | null }>;
  propio: { eje_externo: number; eje_interno: number; color_tecnologia: number | null };
}) {
  const W = 400, H = 240, PAD = 30;
  const toX = (v: number) => PAD + (v / 100) * (W - PAD * 2);
  const toY = (v: number) => H - PAD - (v / 100) * (H - PAD * 2);

  return (
    <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <Line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke={C.borde} strokeWidth={1} />
      <Line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke={C.borde} strokeWidth={1} />
      {puntos.map((p, i) => (
        <Circle
          key={i}
          cx={toX(p.eje_externo)}
          cy={toY(p.eje_interno)}
          r={4}
          fill={tecColor(p.color_tecnologia)}
        />
      ))}
      <Circle
        cx={toX(propio.eje_externo)}
        cy={toY(propio.eje_interno)}
        r={8}
        fill={tecColor(propio.color_tecnologia)}
        stroke={C.navy}
        strokeWidth={2}
      />
    </Svg>
  );
}

import type { DimensionBaja } from "@/lib/oc-engine/recomendaciones-expandidas";
import { PRINCIPIO_LABEL } from "@/lib/oc-engine/recomendaciones-expandidas";

export interface KitPDFProps {
  contexto: { rubro: string; empleados: string; antiguedad: string; rol?: string };
  resultado: {
    iaoGeneral: number;
    nivelGeneral: string;
    ejes: { externo: { iao: number }; interno: { iao: number } };
    dimensiones: Array<{ etiqueta: string; iao: number; nivel: string; recomendacionTexto: string }>;
  };
  resultadoTec: {
    puntaje: number;
    nivel: string;
    porDimension: Record<string, number | undefined>;
    recomendacionesDim: Array<{ label: string; texto: string }>;
  };
  resultadoIA: { estado: string; estadoLabel: string; recomendacion: string };
  puntosEcosistema: Array<{ eje_externo: number; eje_interno: number; color_tecnologia: number | null }>;
  fecha: string;
  /**
   * Dimensiones con score ≤ 50 (bajas), TODAS — sin límite top 3.
   * Anexo §5.2: en PDF se incluyen todas las bajas, una página por cada una.
   */
  dimensionesBajasExpandidas: DimensionBaja[];
}

export function KitConversacionPDF({
  contexto,
  resultado,
  resultadoTec,
  resultadoIA,
  puntosEcosistema,
  fecha,
  dimensionesBajasExpandidas,
}: KitPDFProps) {
  return (
    <Document>
      {/* Página 1 — Portada */}
      <Page size="A4" style={styles.page}>
        <View style={{ flex: 1, justifyContent: "center" }}>
          <Text style={{ fontSize: 10, color: C.teal, fontFamily: "Helvetica-Bold", marginBottom: 4, letterSpacing: 1 }}>
            PULSO PYME · ANTEL
          </Text>
          <Text style={styles.titulo}>Tu diagnóstico{"\n"}de adaptabilidad</Text>
          <Text style={styles.subtitulo}>Un mapa para conversar con tu equipo</Text>
          <View style={styles.separador} />
          <Text style={styles.body}>Rubro: {contexto.rubro}</Text>
          <Text style={styles.body}>Tamaño: {contexto.empleados}</Text>
          <Text style={styles.body}>Antigüedad: {contexto.antiguedad}</Text>
          {contexto.rol ? <Text style={styles.body}>Rol: {contexto.rol}</Text> : null}
          <Text style={{ ...styles.body, marginTop: 24, color: C.gris }}>{fecha}</Text>
          <Text style={{ ...styles.body, marginTop: 4, color: C.gris, fontSize: 9 }}>
            Sin nombre, sin empresa, sin identificación.
          </Text>
        </View>
        <View style={styles.banda} />
      </Page>

      {/* Página 2 — Este diagnóstico es distinto */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.h2}>Este diagnóstico es distinto.</Text>
        <Text style={styles.body}>
          No hay una nota al final ni un puntaje que diga si tu negocio está bien o mal,
          y nadie va a evaluarlo desde afuera.{"\n\n"}
          Este diagnóstico es para entender dónde y cómo está tu negocio.{"\n\n"}
          Es una herramienta para vos y para tu equipo. Sirve para abrir una conversación
          puertas adentro del negocio — entre el dueño y los que recién entraron, entre el
          que está con el cliente y el que lleva los números, entre quien conoce el rubro de
          toda la vida y quien recién llega con otra mirada.{"\n\n"}
          Lo que sale de acá no es un diagnóstico que alguien te entrega para que vos hagas algo.{"\n\n"}
          Es un mapa para que ustedes lo miren juntos. Las preguntas tocan temas que muchas
          veces no se charlan: cómo se toman las decisiones, qué pasa cuando alguien se
          equivoca, quién conoce los números, cómo se reacciona ante un cambio del mercado.
          Las respuestas — sobre todo donde no coincidan entre ustedes — son el comienzo de
          una mesa de trabajo honesta.{"\n\n"}
          No buscamos la respuesta que queda bien. Buscamos la respuesta verdadera, porque
          es la única que sirve para mejorar. Y mejorar no es llegar a un ideal: es entrar
          en un proceso de conversación, aprendizaje y ajuste continuo donde todos los que
          trabajan en el negocio aportan lo que saben.{"\n\n"}
          Para algunas cosas que aparezcan vas a necesitar formación, herramientas o
          acompañamiento de afuera. Está bien — darte cuenta es parte del valor de hacerse
          las preguntas.{"\n\n"}
          Contestá con honestidad, con crudeza.{"\n\n"}
          Después, sentate con tu equipo y charlen lo que aparezca. Lo que respondas se
          guarda de forma anónima: sin nombre, sin empresa, sin nadie que pueda identificarte.
        </Text>
        <View style={styles.banda} />
      </Page>

      {/* Página 3 — IAO */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.h2}>Tu Índice de Adaptabilidad Organizacional</Text>
        <View style={{ flexDirection: "row", alignItems: "baseline", marginBottom: 4 }}>
          <Text style={{ fontSize: 40, fontFamily: "Helvetica-Bold", color: C.navy }}>
            {resultado.iaoGeneral}
          </Text>
          <Text style={{ fontSize: 16, color: C.gris }}> / 100</Text>
        </View>
        <Text style={styles.badge}>{nivelLabel(resultado.nivelGeneral)}</Text>
        <View style={styles.separador} />
        <View style={styles.fila}>
          <Text style={styles.label}>Eje externo (mercado)</Text>
          <Text style={styles.valor}>{resultado.ejes.externo.iao} / 100</Text>
        </View>
        <View style={styles.fila}>
          <Text style={styles.label}>Eje interno (puertas adentro)</Text>
          <Text style={styles.valor}>{resultado.ejes.interno.iao} / 100</Text>
        </View>
        <View style={styles.separador} />
        <Text style={styles.h3}>Recomendaciones por dimensión</Text>
        {resultado.dimensiones.map((d) => (
          <View key={d.etiqueta} style={{ marginBottom: 10 }}>
            <Text style={{ fontSize: 10, fontFamily: "Helvetica-Bold", color: C.texto }}>{d.etiqueta}</Text>
            <Text style={{ fontSize: 9, color: C.gris }}>{nivelLabel(d.nivel)} · {d.iao}/100</Text>
            <Text style={{ fontSize: 9, color: C.texto, lineHeight: 1.5 }}>{d.recomendacionTexto}</Text>
          </View>
        ))}
        <View style={styles.banda} />
      </Page>

      {/* Páginas extendidas — una por dimensión BAJA con marco de 4 capas (Anexo §3) */}
      {dimensionesBajasExpandidas.map((dim) => (
        <Page key={`exp-${dim.dimensionId}`} size="A4" style={styles.page}>
          <Text style={{ fontSize: 10, color: C.teal, fontFamily: "Helvetica-Bold", letterSpacing: 1, marginBottom: 4 }}>
            POR DÓNDE EMPEZAR · {dim.etiqueta.toUpperCase()}
          </Text>
          <Text style={{ ...styles.h2, marginTop: 0 }}>{dim.etiqueta}</Text>
          <Text style={{ ...styles.badge, backgroundColor: "#FCE7E7", color: "#A33232" }}>
            Bajo · {dim.score}/100
          </Text>

          {/* Capa 1 — Señal */}
          <Text style={styles.h3}>Lo que mostró tu pulso</Text>
          <Text style={styles.body}>{dim.recomendacion.senal}</Text>

          {/* Capa 2 — Desarmar idea común (opcional) */}
          {dim.recomendacion.desarmarIdea && (
            <>
              <Text style={styles.h3}>Desarmar una idea común</Text>
              <Text style={styles.body}>{dim.recomendacion.desarmarIdea}</Text>
            </>
          )}

          {/* Capa 3a — Argumento conceptual */}
          <Text style={styles.h3}>Por qué importa</Text>
          <Text style={styles.body}>{dim.recomendacion.argumentoConceptual}</Text>

          {/* Capa 3b — Costo cotidiano */}
          <View style={{ backgroundColor: C.tealSoft, padding: 8, borderRadius: 4, marginBottom: 8 }}>
            <Text style={{ fontSize: 8, fontFamily: "Helvetica-Bold", color: C.navy, marginBottom: 2 }}>
              CÓMO SE SIENTE EN EL DÍA A DÍA
            </Text>
            <Text style={{ fontSize: 9, color: C.texto, lineHeight: 1.5 }}>
              {dim.recomendacion.costoCotidiano}
            </Text>
          </View>

          {/* Capa 3c — Principios conectados */}
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4, marginBottom: 12 }}>
            {dim.recomendacion.principiosConectados.map((p) => (
              <Text
                key={p}
                style={{
                  fontSize: 8,
                  fontFamily: "Helvetica-Bold",
                  color: C.navy,
                  backgroundColor: "#FFF",
                  borderColor: C.navy,
                  borderWidth: 0.5,
                  padding: "2 6",
                  borderRadius: 8,
                  marginRight: 4,
                }}
              >
                {PRINCIPIO_LABEL[p]}
              </Text>
            ))}
          </View>

          {/* Capa 4 — Cómo moverte: 3 lentes */}
          <Text style={styles.h3}>Cómo moverte</Text>
          <View style={{ marginBottom: 6 }}>
            <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", color: C.teal, marginBottom: 2 }}>
              Mirando al cliente
            </Text>
            <Text style={{ fontSize: 9, color: C.texto, lineHeight: 1.5, marginBottom: 6 }}>
              {dim.recomendacion.comoMoverte.cliente}
            </Text>
          </View>
          <View style={{ marginBottom: 6 }}>
            <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", color: C.teal, marginBottom: 2 }}>
              Mirando al contexto
            </Text>
            <Text style={{ fontSize: 9, color: C.texto, lineHeight: 1.5, marginBottom: 6 }}>
              {dim.recomendacion.comoMoverte.contexto}
            </Text>
          </View>
          <View>
            <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", color: C.teal, marginBottom: 2 }}>
              Mirando la competitividad
            </Text>
            <Text style={{ fontSize: 9, color: C.texto, lineHeight: 1.5 }}>
              {dim.recomendacion.comoMoverte.competitividad}
            </Text>
          </View>

          <View style={styles.banda} />
        </Page>
      ))}

      {/* Página 4 — Tecnología y datos */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.h2}>Una lectura aparte sobre tecnología y datos</Text>
        <Text style={styles.body}>
          Esto no entra en el puntaje principal de adaptabilidad. Es una mirada complementaria
          sobre desde dónde arrancás con la tecnología.
        </Text>
        <View style={{ flexDirection: "row", alignItems: "baseline", marginBottom: 4 }}>
          <Text style={{ fontSize: 32, fontFamily: "Helvetica-Bold", color: C.navy }}>
            {Math.round(resultadoTec.puntaje)}
          </Text>
          <Text style={{ fontSize: 14, color: C.gris }}> / 100</Text>
        </View>
        <Text style={styles.badge}>{tecLabel(resultadoTec.nivel)}</Text>
        <View style={styles.separador} />
        {resultadoTec.recomendacionesDim.map((d) => (
          <View key={d.label} style={{ marginBottom: 10 }}>
            <Text style={{ fontSize: 10, fontFamily: "Helvetica-Bold", color: C.texto }}>{d.label}</Text>
            <Text style={{ fontSize: 9, color: C.texto, lineHeight: 1.5 }}>{d.texto}</Text>
          </View>
        ))}
        <View style={styles.banda} />
      </Page>

      {/* Página 5 — IA */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.h2}>Tu punto de partida con IA</Text>
        <Text style={styles.body}>
          Esto tampoco entra en el puntaje principal. Es para saber en qué momento estás
          respecto a la inteligencia artificial.
        </Text>
        <Text style={{ fontSize: 18, fontFamily: "Helvetica-Bold", color: C.navy, marginBottom: 12 }}>
          {resultadoIA.estadoLabel}
        </Text>
        <Text style={styles.body}>{resultadoIA.recomendacion}</Text>
        <View style={styles.banda} />
      </Page>

      {/* Página 6 — Mapa del ecosistema */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.h2}>Acá estás vos en el ecosistema PyME uruguayo.</Text>
        <Text style={styles.body}>
          Así es como vos ves a tu empresa y cómo se ubica en el mapa respecto de otras.
        </Text>
        <ScatterPDF
          puntos={puntosEcosistema}
          propio={{
            eje_externo: resultado.ejes.externo.iao,
            eje_interno: resultado.ejes.interno.iao,
            color_tecnologia: resultadoTec.puntaje,
          }}
        />
        <Text style={{ ...styles.body, marginTop: 12 }}>
          Cada punto es una PyME uruguaya que pasó por este diagnóstico. El tuyo está más
          grande y con borde. Más a la derecha: más rápido para moverse con el mercado.
          Más arriba: más organizado puertas adentro. El color muestra qué tan digitalizado
          está el negocio.
        </Text>
        <Text style={styles.body}>
          No hay un cuadrante mejor que otro. Lo que sale de acá es para charlar con tu
          equipo, no para compararse.
        </Text>
        <View style={styles.banda} />
      </Page>

      {/* Página 7 — Cómo usar esto con tu equipo */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.h2}>Cómo aprovechar este diagnóstico</Text>
        <Text style={styles.body}>
          Este diagnóstico no termina cuando lo descargás. Recién ahí empieza.
        </Text>
        {[
          ["1. Convocá a las personas, no solo a los puestos.",
           "Para una conversación honesta no alcanza con el dueño y el contador. Sumá a quien atiende al cliente todos los días, a quien recién entró y mira con ojos nuevos, a quien lleva años y conoce las mañas del negocio. La mesa rinde cuando hay miradas distintas."],
          ["2. Pasá las preguntas — no las respuestas.",
           "Antes de mostrar los resultados, pedile a cada uno que conteste el cuestionario por su cuenta. Las diferencias entre las respuestas son el material más valioso de la conversación."],
          ["3. Empezá por una dimensión, no por todas.",
           "Mirar el reporte entero genera parálisis. Elegí una dimensión donde vieron diferencias o donde el puntaje les llamó la atención, y trabájenla a fondo."],
          ["4. Pregunten \"qué\" antes que \"quién\".",
           "El instinto es buscar responsables. La pregunta que abre conversación es otra: qué está pasando que esto sea así, qué del cómo trabajamos lo sostiene."],
          ["5. Salgan con un compromiso chico, no con un plan grande.",
           "Una mesa que termina con \"vamos a transformarnos\" termina sin hacer nada. Una que termina con \"vamos a probar esto durante dos semanas y volvemos a vernos\" arranca el cambio."],
          ["6. Volvé al diagnóstico en seis meses.",
           "No para sacarse mejor nota. Para ver qué se movió, qué quedó igual, y qué cosas nuevas aparecieron. La adaptabilidad no es un estado, es un proceso."],
        ].map(([titulo, cuerpo]) => (
          <View key={titulo} style={{ marginBottom: 10 }}>
            <Text style={{ fontSize: 10, fontFamily: "Helvetica-Bold", color: C.texto }}>{titulo}</Text>
            <Text style={{ fontSize: 9, color: C.texto, lineHeight: 1.5 }}>{cuerpo}</Text>
          </View>
        ))}
        <View style={styles.banda} />
      </Page>

      {/* Página 8 — Hoja de compromisos */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.h2}>Compromisos del equipo</Text>
        <Text style={styles.body}>Fecha de la mesa: ___________________________</Text>
        <Text style={styles.body}>Quiénes estuvieron: _________________________________________________</Text>
        <View style={styles.separador} />
        <Text style={styles.h3}>Qué vamos a probar</Text>
        <Text style={{ fontSize: 9, color: C.gris, marginBottom: 8 }}>
          Una sola cosa, concreta, con plazo corto
        </Text>
        {[...Array(5)].map((_, i) => <View key={i} style={styles.linea_compromiso} />)}
        <View style={styles.separador} />
        <Text style={styles.h3}>Quién lo lleva adelante</Text>
        {[...Array(2)].map((_, i) => <View key={i} style={styles.linea_compromiso} />)}
        <View style={styles.separador} />
        <Text style={styles.h3}>Cuándo nos volvemos a juntar para revisar</Text>
        <View style={styles.linea_compromiso} />
        <View style={styles.separador} />
        <Text style={styles.h3}>Qué dimensión queremos mirar la próxima vez</Text>
        {[...Array(2)].map((_, i) => <View key={i} style={styles.linea_compromiso} />)}
        <View style={{ position: "absolute", bottom: 24, left: 48, right: 48 }}>
          <Text style={{ fontSize: 8, color: C.gris, textAlign: "center" }}>
            Pulso PyME · ANTEL — Empresas Uruguayas Inteligentes · Powered by Adaptant Studio · OC Framework v2.0
          </Text>
        </View>
        <View style={styles.banda} />
      </Page>
    </Document>
  );
}