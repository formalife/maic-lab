import { mkdir, writeFile } from 'node:fs/promises';

import { validateFormalifeEnvelope } from '../src/gate/validate-envelope.js';
import { hardenInteractiveHtml } from '../src/preview/harden-interactive-html.js';
import { buildPrototype001PassiveBaseline } from '../src/prototypes/001/passive-baseline.js';
import { generatePrototype001 } from '../src/prototypes/001/generate.js';
import { createPrototype001GroundedRecordedAiHarness } from '../src/prototypes/001/recorded-ai-grounded.js';
import { PROTOTYPE_001_SOURCE_PACK } from '../src/prototypes/001/source-pack.js';

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

const passiveBaseline = buildPrototype001PassiveBaseline();
const factCatalog = Object.fromEntries(
  PROTOTYPE_001_SOURCE_PACK.facts.map((fact) => [
    fact.id,
    {
      text: fact.text,
      locator: fact.locator,
      sourceIds: fact.sourceIds,
    },
  ]),
);

const output = {
  providerMode: 'recorded-ai-response-grounded',
  note:
    'Internal-only deterministic preview data generated through @openmaic/generation and the Formalife gate. Not customer-facing and not a substitute for supervised physical practice.',
  experiment: {
    versionA: 'passive-source-matched',
    versionB: 'openmaic-decision-training',
    evaluationDataPolicy: 'local-only-no-network',
  },
  passiveBaseline,
  factCatalog,
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
  `Prototype 001 preview data generated: ${result.envelope.scenes.length} interactive scenes, ${passiveBaseline.length} passive blocks, ${Object.keys(factCatalog).length} approved facts, gate PASS, interactive HTML hardened.`,
);
