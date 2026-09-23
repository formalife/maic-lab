import { describe, expect, it } from 'vitest';

import { validateFormalifeEnvelope } from '../src/gate/validate-envelope.js';
import { generatePrototype001 } from '../src/prototypes/001/generate.js';
import { PROTOTYPE_001_OUTLINE } from '../src/prototypes/001/outline.js';
import { createPrototype001RecordedAiHarness } from '../src/prototypes/001/recorded-ai.js';

describe('Prototype 001 OpenMAIC generation pipeline', () => {
  it('generates all seven scenes and passes the Formalife gate', async () => {
    const harness = createPrototype001RecordedAiHarness();
    const result = await generatePrototype001(harness.aiCall);

    expect(result.envelope.scenes).toHaveLength(7);
    expect(validateFormalifeEnvelope(result.envelope)).toEqual({ pass: true, issues: [] });
    expect(result.envelope.reviewState).toBe('draft');
    expect(result.envelope.releaseScope).toBe('internal-only');
  });

  it('runs both OpenMAIC content and action generation for every scene', async () => {
    const harness = createPrototype001RecordedAiHarness();
    await generatePrototype001(harness.aiCall);

    for (const outline of PROTOTYPE_001_OUTLINE) {
      const calls = harness.calls.filter((call) => call.sceneId === outline.id);
      expect(calls, outline.id).toHaveLength(2);
      expect(calls[0]?.callIndex).toBe(0);
      expect(calls[1]?.callIndex).toBe(1);
    }
  });

  it('limits each scene prompt to its assigned Source Pack facts', async () => {
    const harness = createPrototype001RecordedAiHarness();
    await generatePrototype001(harness.aiCall);

    const scenarioOneCalls = harness.calls.filter((call) => call.sceneId === 'p001-s02');
    expect(scenarioOneCalls).toHaveLength(2);

    for (const call of scenarioOneCalls) {
      expect(call.systemPrompt).toContain('[partial-airflow]');
      expect(call.systemPrompt).toContain('[cough-means-airflow]');
      expect(call.systemPrompt).toContain('[effective-cough-response]');
      expect(call.systemPrompt).not.toContain('[do-not-wait-for-cyanosis]');
      expect(call.systemPrompt).not.toContain('[older-child-verbal-check]');
    }
  });

  it('preserves fact-level provenance alongside generated scene ids', async () => {
    const harness = createPrototype001RecordedAiHarness();
    const result = await generatePrototype001(harness.aiCall);

    expect(result.sceneFactIds['scene-p001-s04']).toEqual([
      'transition-direction',
      'do-not-wait-for-cyanosis',
      'total-obstruction-silence',
      'total-requires-immediate-action',
    ]);
  });

  it('produces real interactive HTML and quiz content through @openmaic/generation', async () => {
    const harness = createPrototype001RecordedAiHarness();
    const result = await generatePrototype001(harness.aiCall);

    const scenes = result.envelope.scenes as Array<Record<string, any>>;
    const transition = scenes.find((scene) => scene.id === 'scene-p001-s04');
    const quiz = scenes.find((scene) => scene.id === 'scene-p001-s05');

    expect(transition?.content?.type).toBe('interactive');
    expect(transition?.content?.html).toContain('La situazione cambia');
    expect(transition?.content?.html.toLowerCase()).toContain('rivaluta');

    expect(quiz?.content?.type).toBe('quiz');
    expect(quiz?.content?.questions).toHaveLength(3);
    expect(quiz?.content?.questions[0]?.answer).toEqual(['A']);
  });
});
