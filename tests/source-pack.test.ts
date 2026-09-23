import { describe, expect, it } from 'vitest';

import { makeSourceBoundAICall } from '../src/source-pack/source-bound-ai.js';
import { validateSourcePack } from '../src/source-pack/validate-source-pack.js';

function validPack(): Record<string, any> {
  return {
    id: 'pack-1',
    title: 'Synthetic approved fixture',
    releaseScope: 'internal-only',
    contentClass: 'general',
    sources: [
      {
        id: 'source-1',
        label: 'Synthetic public fixture',
        reviewStatus: 'human-reviewed-for-lab',
      },
    ],
    facts: [
      {
        id: 'fact-1',
        text: 'A learner should reassess when a scenario variable changes.',
        sourceIds: ['source-1'],
        locator: 'synthetic fixture',
      },
    ],
  };
}

describe('Source Pack', () => {
  it('passes a bounded, human-reviewed general pack', () => {
    expect(validateSourcePack(validPack())).toEqual({ pass: true, issues: [] });
  });

  it('keeps HOLD sources out of generation', () => {
    const pack = validPack();
    pack.sources[0].reviewStatus = 'hold-professional-review';

    const result = validateSourcePack(pack);

    expect(result.pass).toBe(false);
    if (!result.pass) {
      expect(result.issues.some((issue) => issue.path === '/sources/0/reviewStatus')).toBe(true);
    }
  });

  it('requires professional validation for sensitive clinical packs', () => {
    const pack = validPack();
    pack.contentClass = 'sensitive-clinical';

    const result = validateSourcePack(pack);

    expect(result.pass).toBe(false);
    if (!result.pass) {
      expect(
        result.issues.some((issue) =>
          issue.message.includes('require professionally-validated sources'),
        ),
      ).toBe(true);
    }

    pack.sources[0].reviewStatus = 'professionally-validated';
    expect(validateSourcePack(pack)).toEqual({ pass: true, issues: [] });
  });

  it('requires a fact-level locator for traceability', () => {
    const pack = validPack();
    delete pack.facts[0].locator;

    const result = validateSourcePack(pack);

    expect(result.pass).toBe(false);
    if (!result.pass) {
      expect(result.issues.some((issue) => issue.path === '/facts/0/locator')).toBe(true);
    }
  });

  it('injects approved facts and locators into OpenMAIC AI calls', async () => {
    let capturedSystem = '';
    let capturedUser = '';

    const baseAiCall = async (systemPrompt: string, userPrompt: string) => {
      capturedSystem = systemPrompt;
      capturedUser = userPrompt;
      return '{"ok":true}';
    };

    const boundedAiCall = makeSourceBoundAICall(baseAiCall, validPack());
    const output = await boundedAiCall('OPENMAIC SYSTEM', 'OPENMAIC USER');

    expect(output).toBe('{"ok":true}');
    expect(capturedSystem).toContain('FORMALIFE SOURCE BOUNDARY — MANDATORY');
    expect(capturedSystem).toContain('Content class: general');
    expect(capturedSystem).toContain('[fact-1] A learner should reassess');
    expect(capturedSystem).toContain('locator: synthetic fixture');
    expect(capturedSystem).toContain('HOLD / NEED PROFESSIONAL REVIEW');
    expect(capturedSystem).toContain('OPENMAIC SYSTEM');
    expect(capturedUser).toBe('OPENMAIC USER');
  });

  it('refuses to construct an AI adapter from an unreviewed pack', () => {
    const pack = validPack();
    pack.sources[0].reviewStatus = 'hold-professional-review';

    expect(() =>
      makeSourceBoundAICall(async () => 'unused', pack),
    ).toThrow(/generation is blocked/);
  });
});
