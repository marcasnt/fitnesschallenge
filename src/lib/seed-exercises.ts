import type { CompetitionLevel } from "./category";

type ExerciseStation =
  | "STATION_1"
  | "STATION_2"
  | "STATION_3"
  | "STATION_4"
  | "STATION_5"
  | "STATION_6";

export interface SeedTechAlert {
  title: string;
  description: string;
  severity: "WARNING" | "INVALID" | "PROHIBITED";
  triggerCondition?: string;
  sortOrder: number;
}

export interface SeedExercise {
  name: string;
  nameEs: string;
  station: ExerciseStation;
  level: CompetitionLevel;
  description: string;
  weightMaleKg: number | null;
  weightFemaleKg: number | null;
  weightLabel: string;
  mixedPairException?: boolean;
  strapsAllowed?: boolean;
  isTiebreakerStation?: boolean;
  requiresEquipment?: string;
  speedFitTargetReps?: number;
  speedFitTeamReps?: number;
  techRequirementsJson: string;
  commonErrorsJson?: string;
  sortOrder: number;
  techAlerts: SeedTechAlert[];
}

export const IFBB_EXERCISES_SEED: SeedExercise[] = [
  // ══════════════════════════════════════
  // NIVEL ORO (GOLD)
  // ══════════════════════════════════════
  {
    name: "Chin-Ups Prone & Strict",
    nameEs: "Dominadas Pronadas y Estrictas",
    station: "STATION_1",
    level: "GOLD",
    description: "Dominadas estrictas con agarre pronado (palmas hacia afuera). Posición inicial con codos completamente extendidos. La barbilla debe superar el borde superior de la barra en cada repetición.",
    weightMaleKg: 0,
    weightFemaleKg: 0,
    weightLabel: "Peso corporal",
    mixedPairException: false,
    strapsAllowed: false,
    isTiebreakerStation: false,
    techRequirementsJson: JSON.stringify([
      "Agarre pronado (palmas hacia afuera) al ancho de los hombros",
      "Iniciar con codos completamente extendidos — posición muerta",
      "Barbilla debe superar completamente el borde superior de la barra",
      "Bajar hasta extensión completa con codos bloqueados",
      "Movimiento estrictamente vertical, sin oscilación",
    ]),
    commonErrorsJson: JSON.stringify([
      "Balanceo del cuerpo (kipping)",
      "Barbilla que no supera la barra",
      "Codos que no se bloquean al bajar",
    ]),
    sortOrder: 1,
    techAlerts: [
      { title: "❌ BALANCEO / KIPPING DETECTADO", description: "No se permite ningún tipo de balanceo, impulso con cadera ni kipping. La repetición es inválida.", severity: "INVALID", sortOrder: 1 },
      { title: "❌ BARBILLA NO SUPERA LA BARRA", description: "La barbilla debe pasar COMPLETAMENTE el borde superior de la barra.", severity: "INVALID", sortOrder: 2 },
      { title: "❌ CODOS SIN BLOQUEO COMPLETO", description: "Los codos deben quedar completamente bloqueados al finalizar el descenso.", severity: "INVALID", sortOrder: 3 },
    ],
  },
  {
    name: "Kettlebell Squat and Pull",
    nameEs: "Sentadilla y Tirón con Kettlebell",
    station: "STATION_2",
    level: "GOLD",
    description: "Sentadilla profunda con kettlebell entre las piernas seguida de un tirón hasta el pecho. La base del kettlebell debe tocar el suelo en cada repetición.",
    weightMaleKg: 32,
    weightFemaleKg: 24,
    weightLabel: "Kettlebell (kg)",
    mixedPairException: false,
    isTiebreakerStation: false,
    techRequirementsJson: JSON.stringify([
      "KB colocada entre las piernas con agarre pronado",
      "Sentadilla hasta que la BASE del KB toca claramente el suelo",
      "Levantarse con extensión COMPLETA de caderas y rodillas",
      "Tirar de la KB hasta que el ASA quede a la altura del medio del pecho",
      "Movimiento fluido: sentadilla + tirón en una sola secuencia",
    ]),
    commonErrorsJson: JSON.stringify([
      "KB que no llega a tocar el suelo",
      "Tirón incompleto por debajo del pecho",
    ]),
    sortOrder: 2,
    techAlerts: [
      { title: "❌ KB NO TOCA EL SUELO", description: "La base de la pesa rusa debe tocar claramente el suelo en cada repetición.", severity: "INVALID", sortOrder: 1 },
      { title: "❌ TIRÓN INCOMPLETO", description: "El asa debe llegar exactamente a la altura del medio del pecho.", severity: "INVALID", sortOrder: 2 },
      { title: "❌ EXTENSIÓN INCOMPLETA", description: "Caderas y rodillas deben extenderse completamente antes del tirón.", severity: "INVALID", sortOrder: 3 },
    ],
  },
  {
    name: "Dips Feet Forward",
    nameEs: "Fondos en Paralelas con Pies Adelantados",
    station: "STATION_3",
    level: "GOLD",
    description: "Fondos en paralelas con los pies ligeramente adelantados respecto a las manos. Se requiere pausa de 1 segundo arriba con codos bloqueados.",
    weightMaleKg: 0,
    weightFemaleKg: 0,
    weightLabel: "Peso corporal",
    isTiebreakerStation: false,
    techRequirementsJson: JSON.stringify([
      "Codos completamente bloqueados en posición inicial",
      "Piernas extendidas ligeramente por delante de las manos",
      "Sin balanceo en ningún momento del movimiento",
      "Bajar hasta que codos formen exactamente 90°",
      "Empujar hasta extensión completa con PAUSA de 1 segundo arriba",
    ]),
    sortOrder: 3,
    techAlerts: [
      { title: "❌ CODOS NO LLEGAN A 90°", description: "Los codos deben formar exactamente un ángulo de 90° en la fase baja.", severity: "INVALID", sortOrder: 1 },
      { title: "❌ SIN PAUSA EN POSICIÓN SUPERIOR", description: "Se requiere pausa de 1 segundo con codos bloqueados arriba.", severity: "INVALID", sortOrder: 2 },
      { title: "❌ BALANCEO DEL CUERPO", description: "No se permite balanceo. El movimiento debe ser estrictamente vertical.", severity: "INVALID", sortOrder: 3 },
    ],
  },
  {
    name: "Walking Lunges with Barbell",
    nameEs: "Zancadas Caminando con Barra",
    station: "STATION_4",
    level: "GOLD",
    description: "Zancadas caminando con barra sobre los hombros. La rodilla trasera DEBE tocar el suelo en cada repetición. Excepción: en parejas mixtas se permite peso diferenciado por sexo.",
    weightMaleKg: 50,
    weightFemaleKg: 30,
    weightLabel: "Barra sobre hombros (kg)",
    mixedPairException: true,
    isTiebreakerStation: false,
    techRequirementsJson: JSON.stringify([
      "Barra descansando sobre los hombros (no en el cuello)",
      "Zancadas caminando hacia adelante con desplazamiento",
      "Ambas rodillas deben alcanzar 90° de flexión",
      "La rodilla de la pierna TRASERA DEBE TOCAR el suelo obligatoriamente",
      "Torso erguido en todo momento",
    ]),
    sortOrder: 4,
    techAlerts: [
      { title: "❌ RODILLA TRASERA NO TOCA EL SUELO", description: "La rodilla de la pierna trasera DEBE tocar el suelo. Rep inválida sin este contacto.", severity: "INVALID", sortOrder: 1 },
      { title: "❌ RODILLAS SIN 90°", description: "Ambas rodillas deben alcanzar los 90° de flexión.", severity: "INVALID", sortOrder: 2 },
      { title: "⚠️ EXCEPCIÓN PAREJA MIXTA", description: "Esta es la ÚNICA estación donde la pareja mixta puede usar pesos diferentes por sexo.", severity: "WARNING", sortOrder: 3 },
    ],
  },
  {
    name: "Toes to Bar",
    nameEs: "Pies a la Barra",
    station: "STATION_5",
    level: "GOLD",
    description: "Pies a la barra colgado. Ambos pies deben tocar la barra simultáneamente. ÚNICO ejercicio donde se permiten correas de agarre.",
    weightMaleKg: 0,
    weightFemaleKg: 0,
    weightLabel: "Peso corporal",
    strapsAllowed: true,
    isTiebreakerStation: false,
    techRequirementsJson: JSON.stringify([
      "Colgado de la barra con brazos completamente extendidos",
      "Elevar piernas hasta que AMBOS pies toquen la barra simultáneamente",
      "Al descender: talones O rodillas deben pasar DETRÁS de la línea vertical de la barra",
      "Se permite balanceo ligero para el movimiento",
      "Correas de agarre PERMITIDAS (única excepción reglamentaria)",
    ]),
    sortOrder: 5,
    techAlerts: [
      { title: "❌ SOLO UN PIE TOCA LA BARRA", description: "Ambos pies deben tocar la barra SIMULTÁNEAMENTE.", severity: "INVALID", sortOrder: 1 },
      { title: "❌ RESET INCORRECTO", description: "Al descender, talones O rodillas deben pasar claramente detrás de la línea vertical de la barra antes de iniciar la siguiente repetición.", severity: "INVALID", sortOrder: 2 },
      { title: "✅ CORREAS PERMITIDAS", description: "Las correas de agarre están permitidas SOLO en este ejercicio.", severity: "WARNING", sortOrder: 3 },
    ],
  },
  {
    name: "Burpees & Devil Press",
    nameEs: "Burpees y Press del Diablo",
    station: "STATION_6",
    level: "GOLD",
    description: "Burpees con press sobre la cabeza usando dos mancuernas. Movimiento snatch ESTRICTAMENTE PROHIBIDO. ⭐ ESTACIÓN DE DESEMPATE OFICIAL.",
    weightMaleKg: 15,
    weightFemaleKg: 10,
    weightLabel: "Par de mancuernas (kg c/u)",
    isTiebreakerStation: true,
    techRequirementsJson: JSON.stringify([
      "Iniciar de pie con las dos mancuernas en el suelo",
      "Apoyarse en las mancuernas y ejecutar push-up con PECHO AL SUELO",
      "Incorporarse y llevar mancuernas a los hombros (curl)",
      "Empujar las mancuernas sobre la cabeza hasta BLOQUEAR los codos",
      "Cuerpo completamente erguido al finalizar el press",
      "PROHIBIDO movimiento tipo Snatch (desde suelo hasta arriba directo)",
    ]),
    sortOrder: 6,
    techAlerts: [
      { title: "🚫 SNATCH PROHIBIDO", description: "PROHIBIDO llevar las mancuernas desde el suelo hasta arriba de la cabeza en un solo movimiento. Rep inválida.", severity: "PROHIBITED", sortOrder: 1 },
      { title: "❌ PECHO NO TOCA EL SUELO", description: "El pecho debe tocar el suelo en cada repetición durante el push-up.", severity: "INVALID", sortOrder: 2 },
      { title: "❌ CODOS NO BLOQUEADOS ARRIBA", description: "Los codos deben bloquearse completamente al finalizar el press sobre la cabeza.", severity: "INVALID", sortOrder: 3 },
      { title: "❌ CUERPO NO ERGUIDO", description: "El cuerpo debe estar completamente erguido y estable al finalizar el movimiento.", severity: "INVALID", sortOrder: 4 },
      { title: "⭐ ESTACIÓN DE DESEMPATE", description: "En caso de empate en repeticiones totales, gana el atleta con más reps en esta estación.", severity: "WARNING", sortOrder: 5 },
    ],
  },

  // ══════════════════════════════════════
  // NIVEL PLATA (SILVER)
  // ══════════════════════════════════════
  {
    name: "Horizontal Chin-Ups",
    nameEs: "Dominadas Horizontales",
    station: "STATION_1",
    level: "SILVER",
    description: "Dominadas con el cuerpo en posición completamente horizontal bajo la barra. El pecho debe tocar la barra en cada repetición.",
    weightMaleKg: 0,
    weightFemaleKg: 0,
    weightLabel: "Peso corporal",
    techRequirementsJson: JSON.stringify([
      "Cuerpo suspendido bajo la barra en posición completamente horizontal",
      "Agarre al ancho de los hombros",
      "Cuerpo recto como una tabla (sin flexionar caderas)",
      "Tirar hasta que el PECHO TOQUE la barra",
      "Volver a extensión completa de codos",
    ]),
    sortOrder: 7,
    techAlerts: [
      { title: "❌ PECHO NO TOCA LA BARRA", description: "El pecho debe tocar la barra en cada repetición.", severity: "INVALID", sortOrder: 1 },
      { title: "❌ CUERPO NO HORIZONTAL", description: "El cuerpo debe mantenerse perfectamente recto y horizontal.", severity: "INVALID", sortOrder: 2 },
    ],
  },
  {
    name: "Jefferson Squat",
    nameEs: "Sentadilla Jefferson con Barra",
    station: "STATION_2",
    level: "SILVER",
    description: "Sentadilla con la barra entre las piernas en posición de caballero a horcajadas. Los discos deben tocar el suelo en cada repetición.",
    weightMaleKg: 60,
    weightFemaleKg: 40,
    weightLabel: "Barra (kg)",
    techRequirementsJson: JSON.stringify([
      "Barra colocada entre las piernas (posición de caballero a horcajadas)",
      "Una mano en agarre pronado adelante, otra supina detrás",
      "Bajar hasta que los DISCOS de la barra toquen el suelo",
      "Columna en posición NEUTRA durante todo el movimiento",
      "Extensión completa de rodillas y caderas arriba",
    ]),
    sortOrder: 8,
    techAlerts: [
      { title: "❌ DISCOS NO TOCAN EL SUELO", description: "Los discos de la barra deben tocar el suelo en cada repetición.", severity: "INVALID", sortOrder: 1 },
      { title: "❌ COLUMNA EN CIFOSIS", description: "Mantener columna neutra. La cifosis excesiva puede invalidar la repetición.", severity: "WARNING", sortOrder: 2 },
    ],
  },
  {
    name: "Bench Dips",
    nameEs: "Fondos en Banco",
    station: "STATION_3",
    level: "SILVER",
    description: "Fondos con manos apoyadas en el borde de un banco. Los codos deben alcanzar 90° de flexión.",
    weightMaleKg: 0,
    weightFemaleKg: 0,
    weightLabel: "Peso corporal",
    techRequirementsJson: JSON.stringify([
      "Manos apoyadas en el borde del banco detrás del cuerpo",
      "Pies apoyados frente al cuerpo en el suelo o banco elevado",
      "Bajar hasta que codos formen EXACTAMENTE 90°",
      "Empujar hasta extensión completa de los codos",
    ]),
    sortOrder: 9,
    techAlerts: [
      { title: "❌ CODOS NO LLEGAN A 90°", description: "Los codos deben alcanzar exactamente 90° en la fase baja.", severity: "INVALID", sortOrder: 1 },
    ],
  },
  {
    name: "Static Lunges with Dumbbells",
    nameEs: "Zancadas Estáticas con Mancuernas",
    station: "STATION_4",
    level: "SILVER",
    description: "Zancadas en el sitio con mancuernas a los costados. La rodilla trasera debe tocar el suelo.",
    weightMaleKg: 15,
    weightFemaleKg: 10,
    weightLabel: "Par de mancuernas (kg c/u)",
    techRequirementsJson: JSON.stringify([
      "Una mancuerna en cada mano a los costados del cuerpo",
      "Zancadas EN EL SITIO (sin desplazamiento)",
      "Ambas rodillas deben alcanzar 90° de flexión",
      "Rodilla trasera DEBE TOCAR el suelo obligatoriamente",
      "Alternar pierna en cada repetición o completar una pierna antes de cambiar",
    ]),
    sortOrder: 10,
    techAlerts: [
      { title: "❌ RODILLA TRASERA NO TOCA EL SUELO", description: "La rodilla trasera debe tocar el suelo en cada repetición.", severity: "INVALID", sortOrder: 1 },
      { title: "❌ ZANCADAS CON DESPLAZAMIENTO", description: "Las zancadas en Nivel Plata son EN EL SITIO, sin caminar.", severity: "INVALID", sortOrder: 2 },
    ],
  },
  {
    name: "Weighted Sit-Ups",
    nameEs: "Abdominales con Disco de 10kg",
    station: "STATION_5",
    level: "SILVER",
    description: "Abdominales con un disco de 10kg sostenido sobre el pecho. El tronco debe quedar perpendicular y tocar los pies al llegar arriba.",
    weightMaleKg: 10,
    weightFemaleKg: 10,
    weightLabel: "Disco sobre el pecho (kg)",
    techRequirementsJson: JSON.stringify([
      "Comenzar acostado con rodillas y caderas a 90°",
      "Disco de 10kg sostenido firmemente sobre el pecho",
      "Incorporarse hasta que el tronco quede PERPENDICULAR al suelo",
      "Tocar los pies con el disco (o manos) al llegar arriba",
    ]),
    sortOrder: 11,
    techAlerts: [
      { title: "❌ TRONCO NO LLEGA A PERPENDICULAR", description: "El tronco debe llegar a posición perpendicular al suelo.", severity: "INVALID", sortOrder: 1 },
      { title: "❌ DISCO NO CONTACTA LOS PIES", description: "El disco (o manos sosteniendo el disco) debe tocar los pies.", severity: "INVALID", sortOrder: 2 },
    ],
  },
  {
    name: "Kettlebell Snatch",
    nameEs: "Arrancada con Kettlebell",
    station: "STATION_6",
    level: "SILVER",
    description: "Movimiento balístico de una sola mano. La kettlebell sube en un solo arco hasta sobre la cabeza con bloqueo completo del codo. ⭐ ESTACIÓN DE DESEMPATE.",
    weightMaleKg: 12,
    weightFemaleKg: 8,
    weightLabel: "Kettlebell (kg)",
    isTiebreakerStation: true,
    techRequirementsJson: JSON.stringify([
      "Movimiento balístico de una sola mano desde entre las piernas",
      "La KB sube en un solo arco continuo hasta sobre la cabeza",
      "Bloqueo COMPLETO del codo en posición superior",
      "Cuerpo completamente estable y erguido al finalizar",
      "Alternar brazos según criterio del atleta",
    ]),
    sortOrder: 12,
    techAlerts: [
      { title: "❌ CODO NO SE BLOQUEA ARRIBA", description: "El codo debe bloquearse completamente en la posición superior.", severity: "INVALID", sortOrder: 1 },
      { title: "⭐ ESTACIÓN DE DESEMPATE", description: "En empate total de repeticiones, gana quien más reps tenga en esta estación.", severity: "WARNING", sortOrder: 2 },
    ],
  },

  // ══════════════════════════════════════
  // NIVEL BRONCE (BRONZE)
  // ══════════════════════════════════════
  {
    name: "Supine Grip Chin-Ups (Feet Supported)",
    nameEs: "Dominadas Supinas con Talones en el Suelo",
    station: "STATION_1",
    level: "BRONZE",
    description: "Dominadas con agarre supino y talones apoyados en el suelo. Pausa de 2 segundos en posición inicial.",
    weightMaleKg: 0,
    weightFemaleKg: 0,
    weightLabel: "Peso corporal asistido",
    techRequirementsJson: JSON.stringify([
      "Agarre SUPINO (palmas hacia el cuerpo) al ancho de los hombros",
      "TALONES APOYADOS EN EL SUELO en todo momento",
      "Detener 2 segundos en posición inicial (colgado)",
      "Tronco, caderas y rodillas completamente rectos (como una tabla)",
      "Tirar hasta que el PECHO TOQUE la barra",
      "Sin balanceo en ningún momento",
    ]),
    sortOrder: 13,
    techAlerts: [
      { title: "❌ TALONES SE DESPEGAN DEL SUELO", description: "Los talones DEBEN permanecer apoyados en el suelo durante toda la repetición.", severity: "INVALID", sortOrder: 1 },
      { title: "❌ PECHO NO TOCA LA BARRA", description: "El pecho debe tocar la barra en cada repetición.", severity: "INVALID", sortOrder: 2 },
      { title: "❌ CUERPO NO RECTO", description: "Tronco, caderas y rodillas deben formar una línea recta perfecta.", severity: "INVALID", sortOrder: 3 },
      { title: "❌ SIN PAUSA DE 2 SEGUNDOS INICIAL", description: "La posición inicial (colgado, codos extendidos) debe mantenerse 2 segundos.", severity: "INVALID", sortOrder: 4 },
    ],
  },
  {
    name: "Kettlebell Squat",
    nameEs: "Sentadilla con Kettlebell",
    station: "STATION_2",
    level: "BRONZE",
    description: "Sentadilla frontal con kettlebell. La kettlebell debe tocar el suelo en cada repetición.",
    weightMaleKg: 32,
    weightFemaleKg: 24,
    weightLabel: "Kettlebell (kg)",
    techRequirementsJson: JSON.stringify([
      "Pies ligeramente más anchos que los hombros",
      "KB sostenida FRENTE AL CUERPO con agarre pronado",
      "Sentadilla flexionando caderas y rodillas",
      "KB debe TOCAR EL SUELO en cada repetición",
      "Torso erguido, mirada al frente",
    ]),
    sortOrder: 14,
    techAlerts: [
      { title: "❌ KB NO TOCA EL SUELO", description: "La Kettlebell debe tocar el suelo en cada repetición.", severity: "INVALID", sortOrder: 1 },
    ],
  },
  {
    name: "Push-Ups Elbows Flare (Handball Ball)",
    nameEs: "Flexiones Codos Abiertos con Balón",
    station: "STATION_3",
    level: "BRONZE",
    description: "Flexiones con codos abiertos y balón de balonmano bajo el pecho. El pecho debe tocar el balón en cada repetición.",
    weightMaleKg: 0,
    weightFemaleKg: 0,
    weightLabel: "Peso corporal",
    requiresEquipment: "handball_ball",
    techRequirementsJson: JSON.stringify([
      "Partir desde posición de extensión completa de codos",
      "Codos abiertos hacia los lados (NO pegados al cuerpo)",
      "Descender hasta que el PECHO TOQUE el balón de balonmano",
      "Codos deben alcanzar 90° de flexión",
      "Empujar hasta extensión completa",
    ]),
    sortOrder: 15,
    techAlerts: [
      { title: "❌ PECHO NO TOCA EL BALÓN", description: "El pecho debe tocar el balón de balonmano. Es el criterio de validación de la repetición.", severity: "INVALID", sortOrder: 1 },
      { title: "❌ CODOS NO LLEGAN A 90°", description: "Los codos deben alcanzar al menos 90° de flexión.", severity: "INVALID", sortOrder: 2 },
    ],
  },
  {
    name: "Backward Lunges with Dumbbells",
    nameEs: "Zancadas Hacia Atrás con Mancuernas",
    station: "STATION_4",
    level: "BRONZE",
    description: "Zancadas hacia atrás (no hacia adelante) con mancuernas. La rodilla trasera debe tocar el suelo.",
    weightMaleKg: 12.5,
    weightFemaleKg: 7.5,
    weightLabel: "Par de mancuernas (kg c/u)",
    techRequirementsJson: JSON.stringify([
      "Una mancuerna en cada mano",
      "Paso hacia ATRÁS (no hacia adelante — eso sería inválido)",
      "Mantenerse EN EL SITIO (sin desplazamiento)",
      "Ambas rodillas deben alcanzar 90°",
      "Rodilla trasera DEBE TOCAR el suelo obligatoriamente",
    ]),
    sortOrder: 16,
    techAlerts: [
      { title: "❌ RODILLA TRASERA NO TOCA EL SUELO", description: "La rodilla trasera debe tocar el suelo obligatoriamente.", severity: "INVALID", sortOrder: 1 },
      { title: "❌ ZANCADA HACIA ADELANTE", description: "El Nivel Bronce exige zancada hacia ATRÁS. Hacia adelante es inválida.", severity: "INVALID", sortOrder: 2 },
    ],
  },
  {
    name: "Sit-Ups Touch Feet",
    nameEs: "Abdominales Tocando los Pies",
    station: "STATION_5",
    level: "BRONZE",
    description: "Abdominales sin peso. Ambas manos deben tocar los pies al llegar arriba con el tronco perpendicular.",
    weightMaleKg: 0,
    weightFemaleKg: 0,
    weightLabel: "Sin peso",
    techRequirementsJson: JSON.stringify([
      "Comenzar acostado con rodillas y caderas a 90°",
      "Puede usarse impulso de brazos para iniciar el movimiento",
      "Incorporarse hasta que el tronco quede perpendicular al suelo",
      "AMBAS MANOS deben tocar los pies al llegar arriba",
    ]),
    sortOrder: 17,
    techAlerts: [
      { title: "❌ MANOS NO TOCAN LOS PIES", description: "Ambas manos deben tocar los pies en cada repetición.", severity: "INVALID", sortOrder: 1 },
      { title: "❌ TRONCO NO LLEGA A 90°", description: "El tronco debe ser perpendicular al suelo al llegar arriba.", severity: "INVALID", sortOrder: 2 },
    ],
  },
  {
    name: "Kettlebell Overhead Swing",
    nameEs: "Swing de Kettlebell sobre la Cabeza",
    station: "STATION_6",
    level: "BRONZE",
    description: "Swing balístico de kettlebell sobre la cabeza con brazos completamente extendidos y pausa breve en vertical. ⭐ ESTACIÓN DE DESEMPATE.",
    weightMaleKg: 12,
    weightFemaleKg: 8,
    weightLabel: "Kettlebell (kg)",
    isTiebreakerStation: true,
    techRequirementsJson: JSON.stringify([
      "Flexión de caderas para pasar la KB entre las piernas",
      "Balanceo continuo y explosivo hacia arriba",
      "Brazos COMPLETAMENTE EXTENDIDOS sobre la cabeza",
      "Detenerse brevemente en posición VERTICAL con KB sobre la cabeza",
      "Cuerpo completamente erguido al finalizar",
    ]),
    sortOrder: 18,
    techAlerts: [
      { title: "❌ KB NO LLEGA SOBRE LA CABEZA", description: "Los brazos deben estar completamente extendidos sobre la cabeza.", severity: "INVALID", sortOrder: 1 },
      { title: "❌ SIN PARADA EN VERTICAL", description: "Debe haber una pausa breve con la KB sobre la cabeza en posición vertical.", severity: "INVALID", sortOrder: 2 },
      { title: "⭐ ESTACIÓN DE DESEMPATE", description: "En empate total de repeticiones, gana quien más reps tenga aquí.", severity: "WARNING", sortOrder: 3 },
    ],
  },
];
