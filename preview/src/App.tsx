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

type PreviewPayload = {
  providerMode: string;
  note: string;
  sceneFactIds: Record<string, string[]>;
  envelope: {
    releaseScope: string;
    reviewState: string;
    scenes: PreviewScene[];
    sources: Array<{ id: string; label: string; scope: string }>;
    sceneSources: Record<string, string[]>;
  };
};

const payload = previewData as PreviewPayload;

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

export default function App() {
  const scenes = useMemo(
    () => [...payload.envelope.scenes].sort((a, b) => a.order - b.order),
    [],
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const activeScene = scenes[activeIndex];

  const move = (delta: number) => {
    setActiveIndex((current) => Math.max(0, Math.min(scenes.length - 1, current + delta)));
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') move(-1);
      if (event.key === 'ArrowRight') move(1);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [scenes.length]);

  if (!activeScene) return null;

  const narration = (activeScene.actions ?? [])
    .filter((action) => action.type === 'speech' && action.text)
    .map((action) => action.text)
    .join(' ');
  const factIds = payload.sceneFactIds[activeScene.id] ?? [];
  const sourceIds = payload.envelope.sceneSources[activeScene.id] ?? [];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="eyebrow">Formalife · MAIC Lab</div>
          <h1>Prototype 001</h1>
          <p>Decision training · preview interno</p>
        </div>

        <div className="status-strip">
          <span>INTERNAL ONLY</span>
          <span>{payload.envelope.reviewState.toUpperCase()}</span>
        </div>

        <nav className="scene-nav" aria-label="Scene del prototipo">
          {scenes.map((scene, index) => (
            <button
              type="button"
              key={scene.id}
              className={index === activeIndex ? 'scene-nav-item active' : 'scene-nav-item'}
              onClick={() => setActiveIndex(index)}
            >
              <span className="scene-number">{String(index + 1).padStart(2, '0')}</span>
              <span className="scene-nav-copy">
                <strong>{scene.title}</strong>
                <small>{kindLabel(scene)}</small>
              </span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="workspace">
        <header className="workspace-header">
          <div>
            <div className="eyebrow">
              Scena {activeIndex + 1} / {scenes.length} · {kindLabel(activeScene)}
            </div>
            <h2>{activeScene.title}</h2>
          </div>
          <div className="nav-buttons">
            <button type="button" onClick={() => move(-1)} disabled={activeIndex === 0}>
              ← Precedente
            </button>
            <button
              type="button"
              onClick={() => move(1)}
              disabled={activeIndex === scenes.length - 1}
            >
              Successiva →
            </button>
          </div>
        </header>

        <section className="preview-panel">
          <SceneViewport scene={activeScene} />
        </section>

        <section className="inspector-grid">
          <article className="inspector-card">
            <div className="eyebrow">Narration</div>
            <p>{narration || 'Nessuna narration disponibile per questa scena.'}</p>
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

        <footer className="lab-footer">
          <strong>Limite del test:</strong> {payload.note}
        </footer>
      </main>
    </div>
  );
}
