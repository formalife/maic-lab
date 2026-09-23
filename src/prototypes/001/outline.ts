import type { SceneOutline } from '@openmaic/generation';

export interface PrototypeSceneOutline extends SceneOutline {
  /** Stable Source Pack fact ids required by this scene. */
  sourceFactIds: string[];
}

export const PROTOTYPE_001_OUTLINE: PrototypeSceneOutline[] = [
  {
    id: 'p001-s01',
    order: 1,
    type: 'slide',
    title: 'Prima della manovra: che cosa stai osservando?',
    description:
      'Apri il modulo chiarendo che il primo lavoro è riconoscere se l’aria sta ancora passando. Non insegnare qui la sequenza delle manovre.',
    keyPoints: [
      'Nell’ostruzione parziale l’aria continua a passare.',
      'La presenza o l’assenza di suono cambia la decisione.',
      'Riconoscere viene prima dell’intervento tecnico.',
    ],
    teachingObjective:
      'Orientare l’attenzione del learner sui segnali osservabili che distinguono la situazione.',
    estimatedDuration: 60,
    languageNote: 'Italiano, tono calmo e concreto.',
    sourceFactIds: ['partial-airflow', 'cough-means-airflow', 'total-obstruction-silence'],
  },
  {
    id: 'p001-s02',
    order: 2,
    type: 'interactive',
    title: 'Scenario 1 — C’è ancora aria?',
    description:
      'Mostra un bambino cosciente che tossisce in modo udibile e riesce ancora a produrre un suono. Il learner deve classificare la situazione e scegliere tra osservare/incoraggiare la tosse oppure iniziare manovre manuali.',
    keyPoints: [
      'Una tosse presente implica passaggio d’aria.',
      'Con tosse efficace non si eseguono manovre manuali di disostruzione.',
      'Si osserva, si incoraggia a tossire e si resta pronti a rivalutare.',
    ],
    teachingObjective:
      'Far scegliere attivamente la risposta coerente con un’ostruzione parziale invece di reagire alla sola paura della scena.',
    estimatedDuration: 120,
    languageNote: 'Italiano. Nessun countdown e nessuna pressione sulla velocità.',
    widgetType: 'game',
    widgetOutline: {
      concept: 'Riconoscimento dell’ostruzione parziale',
      gameType: 'card',
      challenge:
        'Osserva i segnali e scegli quale categoria descrive la situazione e quale risposta è appropriata.',
      playerControls: ['Osserva gli indizi', 'Scegli la classificazione', 'Scegli la risposta'],
      successCriteria: [
        'Riconoscere che la tosse udibile indica passaggio d’aria.',
        'Evitare manovre manuali mentre la tosse è efficace.',
      ],
      errorConsequences: [
        'La spiegazione deve mostrare quale indizio è stato ignorato, senza simulare un esito clinico inventato.',
      ],
    },
    sourceFactIds: ['partial-airflow', 'cough-means-airflow', 'effective-cough-response'],
  },
  {
    id: 'p001-s03',
    order: 3,
    type: 'slide',
    title: 'Perché il suono cambia la decisione',
    description:
      'Spiega dopo la scelta che tosse e altri suoni sono evidenza di passaggio d’aria. Mantieni la spiegazione breve e collegata allo scenario appena affrontato.',
    keyPoints: [
      'Tossire richiede che almeno una parte dell’aria riesca ancora a passare.',
      'La risposta corretta nell’ostruzione parziale non è “fare di più”, ma non interferire e continuare a osservare.',
      'In caso di dubbio o situazione non convincente si può chiamare il 112 senza attendere che diventi totale.',
    ],
    teachingObjective:
      'Trasformare la scelta del learner in una regola mentale comprensibile e tracciabile.',
    estimatedDuration: 75,
    languageNote: 'Italiano, spiegazione post-decisione.',
    sourceFactIds: ['cough-means-airflow', 'effective-cough-response', 'call-112-when-uncertain'],
  },
  {
    id: 'p001-s04',
    order: 4,
    type: 'interactive',
    title: 'Scenario 2 — La variabile cambia',
    description:
      'Lo scenario parte con tosse presente. Poi la tosse si affievolisce fino a scomparire e il bambino non produce più voce o pianto. Il learner deve rivalutare: la risposta precedente non è più automaticamente valida.',
    keyPoints: [
      'La transizione può essere rapida e richiede osservazione continua.',
      'Il passaggio da suono a silenzio è un cambio decisionale.',
      'Non si aspetta la cianosi per cambiare risposta.',
      'Quando è riconosciuta l’ostruzione totale, serve intervento immediato.',
    ],
    teachingObjective:
      'Allenare la rivalutazione quando un singolo scenario cambia nel tempo.',
    estimatedDuration: 150,
    languageNote: 'Italiano. La difficoltà nasce dal cambio degli indizi, non dalla velocità.',
    widgetType: 'game',
    widgetOutline: {
      concept: 'Rivalutazione durante la transizione',
      gameType: 'strategy',
      challenge:
        'Prendi una prima decisione, osserva il cambio di segnali e decidi se mantenerla o cambiarla.',
      playerControls: ['Valuta fase iniziale', 'Rivela il cambiamento', 'Rivaluta la decisione'],
      successCriteria: [
        'Cambiare classificazione quando scompaiono tosse e voce.',
        'Non aspettare un cambio di colore per riconoscere il peggioramento.',
      ],
      errorConsequences: [
        'Il feedback deve indicare quale segnale è cambiato e perché richiede rivalutazione.',
      ],
    },
    sourceFactIds: [
      'transition-direction',
      'do-not-wait-for-cyanosis',
      'total-obstruction-silence',
      'total-requires-immediate-action',
    ],
  },
  {
    id: 'p001-s05',
    order: 5,
    type: 'quiz',
    title: 'Checkpoint — Quale indizio guida la decisione?',
    description:
      'Tre domande brevi su tosse presente, passaggio al silenzio e momento in cui rivalutare. Non introdurre fatti nuovi.',
    keyPoints: [
      'Tosse presente → aria presente.',
      'Tosse efficace → non interferire con manovre manuali.',
      'Scomparsa di tosse/voce → rivalutazione immediata verso ostruzione totale.',
    ],
    teachingObjective: 'Verificare che il learner sappia usare gli indizi invece di ricordare slogan isolati.',
    estimatedDuration: 120,
    languageNote: 'Italiano.',
    quizConfig: {
      questionCount: 3,
      difficulty: 'medium',
      questionTypes: ['single'],
    },
    sourceFactIds: [
      'cough-means-airflow',
      'effective-cough-response',
      'transition-direction',
      'total-obstruction-silence',
    ],
  },
  {
    id: 'p001-s06',
    order: 6,
    type: 'interactive',
    title: 'Scenario 3 — Quando il quadro non è subito chiaro',
    description:
      'Scenario di un bambino sopra i due-tre anni, con adulto già accanto e quadro inizialmente ambiguo. Il learner deve decidere quale informazione rapida può aiutare senza sostituire l’osservazione.',
    keyPoints: [
      'Una risposta vocale dimostra che passa aria.',
      'L’assenza di suono durante il tentativo di rispondere supporta il riconoscimento dell’ostruzione totale.',
      'La domanda è una conferma rapida, non un sostituto dell’osservazione.',
    ],
    teachingObjective:
      'Trasferire la logica aria/suono in uno scenario leggermente diverso senza aggiungere nuove regole cliniche.',
    estimatedDuration: 120,
    languageNote: 'Italiano.',
    widgetType: 'game',
    widgetOutline: {
      concept: 'Conferma rapida nel bambino più grande',
      gameType: 'card',
      challenge:
        'Scegli quale verifica è coerente con il quadro e interpreta correttamente la presenza o assenza di risposta vocale.',
      playerControls: ['Osserva', 'Scegli la verifica', 'Interpreta la risposta'],
      successCriteria: [
        'Usare la risposta vocale come evidenza di airflow.',
        'Non trattare la domanda come sostituto dell’osservazione.',
      ],
    },
    sourceFactIds: ['older-child-verbal-check', 'partial-airflow', 'total-obstruction-silence'],
  },
  {
    id: 'p001-s07',
    order: 7,
    type: 'slide',
    title: 'Capire la decisione non significa aver allenato le mani',
    description:
      'Chiudi distinguendo il lavoro svolto nel modulo — riconoscere e decidere — dall’apprendimento pratico delle manovre su manichino.',
    keyPoints: [
      'Il modulo può allenare osservazione, classificazione e rivalutazione.',
      'La competenza pratica nelle manovre richiede esercitazione fisica su manichino.',
      'Il digitale non viene presentato come sostituto della pratica supervisionata.',
    ],
    teachingObjective:
      'Evitare falsa sicurezza e mantenere onesto il perimetro del prototipo.',
    estimatedDuration: 60,
    languageNote: 'Italiano, chiusura breve.',
    sourceFactIds: ['reading-is-not-practical-competence'],
  },
];
