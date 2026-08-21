// ─── Mock Users & Training Plans ─────────────────────────────────────────────
// Complete exercise database for FitPulse Pro

export const USERS = [
  {
    id: 1,
    username: "user2dias",
    password: "1234",
    name: "Martín López",
    avatar: "ML",
    plan: "2 días/semana",
    planDays: 2,
    coach: "Alex Rossi",
    coachTitle: "Head Trainer",
    startDate: "2026-07-01",
  },
  {
    id: 2,
    username: "user3dias",
    password: "1234",
    name: "Lucía Fernández",
    avatar: "LF",
    plan: "3 días/semana",
    planDays: 3,
    coach: "Alex Rossi",
    coachTitle: "Head Trainer",
    startDate: "2026-07-15",
  },
  {
    id: 3,
    username: "user5dias",
    password: "1234",
    name: "Diego Ramírez",
    avatar: "DR",
    plan: "5 días/semana",
    planDays: 5,
    coach: "Alex Rossi",
    coachTitle: "Head Trainer",
    startDate: "2026-08-01",
  },
];

// ─── 2-Day Plan ──────────────────────────────────────────────────────────────

const plan2Days = {
  1: {
    title: "Full Body A",
    focus: "Fuerza General - Tren Superior Énfasis",
    exercises: [
      {
        id: "2d1e1",
        name: "Sentadilla con Barra",
        muscle: "Cuádriceps / Glúteos",
        sets: 4,
        reps: "8-10",
        rest: "90s",
        instructions:
          "Coloca la barra sobre los trapecios. Pies a la anchura de los hombros. Desciende controladamente hasta que los muslos queden paralelos al suelo. Mantén el pecho erguido y las rodillas alineadas con los pies. Empuja desde los talones para subir.",
      },
      {
        id: "2d1e2",
        name: "Press de Banca Plano",
        muscle: "Pecho / Tríceps",
        sets: 4,
        reps: "8-10",
        rest: "90s",
        instructions:
          "Acuéstate en el banco con los pies firmes en el suelo. Agarra la barra ligeramente más ancha que los hombros. Baja la barra hasta el pecho de forma controlada. Empuja explosivamente hasta la extensión completa sin bloquear los codos.",
      },
      {
        id: "2d1e3",
        name: "Remo con Barra",
        muscle: "Espalda / Bíceps",
        sets: 4,
        reps: "8-10",
        rest: "90s",
        instructions:
          "Inclínate hacia adelante con la espalda recta, rodillas ligeramente flexionadas. Agarra la barra con agarre prono a la anchura de los hombros. Tira de la barra hacia el abdomen bajo apretando los omóplatos. Baja de forma controlada.",
      },
      {
        id: "2d1e4",
        name: "Press Militar con Mancuernas",
        muscle: "Hombros / Tríceps",
        sets: 3,
        reps: "10-12",
        rest: "60s",
        instructions:
          "Sentado en un banco a 90°, sujeta las mancuernas a la altura de los hombros con las palmas hacia adelante. Empuja hacia arriba hasta casi extender los brazos. Baja controladamente hasta la posición inicial.",
      },
      {
        id: "2d1e5",
        name: "Curl con Barra Z",
        muscle: "Bíceps",
        sets: 3,
        reps: "10-12",
        rest: "60s",
        instructions:
          "De pie, sujeta la barra Z con agarre supino. Mantén los codos pegados al cuerpo. Flexiona los brazos llevando la barra hacia los hombros. Baja lentamente controlando la fase excéntrica.",
      },
      {
        id: "2d1e6",
        name: "Plancha Frontal",
        muscle: "Core / Abdomen",
        sets: 3,
        reps: "45s",
        rest: "45s",
        instructions:
          "Apóyate sobre los antebrazos y las puntas de los pies. Mantén el cuerpo en línea recta desde la cabeza hasta los talones. Contrae el abdomen y los glúteos. No dejes que las caderas se hundan ni se eleven.",
      },
    ],
  },
  2: {
    title: "Full Body B",
    focus: "Fuerza General - Tren Inferior Énfasis",
    exercises: [
      {
        id: "2d2e1",
        name: "Peso Muerto Convencional",
        muscle: "Espalda Baja / Isquiotibiales / Glúteos",
        sets: 4,
        reps: "6-8",
        rest: "120s",
        instructions:
          "Con los pies a la anchura de las caderas, agarra la barra con agarre mixto o doble prono. Mantén la espalda completamente recta. Levanta la barra extendiendo caderas y rodillas simultáneamente. Bloquea arriba apretando los glúteos.",
      },
      {
        id: "2d2e2",
        name: "Press Inclinado con Mancuernas",
        muscle: "Pecho Superior / Hombros",
        sets: 4,
        reps: "10-12",
        rest: "90s",
        instructions:
          "En banco inclinado a 30-45°, sujeta las mancuernas a la altura del pecho. Empuja hacia arriba acercando ligeramente las mancuernas en la parte superior. Baja controladamente hasta sentir el estiramiento en el pecho.",
      },
      {
        id: "2d2e3",
        name: "Zancadas con Mancuernas",
        muscle: "Cuádriceps / Glúteos",
        sets: 3,
        reps: "12 c/pierna",
        rest: "60s",
        instructions:
          "De pie con mancuernas a los lados, da un paso largo hacia adelante. Flexiona ambas rodillas hasta que la trasera casi toque el suelo. La rodilla delantera no debe sobrepasar la punta del pie. Empuja con el pie delantero para volver.",
      },
      {
        id: "2d2e4",
        name: "Dominadas (o Jalón al Pecho)",
        muscle: "Dorsal / Bíceps",
        sets: 4,
        reps: "8-10",
        rest: "90s",
        instructions:
          "Agarra la barra con agarre prono, más ancho que los hombros. Desde la posición colgado, tira llevando el pecho hacia la barra. Aprieta los dorsales en la parte superior. Baja de forma controlada hasta la extensión completa.",
      },
      {
        id: "2d2e5",
        name: "Fondos en Paralelas",
        muscle: "Pecho / Tríceps",
        sets: 3,
        reps: "8-12",
        rest: "60s",
        instructions:
          "Sujétate en las barras paralelas con los brazos extendidos. Inclínate ligeramente hacia adelante para enfatizar el pecho. Desciende hasta que los brazos formen 90°. Empuja hacia arriba hasta la extensión completa.",
      },
      {
        id: "2d2e6",
        name: "Elevaciones de Piernas Colgado",
        muscle: "Abdomen Inferior",
        sets: 3,
        reps: "12-15",
        rest: "45s",
        instructions:
          "Cuélgate de una barra con agarre prono. Sin balancearte, eleva las piernas rectas hasta formar 90° con el torso. Si es muy difícil, flexiona las rodillas. Baja lentamente sin dejar que las piernas caigan.",
      },
    ],
  },
};

// ─── 3-Day Plan ──────────────────────────────────────────────────────────────

const plan3Days = {
  1: {
    title: "Push (Empuje)",
    focus: "Pecho / Hombros / Tríceps",
    exercises: [
      {
        id: "3d1e1",
        name: "Press de Banca Plano",
        muscle: "Pecho",
        sets: 4,
        reps: "6-8",
        rest: "120s",
        instructions:
          "Acuéstate en el banco con los pies firmes en el suelo. Agarra la barra ligeramente más ancha que los hombros. Baja la barra hasta el pecho de forma controlada. Empuja explosivamente hasta la extensión completa sin bloquear los codos.",
      },
      {
        id: "3d1e2",
        name: "Press Inclinado con Mancuernas",
        muscle: "Pecho Superior",
        sets: 4,
        reps: "8-10",
        rest: "90s",
        instructions:
          "En banco inclinado a 30-45°, sujeta las mancuernas a la altura del pecho. Empuja hacia arriba acercando ligeramente las mancuernas en la parte superior. Baja controladamente hasta sentir el estiramiento en el pecho.",
      },
      {
        id: "3d1e3",
        name: "Aperturas en Polea",
        muscle: "Pecho",
        sets: 3,
        reps: "12-15",
        rest: "60s",
        instructions:
          "De pie entre las poleas con los cables a la altura del pecho. Con los codos ligeramente flexionados, lleva las manos al centro del cuerpo. Aprieta el pecho en la contracción. Vuelve controladamente a la posición inicial.",
      },
      {
        id: "3d1e4",
        name: "Press Militar con Barra",
        muscle: "Hombros",
        sets: 4,
        reps: "8-10",
        rest: "90s",
        instructions:
          "De pie o sentado, sujeta la barra a la altura de los hombros con agarre ligeramente más ancho. Empuja la barra por encima de la cabeza hasta la extensión completa. Baja controladamente hasta los hombros.",
      },
      {
        id: "3d1e5",
        name: "Elevaciones Laterales",
        muscle: "Deltoides Lateral",
        sets: 3,
        reps: "12-15",
        rest: "60s",
        instructions:
          "De pie con mancuernas a los lados. Eleva los brazos lateralmente hasta la altura de los hombros con los codos ligeramente flexionados. Mantén una ligera inclinación hacia adelante. Baja de forma controlada.",
      },
      {
        id: "3d1e6",
        name: "Extensiones de Tríceps en Polea",
        muscle: "Tríceps",
        sets: 3,
        reps: "10-12",
        rest: "60s",
        instructions:
          "De pie frente a la polea alta, agarra la cuerda o barra V. Mantén los codos pegados al cuerpo. Extiende los brazos completamente hacia abajo. Vuelve controladamente sin separar los codos.",
      },
      {
        id: "3d1e7",
        name: "Fondos en Paralelas",
        muscle: "Tríceps / Pecho",
        sets: 3,
        reps: "8-12",
        rest: "60s",
        instructions:
          "Sujétate en las barras paralelas con los brazos extendidos. Mantén el torso más vertical para enfatizar tríceps. Desciende hasta que los brazos formen 90°. Empuja hacia arriba hasta la extensión completa.",
      },
    ],
  },
  2: {
    title: "Pull (Tirón)",
    focus: "Espalda / Bíceps / Antebrazo",
    exercises: [
      {
        id: "3d2e1",
        name: "Peso Muerto Convencional",
        muscle: "Espalda Baja / Isquiotibiales",
        sets: 4,
        reps: "5-6",
        rest: "150s",
        instructions:
          "Con los pies a la anchura de las caderas, agarra la barra con agarre mixto o doble prono. Mantén la espalda completamente recta. Levanta la barra extendiendo caderas y rodillas simultáneamente. Bloquea arriba apretando los glúteos.",
      },
      {
        id: "3d2e2",
        name: "Dominadas con Agarre Ancho",
        muscle: "Dorsal Ancho",
        sets: 4,
        reps: "6-10",
        rest: "90s",
        instructions:
          "Agarra la barra con agarre prono bien ancho. Desde colgado, tira del cuerpo hacia arriba llevando el pecho a la barra. Aprieta los dorsales en la parte más alta. Baja controladamente hasta extensión completa.",
      },
      {
        id: "3d2e3",
        name: "Remo con Mancuerna a Una Mano",
        muscle: "Dorsal / Romboides",
        sets: 3,
        reps: "10-12 c/lado",
        rest: "60s",
        instructions:
          "Apoya una rodilla y una mano en el banco. Con la otra mano, sujeta la mancuerna y tira hacia la cadera. Mantén la espalda paralela al suelo. Aprieta el omóplato en la parte alta del movimiento.",
      },
      {
        id: "3d2e4",
        name: "Remo en Polea Baja",
        muscle: "Espalda Media",
        sets: 3,
        reps: "10-12",
        rest: "60s",
        instructions:
          "Sentado con los pies en la plataforma y las rodillas ligeramente flexionadas. Tira del agarre hacia el abdomen manteniendo la espalda recta. Aprieta los omóplatos al final del movimiento. Vuelve controladamente.",
      },
      {
        id: "3d2e5",
        name: "Curl con Barra Z",
        muscle: "Bíceps",
        sets: 3,
        reps: "8-10",
        rest: "60s",
        instructions:
          "De pie, sujeta la barra Z con agarre supino. Mantén los codos pegados al cuerpo. Flexiona los brazos llevando la barra hacia los hombros. Baja lentamente controlando la fase excéntrica.",
      },
      {
        id: "3d2e6",
        name: "Curl Martillo con Mancuernas",
        muscle: "Bíceps / Braquiorradial",
        sets: 3,
        reps: "10-12",
        rest: "60s",
        instructions:
          "De pie con mancuernas a los lados, palmas mirándose entre sí. Flexiona los brazos sin girar las muñecas. Sube hasta la contracción completa del bíceps. Baja de forma controlada.",
      },
      {
        id: "3d2e7",
        name: "Face Pulls en Polea",
        muscle: "Deltoides Posterior / Trapecios",
        sets: 3,
        reps: "15-20",
        rest: "45s",
        instructions:
          "Polea a la altura de la cara con agarre de cuerda. Tira hacia la cara separando las manos y rotando externamente los hombros. Aprieta los omóplatos. Vuelve controladamente.",
      },
    ],
  },
  3: {
    title: "Legs (Piernas)",
    focus: "Cuádriceps / Isquiotibiales / Glúteos / Pantorrillas",
    exercises: [
      {
        id: "3d3e1",
        name: "Sentadilla con Barra",
        muscle: "Cuádriceps / Glúteos",
        sets: 4,
        reps: "6-8",
        rest: "120s",
        instructions:
          "Coloca la barra sobre los trapecios. Pies a la anchura de los hombros. Desciende controladamente hasta que los muslos queden paralelos al suelo. Mantén el pecho erguido y las rodillas alineadas con los pies.",
      },
      {
        id: "3d3e2",
        name: "Prensa de Piernas 45°",
        muscle: "Cuádriceps / Glúteos",
        sets: 4,
        reps: "10-12",
        rest: "90s",
        instructions:
          "Siéntate en la prensa con la espalda bien apoyada. Coloca los pies a la anchura de los hombros en la plataforma. Baja la plataforma hasta que las rodillas formen 90°. Empuja sin bloquear las rodillas arriba.",
      },
      {
        id: "3d3e3",
        name: "Peso Muerto Rumano",
        muscle: "Isquiotibiales / Glúteos",
        sets: 4,
        reps: "8-10",
        rest: "90s",
        instructions:
          "De pie con la barra al frente de los muslos. Flexiona las caderas empujándolas hacia atrás mientras deslizas la barra por las piernas. Mantén la espalda recta y las rodillas ligeramente flexionadas. Sube contrayendo glúteos e isquiotibiales.",
      },
      {
        id: "3d3e4",
        name: "Extensiones de Cuádriceps",
        muscle: "Cuádriceps",
        sets: 3,
        reps: "12-15",
        rest: "60s",
        instructions:
          "Sentado en la máquina de extensiones, ajusta el rodillo sobre los tobillos. Extiende las piernas completamente apretando los cuádriceps. Mantén la contracción un segundo arriba. Baja de forma controlada.",
      },
      {
        id: "3d3e5",
        name: "Curl Femoral Acostado",
        muscle: "Isquiotibiales",
        sets: 3,
        reps: "10-12",
        rest: "60s",
        instructions:
          "Acuéstate boca abajo en la máquina de curl femoral. Ajusta el rodillo sobre los tobillos. Flexiona las piernas llevando los talones hacia los glúteos. Baja controladamente.",
      },
      {
        id: "3d3e6",
        name: "Elevaciones de Pantorrillas de Pie",
        muscle: "Gemelos",
        sets: 4,
        reps: "15-20",
        rest: "45s",
        instructions:
          "De pie en la máquina de pantorrillas o en un escalón. Elévate sobre las puntas de los pies hasta la máxima contracción. Mantén un segundo arriba. Baja estirando los gemelos al máximo.",
      },
      {
        id: "3d3e7",
        name: "Sentadilla Búlgara",
        muscle: "Cuádriceps / Glúteos",
        sets: 3,
        reps: "10 c/pierna",
        rest: "60s",
        instructions:
          "Coloca un pie atrás sobre un banco. Con el pie delantero, realiza una sentadilla profunda. Mantén el torso erguido. Empuja desde el talón del pie delantero para subir.",
      },
    ],
  },
};

// ─── 5-Day Plan ──────────────────────────────────────────────────────────────

const plan5Days = {
  1: {
    title: "Pecho / Tríceps",
    focus: "Hipertrofia Pectoral + Tríceps",
    exercises: [
      {
        id: "5d1e1",
        name: "Press de Banca Plano",
        muscle: "Pecho",
        sets: 4,
        reps: "6-8",
        rest: "120s",
        instructions:
          "Acuéstate en el banco con arco natural en la espalda baja. Agarra la barra ligeramente más ancha que los hombros. Baja la barra al esternón inferior de forma controlada. Empuja explosivamente.",
      },
      {
        id: "5d1e2",
        name: "Press Inclinado con Mancuernas",
        muscle: "Pecho Superior",
        sets: 4,
        reps: "8-10",
        rest: "90s",
        instructions:
          "Banco a 30-45°. Empuja las mancuernas hacia arriba en un arco convergente. Baja controladamente sintiendo el estiramiento.",
      },
      {
        id: "5d1e3",
        name: "Aperturas en Máquina Pec Deck",
        muscle: "Pecho",
        sets: 3,
        reps: "12-15",
        rest: "60s",
        instructions:
          "Sentado con la espalda apoyada. Lleva las almohadillas al centro apretando el pecho. Mantén una ligera flexión en los codos. Vuelve de forma controlada.",
      },
      {
        id: "5d1e4",
        name: "Press Cerrado con Barra",
        muscle: "Tríceps / Pecho",
        sets: 4,
        reps: "8-10",
        rest: "90s",
        instructions:
          "Agarre a la anchura de los hombros o ligeramente menor. Baja la barra al pecho bajo manteniendo los codos pegados al torso. Empuja apretando los tríceps.",
      },
      {
        id: "5d1e5",
        name: "Extensiones en Polea con Cuerda",
        muscle: "Tríceps",
        sets: 3,
        reps: "10-12",
        rest: "60s",
        instructions:
          "De pie frente a la polea alta. Extiende separando las cuerdas en la parte baja para máxima contracción. Mantén los codos fijos.",
      },
      {
        id: "5d1e6",
        name: "Fondos en Máquina Asistida",
        muscle: "Tríceps / Pecho Inferior",
        sets: 3,
        reps: "10-12",
        rest: "60s",
        instructions:
          "Mantén el torso recto para enfatizar tríceps. Desciende hasta 90° en los codos. Empuja hasta extensión completa sin bloquear.",
      },
    ],
  },
  2: {
    title: "Espalda / Bíceps",
    focus: "Volumen Dorsal + Bíceps",
    exercises: [
      {
        id: "5d2e1",
        name: "Dominadas con Lastre",
        muscle: "Dorsal Ancho",
        sets: 4,
        reps: "6-8",
        rest: "120s",
        instructions:
          "Agarre prono ancho. Si puedes, añade peso con cinturón. Tira del cuerpo hacia la barra. Baja controladamente hasta extensión completa.",
      },
      {
        id: "5d2e2",
        name: "Remo con Barra T",
        muscle: "Espalda Media / Romboides",
        sets: 4,
        reps: "8-10",
        rest: "90s",
        instructions:
          "Inclínate a 45° sobre la barra T. Tira del agarre hacia el abdomen apretando los omóplatos. Baja controladamente.",
      },
      {
        id: "5d2e3",
        name: "Jalón al Pecho con Agarre V",
        muscle: "Dorsal Ancho",
        sets: 3,
        reps: "10-12",
        rest: "60s",
        instructions:
          "Sentado en la máquina de jalón, usa el agarre en V cerrado. Tira hacia el pecho inclinándote ligeramente hacia atrás. Aprieta los dorsales.",
      },
      {
        id: "5d2e4",
        name: "Remo en Máquina Hammer",
        muscle: "Espalda",
        sets: 3,
        reps: "10-12",
        rest: "60s",
        instructions:
          "Sentado con el pecho apoyado en la almohadilla. Tira de los agarres hacia las caderas. Aprieta los omóplatos. Regresa controladamente.",
      },
      {
        id: "5d2e5",
        name: "Curl con Barra Recta",
        muscle: "Bíceps",
        sets: 3,
        reps: "8-10",
        rest: "60s",
        instructions:
          "De pie con la barra a la anchura de los hombros. Flexiona los codos sin balancear el cuerpo. Aprieta en la parte alta. Baja lento.",
      },
      {
        id: "5d2e6",
        name: "Curl en Banco Scott",
        muscle: "Bíceps (cabeza corta)",
        sets: 3,
        reps: "10-12",
        rest: "60s",
        instructions:
          "Apoya los brazos en el banco Scott. Sube la barra hasta la contracción máxima. Baja lentamente sin extender completamente para mantener tensión.",
      },
    ],
  },
  3: {
    title: "Pierna",
    focus: "Cuádriceps / Isquiotibiales / Glúteos",
    exercises: [
      {
        id: "5d3e1",
        name: "Sentadilla con Barra",
        muscle: "Cuádriceps / Glúteos",
        sets: 5,
        reps: "5-6",
        rest: "150s",
        instructions:
          "Barra alta sobre trapecios. Desciende profundamente, mantén el core activado. Empuja explosivamente desde los talones.",
      },
      {
        id: "5d3e2",
        name: "Prensa de Piernas 45°",
        muscle: "Cuádriceps",
        sets: 4,
        reps: "10-12",
        rest: "90s",
        instructions:
          "Pies altos y anchos para glúteos, pies bajos y juntos para cuádriceps. Baja hasta 90°. No bloquees arriba.",
      },
      {
        id: "5d3e3",
        name: "Peso Muerto Rumano",
        muscle: "Isquiotibiales / Glúteos",
        sets: 4,
        reps: "8-10",
        rest: "90s",
        instructions:
          "Empuja las caderas hacia atrás. Desliza la barra por los muslos. Siente el estiramiento en los isquiotibiales. Sube apretando glúteos.",
      },
      {
        id: "5d3e4",
        name: "Sentadilla Hack",
        muscle: "Cuádriceps",
        sets: 3,
        reps: "10-12",
        rest: "60s",
        instructions:
          "En la máquina hack, apoya la espalda firmemente. Desciende hasta que las rodillas formen 90°. Empuja de forma controlada.",
      },
      {
        id: "5d3e5",
        name: "Curl Femoral Sentado",
        muscle: "Isquiotibiales",
        sets: 3,
        reps: "10-12",
        rest: "60s",
        instructions:
          "Sentado en la máquina, ajusta las almohadillas. Flexiona las piernas llevando los talones bajo el asiento. Regresa lentamente.",
      },
      {
        id: "5d3e6",
        name: "Elevaciones de Pantorrillas en Prensa",
        muscle: "Gemelos",
        sets: 4,
        reps: "15-20",
        rest: "45s",
        instructions:
          "Coloca las puntas de los pies en el borde de la plataforma de la prensa. Extiende los tobillos al máximo. Baja estirando completamente.",
      },
    ],
  },
  4: {
    title: "Hombros / Abdomen",
    focus: "Deltoides 3D + Core",
    exercises: [
      {
        id: "5d4e1",
        name: "Press Militar con Barra",
        muscle: "Deltoides Anterior",
        sets: 4,
        reps: "6-8",
        rest: "120s",
        instructions:
          "De pie, agarra la barra a la anchura de los hombros. Empuja sobre la cabeza hasta la extensión completa. Baja a los hombros controladamente.",
      },
      {
        id: "5d4e2",
        name: "Elevaciones Laterales con Mancuernas",
        muscle: "Deltoides Lateral",
        sets: 4,
        reps: "12-15",
        rest: "60s",
        instructions:
          "De pie, eleva las mancuernas lateralmente con los codos ligeramente flexionados. Sube hasta la altura de los hombros. Baja controlado.",
      },
      {
        id: "5d4e3",
        name: "Pájaros en Polea",
        muscle: "Deltoides Posterior",
        sets: 3,
        reps: "12-15",
        rest: "60s",
        instructions:
          "De pie entre dos poleas bajas cruzadas. Tira de los cables hacia afuera y atrás con los codos altos. Aprieta los deltoides posteriores.",
      },
      {
        id: "5d4e4",
        name: "Encogimientos con Barra",
        muscle: "Trapecios",
        sets: 3,
        reps: "12-15",
        rest: "60s",
        instructions:
          "De pie con la barra al frente. Encoge los hombros llevándolos hacia las orejas. Mantén la contracción 2 segundos. Baja lentamente.",
      },
      {
        id: "5d4e5",
        name: "Crunch en Polea Alta",
        muscle: "Abdomen",
        sets: 3,
        reps: "15-20",
        rest: "45s",
        instructions:
          "Arrodillado frente a la polea alta con la cuerda detrás de la nuca. Flexiona el tronco acercando los codos a las rodillas. Contrae el abdomen.",
      },
      {
        id: "5d4e6",
        name: "Plancha Lateral",
        muscle: "Oblicuos / Core",
        sets: 3,
        reps: "30s c/lado",
        rest: "30s",
        instructions:
          "Apóyate sobre un antebrazo con los pies apilados. Eleva las caderas formando una línea recta. Contrae los oblicuos. Mantén la posición.",
      },
      {
        id: "5d4e7",
        name: "Russian Twists con Disco",
        muscle: "Oblicuos",
        sets: 3,
        reps: "20 total",
        rest: "45s",
        instructions:
          "Sentado con las piernas elevadas, sujeta un disco frente al pecho. Gira el torso de lado a lado tocando el suelo con el disco. Mantén el abdomen contraído.",
      },
    ],
  },
  5: {
    title: "Full Body Potencia",
    focus: "Fuerza Explosiva / Compuestos",
    exercises: [
      {
        id: "5d5e1",
        name: "Clean & Press (Cargada y Press)",
        muscle: "Cuerpo Completo",
        sets: 4,
        reps: "5",
        rest: "150s",
        instructions:
          "Desde el suelo, realiza una cargada llevando la barra a los hombros. Desde ahí, empuja sobre la cabeza. Baja la barra de forma controlada a los hombros y luego al suelo.",
      },
      {
        id: "5d5e2",
        name: "Sentadilla Frontal",
        muscle: "Cuádriceps / Core",
        sets: 4,
        reps: "6-8",
        rest: "120s",
        instructions:
          "Barra en los deltoides frontales con agarre cruzado o limpio. Mantén los codos altos. Desciende profundamente manteniendo el torso vertical.",
      },
      {
        id: "5d5e3",
        name: "Remo Pendlay",
        muscle: "Espalda",
        sets: 4,
        reps: "5-6",
        rest: "120s",
        instructions:
          "Desde el suelo, inclínate a 90° con la espalda paralela. Tira explosivamente de la barra al abdomen. Baja la barra al suelo en cada repetición.",
      },
      {
        id: "5d5e4",
        name: "Push Press",
        muscle: "Hombros / Piernas",
        sets: 3,
        reps: "6-8",
        rest: "90s",
        instructions:
          "Barra en los hombros. Realiza un pequeño dip con las rodillas y empuja explosivamente la barra sobre la cabeza usando el impulso de las piernas.",
      },
      {
        id: "5d5e5",
        name: "Peso Muerto con Trap Bar",
        muscle: "Piernas / Espalda",
        sets: 4,
        reps: "6-8",
        rest: "120s",
        instructions:
          "Dentro de la trap bar, agarra los mangos laterales. Levanta extendiendo caderas y rodillas. Más seguro para la espalda que el peso muerto convencional.",
      },
      {
        id: "5d5e6",
        name: "Farmer's Walk (Paseo del Granjero)",
        muscle: "Core / Agarre / Trapecios",
        sets: 3,
        reps: "40m",
        rest: "90s",
        instructions:
          "Sujeta mancuernas o kettlebells pesadas a los lados. Camina con pasos cortos y rápidos manteniendo el torso completamente recto. Aprieta el core y los hombros.",
      },
    ],
  },
};

// ─── Plan Mapping ────────────────────────────────────────────────────────────

export const PLANS = {
  2: plan2Days,
  3: plan3Days,
  5: plan5Days,
};
