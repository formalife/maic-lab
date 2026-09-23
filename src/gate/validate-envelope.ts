import { validateScene, validateStage } from '@openmaic/dsl';

import {
  FORMALIFE_LAB_SCHEMA_VERSION,
  type FormalifeGateIssue,
  type FormalifeGateResult,
} from './types.js';

const REVIEW_STATES = new Set([
  'draft',
  'hold-professional-review',
  'review-recorded',
]);

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function sceneId(scene: unknown): string | null {
  const record = asRecord(scene);
  return record && nonEmptyString(record.id) ? record.id : null;
}

function sceneStageId(scene: unknown): string | null {
  const record = asRecord(scene);
  return record && nonEmptyString(record.stageId) ? record.stageId : null;
}

function stageId(stage: unknown): string | null {
  const record = asRecord(stage);
  return record && nonEmptyString(record.id) ? record.id : null;
}

export function validateFormalifeEnvelope(value: unknown): FormalifeGateResult {
  const issues: FormalifeGateIssue[] = [];
  const envelope = asRecord(value);

  if (!envelope) {
    return {
      pass: false,
      issues: [{ path: '/', message: 'Formalife envelope must be an object' }],
    };
  }

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

  if (typeof envelope.reviewState !== 'string' || !REVIEW_STATES.has(envelope.reviewState)) {
    issues.push({
      path: '/reviewState',
      message: 'unknown or missing reviewState',
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

  const sources = Array.isArray(envelope.sources) ? envelope.sources : null;
  if (!sources) {
    issues.push({ path: '/sources', message: 'sources must be an array' });
  }

  const sourceIds = new Set<string>();
  if (sources) {
    if (sources.length === 0) {
      issues.push({
        path: '/sources',
        message: 'at least one bounded source reference is required',
      });
    }

    sources.forEach((source, index) => {
      const record = asRecord(source);
      if (!record) {
        issues.push({
          path: `/sources/${index}`,
          message: 'source reference must be an object',
        });
        return;
      }

      if (!nonEmptyString(record.id)) {
        issues.push({
          path: `/sources/${index}/id`,
          message: 'source id must be a non-empty string',
        });
      } else {
        if (sourceIds.has(record.id)) {
          issues.push({
            path: `/sources/${index}/id`,
            message: `duplicate source id: ${record.id}`,
          });
        }
        sourceIds.add(record.id);
      }

      if (!nonEmptyString(record.label)) {
        issues.push({
          path: `/sources/${index}/label`,
          message: 'source label must be a non-empty string',
        });
      }

      if (record.scope !== undefined && typeof record.scope !== 'string') {
        issues.push({
          path: `/sources/${index}/scope`,
          message: 'source scope must be a string when present',
        });
      }
    });
  }

  const sceneSourcesRecord = asRecord(envelope.sceneSources);
  if (!sceneSourcesRecord) {
    issues.push({
      path: '/sceneSources',
      message: 'sceneSources must be an object map',
    });
  }

  const scenes = Array.isArray(envelope.scenes) ? envelope.scenes : null;
  if (!scenes) {
    issues.push({ path: '/scenes', message: 'scenes must be an array' });
  }

  const seenSceneIds = new Set<string>();

  if (scenes) {
    scenes.forEach((scene, index) => {
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

      if (!sceneSourcesRecord) return;

      const provenance = sceneSourcesRecord[id];
      if (!Array.isArray(provenance) || provenance.length === 0) {
        issues.push({
          path: `/sceneSources/${id}`,
          message: 'every scene must reference at least one source id',
        });
        return;
      }

      for (const sourceId of provenance) {
        if (!nonEmptyString(sourceId)) {
          issues.push({
            path: `/sceneSources/${id}`,
            message: 'source mappings must contain non-empty source-id strings',
          });
        } else if (!sourceIds.has(sourceId)) {
          issues.push({
            path: `/sceneSources/${id}`,
            message: `unknown source id: ${sourceId}`,
          });
        }
      }
    });
  }

  if (sceneSourcesRecord) {
    for (const mappedSceneId of Object.keys(sceneSourcesRecord)) {
      if (!seenSceneIds.has(mappedSceneId)) {
        issues.push({
          path: `/sceneSources/${mappedSceneId}`,
          message: 'provenance map references a scene that is not present',
        });
      }
    }
  }

  return issues.length === 0
    ? { pass: true, issues: [] }
    : { pass: false, issues };
}
