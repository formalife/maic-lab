import { mkdir, writeFile } from 'node:fs/promises';

import { generatePrototype001 } from '../src/prototypes/001/generate.js';
import { createPrototype001GroundedRecordedAiHarness } from '../src/prototypes/001/recorded-ai-grounded.js';

const harness = createPrototype001GroundedRecordedAiHarness();
const result = await generatePrototype001(harness.aiCall);

const output = {
  generatedAt: new Date().toISOString(),
  providerMode: 'recorded-ai-response',
  note:
    'Internal deterministic integration artifact. Content and playback-action responses are bounded by the professionally validated Formalife Source Pack; this is not a customer-facing or professionally re-approved lesson.',
  calls: harness.calls.map((call) => ({
    sceneId: call.sceneId,
    callIndex: call.callIndex,
    sourceBoundaryPresent: call.systemPrompt.includes('FORMALIFE SOURCE BOUNDARY — MANDATORY'),
  })),
  sceneFactIds: result.sceneFactIds,
  envelope: result.envelope,
};

await mkdir('artifacts', { recursive: true });
await writeFile(
  'artifacts/prototype-001-recorded.json',
  `${JSON.stringify(output, null, 2)}\n`,
  'utf8',
);

console.log(
  `Prototype 001 generated: ${result.envelope.scenes.length} scenes, ${harness.calls.length} model-seam calls, gate PASS.`,
);
