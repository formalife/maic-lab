import { validateScene, validateStage } from '@openmaic/dsl';

import {
  FORMALIFE_LAB_SCHEMA_VERSION,
  type FormalifeGateIssue,
  type FormalifeGateResult,
  type FormalifeLabEnvelope,
} from './types.js';

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function sceneId(scene: unknown): string | null {
  const record = asRecord(scene);
  return record && typeof record.id === 'string' && record.id.length > 0
    ? record.id
    : null;
}

function sceneStageId(scene: unknown): string | null {
  const record = asRecord(scene);
  return record && typeof record.stageId === 'string' && record.stageId.length > 0
    ? record.stageId
    : null;
}

function stageId(stage: unknown): string | null {
  const record = asRecord(stage);
  return record && typeof record.id === 'string' && record.id.length > 0
    ? record.id
    : null;
}

export function validateFormalifeEnvelope(
  envelope: FormalifeLabEnvelope,
): FormalifeGateResult {
  const issues: FormalifeGateIssue[] = [];

  if (envelope.labSchemaVersion !== FORMALIFE_LAB_SCHEMA_VERSION) {
    issues.push({
      path: '/labSchemaVersion',
      message: `expected Formalife lab schema version ${FORMALIFE_LAB_SCHEMA_VERSION}`,
    });
  }

  if (envelope.releaseScope !== 'internal-only') {
    issues.push({
      path: '/releaseScope',
      message: 'v0 MAIC Lab artifacts must remain internal-only',
    });
  }

  const stageValidation = validateStage(envelope.stage);
  if (!stageValidation.valid) {
    for (const issue of stageValidation.errors) {
      issues.push({
        path: `/stage${issue.path === '/' ? '' : issue.path}`,
        message: issue.message,
      });
    }
  }

  const expectedStageId = stageId(envelope.stage);

  const sourceIds = new Set<string>();
  envelope.sources.forEach((source, index) => {
    if (!source.id.trim()) {
      issues.push({
        path: `/sources/${index}/id`,
        message: 'source id must be a non-empty string',
      });
      return;
    }
    if (sourceIds.has(source.id)) {
      issues.push({
        path: `/sources/${index}/id`,
        message: `duplicate source id: ${source.id}`,
      });
    }
    sourceIds.add(source.id);

    if (!source.label.trim()) {
      issues.push({
        path: `/sources/${index}/label`,
        message: 'source label must be a non-empty string',
      });
    }
  });

  if (envelope.sources.length === 0) {
    issues.push({
      path: '/sources',
      message: 'at least one bounded source reference is required',
    });
  }

  const seenSceneIds = new Set<string>();

  envelope.scenes.forEach((scene, index) => {
    const result = validateScene(scene);
    if (!result.valid) {
      for (const issue of result.errors) {
        issues.push({
          path: `/scenes/${index}${issue.path === '/' ? '' : issue.path}`,
          message: issue.message,
        });
      }
    }

    const id = sceneId(scene);
    if (!id) return;

    if (seenSceneIds.has(id)) {
      issues.push({
        path: `/scenes/${index}/id`,
        message: `duplicate scene id: ${id}`,
      });
    }
    seenSceneIds.add(id);

    const parent = sceneStageId(scene);
    if (expectedStageId && parent && parent !== expectedStageId) {
      issues.push({
        path: `/scenes/${index}/stageId`,
        message: `scene stageId ${parent} does not match stage id ${expectedStageId}`,
      });
    }

    const provenance = envelope.sceneSources[id];
    if (!Array.isArray(provenance) || provenance.length === 0) {
      issues.push({
        path: `/sceneSources/${id}`,
        message: 'every scene must reference at least one source id',
      });
      return;
    }

    for (const sourceId of provenance) {
      if (!sourceIds.has(sourceId)) {
        issues.push({
          path: `/sceneSources/${id}`,
          message: `unknown source id: ${sourceId}`,
        });
      }
    }
  });

  for (const mappedSceneId of Object.keys(envelope.sceneSources)) {
    if (!seenSceneIds.has(mappedSceneId)) {
      issues.push({
        path: `/sceneSources/${mappedSceneId}`,
        message: 'provenance map references a scene that is not present',
      });
    }
  }

  return issues.length === 0
    ? { pass: true, issues: [] }
    : { pass: false, issues };
}
