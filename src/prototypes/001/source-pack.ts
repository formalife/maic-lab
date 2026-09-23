import type { FormalifeSourcePack } from '../../source-pack/types.js';

const BOOK_SOURCE_ID = 'formalife-guida-antipanico-soffocamento-2026';

/**
 * Prototype 001 Source Pack.
 *
 * The underlying book is not copied into this public repository. Facts below are
 * bounded paraphrases of the professionally validated Formalife source.
 */
export const PROTOTYPE_001_SOURCE_PACK: FormalifeSourcePack = {
  id: 'prototype-001-recognition-decision',
  title: 'Recognition and decision during pediatric airway obstruction',
  releaseScope: 'internal-only',
  contentClass: 'sensitive-clinical',
  sources: [
    {
      id: BOOK_SOURCE_ID,
      label: 'La Guida Anti-Panico al Soffocamento Pediatrico — first edition, 2026',
      reviewStatus: 'professionally-validated',
      provenance:
        'Formalife final book. The owner confirmed on 2026-09-23 that its scientific content was professionally validated and may be used as the clinical source for MAIC Lab.',
    },
  ],
  facts: [
    {
      id: 'partial-airflow',
      text:
        'In a partial airway obstruction, air is still passing. Recognition should focus first on evidence that airflow remains present.',
      sourceIds: [BOOK_SOURCE_ID],
      locator: 'Chapter 5, printed pp. 79–80; PDF pp. 101–102',
    },
    {
      id: 'cough-means-airflow',
      text:
        'A present cough, including a weak or hoarse cough, indicates that some air is still passing because coughing requires airflow.',
      sourceIds: [BOOK_SOURCE_ID],
      locator: 'Chapter 5, printed p. 80; PDF p. 102',
    },
    {
      id: 'effective-cough-response',
      text:
        'While the child is coughing effectively, do not perform manual disobstruction manoeuvres or attempt finger removal. Observe, encourage coughing, and remain ready to change response if the situation worsens.',
      sourceIds: [BOOK_SOURCE_ID],
      locator: 'Chapter 5, printed pp. 81–82; PDF pp. 103–104',
    },
    {
      id: 'call-112-when-uncertain',
      text:
        'If the situation is concerning or uncertain, emergency services can be called without waiting for the obstruction to become total.',
      sourceIds: [BOOK_SOURCE_ID],
      locator: 'Chapter 5, printed p. 82; PDF p. 104',
    },
    {
      id: 'transition-direction',
      text:
        'A worsening obstruction tends to move from activity and sound toward quiet and silence: the cough weakens, voice or crying may disappear, and reactivity can decrease. The response must be reassessed as these cues change.',
      sourceIds: [BOOK_SOURCE_ID],
      locator: 'Chapter 5, printed pp. 84–86; PDF pp. 106–108',
    },
    {
      id: 'do-not-wait-for-cyanosis',
      text:
        'Do not wait for cyanosis before changing response. The disappearance of the cough is an earlier decision cue than a visible colour change.',
      sourceIds: [BOOK_SOURCE_ID],
      locator: 'Chapter 5, printed p. 85; PDF p. 107',
    },
    {
      id: 'total-obstruction-silence',
      text:
        'Total airway obstruction is recognized primarily by what is absent: no cough, no voice or cry, and no audible breathing; the child may open the mouth without producing sound.',
      sourceIds: [BOOK_SOURCE_ID],
      locator: 'Chapter 6, printed p. 88; PDF p. 110',
    },
    {
      id: 'older-child-verbal-check',
      text:
        'For a child older than about two to three years, when the situation is not immediately clear and the adult is already beside the child, asking whether they are choking can provide a rapid confirmation: any vocal response shows airflow, while inability to produce sound supports total obstruction. This check does not replace observation.',
      sourceIds: [BOOK_SOURCE_ID],
      locator: 'Chapter 6, printed p. 88; PDF p. 110',
    },
    {
      id: 'total-requires-immediate-action',
      text:
        'When total obstruction is recognized, the response changes from observation to immediate intervention.',
      sourceIds: [BOOK_SOURCE_ID],
      locator: 'Chapter 5–6, printed pp. 86–88; PDF pp. 108–110',
    },
    {
      id: 'reading-is-not-practical-competence',
      text:
        'Understanding a manoeuvre sequence from a page does not create reliable practical competence under stress; physical disobstruction skills are learned through hands-on practice on a manikin.',
      sourceIds: [BOOK_SOURCE_ID],
      locator: 'Chapter 6, printed p. 87; PDF p. 109',
    },
  ],
};
