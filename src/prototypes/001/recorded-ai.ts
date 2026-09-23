import type { AICallFn } from '@openmaic/generation';

import { PROTOTYPE_001_OUTLINE } from './outline.js';

export interface RecordedAiCall {
  sceneId: string;
  callIndex: number;
  systemPrompt: string;
  userPrompt: string;
  response: string;
}

export interface RecordedAiHarness {
  aiCall: AICallFn;
  calls: RecordedAiCall[];
}

function slide(title: string, lead: string, bullets: string[]): string {
  return JSON.stringify({
    elements: [
      {
        id: 'title',
        type: 'text',
        left: 70,
        top: 55,
        width: 860,
        height: 95,
        content: `<p><strong>${title}</strong></p>`,
        defaultFontName: 'Arial',
        defaultColor: '#1F2937',
        rotate: 0,
      },
      {
        id: 'lead',
        type: 'text',
        left: 90,
        top: 180,
        width: 820,
        height: 115,
        content: `<p>${lead}</p>`,
        defaultFontName: 'Arial',
        defaultColor: '#374151',
        rotate: 0,
      },
      {
        id: 'bullets',
        type: 'text',
        left: 105,
        top: 330,
        width: 790,
        height: 390,
        content: `<ul>${bullets.map((bullet) => `<li>${bullet}</li>`).join('')}</ul>`,
        defaultFontName: 'Arial',
        defaultColor: '#1F2937',
        rotate: 0,
      },
    ],
    background: null,
    remark: 'Prototype 001 — internal-only recorded AI response.',
  });
}

function scenarioHtml(options: {
  heading: string;
  intro: string;
  cue: string;
  choices: Array<{ label: string; feedback: string; correct: boolean }>;
  change?: { label: string; cue: string };
}): string {
  const choices = JSON.stringify(options.choices);
  const changedCue = JSON.stringify(options.change?.cue ?? '');

  return `<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${options.heading}</title>
<style>
  :root { font-family: Arial, sans-serif; color: #1f2937; background: #fbf8f4; }
  body { margin: 0; padding: 28px; }
  main { max-width: 760px; margin: 0 auto; }
  .card { background: #fff; border: 1px solid #e5e7eb; border-radius: 18px; padding: 24px; box-shadow: 0 8px 24px rgba(0,0,0,.05); }
  .cue { margin: 20px 0; padding: 18px; border-radius: 14px; background: #f3f4f6; font-size: 1.08rem; }
  .choices { display: grid; gap: 12px; }
  button { text-align: left; border: 1px solid #d1d5db; background: #fff; border-radius: 12px; padding: 14px 16px; cursor: pointer; font-size: 1rem; }
  button:hover { border-color: #6b7280; }
  #feedback { margin-top: 18px; min-height: 3em; font-weight: 600; }
  #change { margin-top: 20px; }
</style>
</head>
<body>
<main>
  <section class="card">
    <h1>${options.heading}</h1>
    <p>${options.intro}</p>
    <div class="cue" id="cue">${options.cue}</div>
    <div class="choices" id="choices"></div>
    <div id="feedback" aria-live="polite"></div>
    ${options.change ? `<button id="change">${options.change.label}</button>` : ''}
  </section>
</main>
<script>
  const choices = ${choices};
  const container = document.getElementById('choices');
  const feedback = document.getElementById('feedback');
  function renderChoices() {
    container.innerHTML = '';
    for (const choice of choices) {
      const button = document.createElement('button');
      button.textContent = choice.label;
      button.onclick = () => {
        feedback.textContent = choice.feedback;
        feedback.dataset.correct = String(choice.correct);
      };
      container.appendChild(button);
    }
  }
  renderChoices();
  const change = document.getElementById('change');
  if (change) {
    change.onclick = () => {
      document.getElementById('cue').textContent = ${changedCue};
      feedback.textContent = 'Gli indizi sono cambiati: rivaluta la decisione, non limitarti a ripetere quella precedente.';
      change.disabled = true;
    };
  }
</script>
</body>
</html>`;
}

function contentResponse(sceneId: string): string {
  switch (sceneId) {
    case 'p001-s01':
      return slide(
        'Prima della manovra: che cosa stai osservando?',
        'La prima decisione dipende da un fatto semplice: l’aria sta ancora passando oppure no?',
        [
          'Una tosse presente richiede passaggio d’aria.',
          'Suono e silenzio non sono dettagli: cambiano la classificazione della situazione.',
          'Prima di pensare alla tecnica, riconosci ciò che sta accadendo.',
        ],
      );
    case 'p001-s02':
      return scenarioHtml({
        heading: 'Scenario 1 — C’è ancora aria?',
        intro: 'Un bambino è cosciente. Tossisce in modo udibile e riesce ancora a produrre un suono.',
        cue: 'Segnale osservabile: la tosse è presente e si sente passaggio d’aria.',
        choices: [
          {
            label: 'Osservo, incoraggio a tossire e resto pronto a rivalutare',
            feedback: 'Corretto: la tosse presente indica che l’aria passa ancora. In questa fase non si interferisce con manovre manuali.',
            correct: true,
          },
          {
            label: 'Inizio subito manovre manuali di disostruzione',
            feedback: 'No: con tosse efficace il Source Pack indica di non interferire con manovre manuali.',
            correct: false,
          },
        ],
      });
    case 'p001-s03':
      return slide(
        'Perché il suono cambia la decisione',
        'Tossire richiede aria. Per questo il suono è un indizio operativo, non soltanto un sintomo da notare.',
        [
          'Tosse presente → una quota d’aria sta ancora passando.',
          'Con tosse efficace: osserva, incoraggia a tossire, non interferire con manovre manuali.',
          'Se la situazione non convince o hai un dubbio, puoi chiamare il 112 senza aspettare che diventi totale.',
        ],
      );
    case 'p001-s04':
      return scenarioHtml({
        heading: 'Scenario 2 — La variabile cambia',
        intro: 'All’inizio il bambino tossisce. Poi il quadro evolve.',
        cue: 'Fase iniziale: tosse presente e udibile.',
        change: {
          label: 'La situazione cambia',
          cue: 'Ora la tosse non produce più suono e non senti più voce o pianto.',
        },
        choices: [
          {
            label: 'Mantengo sempre la stessa risposta perché all’inizio tossiva',
            feedback: 'No: il Source Pack richiede rivalutazione quando cambiano gli indizi.',
            correct: false,
          },
          {
            label: 'Rivaluto subito: il passaggio da suono a silenzio cambia la decisione',
            feedback: 'Corretto: la scomparsa di tosse e voce è un cambio decisionale. Non si aspetta la cianosi per rivalutare.',
            correct: true,
          },
        ],
      });
    case 'p001-s05':
      return JSON.stringify([
        {
          id: 'q1',
          type: 'single',
          question: 'Un bambino tossisce in modo udibile. Quale informazione puoi ricavare con certezza dal Source Pack?',
          options: [
            { value: 'A', label: 'Una quota d’aria sta ancora passando' },
            { value: 'B', label: 'L’ostruzione è necessariamente totale' },
            { value: 'C', label: 'Bisogna attendere un cambio di colore' },
          ],
          answer: ['A'],
        },
        {
          id: 'q2',
          type: 'single',
          question: 'Durante una tosse efficace, quale risposta è coerente con il Source Pack?',
          options: [
            { value: 'A', label: 'Eseguire comunque manovre manuali' },
            { value: 'B', label: 'Osservare, incoraggiare la tosse e restare pronti a rivalutare' },
            { value: 'C', label: 'Sdraiare il bambino per controllarlo meglio' },
          ],
          answer: ['B'],
        },
        {
          id: 'q3',
          type: 'single',
          question: 'La tosse e la voce scompaiono. Qual è il passaggio cognitivo corretto?',
          options: [
            { value: 'A', label: 'Rivalutare immediatamente la situazione' },
            { value: 'B', label: 'Continuare senza cambiare decisione' },
            { value: 'C', label: 'Aspettare la cianosi prima di rivalutare' },
          ],
          answer: ['A'],
        },
      ]);
    case 'p001-s06':
      return scenarioHtml({
        heading: 'Scenario 3 — Quando il quadro non è subito chiaro',
        intro: 'Sei già accanto a un bambino sopra i due-tre anni e il quadro iniziale non è immediatamente chiaro.',
        cue: 'Devi ottenere un’informazione rapida senza sostituire l’osservazione.',
        choices: [
          {
            label: 'Gli chiedo se sta soffocando e interpreto l’eventuale risposta vocale insieme agli altri segnali',
            feedback: 'Corretto: una risposta vocale dimostra passaggio d’aria; la verifica resta una conferma e non sostituisce l’osservazione.',
            correct: true,
          },
          {
            label: 'Ignoro i segnali osservabili e considero decisiva solo la domanda',
            feedback: 'No: il Source Pack specifica che la domanda non sostituisce l’osservazione.',
            correct: false,
          },
        ],
      });
    case 'p001-s07':
      return slide(
        'Capire la decisione non significa aver allenato le mani',
        'Questo prototipo può allenare osservazione, classificazione e rivalutazione. Non crea da solo competenza pratica nelle manovre.',
        [
          'Il digitale può aiutare a capire cosa osservare e quando cambiare decisione.',
          'Le manovre fisiche richiedono esercitazione pratica su manichino.',
          'Il prototipo non viene presentato come equivalente alla pratica supervisionata.',
        ],
      );
    default:
      throw new Error(`no recorded Prototype 001 content for scene ${sceneId}`);
  }
}

function sceneIdFromPrompt(userPrompt: string): string {
  const outline = PROTOTYPE_001_OUTLINE.find((scene) => userPrompt.includes(scene.title));
  if (!outline) {
    throw new Error('recorded Prototype 001 provider could not identify scene from prompt');
  }
  return outline.id;
}

/**
 * Recorded model harness for a deterministic end-to-end OpenMAIC integration run.
 * The first call per scene is the model content response; the second is the
 * OpenMAIC action response. Content was authored from the approved Source Pack.
 */
export function createPrototype001RecordedAiHarness(): RecordedAiHarness {
  const calls: RecordedAiCall[] = [];
  const counts = new Map<string, number>();

  const aiCall: AICallFn = async (systemPrompt, userPrompt) => {
    const sceneId = sceneIdFromPrompt(userPrompt);
    const callIndex = counts.get(sceneId) ?? 0;
    counts.set(sceneId, callIndex + 1);

    const response = callIndex === 0 ? contentResponse(sceneId) : '[]';
    calls.push({ sceneId, callIndex, systemPrompt, userPrompt, response });
    return response;
  };

  return { aiCall, calls };
}
