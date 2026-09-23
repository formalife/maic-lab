import type {
  FormalifeSourcePack,
  SourcePackIssue,
  SourcePackValidationResult,
} from './types.js';

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function validateSourcePack(value: unknown): SourcePackValidationResult {
  const issues: SourcePackIssue[] = [];
  const pack = asRecord(value);

  if (!pack) {
    return {
      pass: false,
      issues: [{ path: '/', message: 'Source Pack must be an object' }],
    };
  }

  if (!nonEmptyString(pack.id)) {
    issues.push({ path: '/id', message: 'Source Pack id must be a non-empty string' });
  }

  if (!nonEmptyString(pack.title)) {
    issues.push({ path: '/title', message: 'Source Pack title must be a non-empty string' });
  }

  if (pack.releaseScope !== 'internal-only') {
    issues.push({
      path: '/releaseScope',
      message: 'v0 Source Packs must remain internal-only',
    });
  }

  const sources = Array.isArray(pack.sources) ? pack.sources : null;
  const facts = Array.isArray(pack.facts) ? pack.facts : null;

  if (!sources) issues.push({ path: '/sources', message: 'sources must be an array' });
  if (!facts) issues.push({ path: '/facts', message: 'facts must be an array' });

  const sourceIds = new Set<string>();

  if (sources) {
    if (sources.length === 0) {
      issues.push({ path: '/sources', message: 'at least one source is required' });
    }

    sources.forEach((source, index) => {
      const record = asRecord(source);
      if (!record) {
        issues.push({ path: `/sources/${index}`, message: 'source must be an object' });
        return;
      }

      if (!nonEmptyString(record.id)) {
        issues.push({ path: `/sources/${index}/id`, message: 'source id must be non-empty' });
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
        issues.push({ path: `/sources/${index}/label`, message: 'source label must be non-empty' });
      }

      if (record.reviewStatus !== 'human-reviewed-for-lab') {
        issues.push({
          path: `/sources/${index}/reviewStatus`,
          message: 'source is not human-reviewed-for-lab; generation remains HOLD',
        });
      }

      if (record.provenance !== undefined && typeof record.provenance !== 'string') {
        issues.push({
          path: `/sources/${index}/provenance`,
          message: 'provenance must be a string when present',
        });
      }
    });
  }

  const factIds = new Set<string>();

  if (facts) {
    if (facts.length === 0) {
      issues.push({ path: '/facts', message: 'at least one bounded fact is required' });
    }

    facts.forEach((fact, index) => {
      const record = asRecord(fact);
      if (!record) {
        issues.push({ path: `/facts/${index}`, message: 'fact must be an object' });
        return;
      }

      if (!nonEmptyString(record.id)) {
        issues.push({ path: `/facts/${index}/id`, message: 'fact id must be non-empty' });
      } else {
        if (factIds.has(record.id)) {
          issues.push({ path: `/facts/${index}/id`, message: `duplicate fact id: ${record.id}` });
        }
        factIds.add(record.id);
      }

      if (!nonEmptyString(record.text)) {
        issues.push({ path: `/facts/${index}/text`, message: 'fact text must be non-empty' });
      }

      if (!Array.isArray(record.sourceIds) || record.sourceIds.length === 0) {
        issues.push({
          path: `/facts/${index}/sourceIds`,
          message: 'each fact must reference at least one source id',
        });
      } else {
        for (const sourceId of record.sourceIds) {
          if (!nonEmptyString(sourceId)) {
            issues.push({
              path: `/facts/${index}/sourceIds`,
              message: 'sourceIds must contain non-empty strings',
            });
          } else if (!sourceIds.has(sourceId)) {
            issues.push({
              path: `/facts/${index}/sourceIds`,
              message: `unknown source id: ${sourceId}`,
            });
          }
        }
      }
    });
  }

  return issues.length === 0
    ? { pass: true, issues: [] }
    : { pass: false, issues };
}

/** Type-level helper after an explicit successful validation at the boundary. */
export function asValidatedSourcePack(value: unknown): FormalifeSourcePack {
  const result = validateSourcePack(value);
  if (!result.pass) {
    throw new Error(result.issues.map((issue) => `${issue.path}: ${issue.message}`).join('\n'));
  }
  return value as FormalifeSourcePack;
}
