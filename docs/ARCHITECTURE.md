# MAIC Lab architecture v0.1

## Principle

**AI may generate. Formalife authorizes.**

OpenMAIC is used selectively as an educational document/generation foundation. Formalife owns the source discipline, provenance, approval boundaries, product meaning, and any sensitive-content gate.

## v0 flow

```text
CURRENT FORMALIFE SOURCE OF TRUTH
            |
            v
     bounded Source Pack
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
 renderer/editor prototype
       (later step)
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

Important: generation output is never equivalent to approved content.

### 3. `@openmaic/renderer` — DEFER UNTIL CONTRACT/GATE PASS

Candidate role: internal preview/runtime for accepted DSL documents.

Current upstream package observed during lab setup: `0.1.11`.

Reason for defer: UI is not the first uncertainty. We first need to prove that Formalife can generate, trace and reject documents reliably.

### 4. `@openmaic/editor` — DEFER UNTIL CONTRACT/GATE PASS

Candidate role: internal authoring/revision surface.

Current upstream package observed during lab setup: `0.0.9`.

Reason for defer: avoid building a Course Studio before the underlying document and review workflow proves useful.

### 5. Full OpenMAIC application — DO NOT ADOPT

Not part of v0. In particular, do not import its authentication, persistence, learner accounts, public runtime, render service or deployment model merely because the packages originate there.

## Formalife-owned layer

The proprietary layer begins where OpenMAIC's generic educational primitives stop.

### A. Source Pack

A bounded set of source references and approved facts for one experiment.

The model receives only what is necessary for the current generation task. Missing sensitive information is not completed from memory.

### B. Instructional Skill

Encodes Formalife's current non-clinical learning/brand constraints: preparation over content accumulation, recognition before intervention, decision before technique, adult agency, explicit limits, and format honesty.

Clinical sequences, thresholds, emergency instructions or other professional rules are not invented inside the skill.

### C. Formalife Envelope

Wraps the OpenMAIC document with metadata OpenMAIC does not own:

- lab schema version;
- source registry;
- scene → source mapping;
- review state;
- explicit internal-only release scope.

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

## Data boundary

v0 must use synthetic or editorial content only.

Do not store:

- customer records;
- learner identities;
- health records;
- payment data;
- production credentials;
- API keys or secrets;
- unpublished sensitive information that should not live in a public repository.

Secrets, when later needed for local generation, belong in environment variables ignored by Git.

## Public repository implication

This repository is intentionally public for development collaboration. Therefore:

- Source Pack examples committed here must be safe for public disclosure.
- private Formalife KB documents must not be copied wholesale into the repo;
- use stable source IDs/references rather than secrets or private URLs;
- sensitive prototype content should remain local until explicitly cleared for repository storage.

## Version discipline

OpenMAIC package versions are pinned during an experiment. Upgrade only when there is a concrete reason, then re-run gate/type tests before accepting the change.

The Formalife envelope has its own schema version independent of OpenMAIC's DSL version so the two can evolve separately.

## Next technical checkpoint

Build and test the Formalife envelope + deterministic gate around `@openmaic/dsl`.

Only after PASS add renderer/editor and construct the first 5–7 scene interactive prototype.
