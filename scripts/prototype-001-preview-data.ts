import { mkdir, writeFile } from 'node:fs/promises';

import { validateFormalifeEnvelope } from '../src/gate/validate-envelope.js';
import { hardenInteractiveHtml } from '../src/preview/harden-interactive-html.js';
import { generatePrototype001 } from '../src/prototypes/001/generate.js';
import { createPrototype001GroundedRecordedAiHarness } from '../src/prototypes/001/recorded-ai-grounded.js';

const harness = createPrototype001GroundedRecordedAiHarness();
const result = await generatePrototype001(harness.aiCall);
const gate = validateFormalifeEnvelope(result.envelope);

if (!gate.pass) {
  throw new Error(`Prototype 001 preview data failed Formalife gate: ${gate.issues.join('; ')}`);
}

const envelope = structuredClone(result.envelope);
for (const scene of envelope.scenes) {
  if (scene.content.type === 'interactive') {
    scene.content.html = hardenInteractiveHtml(scene.content.html);
  }
}

const output = {
  providerMode: 'recorded-ai-response-grounded',
  note:
    'Internal-only deterministic preview data generated through @openmaic/generation and the Formalife gate. Not customer-facing and not a substitute for supervised physical practice.',
  sceneFactIds: result.sceneFactIds,
  envelope,
};

await mkdir('preview/src', { recursive: true });
await writeFile(
  'preview/src/prototype-001.generated.json',
  `${JSON.stringify(output, null, 2)}\n`,
  'utf8',
);

console.log(
  `Prototype 001 preview data generated: ${result.envelope.scenes.length} scenes, gate PASS, interactive HTML hardened.`,
);
