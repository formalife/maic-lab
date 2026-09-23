import { describe, expect, it } from 'vitest';

import { validateFormalifeEnvelope } from '../src/gate/validate-envelope.js';

function validEnvelope(): Record<string, any> {
  return {
    labSchemaVersion: 1,
    releaseScope: 'internal-only',
    reviewState: 'draft',
    stage: {
      id: 'stage-1',
      name: 'Internal prototype',
      createdAt: 1,
      updatedAt: 1,
    },
    scenes: [
      {
        id: 'scene-1',
        stageId: 'stage-1',
        title: 'Decision checkpoint',
        order: 0,
        type: 'quiz',
        content: {
          type: 'quiz',
          questions: [],
        },
      },
    ],
    sources: [
      {
        id: 'source-1',
        label: 'Public synthetic fixture',
      },
    ],
    sceneSources: {
      'scene-1': ['source-1'],
    },
  };
}

describe('validateFormalifeEnvelope', () => {
  it('passes a structurally valid, fully traced internal document', () => {
    expect(validateFormalifeEnvelope(validEnvelope())).toEqual({
      pass: true,
      issues: [],
    });
  });

  it('rejects a scene without provenance', () => {
    const envelope = validEnvelope();
    envelope.sceneSources = {};

    const result = validateFormalifeEnvelope(envelope);

    expect(result.pass).toBe(false);
    if (!result.pass) {
      expect(result.issues.some((issue) => issue.path === '/sceneSources/scene-1')).toBe(true);
    }
  });

  it('rejects unknown source ids and mismatched stage ids', () => {
    const envelope = validEnvelope();
    envelope.scenes[0].stageId = 'other-stage';
    envelope.sceneSources['scene-1'] = ['missing-source'];

    const result = validateFormalifeEnvelope(envelope);

    expect(result.pass).toBe(false);
    if (!result.pass) {
      expect(result.issues.some((issue) => issue.path === '/scenes/0/stageId')).toBe(true);
      expect(result.issues.some((issue) => issue.message.includes('unknown source id'))).toBe(true);
    }
  });

  it('rejects anything that attempts to escape internal-only scope', () => {
    const envelope = validEnvelope();
    envelope.releaseScope = 'public';

    const result = validateFormalifeEnvelope(envelope);

    expect(result.pass).toBe(false);
    if (!result.pass) {
      expect(result.issues.some((issue) => issue.path === '/releaseScope')).toBe(true);
    }
  });
});
