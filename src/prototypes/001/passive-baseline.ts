import { PROTOTYPE_001_OUTLINE } from './outline.js';
import { PROTOTYPE_001_SOURCE_PACK } from './source-pack.js';

export interface PassiveBaselineScene {
  id: string;
  order: number;
  title: string;
  keyPoints: string[];
  sourceFactIds: string[];
  sourceLocators: string[];
}

/**
 * Version A of Experiment 001.
 *
 * This deliberately removes quizzes, branching and decision controls while
 * keeping the same scene order and source boundaries used by Version B.
 * It is a conventional passive explanation baseline, not a second curriculum.
 */
export function buildPrototype001PassiveBaseline(): PassiveBaselineScene[] {
  const factsById = new Map(PROTOTYPE_001_SOURCE_PACK.facts.map((fact) => [fact.id, fact]));

  return [...PROTOTYPE_001_OUTLINE]
    .sort((a, b) => a.order - b.order)
    .map((scene) => {
      const sourceLocators = scene.sourceFactIds.map((factId) => {
        const fact = factsById.get(factId);
        if (!fact) {
          throw new Error(`Passive baseline scene ${scene.id} references unknown fact ${factId}`);
        }
        return fact.locator;
      });

      return {
        id: `${scene.id}-passive`,
        order: scene.order,
        title: scene.title,
        keyPoints: [...scene.keyPoints],
        sourceFactIds: [...scene.sourceFactIds],
        sourceLocators: [...new Set(sourceLocators)],
      };
    });
}
