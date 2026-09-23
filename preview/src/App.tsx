import { useEffect, useMemo, useState } from 'react';
import { SlideCanvas, type Slide } from '@openmaic/renderer';

import previewData from './prototype-001.generated.json';

type SceneAction = {
  id: string;
  type: string;
  text?: string;
};

type SlideSceneContent = {
  type: 'slide';
  canvas: Slide;
};

type InteractiveSceneContent = {
  type: 'interactive';
  html: string;
  widgetType?: string;
};

type QuizOption = {
  value: string;
  label: string;
};

type QuizQuestion = {
  id: string;
  type: string;
  question: string;
  options?: QuizOption[];
  answer?: string[];
};

type QuizSceneContent = {
  type: 'quiz';
  questions: QuizQuestion[];
};

type PreviewScene = {
  id: string;
  title: string;
  type: 'slide' | 'interactive' | 'quiz' | 'pbl';
  order: number;
  content: SlideSceneContent | InteractiveSceneContent | QuizSceneContent | Record<string, unknown>;
  actions?: SceneAction[];
};

type PassiveBaselineScene = {
  id: string;
  order: number;
  title: string;
  keyPoints: string[];
  sourceFactIds: string[];
  sourceLocators: string[];
};

type PreviewPayload = {
  providerMode: string;
  note: string;
  experiment: {
    versionA: string;
    versionB: string;
    evaluationDataPolicy: string;
  };
  passiveBaseline: PassiveBaselineScene[];
  sceneFactIds: Record<string, string[]>;
  envelope: {
    releaseScope: string;
    reviewState: string;
    scenes: PreviewScene[];
    sources: Array<{ id: string; label: string; scope: string }>;
    sceneSources: Record<string, string[]>;
  };
};

type Version = 'A' | 'B';
type RatingPair = { A?: number; B?: number };
type RatingState = Record<string, RatingPair>;

const payload = previewData as PreviewPayload;

const evaluationCriteria = [
  {
    id: 'clarity',
    label: 'Chiarezza',
    description: 'Quanto è facile capire quali segnali e distinzioni contano?',
  },
  {
    id: 'decision_relevance',
    label: 'Rilevanza decisionale',
    description: 'Quanto il formato aiuta a capire cosa osservare e quando rivalutare?',
  },
  {
    id: 'mental_work',
    label: 'Lavoro mentale',
    description: 'Quanto obbliga a valutare gli indizi invece di limitarsi a leggere?',
  },
  {
    id: 'source_fidelity',
    label: 'Fedeltà alla fonte',
    description: 'Quanto è evidente che il contenuto resta entro il Source Pack autorizzato?',
  },
  {
    id: 'reviewability',
    label: 'Controllabilità',
    description: 'Quanto è semplice ispezionare, verificare e correggere l’artefatto?',
  },
] as const;

function kindLabel(scene: PreviewScene): string {
  switch (scene.content.type) {
    case 'slide':
      return 'Slide';
    case 'interactive':
      return 'Scenario';
    case 'quiz':
      return 'Quiz';
    default:
      return scene.type;
  }
}

function SlideScene({ content }: { content: SlideSceneContent }) {
  return (
    <div className="slide-frame" aria-label="Anteprima slide OpenMAIC">
      <SlideCanvas slide={content.canvas} videoInteractive={false} />
    </div>
  );
}

function InteractiveScene({ content, title }: { content: InteractiveSceneContent; title: string }) {
  return (
    <iframe
      className="interactive-frame"
      title={title}
      srcDoc={content.html}
      sandbox="allow-scripts"
      referrerPolicy="no-referrer"
    />
  );
}

function QuizScene({ content }: { content: QuizSceneContent }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  return (
    <div className="quiz-stack">
      {content.questions.map((question, index) => {
        const selected = answers[question.id];
        const isAnswered = Boolean(selected);
        const isCorrect = selected ? question.answer?.includes(selected) ?? false : false;

        return (
          <section className="quiz-card" key={question.id}>
            <div className="quiz-index">Domanda {index + 1}</div>
            <h3>{question.question}</h3>
            <div className="quiz-options">
              {(question.options ?? []).map((option) => {
                const chosen = selected === option.value;
                return (
                  <button
                    type="button"
                    key={option.value}
                    className={chosen ? 'quiz-option selected' : 'quiz-option'}
                    onClick={() => setAnswers((current) => ({ ...current, [question.id]: option.value }))}
                  >
                    <span className="option-key">{option.value}</span>
                    <span>{option.label}</span>
                  </button>
                );
              })}
            </div>
            {isAnswered ? (
              <div className={isCorrect ? 'quiz-result correct' : 'quiz-result incorrect'} aria-live="polite">
                {isCorrect ? 'Coerente con il Source Pack.' : 'Rivaluta gli indizi e riprova.'}
              </div>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}

function SceneViewport({ scene }: { scene: PreviewScene }) {
  if (scene.content.type === 'slide') {
    return <SlideScene content={scene.content as SlideSceneContent} />;
  }

  if (scene.content.type === 'interactive') {
    return <InteractiveScene content={scene.content as InteractiveSceneContent} title={scene.title} />;
  }

  if (scene.content.type === 'quiz') {
    return <QuizScene key={scene.id} content={scene.content as QuizSceneContent} />;
  }

  return <div className="unsupported">Tipo scena non supportato nel preview v0.</div>;
}

function PassiveScene({ scene }: { scene: PassiveBaselineScene }) {
  return (
    <article className="passive-card">
      <div className="passive-label">Versione A · spiegazione passiva</div>
      <h3>{scene.title}</h3>
      <ul>
        {scene.keyPoints.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
      <div className="passive-source">
        {scene.sourceLocators.map((locator) => (
          <span key={locator}>{locator}</span>
        ))}
      </div>
    </article>
  );
}

function ScorePicker({
  value,
  onChange,
  label,
}: {
  value?: number;
  onChange: (score: number) => void;
  label: string;
}) {
  return (
    <div className="score-picker" aria-label={label}>
      {[1, 2, 3, 4, 5].map((score) => (
        <button
          type="button"
          key={score}
          className={value === score ? 'score-button selected' : 'score-button'}
          onClick={() => onChange(score)}
          aria-pressed={value === score}
          title={`${label}: ${score}/5`}
        >
          {score}
        </button>
      ))}
    </div>
  );
}

function EvaluationPanel({ ratings, setRatings }: { ratings: RatingState; setRatings: (ratings: RatingState) => void }) {
  const [notes, setNotes] = useState('');

  const setScore = (criterionId: string, version: Version, score: number) => {
    setRatings({
      ...ratings,
      [criterionId]: {
        ...ratings[criterionId],
        [version]: score,
      },
    });
  };

  const completed = evaluationCriteria.every(
    (criterion) => ratings[criterion.id]?.A && ratings[criterion.id]?.B,
  );

  const exportEvaluation = () => {
    const criteria = evaluationCriteria.map((criterion) => {
      const pair = ratings[criterion.id] ?? {};
      return {
        id: criterion.id,
        label: criterion.label,
        versionA: pair.A ?? null,
        versionB: pair.B ?? null,
        deltaBMinusA:
          pair.A !== undefined && pair.B !== undefined ? pair.B - pair.A : null,
      };
    });

    const result = {
      experimentId: 'formalife-maic-lab-prototype-001',
      generatedAt: new Date().toISOString(),
      versions: {
        A: payload.experiment.versionA,
        B: payload.experiment.versionB,
      },
      dataPolicy: payload.experiment.evaluationDataPolicy,
      criteria,
      notes,
      complete: Boolean(completed),
    };

    const blob = new Blob([`${JSON.stringify(result, null, 2)}\n`], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'formalife-maic-lab-prototype-001-evaluation.json';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="evaluation-panel">
      <div className="evaluation-heading">
        <div>
          <div className="eyebrow">Experiment 001 · comparison</div>
          <h3>Valutazione A/B</h3>
          <p>
            Dopo aver percorso entrambe le versioni, assegna 1–5 a ciascun criterio. I dati restano nel browser finché non esporti manualmente il JSON.
          </p>
        </div>
        <div className={completed ? 'evaluation-state complete' : 'evaluation-state'}>
          {completed ? 'Valutazione completa' : 'Da completare'}
        </div>
      </div>

      <div className="evaluation-table" role="table" aria-label="Valutazione comparativa">
        <div className="evaluation-row evaluation-header" role="row">
          <div>Critero</div>
          <div>A · Passivo</div>
          <div>B · Interattivo</div>
          <div>Δ B−A</div>
        </div>
        {evaluationCriteria.map((criterion) => {
          const pair = ratings[criterion.id] ?? {};
          const delta = pair.A !== undefined && pair.B !== undefined ? pair.B - pair.A : null;

          return (
            <div className="evaluation-row" role="row" key={criterion.id}>
              <div className="criterion-copy">
                <strong>{criterion.label}</strong>
                <span>{criterion.description}</span>
              </div>
              <ScorePicker
                value={pair.A}
                onChange={(score) => setScore(criterion.id, 'A', score)}
                label={`${criterion.label} — Versione A`}
              />
              <ScorePicker
                value={pair.B}
                onChange={(score) => setScore(criterion.id, 'B', score)}
                label={`${criterion.label} — Versione B`}
              />
              <div className={delta === null ? 'delta-score empty' : delta > 0 ? 'delta-score positive' : delta < 0 ? 'delta-score negative' : 'delta-score'}>
                {delta === null ? '—' : delta > 0 ? `+${delta}` : delta}
              </div>
            </div>
          );
        })}
      </div>

      <label className="evaluation-notes">
        <span>Note qualitative</span>
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Dove la versione interattiva aggiunge valore? Dove introduce attrito o complessità inutile?"
          rows={4}
        />
      </label>

      <div className="evaluation-actions">
        <button
          type="button"
          className="secondary-action"
          onClick={() => {
            setRatings({});
            setNotes('');
          }}
        >
          Azzera valutazione
        </button>
        <button type="button" className="primary-action" onClick={exportEvaluation}>
          Esporta JSON locale
        </button>
      </div>
    </section>
  );
}

export default function App() {
  const interactiveScenes = useMemo(
    () => [...payload.envelope.scenes].sort((a, b) => a.order - b.order),
    [],
  );
  const passiveScenes = useMemo(
    () => [...payload.passiveBaseline].sort((a, b) => a.order - b.order),
    [],
  );
  const [version, setVersion] = useState<Version>('A');
  const [activeIndex, setActiveIndex] = useState(0);
  const [ratings, setRatings] = useState<RatingState>({});

  const activeInteractiveScene = interactiveScenes[activeIndex];
  const activePassiveScene = passiveScenes[activeIndex];

  const move = (delta: number) => {
    setActiveIndex((current) => Math.max(0, Math.min(interactiveScenes.length - 1, current + delta)));
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.matches('input, textarea, select')) return;
      if (event.key === 'ArrowLeft') move(-1);
      if (event.key === 'ArrowRight') move(1);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [interactiveScenes.length]);

  if (!activeInteractiveScene || !activePassiveScene) return null;

  const narration = (activeInteractiveScene.actions ?? [])
    .filter((action) => action.type === 'speech' && action.text)
    .map((action) => action.text)
    .join(' ');
  const factIds =
    version === 'A'
      ? activePassiveScene.sourceFactIds
      : payload.sceneFactIds[activeInteractiveScene.id] ?? [];
  const sourceIds = payload.envelope.sceneSources[activeInteractiveScene.id] ?? [];
  const activeTitle = version === 'A' ? activePassiveScene.title : activeInteractiveScene.title;
  const activeKind = version === 'A' ? 'Passivo' : kindLabel(activeInteractiveScene);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="eyebrow">Formalife · MAIC Lab</div>
          <h1>Prototype 001</h1>
          <p>A/B learning-format evaluation</p>
        </div>

        <div className="status-strip">
          <span>INTERNAL ONLY</span>
          <span>{payload.envelope.reviewState.toUpperCase()}</span>
        </div>

        <div className="version-switch" role="group" aria-label="Versione esperimento">
          <button
            type="button"
            className={version === 'A' ? 'version-button active' : 'version-button'}
            onClick={() => setVersion('A')}
          >
            <strong>A</strong>
            <span>Passivo</span>
          </button>
          <button
            type="button"
            className={version === 'B' ? 'version-button active' : 'version-button'}
            onClick={() => setVersion('B')}
          >
            <strong>B</strong>
            <span>Decision training</span>
          </button>
        </div>

        <nav className="scene-nav" aria-label="Scene del prototipo">
          {interactiveScenes.map((scene, index) => (
            <button
              type="button"
              key={scene.id}
              className={index === activeIndex ? 'scene-nav-item active' : 'scene-nav-item'}
              onClick={() => setActiveIndex(index)}
            >
              <span className="scene-number">{String(index + 1).padStart(2, '0')}</span>
              <span className="scene-nav-copy">
                <strong>{scene.title}</strong>
                <small>{version === 'A' ? 'Passivo' : kindLabel(scene)}</small>
              </span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="workspace">
        <header className="workspace-header">
          <div>
            <div className="eyebrow">
              Versione {version} · Scena {activeIndex + 1} / {interactiveScenes.length} · {activeKind}
            </div>
            <h2>{activeTitle}</h2>
          </div>
          <div className="nav-buttons">
            <button type="button" onClick={() => move(-1)} disabled={activeIndex === 0}>
              ← Precedente
            </button>
            <button
              type="button"
              onClick={() => move(1)}
              disabled={activeIndex === interactiveScenes.length - 1}
            >
              Successiva →
            </button>
          </div>
        </header>

        <section className="comparison-banner">
          <div>
            <strong>{version === 'A' ? 'A · Baseline passiva' : 'B · OpenMAIC decision training'}</strong>
            <span>
              {version === 'A'
                ? 'Stessi blocchi e stessi fact-ID, senza quiz, branching o decision controls.'
                : 'Stesso perimetro scientifico, trasformato in scelte, feedback e rivalutazione.'}
            </span>
          </div>
          <button type="button" onClick={() => setVersion(version === 'A' ? 'B' : 'A')}>
            Vedi versione {version === 'A' ? 'B' : 'A'}
          </button>
        </section>

        <section className="preview-panel">
          {version === 'A' ? (
            <PassiveScene scene={activePassiveScene} />
          ) : (
            <SceneViewport scene={activeInteractiveScene} />
          )}
        </section>

        <section className="inspector-grid">
          <article className="inspector-card">
            <div className="eyebrow">{version === 'A' ? 'Format' : 'Narration'}</div>
            <p>
              {version === 'A'
                ? 'Baseline intenzionalmente passiva: il reviewer legge gli stessi key point senza dover prendere decisioni o ricevere feedback interattivo.'
                : narration || 'Nessuna narration disponibile per questa scena.'}
            </p>
          </article>

          <article className="inspector-card">
            <div className="eyebrow">Source boundary</div>
            <div className="tag-list">
              {factIds.map((factId) => (
                <span className="tag" key={factId}>
                  {factId}
                </span>
              ))}
            </div>
            <p className="source-note">Fonte: {sourceIds.join(', ') || 'non assegnata'}</p>
          </article>
        </section>

        <EvaluationPanel ratings={ratings} setRatings={setRatings} />

        <footer className="lab-footer">
          <strong>Limite del test:</strong> {payload.note}
        </footer>
      </main>
    </div>
  );
}
