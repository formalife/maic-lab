import type { AICallFn } from '@openmaic/generation';

import type { FormalifeSourcePack } from './types.js';
import { asValidatedSourcePack } from './validate-source-pack.js';

function buildSourceBoundary(pack: FormalifeSourcePack): string {
  const facts = pack.facts
    .map(
      (fact) =>
        `- [${fact.id}] ${fact.text} (sources: ${fact.sourceIds.join(', ')}; locator: ${fact.locator})`,
    )
    .join('\n');

  return [
    'FORMALIFE SOURCE BOUNDARY — MANDATORY',
    `Source Pack: ${pack.id} — ${pack.title}`,
    `Content class: ${pack.contentClass}`,
    '',
    'For sensitive/professional factual content, use ONLY the approved facts below.',
    'Do not add a missing clinical rule, threshold, sequence, exception or recommendation from model memory.',
    'If the requested output requires information not present below, explicitly use the text: HOLD / NEED PROFESSIONAL REVIEW.',
    'Do not silently replace, expand or reconcile these facts with outside knowledge.',
    'Preserve the distinctions and limits stated in each fact; source locators are for traceability, not an invitation to invent adjacent content.',
    '',
    'APPROVED FACTS:',
    facts,
    '',
    'END FORMALIFE SOURCE BOUNDARY',
  ].join('\n');
}

/**
 * Wrap OpenMAIC's provider-neutral AICallFn with a Formalife source boundary.
 * The wrapper controls inputs; it does NOT prove semantic correctness of output.
 */
export function makeSourceBoundAICall(
  baseAiCall: AICallFn,
  sourcePackValue: unknown,
): AICallFn {
  const pack = asValidatedSourcePack(sourcePackValue);
  const boundary = buildSourceBoundary(pack);

  return async (systemPrompt, userPrompt, images) => {
    return baseAiCall(`${boundary}\n\n${systemPrompt}`, userPrompt, images);
  };
}
