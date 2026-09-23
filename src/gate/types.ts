export const FORMALIFE_LAB_SCHEMA_VERSION = 1 as const;

export type FormalifeLabReviewState =
  | 'draft'
  | 'hold-professional-review'
  | 'review-recorded';

export interface FormalifeSourceReference {
  /** Stable, non-secret identifier used by scene provenance. */
  id: string;
  /** Human-readable label. Keep private URLs and secrets out of public repo fixtures. */
  label: string;
  /** Optional note about the exact scope used from this source. */
  scope?: string;
}

export interface FormalifeLabEnvelope {
  labSchemaVersion: typeof FORMALIFE_LAB_SCHEMA_VERSION;

  /** v0 is intentionally impossible to mark as production/customer-facing. */
  releaseScope: 'internal-only';

  /** OpenMAIC Stage payload, validated at the gate boundary. */
  stage: unknown;

  /** OpenMAIC Scene payloads, validated individually at the gate boundary. */
  scenes: unknown[];

  /** Source registry for this bounded experiment. */
  sources: FormalifeSourceReference[];

  /** Scene id -> one or more source ids used for that scene. */
  sceneSources: Record<string, string[]>;

  /** Metadata only. This field does not itself confer professional approval. */
  reviewState: FormalifeLabReviewState;
}

export interface FormalifeGateIssue {
  path: string;
  message: string;
}

export type FormalifeGateResult =
  | { pass: true; issues: [] }
  | { pass: false; issues: FormalifeGateIssue[] };
