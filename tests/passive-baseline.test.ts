import { describe, expect, it } from 'vitest';

import { PROTOTYPE_001_OUTLINE } from '../src/prototypes/001/outline.js';
import { buildPrototype001PassiveBaseline } from '../src/prototypes/001/passive-baseline.js';
import { PROTOTYPE_001_SOURCE_PACK } from '../src/prototypes/001/source-pack.js';

describe('Experiment 001 passive baseline', () => {
  it('keeps the same seven-block order as the interactive outline', () => {
    const baseline = buildPrototype001PassiveBaseline();

    expect(baseline).toHaveLength(PROTOTYPE_001_OUTLINE.length);
    expect(baseline.map((scene) => scene.order)).toEqual(
      [...PROTOTYPE_001_OUTLINE].sort((a, b) => a.order - b.order).map((scene) => scene.order),
    );
    expect(baseline.map((scene) => scene.title)).toEqual(
      [...PROTOTYPE_001_OUTLINE].sort((a, b) => a.order - b.order).map((scene) => scene.title),
    );
  });

  it('uses exactly the same source fact boundary for each corresponding block', () => {
    const baseline = buildPrototype001PassiveBaseline();
    const orderedOutline = [...PROTOTYPE_001_OUTLINE].sort((a, b) => a.order - b.order);

    baseline.forEach((scene, index) => {
      expect(scene.sourceFactIds).toEqual(orderedOutline[index]?.sourceFactIds);
    });
  });

  it('resolves every fact id to a professionally validated source locator', () => {
    const baseline = buildPrototype001PassiveBaseline();
    const knownFacts = new Set(PROTOTYPE_001_SOURCE_PACK.facts.map((fact) => fact.id));

    for (const scene of baseline) {
      expect(scene.sourceLocators.length).toBeGreaterThan(0);
      for (const factId of scene.sourceFactIds) {
        expect(knownFacts.has(factId)).toBe(true);
      }
    }
  });
});
