# CLAUDE.md — MAIC Lab

## Repository role

This repository is an **internal, non-production experiment** for Formalife. It is not the Formalife website, LMS, clinical protocol, customer application, or current commercial offer.

Before making changes, read:

1. `README.md`
2. `docs/EXPERIMENT.md`
3. `docs/ARCHITECTURE.md`
4. `skills/formalife-decision-training/SKILL.md`

## Objective

Answer one question with the smallest useful implementation:

> Can selected OpenMAIC components turn bounded, human-reviewed Formalife source material into a learning experience that is materially better for recognition/decision practice than a conventional passive sequence?

Proof before infrastructure.

## Architecture boundary

Use OpenMAIC selectively through published packages. Do **not** fork or recreate the full OpenMAIC application unless a later explicit decision changes this rule.

Current adopted lab dependencies:

- `@openmaic/dsl`
- `@openmaic/generation`

Deferred until the contract/gate layer proves useful:

- `@openmaic/renderer`
- `@openmaic/editor`

Out of scope unless explicitly authorized:

- OpenMAIC auth/persistence/public SaaS stack;
- WordPress or production integration;
- Stripe/payment work;
- CRM/customer systems;
- real customer/learner data;
- public deployment;
- new commercial offer implementation.

## Sensitive-content rule

**AI may generate. Formalife authorizes.**

Never invent clinical rules, sequences, thresholds, exceptions, recommendations, or professional claims.

Sensitive generation requires a Source Pack that passes `validateSourcePack()`.

A source with `hold-professional-review` must remain blocked. Do not change its status simply to make a test or prototype run.

If a task requires missing sensitive information, stop that content path with:

`HOLD / NEED PROFESSIONAL REVIEW`

Do not substitute model knowledge or web knowledge for Formalife approval.

## Public-repository rule

Assume everything committed here is public.

Never commit:

- credentials, tokens or `.env` values;
- private customer/learner data;
- private Formalife documents copied wholesale;
- private URLs whose disclosure is not intended;
- unpublished sensitive clinical material.

Use synthetic fixtures for automated tests.

## Engineering rules

- Read before write.
- Prefer the smallest reversible change.
- Keep OpenMAIC package versions pinned during an experiment.
- Keep the Formalife envelope/schema independent from the OpenMAIC DSL version.
- Validate external/AI JSON at runtime boundaries; TypeScript types alone are not a gate.
- Do not weaken a gate to make generated output pass.
- Do not silently repair provenance by inventing source mappings.
- Add or update tests for behavioral changes.
- Run `pnpm typecheck` and `pnpm test` before declaring success.
- If CI fails, inspect the actual failure and fix the minimal cause; do not describe a failed run as PASS.

## Current experiment constraints

The first intended micro-prototype has 5–7 scenes, starts with a slide, includes at least two meaningful interactive scenes and at least one quiz. The interaction must require judgment/reassessment rather than decorative clicking.

This is a structural experiment contract, **not a clinical syllabus**.

## Stop rule

When the requested experiment requirement is satisfied and relevant checks pass, stop. Do not build a platform around a hypothesis.
