# MAIC Lab architecture v0.4

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
 build-time runtime hardening
            |
            v
 internal renderer preview
            |
            v
 matched A/B evaluation
 passive vs decision-training
            |
            v
 HUMAN LEARNING-VALUE DECISION
            |
     useful? yes / no
        |          |
        v          v
 editor only      stop / redesign
 if justified
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

Prototype 001 proves the internal path `Source Pack -> scoped model seam -> content/actions -> Scene -> Envelope -> Gate` with seven scenes and inspectable CI artifacts.

Important: generation output is never equivalent to approved content.

### 3. `@openmaic/renderer` — ADOPT FOR INTERNAL PREVIEW

Role: read-only rendering of accepted DSL slide scenes inside the Prototype 001 evaluation surface.

Pinned: `0.1.11`.

Implementation boundary:

- renderer is used for slide scenes only;
- interactive scenes remain isolated in sandboxed `srcDoc` iframes;
- quiz interaction is rendered locally from the DSL quiz content;
- no OpenMAIC fonts CSS is imported, so the preview has no `file.maic.chat` font dependency;
- no authentication, learner account, persistence, production hosting or customer data is added.

Result: the renderer build passes in CI and produces a static internal artifact that contains all seven scenes, narration and provenance inspection.

### 4. `@openmaic/editor` — STILL DEFERRED

Candidate role: internal authoring/revision surface.

Current upstream package observed during lab setup: `0.0.9`.

Reason for defer: do not build a Course Studio until the matched A/B review shows enough learning value to justify authoring infrastructure.

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

### E. Runtime hardening

Prototype 001 interactive HTML is hardened before it is bundled:

- OpenMAIC-injected KaTeX `jsDelivr` assets are removed because this prototype does not use mathematics;
- the auto-render bootstrap that depends on those assets is removed;
- a restrictive Content Security Policy is embedded;
- the browser still renders the scene inside an iframe with `sandbox="allow-scripts"` and no `allow-same-origin`;
- the static preview artifact contains no `jsDelivr` URL and no `file.maic.chat` font URL.

This is a prototype-specific hardening rule, not a general claim that every future OpenMAIC widget is safe to render unchanged.

### F. Matched passive baseline

Version A is generated deterministically from the same Prototype 001 outline used by Version B.

For every corresponding block it preserves:

- order;
- title;
- approved key points;
- exact `sourceFactIds`;
- source locators.

It deliberately removes quizzes, branching, interactive controls and feedback loops. This prevents the comparison from becoming two different curricula disguised as an A/B test.

### G. Local evaluation surface

The preview exposes Version A and Version B in the same navigation shell and adds an internal rating panel.

Review dimensions:

- clarity;
- decision relevance;
- mental work;
- source fidelity;
- controllability.

Ratings are local page state. The browser does not submit them anywhere. A reviewer may manually export a JSON file containing ratings, descriptive `B − A` deltas and optional notes.

No learner identity or customer data is required.

### H. Professional/human review boundary

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

OpenMAIC package versions are pinned during an experiment. Upgrade only when there is a concrete reason, then re-run gate/type/build tests before accepting the change.

The Formalife envelope has its own schema version independent of OpenMAIC's DSL version so the two can evolve separately.

## Integration findings from Prototype 001

1. OpenMAIC's content/action/build primitives work as a standalone package pipeline under the Formalife Source Pack boundary.
2. Action prompts use a structured `type: text` / `type: action` response contract. Empty action output triggers upstream fallbacks that may not respect the requested language; the Formalife recorded-provider test therefore returns explicit grounded action text.
3. OpenMAIC post-processing injects KaTeX CDN assets into interactive HTML even when Prototype 001 does not require mathematics. The preview strips these at build time and adds a restrictive CSP before bundling.
4. `@openmaic/renderer` works independently for the generated slide canvases without importing the full OpenMAIC app or its font CDN.
5. A single internal preview can combine native OpenMAIC slide rendering with sandboxed interactive HTML and a local quiz renderer while preserving scene-level narration and fact provenance.
6. A passive baseline can be derived from the same outline/source map and mechanically tested for fact-boundary parity, allowing the lab to compare learning format rather than source coverage.

## Verified technical checkpoint

The renderer checkpoint is complete on `main` at merge commit `d765e2f548a9669a4881b32a57617e9791c0020f` with post-merge CI PASS.

The A/B branch additionally verifies:

- 7 interactive scenes + 7 passive matched blocks;
- exact fact-ID parity per corresponding block;
- root + preview TypeScript checks;
- all unit/integration/security tests;
- Prototype 001 gated generation;
- Vite production build;
- static artifact upload;
- no `cdn.jsdelivr.net` or `file.maic.chat` dependency in the final static artifact.

## Current evidence checkpoint

Technical integration is no longer the primary uncertainty.

The unresolved question is **learning value**.

The experiment now uses a predefined continuation heuristic:

- B at least `+1` versus A on decision relevance;
- B at least `+1` versus A on mental work;
- no worse than `−1` on clarity, source fidelity or controllability;
- qualitative evidence that at least one changing scenario cue forces genuine reassessment;
- added interaction does not create disproportionate maintenance/correction burden.

This heuristic is an internal decision aid, not a validated educational-effectiveness threshold.

## Next checkpoint

Run the human A/B review and export the evaluation JSON.

Until that evidence exists:

- do not add `@openmaic/editor`;
- do not add live-model variability merely for novelty;
- do not add persistence/auth/learner tracking;
- do not promote Prototype 001 to a customer-facing product.

If the continuation signal fails, stop or redesign the interaction. If it passes, the next experiment can test whether the editor meaningfully reduces correction/authoring cost.
