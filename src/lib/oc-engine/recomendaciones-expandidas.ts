/**
 * Recomendaciones expandidas del IAO — marco de cuatro capas.
 *
 * Implementa el Anexo de Recomendaciones Expandidas (Adaptant + Ernesto, v1).
 * Solo cubre scores BAJOS (≤ 50/100) por dimensión. Para medio/alto se sigue
 * usando el texto plano de `recommendations.ts → RECOMENDACIONES[...].recomendacion`.
 *
 * Las 4 capas:
 *   Capa 1 — Señal: lectura factual, sin juicio.
 *   Capa 2 — Desarmar una idea común (OPCIONAL): solo cuando hay una creencia
 *            recibida que sostiene el problema.
 *   Capa 3 — Por qué importa: argumento conceptual + costo cotidiano +
 *            principios conectados.
 *   Capa 4 — Cómo moverte: 3 lentes (cliente / contexto / competitividad).
 *
 * Los textos son copy literal del anexo aprobado. NO reescribir sin
 * autorización de Adaptant Studio.
 */

import type { DimensionId } from "./questionnaire";

/** Los cuatro principios sobre los que se construye la adaptabilidad (anexo §1). */
export type Principio = "autonomia" | "no_burocracia" | "tecnologia_valor" | "afuera_negocio";

export const PRINCIPIO_LABEL: Record<Principio, string> = {
  autonomia: "Autonomía",
  no_burocracia: "No Burocracia",
  tecnologia_valor: "Tecnología para el valor",
  afuera_negocio: "El afuera del negocio",
};

export interface TresLentes {
  /** Cómo este movimiento mejora cómo el negocio sirve al cliente. */
  cliente: string;
  /** Cómo este movimiento prepara para cambios del entorno. */
  contexto: string;
  /** Cómo este movimiento sostiene la capacidad de seguir compitiendo. */
  competitividad: string;
}

export interface RecomendacionExpandida {
  /** Capa 1 — Lo que mostró tu pulso (factual, sin juicio). */
  senal: string;
  /** Capa 2 — Desarmar una idea común (opcional). */
  desarmarIdea?: string;
  /** Capa 3a — Argumento conceptual: por qué esto importa desde los principios. */
  argumentoConceptual: string;
  /** Capa 3b — Costo cotidiano: cómo se siente esto en el día a día. */
  costoCotidiano: string;
  /** Capa 3c — Principios conectados. */
  principiosConectados: Principio[];
  /** Capa 4 — Cómo moverte: 3 lentes. */
  comoMoverte: TresLentes;
}

/**
 * Recomendaciones expandidas para las 10 dimensiones del IAO.
 * Se renderizan cuando el score de la dimensión es BAJO (≤ 50/100).
 */
export const RECOMENDACIONES_EXPANDIDAS: Record<DimensionId, RecomendacionExpandida> = {
  // ═══════════════════════════════════════════════════════════════════════
  // EJE EXTERNO
  // ═══════════════════════════════════════════════════════════════════════

  velocidad_respuesta: {
    senal:
      "Cuando algo cambia afuera —un cliente pide algo nuevo, un proveedor cambia condiciones, aparece una tendencia— el negocio se entera tarde, o se entera a tiempo pero reacciona despacio. Las decisiones que deberían ser ágiles se toman con tiempos largos.",
    argumentoConceptual:
      "La velocidad de respuesta no es 'ser apurado'. Es tener la capacidad de actuar cuando una ventana se abre, antes de que se cierre. En mercados que cambian más rápido que antes, la diferencia entre una PyME que aprovecha una oportunidad y otra que la pierde no suele ser inteligencia ni recursos —es tiempo de respuesta.",
    costoCotidiano:
      "El negocio vive apagando incendios, no aprovechando oportunidades. Las cosas se enteran 'porque alguien comentó', no porque exista una forma de escuchar afuera. Cuando una oportunidad aparece, se discute dos semanas y se decide cuando ya pasó. El equipo siente que siempre va corriendo atrás de lo urgente, sin tiempo para mirar lo importante. El dueño termina absorbiendo todas las decisiones porque 'nadie más reacciona rápido' —y eso lo agota.",
    principiosConectados: ["afuera_negocio", "autonomia"],
    comoMoverte: {
      cliente:
        "¿Hay alguna forma sistemática de saber qué están pidiendo los clientes hoy que no pedían el año pasado? ¿O nos enteramos solo cuando uno se va? Empezar por crear un canal mínimo de escucha al cliente —aunque sea una reunión quincenal de quien atiende— ya cambia los tiempos de respuesta.",
      contexto:
        "¿Qué señales del entorno (regulación, tecnología, sector) estamos siguiendo activamente? Si nadie está mirando, las sorpresas son siempre malas. Asignar a alguien del equipo la responsabilidad explícita de leer el sector una vez por semana —aunque sean 30 minutos— mueve la aguja.",
      competitividad:
        "En sectores que cambian rápido, las PyMEs que se mueven primero capturan a los clientes que están buscando alternativas. Identificar una sola decisión que hoy se traba esperando al dueño, y diseñar cómo descentralizarla, suele ser el primer paso de mayor impacto.",
    },
  },

  conversacion_sector: {
    senal:
      "La escucha al cliente y al sector pasa más por intuición o por episodios aislados que por una forma sistemática de hacerlo. Lo que el cliente dice queda en la persona que lo atendió; lo que pasa en el sector se sabe 'porque alguien lo comentó'.",
    desarmarIdea:
      "Hay una creencia que conviene nombrar: que escuchar al cliente es algo que hace el área de ventas o atención, y que el resto del negocio se entera 'cuando hace falta'. Eso es lo opuesto a lo que necesita una PyME adaptativa. La escucha al cliente y al sector no es una función de un área —es una capacidad transversal del negocio entero. Cuando solo una persona o un área escucha, lo que el cliente dice se traduce mal, se diluye, o no llega nunca a quien podría hacer algo al respecto.",
    argumentoConceptual:
      "El cliente le dice al negocio, todos los días, lo que necesita y lo que le falta. La pregunta no es si está hablando —siempre está hablando. La pregunta es si el negocio está escuchando, y si lo que escucha se vuelve algo accionable.",
    costoCotidiano:
      "El cliente te dice algo importante y nadie lo registra. La próxima vez que entra, repite la misma queja. La tercera vez se va. O peor: el negocio se entera de que un cliente importante se fue cuando ya se fue, y nadie puede explicar por qué. Adentro, las personas que atienden saben perfectamente qué está pasando pero no tienen forma de que esa información llegue donde se toman las decisiones. El equipo se frustra porque ve los patrones y nadie los procesa.",
    principiosConectados: ["afuera_negocio", "no_burocracia"],
    comoMoverte: {
      cliente:
        "¿Qué pasa hoy con lo que el cliente dice? ¿Se anota? ¿Se comparte? ¿Se discute? Si la respuesta a las tres es 'no sistemáticamente', crear un mecanismo simple —una libreta compartida, un grupo de WhatsApp, una reunión semanal corta— ya cambia el flujo.",
      contexto:
        "¿Charlan con otras PyMEs del rubro? ¿Saben qué está cambiando en el sector más allá de su propio negocio? La conversación sectorial es subestimada: las PyMEs que se reúnen con sus pares ven cambios antes y se preparan mejor.",
      competitividad:
        "Cuando una PyME conoce a su cliente mejor que la competencia, eso es ventaja sostenible —no se compra, se construye. Y se construye día a día, con sistemas mínimos de escucha. La diferencia entre 'atendemos al cliente' y 'escuchamos al cliente' es la diferencia entre transacción y relación.",
    },
  },

  tiempo_innovacion: {
    senal:
      "Hace tiempo que no cambian algo importante de lo que ofrecen. La oferta del negocio es prácticamente la misma que era hace varios años.",
    desarmarIdea:
      "Hay una idea que conviene desarmar de entrada: que innovar es lanzar un producto nuevo y disruptivo. Eso es una forma de innovar, pero no es la más común ni la más útil para una PyME. Innovar es, en su forma más cotidiana, ajustar lo que ofrecés a partir de lo que aprendiste. Cambiar una forma de empaquetar, sumar un servicio que complementa lo principal, modificar cómo se entrega, repensar para quién es. La innovación útil de una PyME suele ser pequeña, frecuente y conectada con lo que el cliente está pidiendo —no épica.",
    argumentoConceptual:
      "Una oferta que no cambia en años está hablando, sin querer, de un negocio que dejó de escuchar afuera. No es que la oferta esté mal —es que el afuera cambió y la oferta no se enteró.",
    costoCotidiano:
      "El cliente nuevo no encuentra una razón distinta para elegirte. Te compran los de siempre, por costumbre o relación, pero no entran clientes nuevos —y cuando los de siempre se van (porque siempre algunos se van), el negocio empieza a notarlo. El equipo trabaja muy bien lo mismo de siempre, pero nadie tiene la energía o el espacio para preguntarse '¿qué deberíamos estar ofreciendo distinto?'. Cuando una idea aparece, no hay forma sistemática de probarla, así que se descarta o se posterga.",
    principiosConectados: ["afuera_negocio", "autonomia"],
    comoMoverte: {
      cliente:
        "¿Cuándo fue la última vez que le preguntaron a un cliente 'qué te gustaría que ofreciéramos que no ofrecemos hoy'? Esa pregunta, hecha en serio a 10 clientes, suele revelar entre 1 y 3 oportunidades concretas para iterar la oferta.",
      contexto:
        "¿Qué están haciendo otras PyMEs del rubro que ustedes no? No para copiar, sino para entender qué señales del sector están leyendo ellos que ustedes pueden estar perdiendo. Es información gratuita y sub-aprovechada.",
      competitividad:
        "El negocio que innova de forma pequeña y frecuente termina ofreciendo, en 3 años, algo bastante distinto de lo que ofrecía. El que no, en 3 años ofrece lo mismo —y suele descubrir que el mercado se movió sin él. Definir un experimento chico de cambio en la oferta para los próximos 60 días es más útil que un plan grande.",
    },
  },

  // ═══════════════════════════════════════════════════════════════════════
  // EJE INTERNO
  // ═══════════════════════════════════════════════════════════════════════

  estructura_valor: {
    senal:
      "La forma en que está organizado el negocio depende mucho del dueño. Si el dueño se toma 15 días sin computadora, las cosas se frenan o se complican. La estructura está más en la cabeza del dueño que en formas de trabajar que el equipo pueda sostener solo.",
    desarmarIdea:
      "Antes de entrar al diagnóstico, hay una idea muy común en las PyMEs uruguayas que vale la pena nombrar: que 'yo soy el que sabe cómo funciona esto, y por eso tiene que pasar por mí'. Esa frase suele ser cierta, pero suele también ser una trampa. Es cierta porque, efectivamente, el dueño sabe más que nadie de su negocio. Y es trampa porque mientras todo sigue pasando por él, el negocio nunca aprende a funcionar sin él. La estructura no es lo opuesto al criterio del dueño —es la forma en que ese criterio se vuelve capacidad colectiva, en vez de quedar atrapado en una sola cabeza.",
    argumentoConceptual:
      "Un negocio que depende del dueño no es solo frágil —es un negocio que no puede crecer más allá del ancho de banda del dueño. Y eso es un techo invisible. El equipo está, pero no puede tomar decisiones porque no tiene las formas de trabajo que lo habiliten.",
    costoCotidiano:
      "El dueño no puede tomarse vacaciones tranquilo, no puede enfermarse sin sentir culpa, no puede tomarse un día. La frase 'sin mí esto se cae' se vuelve realidad y se vuelve cárcel. El equipo se siente, en paralelo, infantilizado: tienen capacidad, pero sienten que no se les confía. Y cuando llega una urgencia y el dueño no está, todo se frena —o, peor, el equipo toma decisiones sin información y se equivoca.",
    principiosConectados: ["autonomia", "no_burocracia"],
    comoMoverte: {
      cliente:
        "¿Qué experiencia tiene el cliente cuando el dueño no está? Si la respuesta es 'una peor', eso es información sobre dónde están los huecos de estructura. El cliente no debería notar la ausencia del dueño.",
      contexto:
        "¿El negocio podría sobrevivir un mes operando solo con el equipo, si el dueño tuviera que ausentarse por una situación seria? La pregunta es incómoda, pero la respuesta sincera es el diagnóstico real de la estructura.",
      competitividad:
        "Las PyMEs que tienen estructura más allá del dueño escalan mejor, retienen mejor a su gente buena, y son más resilientes ante imprevistos. Empezar por una sola decisión que hoy pasa por el dueño y diseñar cómo dejar de pasar por ahí, suele ser el primer paso de mayor impacto.",
    },
  },

  peso_jerarquia: {
    senal:
      "Las decisiones importantes —incluyendo varias que no necesariamente lo son— se concentran en el dueño o en muy pocas personas. Las personas del equipo tienen poco margen para resolver por su cuenta sin escalar.",
    desarmarIdea:
      "Hay una creencia que conviene nombrar y desarmar: que delegar es perder control. Suele ser intuición del dueño, y suele ser falsa. Delegar no es soltar el control. Es distribuir la capacidad de tomar decisiones con criterios compartidos. El control real no está en aprobar todo —está en que las personas tengan claro qué pueden decidir, hasta dónde, con qué información, y qué hacer cuando aparece algo que no entra en lo previsto. Ese es el control sano. La aprobación de cada cosa es la ilusión de control, no el control.",
    argumentoConceptual:
      "Cuando todas las decisiones pasan por arriba, el negocio se vuelve tan lento como la persona que está arriba. Y esa persona, al mismo tiempo, se desgasta atendiendo decisiones que no deberían requerirla.",
    costoCotidiano:
      "El equipo se siente con las manos atadas. Ven el problema, tienen criterio para resolverlo, pero esperan permiso. Cuando el permiso tarda, el problema crece. Cuando llega, ya pasó la ventana. Y arriba, el dueño o gerente se siente abrumado: dedica el día a aprobar decisiones de a una, sin tiempo para mirar el negocio. La paradoja es que ambos —arriba y abajo— sienten que tienen menos control del que querrían, no más.",
    principiosConectados: ["autonomia", "no_burocracia"],
    comoMoverte: {
      cliente:
        "Cuando el cliente pide algo no previsto —un cambio, una excepción, una solución particular— ¿la persona que lo atiende puede resolver o tiene que ir a preguntar? Cada 'tengo que consultar y te aviso' es una microerosión de la confianza del cliente.",
      contexto:
        "¿Qué decisiones está tomando hoy el dueño que, sinceramente, alguien del equipo podría tomar con menos información de la que el dueño tiene? Esas son las primeras candidatas a descentralizar.",
      competitividad:
        "Las PyMEs donde el equipo decide con autonomía suelen retener mejor a su gente buena. Las personas con criterio no se quedan en lugares donde se les pide solo ejecutar. Pasar de 'todo se aprueba' a 'estas cosas las decide tal persona dentro de estos criterios' es uno de los movimientos con mejor relación esfuerzo / impacto que existen.",
    },
  },

  acceso_informacion: {
    senal:
      "Los números y la información del negocio viven en pocas personas (o en una sola). Cuando hay que decidir, no todos los que podrían aportar tienen lo que necesitan para hacerlo.",
    argumentoConceptual:
      "La adaptabilidad de un negocio no depende de tener mejores estrategas arriba —depende de que la información llegue al lugar donde se toma la decisión, en el momento que se toma. Si la info está concentrada, las decisiones también lo están, y eso reduce la velocidad y la calidad con que el negocio responde a lo que pasa afuera.",
    costoCotidiano:
      "Cuando la adaptabilidad depende de una persona que lo sabe todo —o del que es más hábil para resolver—, los cuellos de botella son inevitables. La gente se siente frenada esperando a que esa persona esté disponible. Esa persona se siente sobrecargada, porque todo termina pasando por ella. El estrés se acumula de los dos lados, y el negocio queda atado al ancho de banda de un solo cerebro.",
    principiosConectados: ["no_burocracia", "autonomia"],
    comoMoverte: {
      cliente:
        "Cuando un cliente pregunta algo o pide algo, ¿la persona que lo atiende tiene acceso a la información para resolverlo, o tiene que ir a buscar a alguien que sí sabe? Cada vez que tiene que ir a buscar, el cliente espera —y la confianza del cliente en que 'este negocio resuelve' se erosiona. Empezar por ahí suele revelar dónde están los cuellos de botella reales.",
      contexto:
        "¿Qué información del negocio te gustaría tener disponible cuando el entorno cambia (un proveedor sube precios, aparece un competidor, cambia una regulación)? Esa lista es la prioridad de qué descentralizar primero. Si todo eso lo tiene una sola persona en la cabeza, el negocio reacciona tarde —no porque sea lento, sino porque tiene un solo punto de procesamiento.",
      competitividad:
        "Las PyMEs que pueden decidir rápido sin esperar al dueño son las que mejor aprovechan oportunidades cortas. Y son también las que no se rompen cuando esa persona clave se enferma, se va de vacaciones o decide tomarse un día. Empezar por un tablero compartido —aunque sea simple— suele ser el primer paso para que el conocimiento empiece a circular.",
    },
  },

  // ═══════════════════════════════════════════════════════════════════════
  // EJE TRANSVERSAL
  // ═══════════════════════════════════════════════════════════════════════

  voz: {
    senal:
      "La relación entre las personas del negocio funciona, pero la voz de quienes no están en posiciones de decisión no termina de llegar a donde se decide. Las ideas, observaciones y propuestas del equipo no tienen un canal claro.",
    desarmarIdea:
      "Conviene nombrar algo que aparece seguido en estas conversaciones: la idea de que escuchar al equipo es entrar en una dinámica democrática o asambleísta, donde todo se discute y nada se decide. Esa caricatura no se sostiene en la práctica de las PyMEs adaptativas. Dar voz al equipo no es someter cada decisión a votación. Es crear formas en que la información, las ideas y las observaciones del equipo lleguen a donde se decide, y que quien decide tenga ese insumo a mano. El que decide sigue decidiendo. Lo que cambia es la calidad del insumo con que decide.",
    argumentoConceptual:
      "Las personas del equipo son las que están más cerca del problema. Ven cosas que el dueño no ve, escuchan al cliente directamente, conocen los detalles de la operación. Cuando esa visibilidad no circula, el negocio decide con información empobrecida.",
    costoCotidiano:
      "Las buenas ideas existen pero no llegan. Alguien del equipo ve un problema, propone una solución, no recibe respuesta, y la próxima vez no propone. Después de un par de iteraciones de eso, las personas se desconectan emocionalmente del negocio. Cumplen su rol, pero dejan de aportar. La sensación de 'no me escuchan' se vuelve crónica, y con ella se va una de las cosas más valiosas que el negocio podía haber tenido: gente que piensa además de hacer.",
    principiosConectados: ["autonomia"],
    comoMoverte: {
      cliente:
        "¿Quién del equipo está más cerca del cliente todos los días? Esa persona está viendo cosas que el resto del negocio se pierde. Crear un canal mínimo para que esa información viaje —una reunión semanal corta, un grupo, una libreta— ya cambia las decisiones que se toman.",
      contexto:
        "Las personas del equipo suelen leer su sector (sus pares, sus clientes, su rubro) desde un ángulo distinto al del dueño. Esa diferencia de ángulos es información. Hacer espacios donde el equipo cuente 'qué están viendo afuera' multiplica la sensibilidad al contexto del negocio entero.",
      competitividad:
        "Las PyMEs donde la gente se siente escuchada retienen mejor, atraen mejor y desarrollan capacidad más rápido. La voz no es un nice-to-have de cultura —es una ventaja competitiva concreta. Empezar por una pregunta hecha en serio ('¿qué cosa estamos haciendo que te parece que no tiene sentido?') y escuchar lo que viene, suele ser el primer movimiento más revelador.",
    },
  },

  error: {
    senal:
      "Cuando alguien se equivoca, la forma en que el negocio lo procesa pesa más hacia buscar responsable que hacia entender qué pasó y qué aprender. El error se vive con tensión, no como insumo.",
    desarmarIdea:
      "Vale la pena desarmar una idea que es muy fuerte y muy común: que una cultura tolerante con el error es una cultura tolerante con la mediocridad. Esa creencia es lo que hace que muchos dueños endurezcan la respuesta al error, pensando que así sostienen la calidad. En la práctica, el efecto es el opuesto. Cuando el error se castiga, no desaparece —se esconde. Las personas dejan de reportar lo que sale mal. Los problemas crecen en silencio. La información que el negocio necesitaba para mejorar se vuelve invisible. La 'cultura de exigencia' termina siendo, en realidad, una cultura de ocultamiento. Y la calidad, lejos de subir, baja —porque se está sosteniendo sobre datos que ya no son ciertos.",
    argumentoConceptual:
      "El error es información. Es el negocio diciéndote dónde tu forma de trabajar tiene un hueco. Si lo tratás como información, ese hueco se cierra. Si lo tratás como ofensa, ese hueco se tapa hasta que se vuelve crisis.",
    costoCotidiano:
      "Las personas esconden errores chicos hasta que se vuelven grandes. Los problemas llegan al dueño cuando ya no hay tiempo para resolverlos bien. El equipo trabaja con una tensión sorda que no nombran pero que afecta todo: tomar decisiones cuesta más, animarse a probar algo nuevo cuesta más, pedir ayuda cuesta más. El miedo a equivocarse se vuelve más caro que los errores mismos.",
    principiosConectados: ["autonomia", "no_burocracia"],
    comoMoverte: {
      cliente:
        "Cuando un error afecta a un cliente, ¿el equipo lo reporta enseguida para resolverlo, o se demora porque hay miedo? La velocidad con que un error llega a quien puede resolverlo es directamente proporcional a la sensación de seguridad del equipo.",
      contexto:
        "¿Qué errores recientes podrían haber sido evitados si alguien hubiera dicho antes 'esto no me cierra'? Probablemente varios. Esa lista es el diagnóstico de cuánto está costando hoy la dinámica actual de gestión del error.",
      competitividad:
        "Las PyMEs donde el error se discute abiertamente aprenden más rápido —porque tienen más datos sobre qué no funciona. Las que no, repiten los mismos errores en silencio. Cambiar la pregunta de '¿quién fue?' a '¿qué hay que aprender?' es un movimiento conceptualmente simple y prácticamente difícil. Vale la pena hacerlo igual.",
    },
  },

  mira_resultado: {
    senal:
      "La mejora de cómo se hacen las cosas se sostiene más sobre intuición y experiencia que sobre métricas explícitas. Avanzar o retroceder se siente, pero no necesariamente se mide.",
    desarmarIdea:
      "Conviene desarmar una idea: que medir es desconfiar del equipo. Aparece especialmente en PyMEs con buen vínculo entre dueños y empleados, donde 'instalar métricas' suena a poner foco en lo que no se cumple. Medir no es desconfiar. Medir es darle al equipo —y al negocio— un espejo para ver si lo que están haciendo está funcionando. La métrica es información para quien hace, no vigilancia. Bien diseñada, le da al equipo autonomía: pueden ver por sí mismos si van bien, sin depender del juicio del dueño. Mal diseñada, sí se vuelve vigilancia. La diferencia está en para quién es la métrica.",
    argumentoConceptual:
      "Sin métricas, las discusiones sobre cómo mejorar el negocio son discusiones de opinión. Cada uno tiene su lectura, cada lectura tiene argumento, y no hay forma de saber quién tiene razón. Las decisiones de mejora terminan siendo decisiones de quién tiene más autoridad para imponer su versión.",
    costoCotidiano:
      "Mejorás a ojo, sin saber si estás avanzando o retrocediendo. Las iniciativas de mejora empiezan con entusiasmo y se diluyen sin que nadie sepa si funcionaron. Las conversaciones sobre qué hacer se vuelven debates circulares, porque no hay datos que ayuden a cerrarlas. El equipo trabaja, hace, ejecuta —pero no tiene forma de saber si lo que hace está creando valor o solo gastando energía.",
    principiosConectados: ["tecnologia_valor", "afuera_negocio"],
    comoMoverte: {
      cliente:
        "¿Hay alguna métrica que les diga si los clientes están más o menos contentos que hace 6 meses? Si no, esa es probablemente la métrica con mayor relación esfuerzo / impacto para empezar. Puede ser simple: cantidad de clientes recurrentes, NPS informal, cantidad de quejas.",
      contexto:
        "¿Hay alguna métrica que les diga cómo están comparados con el sector? Crecimiento de ventas vs promedio del rubro, margen vs benchmarks. Sin contexto externo, las métricas internas pueden engañar (crecer 5% mientras el sector crece 15% no es buena noticia).",
      competitividad:
        "Empezar por 3 métricas, no más, definidas en conjunto con el equipo —y mirarlas mensualmente—. Más que eso satura, menos que eso no alcanza para discutir. El objetivo no es tener 'tablero ejecutivo'; es tener un espejo mínimo compartido.",
    },
  },

  rumbo: {
    senal:
      "Cada persona del negocio empuja con buena intención, pero hacia dónde apunta el negocio en su conjunto no es algo que todos compartan ni tengan claro. Los objetivos comunes son más implícitos que explícitos.",
    argumentoConceptual:
      "Una PyME sin rumbo compartido no es una PyME sin esfuerzo —es una PyME donde el esfuerzo se diluye. Cada persona hace lo mejor que puede desde su lugar, pero los esfuerzos no se suman; a veces se pisan, a veces apuntan en direcciones contradictorias, a veces se cancelan.",
    costoCotidiano:
      "El negocio trabaja mucho y avanza poco. La sensación de 'estamos remando mucho y no llegamos' se vuelve crónica. Cada conversación de equipo arranca de cero, porque no hay un norte compartido al cual referir las decisiones. Las prioridades cambian semana a semana —no porque el contexto cambie, sino porque no hay criterios estables para priorizar. El equipo termina agotado de estar reaccionando, en vez de construyendo hacia algo.",
    principiosConectados: ["autonomia", "no_burocracia"],
    comoMoverte: {
      cliente:
        "¿Podría el equipo, en una sola frase, decir para quién es este negocio y qué le promete? Si la respuesta varía mucho entre personas, ese es el primer hueco de rumbo. Acordar esa frase —en serio, no como ejercicio— suele ser más transformador de lo que parece.",
      contexto:
        "¿Qué cambios del contexto en los próximos 12 meses estamos asumiendo y qué cambios estamos ignorando? Hacer explícitas esas asunciones es la base de cualquier rumbo realista. Un rumbo que no contempla el contexto es un rumbo de papel.",
      competitividad:
        "Las PyMEs con rumbo compartido no necesariamente crecen más rápido —pero crecen más sostenidamente, retienen mejor a su gente, y toman decisiones más coherentes a lo largo del tiempo. Tener rumbo no es tener plan estratégico de 50 páginas. Es tener acordada una frase que el equipo puede usar para decidir cuando aparecen disyuntivas: '¿esto nos acerca o nos aleja de hacia dónde vamos?'.",
    },
  },
};

/**
 * Busca la recomendación expandida para una dimensión. Siempre existe para
 * las 10 dimensiones del IAO (verificado por test de integridad).
 */
export function getRecomendacionExpandida(dimensionId: DimensionId): RecomendacionExpandida {
  return RECOMENDACIONES_EXPANDIDAS[dimensionId];
}

export interface DimensionBaja {
  dimensionId: DimensionId;
  /** Score IAO 0-100 de la dimensión. */
  score: number;
  /** Etiqueta humana de la dimensión. */
  etiqueta: string;
  /** Recomendación expandida correspondiente. */
  recomendacion: RecomendacionExpandida;
}

/**
 * Selecciona las dimensiones con score BAJO (≤ 50) ordenadas por score ascendente
 * (la más crítica primero). Devuelve hasta `limite` resultados. Anexo §5.2:
 * en pantalla mostramos top 3 críticas; en PDF todas las bajas.
 */
export function pickTopBajas(
  dimensiones: Array<{ id: DimensionId; iao: number; etiqueta: string }>,
  opciones: { umbral?: number; limite?: number } = {},
): DimensionBaja[] {
  const umbral = opciones.umbral ?? 50;
  const limite = opciones.limite ?? Infinity;
  return dimensiones
    .filter((d) => d.iao <= umbral)
    .sort((a, b) => a.iao - b.iao)
    .slice(0, limite)
    .map((d) => ({
      dimensionId: d.id,
      score: d.iao,
      etiqueta: d.etiqueta,
      recomendacion: getRecomendacionExpandida(d.id),
    }));
}
