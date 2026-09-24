import { useMemo, useState, type ReactNode } from 'react';

import previewData from './prototype-001.generated.json';

type Phase =
  | 'briefing'
  | 'observe-partial'
  | 'decide-partial'
  | 'transition'
  | 'decide-total'
  | 'debrief';

type FactEntry = {
  text: string;
  locator: string;
  sourceIds: string[];
};

type PreviewPayload = {
  note: string;
  factCatalog: Record<string, FactEntry>;
  envelope: {
    releaseScope: string;
    reviewState: string;
    sources: Array<{ id: string; label: string; scope: string }>;
  };
};

const payload = previewData as PreviewPayload;

const PARTIAL_FACTS = ['partial-airflow', 'cough-means-airflow', 'effective-cough-response'] as const;
const TRANSITION_FACTS = [
  'transition-direction',
  'do-not-wait-for-cyanosis',
  'total-obstruction-silence',
] as const;
const TOTAL_FACTS = ['total-obstruction-silence', 'total-requires-immediate-action'] as const;
const PRACTICE_LIMIT_FACTS = ['reading-is-not-practical-competence'] as const;

const phaseOrder: Phase[] = [
  'briefing',
  'observe-partial',
  'decide-partial',
  'transition',
  'decide-total',
  'debrief',
];

function FactCard({ factId }: { factId: string }) {
  const fact = payload.factCatalog[factId];
  if (!fact) return null;

  return (
    <article className="fact-card">
      <div className="fact-id">{factId}</div>
      <p>{fact.text}</p>
      <span>{fact.locator}</span>
    </article>
  );
}

function FactDrawer({ factIds }: { factIds: readonly string[] }) {
  return (
    <details className="fact-drawer">
      <summary>
        <span>Apri la spiegazione verificata</span>
        <small>{factIds.length} fact dal Source Pack</small>
      </summary>
      <div className="fact-stack">
        {factIds.map((factId) => (
          <FactCard key={factId} factId={factId} />
        ))}
      </div>
    </details>
  );
}

function SignalWave({ mode }: { mode: 'partial' | 'transition' | 'total' }) {
  return (
    <div className={`signal-wave ${mode}`} aria-hidden="true">
      {Array.from({ length: 9 }, (_, index) => (
        <span key={index} />
      ))}
    </div>
  );
}

function SceneIllustration({ mode }: { mode: 'partial' | 'transition' | 'total' }) {
  const isTotal = mode === 'total';
  const label =
    mode === 'partial'
      ? 'Tosse udibile · aria presente'
      : mode === 'transition'
        ? 'La tosse si sta spegnendo'
        : 'Silenzio · nessuna voce o tosse';

  return (
    <div className={`scene-illustration ${mode}`}>
      <div className="scene-room-glow" />
      <div className="scene-window" aria-hidden="true">
        <div className="window-sky" />
        <div className="window-line one" />
        <div className="window-line two" />
      </div>
      <div className="scene-table" aria-hidden="true">
        <div className="plate" />
        <div className="cup" />
      </div>
      <div className="child-figure" aria-label="Illustrazione astratta del bambino nello scenario">
        <div className="child-head">
          <div className="child-hair" />
          <div className="child-face">
            <span className="eye left" />
            <span className="eye right" />
            <span className={`mouth ${isTotal ? 'silent' : ''}`} />
          </div>
        </div>
        <div className="child-neck" />
        <div className="child-body">
          <div className="shirt-mark" />
        </div>
        <div className="child-arm left" />
        <div className="child-arm right" />
      </div>
      <div className={`sound-orbit ${isTotal ? 'muted' : ''}`}>
        <SignalWave mode={mode} />
        <strong>{isTotal ? '…' : mode === 'transition' ? 'coff…' : 'COFF · COFF'}</strong>
      </div>
      <div className={`voice-chip ${isTotal ? 'muted' : ''}`}>
        <span className="voice-dot" />
        {isTotal ? 'Nessun suono' : mode === 'transition' ? 'Voce in calo' : 'Suono presente'}
      </div>
      <div className="scene-caption">
        <span className={`scene-state-dot ${mode}`} />
        <div>
          <small>Segnale dominante</small>
          <strong>{label}</strong>
        </div>
      </div>
    </div>
  );
}

function CueButton({
  label,
  description,
  selected,
  onClick,
}: {
  label: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={selected ? 'cue-button selected' : 'cue-button'}
      onClick={onClick}
      aria-pressed={selected}
    >
      <span className="cue-check">{selected ? '✓' : ''}</span>
      <span>
        <strong>{label}</strong>
        <small>{description}</small>
      </span>
    </button>
  );
}

function ChoiceButton({
  title,
  description,
  onClick,
}: {
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button type="button" className="choice-card" onClick={onClick}>
      <span className="choice-arrow">→</span>
      <span>
        <strong>{title}</strong>
        <small>{description}</small>
      </span>
    </button>
  );
}

function Feedback({
  kind,
  title,
  children,
}: {
  kind: 'correct' | 'incorrect' | 'insight';
  title: string;
  children: ReactNode;
}) {
  return (
    <div className={`feedback-card ${kind}`} role="status">
      <div className="feedback-icon">{kind === 'correct' ? '✓' : kind === 'incorrect' ? '↺' : 'i'}</div>
      <div>
        <strong>{title}</strong>
        <p>{children}</p>
      </div>
    </div>
  );
}

function Briefing({ onStart }: { onStart: () => void }) {
  return (
    <div className="briefing-layout">
      <section className="briefing-copy">
        <div className="section-kicker">Scenario immersivo · Prototype 002</div>
        <h1>
          Non devi ricordare una frase.
          <br />
          Devi accorgerti quando la scena cambia.
        </h1>
        <p className="lead">
          Questo test allena una sola cosa: osservare i segnali, prendere una decisione e poi
          abbandonarla quando gli indizi non la sostengono più.
        </p>

        <div className="briefing-principles">
          <div>
            <span>01</span>
            <strong>Osserva</strong>
            <p>Leggi ciò che è presente, non ciò che temi possa accadere.</p>
          </div>
          <div>
            <span>02</span>
            <strong>Decidi</strong>
            <p>Scegli in base agli indizi che hai davanti in quel momento.</p>
          </div>
          <div>
            <span>03</span>
            <strong>Rivaluta</strong>
            <p>Se il quadro cambia, anche la tua decisione deve poter cambiare.</p>
          </div>
        </div>

        <button type="button" className="primary-cta" onClick={onStart}>
          Entra nello scenario <span>→</span>
        </button>
        <p className="microcopy">Nessun countdown. Nessuna simulazione di stress. Solo decisione.</p>
      </section>

      <section className="briefing-stage">
        <SceneIllustration mode="partial" />
        <div className="floating-note top">
          <small>Obiettivo</small>
          <strong>Riconoscere il passaggio da suono a silenzio</strong>
        </div>
        <div className="floating-note bottom">
          <small>Perimetro</small>
          <strong>Decisione, non addestramento manuale</strong>
        </div>
      </section>
    </div>
  );
}

function ObservationPartial({ onComplete }: { onComplete: () => void }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);

  const toggle = (id: string) => {
    setChecked(false);
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const correct = selected.includes('cough') && selected.includes('sound') && !selected.includes('color');

  return (
    <div className="scenario-layout">
      <section className="scenario-stage-wrap">
        <div className="stage-label">Fase 1 · Osserva prima di decidere</div>
        <SceneIllustration mode="partial" />
      </section>

      <section className="decision-panel">
        <div className="decision-heading">
          <div className="section-kicker">Cosa conta adesso?</div>
          <h2>Seleziona gli indizi che devono guidare la prima classificazione.</h2>
          <p>Non cercare subito “la risposta giusta”. Prima separa i segnali utili dal rumore.</p>
        </div>

        <div className="cue-list">
          <CueButton
            label="La tosse è udibile"
            description="C'è ancora un flusso d'aria sufficiente a produrre tosse."
            selected={selected.includes('cough')}
            onClick={() => toggle('cough')}
          />
          <CueButton
            label="C'è ancora suono"
            description="La scena non è silenziosa: tosse o voce sono ancora presenti."
            selected={selected.includes('sound')}
            onClick={() => toggle('sound')}
          />
          <CueButton
            label="Il colore della pelle"
            description="Può attirare l'attenzione, ma non è il segnale da aspettare per rivalutare."
            selected={selected.includes('color')}
            onClick={() => toggle('color')}
          />
        </div>

        <button
          type="button"
          className="check-button"
          disabled={selected.length === 0}
          onClick={() => setChecked(true)}
        >
          Verifica la mia lettura
        </button>

        {checked ? (
          correct ? (
            <>
              <Feedback kind="correct" title="Hai isolato i segnali decisivi.">
                Tosse e suono indicano che l'aria sta ancora passando. Il quadro richiede osservazione e
                rivalutazione, non una reazione automatica alla paura.
              </Feedback>
              <FactDrawer factIds={PARTIAL_FACTS} />
              <button type="button" className="primary-cta compact" onClick={onComplete}>
                Ora decidi cosa fare <span>→</span>
              </button>
            </>
          ) : (
            <Feedback kind="incorrect" title="Rileggi la scena, non l'ansia che provoca.">
              Per questa classificazione devi dare più peso a tosse e suono. Il colore non è il segnale da
              aspettare per capire che la situazione è cambiata.
            </Feedback>
          )
        ) : null}
      </section>
    </div>
  );
}

function DecidePartial({ onComplete }: { onComplete: () => void }) {
  const [feedback, setFeedback] = useState<'correct' | 'manual' | 'wait' | null>(null);

  return (
    <div className="scenario-layout">
      <section className="scenario-stage-wrap">
        <div className="stage-label">Fase 2 · Scegli senza sovra-intervenire</div>
        <SceneIllustration mode="partial" />
      </section>

      <section className="decision-panel">
        <div className="decision-heading">
          <div className="section-kicker">La tosse è ancora efficace</div>
          <h2>Qual è la risposta coerente con quello che stai osservando?</h2>
          <p>La scena è ancora la stessa. Non anticipare la fase successiva.</p>
        </div>

        <div className="choice-list">
          <ChoiceButton
            title="Osservo, incoraggio la tosse e resto pronto a rivalutare"
            description="Mantengo l'attenzione sui segnali e non interferisco finché la tosse è efficace."
            onClick={() => setFeedback('correct')}
          />
          <ChoiceButton
            title="Inizio subito manovre manuali"
            description="Agisco prima che gli indizi mostrino una perdita dell'efficacia della tosse."
            onClick={() => setFeedback('manual')}
          />
          <ChoiceButton
            title="Aspetto un evidente cambio di colore"
            description="Rimando la rivalutazione finché compare un segnale visivo più drammatico."
            onClick={() => setFeedback('wait')}
          />
        </div>

        {feedback === 'correct' ? (
          <>
            <Feedback kind="correct" title="La risposta è coerente con il quadro attuale.">
              Finché la tosse rimane efficace, la priorità è non interferire, osservare e restare pronti a
              cambiare risposta se i segnali cambiano.
            </Feedback>
            <FactDrawer factIds={PARTIAL_FACTS} />
            <button type="button" className="primary-cta compact" onClick={onComplete}>
              Fai evolvere la scena <span>→</span>
            </button>
          </>
        ) : null}

        {feedback === 'manual' ? (
          <Feedback kind="incorrect" title="Stai reagendo troppo presto.">
            La presenza di una tosse efficace indica ancora passaggio d'aria. In questa fase il Source Pack
            non supporta l'avvio di manovre manuali.
          </Feedback>
        ) : null}

        {feedback === 'wait' ? (
          <Feedback kind="incorrect" title="Stai aspettando il segnale sbagliato.">
            La rivalutazione deve avvenire prima di un evidente cambio di colore: il deterioramento di tosse
            e suono è già un cambio decisionale.
          </Feedback>
        ) : null}
      </section>
    </div>
  );
}

function TransitionPhase({ onComplete }: { onComplete: () => void }) {
  const [revealed, setRevealed] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);

  const toggle = (id: string) => {
    setChecked(false);
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const correct =
    selected.includes('cough-gone') &&
    selected.includes('voice-gone') &&
    !selected.includes('color-first');

  return (
    <div className="scenario-layout">
      <section className="scenario-stage-wrap">
        <div className="stage-label">Fase 3 · La variabile cambia</div>
        <SceneIllustration mode={revealed ? 'total' : 'transition'} />
        {!revealed ? (
          <button type="button" className="stage-action" onClick={() => setRevealed(true)}>
            Osserva cosa cambia <span>↓</span>
          </button>
        ) : (
          <div className="change-banner">
            <span className="change-pulse" />
            La scena non è più quella di prima.
          </div>
        )}
      </section>

      <section className="decision-panel">
        <div className="decision-heading">
          <div className="section-kicker">La decisione precedente non è permanente</div>
          <h2>{revealed ? 'Quali segnali sono cambiati?' : 'Osserva prima. Non anticipare la risposta.'}</h2>
          <p>
            {revealed
              ? 'Seleziona ciò che ti obbliga a rivalutare il quadro.'
              : 'Il test non usa un countdown: devi accorgerti del cambiamento, non essere più veloce.'}
          </p>
        </div>

        {revealed ? (
          <>
            <div className="cue-list">
              <CueButton
                label="La tosse si è spenta"
                description="Da un suono presente si passa al silenzio."
                selected={selected.includes('cough-gone')}
                onClick={() => toggle('cough-gone')}
              />
              <CueButton
                label="Voce e pianto non sono più udibili"
                description="Anche questo indica perdita del precedente passaggio d'aria."
                selected={selected.includes('voice-gone')}
                onClick={() => toggle('voice-gone')}
              />
              <CueButton
                label="Serve aspettare la cianosi"
                description="Il cambio di colore sarebbe il vero segnale per cambiare risposta."
                selected={selected.includes('color-first')}
                onClick={() => toggle('color-first')}
              />
            </div>

            <button
              type="button"
              className="check-button"
              disabled={selected.length === 0}
              onClick={() => setChecked(true)}
            >
              Rivaluta gli indizi
            </button>

            {checked ? (
              correct ? (
                <>
                  <Feedback kind="insight" title="Questo è il punto del training.">
                    Non hai imparato una nuova frase: hai abbandonato una decisione che era corretta un
                    momento prima perché gli indizi sono cambiati. Dal suono si è passati al silenzio.
                  </Feedback>
                  <FactDrawer factIds={TRANSITION_FACTS} />
                  <button type="button" className="primary-cta compact" onClick={onComplete}>
                    Prendi la nuova decisione <span>→</span>
                  </button>
                </>
              ) : (
                <Feedback kind="incorrect" title="Stai aspettando troppo a lungo.">
                  La scomparsa di tosse e voce basta a cambiare la classificazione. Il Source Pack dice
                  esplicitamente di non aspettare la cianosi per rivalutare.
                </Feedback>
              )
            ) : null}
          </>
        ) : null}
      </section>
    </div>
  );
}

function DecideTotal({ onComplete }: { onComplete: () => void }) {
  const [feedback, setFeedback] = useState<'correct' | 'observe' | 'wait' | null>(null);

  return (
    <div className="scenario-layout">
      <section className="scenario-stage-wrap">
        <div className="stage-label">Fase 4 · Nuovo quadro, nuova risposta</div>
        <SceneIllustration mode="total" />
      </section>

      <section className="decision-panel">
        <div className="decision-heading">
          <div className="section-kicker">Ora la scena è silenziosa</div>
          <h2>La risposta di prima è ancora valida?</h2>
          <p>Il test termina sulla decisione. Le tecniche manuali restano fuori da questo prototipo.</p>
        </div>

        <div className="choice-list">
          <ChoiceButton
            title="No. Rivaluto come ostruzione totale e passo all'intervento immediato"
            description="Il passaggio da tosse/suono al silenzio cambia la risposta richiesta."
            onClick={() => setFeedback('correct')}
          />
          <ChoiceButton
            title="Sì. Continuo a osservare e incoraggiare la tosse"
            description="Mantengo la decisione iniziale anche se la tosse non è più presente."
            onClick={() => setFeedback('observe')}
          />
          <ChoiceButton
            title="Aspetto un cambio di colore per esserne sicuro"
            description="Rimando l'intervento finché non compare un segnale più evidente."
            onClick={() => setFeedback('wait')}
          />
        </div>

        {feedback === 'correct' ? (
          <>
            <Feedback kind="correct" title="Hai rivalutato invece di perseverare.">
              Quando l'ostruzione totale è riconosciuta, la risposta cambia dall'osservazione all'intervento
              immediato. Questo prototipo non insegna la sequenza manuale: quella richiede pratica fisica
              supervisionata.
            </Feedback>
            <FactDrawer factIds={TOTAL_FACTS} />
            <button type="button" className="primary-cta compact" onClick={onComplete}>
              Vedi il debrief <span>→</span>
            </button>
          </>
        ) : null}

        {feedback === 'observe' ? (
          <Feedback kind="incorrect" title="La prima decisione era corretta. Adesso non lo è più.">
            Questo è il bias che il modulo vuole allenare: non restare ancorato alla classificazione iniziale
            quando tosse e voce sono scomparse.
          </Feedback>
        ) : null}

        {feedback === 'wait' ? (
          <Feedback kind="incorrect" title="Non aspettare un segnale più drammatico.">
            La perdita di tosse e voce è già il cambio decisivo. Aspettare la cianosi significa reagire più
            tardi rispetto agli indizi disponibili.
          </Feedback>
        ) : null}
      </section>
    </div>
  );
}

function Debrief({ onRestart }: { onRestart: () => void }) {
  const timeline = [
    {
      step: '01',
      label: 'Tosse + suono',
      decision: 'Osserva. Non interferire con una tosse efficace.',
      tone: 'soft',
    },
    {
      step: '02',
      label: 'Tosse che si spegne',
      decision: 'La variabile cambia: la prima decisione va rimessa in discussione.',
      tone: 'shift',
    },
    {
      step: '03',
      label: 'Silenzio',
      decision: 'Riconosci il nuovo quadro e passa all’intervento immediato.',
      tone: 'strong',
    },
  ];

  return (
    <div className="debrief-shell">
      <section className="debrief-hero">
        <div className="section-kicker">Debrief</div>
        <h1>
          La competenza allenata non era “sapere la risposta”.
          <br />
          Era sapere quando cambiarla.
        </h1>
        <p>
          La stessa scena ha richiesto due decisioni opposte in momenti diversi. Il punto del formato
          interattivo è rendere visibile quel passaggio, non trasformare il contenuto in un quiz decorativo.
        </p>
      </section>

      <section className="decision-timeline">
        {timeline.map((item, index) => (
          <article key={item.step} className={`timeline-card ${item.tone}`}>
            <div className="timeline-index">{item.step}</div>
            <div>
              <small>{item.label}</small>
              <strong>{item.decision}</strong>
            </div>
            {index < timeline.length - 1 ? <span className="timeline-arrow">→</span> : null}
          </article>
        ))}
      </section>

      <section className="debrief-grid">
        <article className="debrief-card positive">
          <div className="debrief-icon">✓</div>
          <div>
            <h3>Cosa hai allenato</h3>
            <ul>
              <li>separare indizi utili da segnali più drammatici ma tardivi;</li>
              <li>classificare la situazione sulla base di ciò che è presente;</li>
              <li>rivalutare quando tosse e voce scompaiono;</li>
              <li>abbandonare una decisione precedente quando non è più sostenuta.</li>
            </ul>
          </div>
        </article>

        <article className="debrief-card boundary">
          <div className="debrief-icon">—</div>
          <div>
            <h3>Cosa non hai allenato</h3>
            <p>
              Non hai acquisito una competenza manuale affidabile. La comprensione digitale non sostituisce
              l'esercitazione fisica delle manovre su manichino.
            </p>
            <FactDrawer factIds={PRACTICE_LIMIT_FACTS} />
          </div>
        </article>
      </section>

      <section className="debrief-source">
        <div>
          <div className="section-kicker">Source boundary</div>
          <h3>Ogni passaggio è ricondotto al libro Formalife validato.</h3>
        </div>
        <FactDrawer factIds={[...PARTIAL_FACTS, ...TRANSITION_FACTS, ...TOTAL_FACTS]} />
      </section>

      <div className="debrief-actions">
        <button type="button" className="secondary-cta" onClick={onRestart}>
          ↺ Ripeti lo scenario
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [phase, setPhase] = useState<Phase>('briefing');
  const phaseIndex = useMemo(() => phaseOrder.indexOf(phase), [phase]);
  const progress = Math.max(0, (phaseIndex / (phaseOrder.length - 1)) * 100);

  const next = (target: Phase) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setPhase(target);
  };

  return (
    <div className="immersive-app">
      <header className="lab-header">
        <div className="lab-brand">
          <div className="brand-mark">F</div>
          <div>
            <strong>Formalife · MAIC Lab</strong>
            <small>Prototype 002 · immersive redesign</small>
          </div>
        </div>
        <div className="lab-meta">
          <span>INTERNAL ONLY</span>
          <span>{payload.envelope.reviewState.toUpperCase()}</span>
        </div>
      </header>

      <div className="progress-track" aria-hidden="true">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <main className="immersive-main">
        {phase === 'briefing' ? <Briefing onStart={() => next('observe-partial')} /> : null}
        {phase === 'observe-partial' ? (
          <ObservationPartial onComplete={() => next('decide-partial')} />
        ) : null}
        {phase === 'decide-partial' ? <DecidePartial onComplete={() => next('transition')} /> : null}
        {phase === 'transition' ? <TransitionPhase onComplete={() => next('decide-total')} /> : null}
        {phase === 'decide-total' ? <DecideTotal onComplete={() => next('debrief')} /> : null}
        {phase === 'debrief' ? <Debrief onRestart={() => next('briefing')} /> : null}
      </main>

      <footer className="immersive-footer">
        <span>Source: La Guida Anti-Panico al Soffocamento Pediatrico · Formalife</span>
        <span>{payload.note}</span>
      </footer>
    </div>
  );
}
