import {
  buildCompleteScene,
  generateSceneActions,
  generateSceneContent,
  type AICallFn,
} from '@openmaic/generation';

import {
  FORMALIFE_LAB_SCHEMA_VERSION,
  type FormalifeLabEnvelope,
} from '../../gate/types.js';
import { validateFormalifeEnvelope } from '../../gate/validate-envelope.js';
import { makeSourceBoundAICall } from '../../source-pack/source-bound-ai.js';
import { scopeSourcePackToFacts } from '../../source-pack/scope-source-pack.js';
import { PROTOTYPE_001_OUTLINE } from './outline.js';
import { PROTOTYPE_001_SOURCE_PACK } from './source-pack.js';

const STAGE_ID = 'formalife-prototype-001';
const LANGUAGE_DIRECTIVE =
  'Scrivi in italiano. Mantieni un tono calmo, concreto e adulto. Non introdurre fatti clinici oltre il Source Pack.';

export interface Prototype001GenerationResult {
  envelope: FormalifeLabEnvelope;
  sceneFactIds: Record<string, string[]>;
}

function sourceIdsForFactIds(factIds: readonly string[]): string[] {
  const factsById = new Map(PROTOTYPE_001_SOURCE_PACK.facts.map((fact) => [fact.id, fact]));
  const sourceIds = new Set<string>();

  for (const factId of factIds) {
    const fact = factsById.get(factId);
    if (!fact) throw new Error(`Prototype 001 references unknown fact ${factId}`);
    for (const sourceId of fact.sourceIds) sourceIds.add(sourceId);
  }

  return [...sourceIds];
}

/**
 * Run all seven Prototype 001 outlines through the real @openmaic/generation
 * content/action/build pipeline using a caller-owned AICallFn.
 *
 * Every scene gets its own fact-scoped Source Pack before the model seam is
 * called. Generated output remains a draft and must pass the deterministic
 * Formalife envelope gate before it is returned.
 */
export async function generatePrototype001(
  baseAiCall: AICallFn,
): Promise<Prototype001GenerationResult> {
  const createdAt = Date.now();
  const scenes: unknown[] = [];
  const sceneSources: Record<string, string[]> = {};
  const sceneFactIds: Record<string, string[]> = {};

  for (const outline of PROTOTYPE_001_OUTLINE) {
    const scopedPack = scopeSourcePackToFacts(
      PROTOTYPE_001_SOURCE_PACK,
      outline.sourceFactIds,
    );
    const boundedAiCall = makeSourceBoundAICall(baseAiCall, scopedPack);

    const content = await generateSceneContent(outline, boundedAiCall, {
      languageDirective: LANGUAGE_DIRECTIVE,
    });
    if (!content) {
      throw new Error(`OpenMAIC content generation failed for ${outline.id}`);
    }

    const actions = await generateSceneActions(outline, content, boundedAiCall, {
      languageDirective: LANGUAGE_DIRECTIVE,
    });

    const sceneId = `scene-${outline.id}`;
    const scene = buildCompleteScene(outline, content, actions, STAGE_ID, { sceneId });
    if (!scene) {
      throw new Error(`OpenMAIC scene assembly failed for ${outline.id}`);
    }

    scenes.push(scene);
    sceneSources[sceneId] = sourceIdsForFactIds(outline.sourceFactIds);
    sceneFactIds[sceneId] = [...outline.sourceFactIds];
  }

  const envelope: FormalifeLabEnvelope = {
    labSchemaVersion: FORMALIFE_LAB_SCHEMA_VERSION,
    releaseScope: 'internal-only',
    stage: {
      id: STAGE_ID,
      name: 'Prototype 001 — recognition and decision',
      createdAt,
      updatedAt: Date.now(),
    },
    scenes,
    sources: PROTOTYPE_001_SOURCE_PACK.sources.map((source) => ({
      id: source.id,
      label: source.label,
      scope: 'Prototype 001 bounded facts only',
    })),
    sceneSources,
    reviewState: 'draft',
  };

  const gate = validateFormalifeEnvelope(envelope);
  if (!gate.pass) {
    throw new Error(
      `Prototype 001 failed Formalife gate:\n${gate.issues
        .map((issue) => `${issue.path}: ${issue.message}`)
        .join('\n')}`,
    );
  }

  return { envelope, sceneFactIds };
}
