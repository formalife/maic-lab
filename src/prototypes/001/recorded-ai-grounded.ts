import type { AICallFn } from '@openmaic/generation';

import { PROTOTYPE_001_OUTLINE } from './outline.js';
import {
  createPrototype001RecordedAiHarness,
  type RecordedAiHarness,
} from './recorded-ai.js';

/**
 * Recorded provider used by the end-to-end integration run.
 *
 * `recorded-ai.ts` owns the deterministic content fixtures. OpenMAIC asks the
 * provider a second time for playback actions. Returning an empty array there
 * triggers upstream language-specific defaults, so this adapter supplies a
 * minimal Italian speech action grounded exclusively in the same scene
 * outline/key points that were already derived from the approved Source Pack.
 *
 * This is explicit test-provider behaviour, not a production output repair.
 */
export function createPrototype001GroundedRecordedAiHarness(): RecordedAiHarness {
  const base = createPrototype001RecordedAiHarness();

  const aiCall: AICallFn = async (systemPrompt, userPrompt, images) => {
    const response = await base.aiCall(systemPrompt, userPrompt, images);
    const call = base.calls.at(-1);

    if (!call || call.callIndex !== 1 || response.trim() !== '[]') {
      return response;
    }

    const outline = PROTOTYPE_001_OUTLINE.find((scene) => scene.id === call.sceneId);
    if (!outline) {
      throw new Error(`missing Prototype 001 outline for recorded action call ${call.sceneId}`);
    }

    const groundedActionResponse = JSON.stringify([
      {
        type: 'speech',
        title: 'Guida Formalife',
        text: (outline.keyPoints ?? []).join(' '),
      },
    ]);

    call.response = groundedActionResponse;
    return groundedActionResponse;
  };

  return { aiCall, calls: base.calls };
}
