# MAIC Lab architecture v0.2

## Principle

**AI may generate. Formalife authorizes.**

OpenMAIC is used selectively as an educational document/generation foundation. Formalife owns the source discipline, provenance, approval boundaries, product meaning, and any sensitive-content gate.

## v0 flow

```text
CURRENT FORMALIFE SOURCE OF TRUTH
            |
            v
     bounded Source Pack
   (scoped fact-by-fact)
            |
            v
 Formalife instructional Skill
            |
            v
 @openmaic/generation
      (draft only)
            |
            v
      @openmaic/dsl
 Stage + Scenes contract
            |
            v
   Formalife Envelope
 source map + review state
            |
            v
   deterministic Gate
 structure + traceability
            |
            v
 HOLD / HUMAN REVIEW
            |
            v
 internal renderer preview
            |
            v
 editor only if preview proves useful
```

## Component decisions

### 1. `@openmaic/dsl` — ADOPT FOR LAB

Role: canonical structural contract for Stage, Scene, actions and related lesson objects.

Why: it is dependency-free and already provides pure validators, schemas, normalization and version/migration primitives. We should not recreate a competing lesson schema unless a concrete incompatibility appears.

Pinned initially: `0.11.2`.

### 2. `@openmaic/generation` — ADOPT FOR LAB

Role: draft content-generation pipeline.

Why: its AI boundary is provider-neutral; Formalife can control what source material and instructions are supplied without adopting the full OpenMAIC app.

Pinned initially: `0.3.11`.

Prototype 001 now proves the internal path `Source Pack -> scoped model seam -> content/actions -> Scene -> Envelope -> Gate` with seven scenes and an inspectable CI artifact.

Important: generation output is never equivalent to approved content.

### 3. `@openmaic/renderer` — UNBLOCKED FOR INTERNAL PREVIEW

Candidate role: internal preview/runtime for accepted DSL documents.

Current upstream package observed during lab setup: `0.1.11`.

Reason to proceed: the contract/gate/generation path has passed. The next uncertainty is experiential: whether the generated document is materially better for recognition/decision practice than a passive sequence.

Boundary: renderer work remains internal-only. Do not add authentication, learner accounts, production hosting or customer data.

### 4. `@openmaic/editor` — STILL DEFERRED

Candidate role: internal authoring/revision surface.

Current upstream package observed during lab setup: `0.0.9`.

Reason for defer: do not build a Course Studio until a rendered learning experience proves useful enough to justify authoring infrastructure.

### 5. Full OpenMAIC application — DO NOT ADOPT

Not part of v0. In particular, do not import its authentication, persistence, learner accounts, public runtime, render service or deployment model merely because the packages originate there.

## Formalife-owned layer

The proprietary layer begins where OpenMAIC's generic educational primitives stop.

### A. Source Pack

A bounded set of source references and approved facts for one experiment.

For sensitive generation, each scene receives only the fact IDs explicitly assigned to that scene. A fact being approved elsewhere in the same Source Pack does not automatically make it available to every generation task.

Missing sensitive information is not completed from memory.

### B. Instructional Skill

Encodes Formalife's current non-clinical learning/brand constraints: preparation over content accumulation, recognition before intervention, decision before technique, adult agency, explicit limits, and format honesty.

Clinical sequences, thresholds, emergency instructions or other professional rules are not invented inside the skill.

### C. Formalife Envelope

Wraps the OpenMAIC document with metadata OpenMAIC does not own:

- lab schema version;
- source registry;
- scene -> source mapping;
- review state;
- explicit internal-only release scope.

Prototype generation also retains a scene -> fact-ID map in the experiment artifact for more granular auditability.

### D. Deterministic Gate

Checks what can be checked mechanically:

- OpenMAIC Stage validity;
- OpenMAIC Scene validity;
- stage/scene identity consistency;
- source registry existence;
- source IDs referenced by scenes actually exist;
- every scene has provenance;
- release scope remains internal-only in v0.

It does **not** claim to verify clinical correctness.

### E. Professional/human review boundary

Sensitive meaning is reviewed outside the AI's authority. The repository may record that review happened; it does not create professional approval by itself.

The final Formalife book may be used as a professionally validated clinical source for this lab, but generated scenes remain drafts until separately reviewed for the intended use.

## Data boundary

v0 may use synthetic/editorial fixtures and bounded, explicitly authorized paraphrases from professionally validated Formalife source material.

Do not store:

- customer records;
- learner identities;
- health records;
- payment data;
- production credentials;
- API keys or secrets;
- private source documents copied wholesale;
- unpublished sensitive information that should not live in a public repository.

Secrets, when later needed for local generation, belong in environment variables ignored by Git.

## Public repository implication

This repository is intentionally public for development collaboration. Therefore:

- Source Pack examples committed here must be safe for public disclosure;
- private Formalife KB documents must not be copied wholesale into the repo;
- use stable source IDs/references rather than secrets or private URLs;
- only bounded source paraphrases explicitly authorized for the experiment may be committed.

## Version discipline

OpenMAIC package versions are pinned during an experiment. Upgrade only when there is a concrete reason, then re-run gate/type tests before accepting the change.

The Formalife envelope has its own schema version independent of OpenMAIC's DSL version so the two can evolve separately.

## Integration findings from Prototype 001

1. OpenMAIC's content/action/build primitives work as a standalone package pipeline under the Formalife Source Pack boundary.
2. Action prompts use a structured `type: text` / `type: action` response contract. Empty action output triggers upstream fallbacks that may not respect the requested language; the Formalife recorded-provider test therefore returns explicit grounded action text.
3. OpenMAIC post-processing currently injects jsDelivr KaTeX assets into interactive HTML even when the prototype itself does not require mathematics. Treat third-party runtime dependencies as a renderer-stage issue: inventory them and decide whether to strip or self-host before any public/customer-facing runtime.

## Next technical checkpoint

Add `@openmaic/renderer` only for an internal preview of Prototype 001.

Success criterion: a human can run the seven-scene lesson, make the decisions in the interactive scenes, see feedback/reassessment, and compare the experience with a passive slide/video baseline. Do not add the editor, persistence, authentication or production hosting until that experiential test produces evidence worth preserving.
