export type SourcePackReviewStatus =
  | 'human-reviewed-for-lab'
  | 'professionally-validated'
  | 'hold-professional-review';

export type SourcePackContentClass = 'general' | 'sensitive-clinical';

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
  /** Public-safe locator into the approved source, e.g. printed/PDF page range. */
  locator: string;
}

export interface FormalifeSourcePack {
  id: string;
  title: string;
  releaseScope: 'internal-only';
  contentClass: SourcePackContentClass;
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
