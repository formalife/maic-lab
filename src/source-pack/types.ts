export type SourcePackReviewStatus =
  | 'human-reviewed-for-lab'
  | 'hold-professional-review';

export interface SourcePackSource {
  id: string;
  label: string;
  reviewStatus: SourcePackReviewStatus;
  /** Optional public-safe provenance note; never put credentials/private URLs here. */
  provenance?: string;
}

export interface SourcePackFact {
  id: string;
  text: string;
  sourceIds: string[];
}

export interface FormalifeSourcePack {
  id: string;
  title: string;
  releaseScope: 'internal-only';
  sources: SourcePackSource[];
  facts: SourcePackFact[];
}

export interface SourcePackIssue {
  path: string;
  message: string;
}

export type SourcePackValidationResult =
  | { pass: true; issues: [] }
  | { pass: false; issues: SourcePackIssue[] };
