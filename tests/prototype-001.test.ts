import { describe, expect, it } from 'vitest';

import { PROTOTYPE_001_OUTLINE } from '../src/prototypes/001/outline.js';
import { PROTOTYPE_001_SOURCE_PACK } from '../src/prototypes/001/source-pack.js';
import { validateSourcePack } from '../src/source-pack/validate-source-pack.js';

describe('Prototype 001', () => {
  it('uses a professionally validated sensitive-clinical Source Pack', () => {
    expect(PROTOTYPE_001_SOURCE_PACK.contentClass).toBe('sensitive-clinical');
    expect(PROTOTYPE_001_SOURCE_PACK.sources.every((source) => source.reviewStatus === 'professionally-validated')).toBe(true);
    expect(validateSourcePack(PROTOTYPE_001_SOURCE_PACK)).toEqual({ pass: true, issues: [] });
  });

  it('matches the 5–7 scene experiment contract', () => {
    expect(PROTOTYPE_001_OUTLINE.length).toBeGreaterThanOrEqual(5);
    expect(PROTOTYPE_001_OUTLINE.length).toBeLessThanOrEqual(7);
    expect(PROTOTYPE_001_OUTLINE[0]?.type).toBe('slide');

    const interactiveCount = PROTOTYPE_001_OUTLINE.filter((scene) => scene.type === 'interactive').length;
    const quizCount = PROTOTYPE_001_OUTLINE.filter((scene) => scene.type === 'quiz').length;

    expect(interactiveCount).toBeGreaterThanOrEqual(2);
    expect(quizCount).toBeGreaterThanOrEqual(1);
  });

  it('keeps every scene traceable to known Source Pack facts', () => {
    const factIds = new Set(PROTOTYPE_001_SOURCE_PACK.facts.map((fact) => fact.id));

    for (const scene of PROTOTYPE_001_OUTLINE) {
      expect(scene.sourceFactIds.length).toBeGreaterThan(0);
      for (const factId of scene.sourceFactIds) {
        expect(factIds.has(factId), `${scene.id} references unknown fact ${factId}`).toBe(true);
      }
    }
  });

  it('makes reassessment structural rather than decorative', () => {
    const transitionScene = PROTOTYPE_001_OUTLINE.find((scene) => scene.id === 'p001-s04');

    expect(transitionScene?.type).toBe('interactive');
    expect(transitionScene?.sourceFactIds).toContain('transition-direction');
    expect(transitionScene?.sourceFactIds).toContain('total-obstruction-silence');
    expect(transitionScene?.widgetOutline?.playerControls).toContain('Rivaluta la decisione');
  });

  it('ends by preserving the practical-training boundary', () => {
    const lastScene = PROTOTYPE_001_OUTLINE.at(-1);

    expect(lastScene?.sourceFactIds).toEqual(['reading-is-not-practical-competence']);
    expect(lastScene?.description).toContain('manichino');
  });
});
