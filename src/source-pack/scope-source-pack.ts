import type { FormalifeSourcePack } from './types.js';
import { asValidatedSourcePack } from './validate-source-pack.js';

/**
 * Return a validated Source Pack containing only the facts explicitly assigned
 * to one generation task and the sources required by those facts.
 *
 * This is the key provenance boundary for scene generation: a scene cannot
 * silently pull a different approved clinical fact merely because it exists in
 * the larger prototype pack.
 */
export function scopeSourcePackToFacts(
  sourcePackValue: unknown,
  factIds: readonly string[],
): FormalifeSourcePack {
  const pack = asValidatedSourcePack(sourcePackValue);

  if (factIds.length === 0) {
    throw new Error('scene generation requires at least one Source Pack fact');
  }

  const factsById = new Map(pack.facts.map((fact) => [fact.id, fact]));
  const seen = new Set<string>();
  const selectedFacts = factIds.map((factId) => {
    if (seen.has(factId)) {
      throw new Error(`duplicate scoped fact id: ${factId}`);
    }
    seen.add(factId);

    const fact = factsById.get(factId);
    if (!fact) {
      throw new Error(`unknown scoped fact id: ${factId}`);
    }
    return fact;
  });

  const requiredSourceIds = new Set(selectedFacts.flatMap((fact) => fact.sourceIds));
  const selectedSources = pack.sources.filter((source) => requiredSourceIds.has(source.id));

  return asValidatedSourcePack({
    ...pack,
    id: `${pack.id}::scoped`,
    sources: selectedSources,
    facts: selectedFacts,
  });
}
