# MAIC Lab

Internal, non-production laboratory for Formalife learning experiments built selectively on OpenMAIC components.

## Status

**EXPERIMENT / NON-PRODUCTION**

This repository is not a customer-facing product, LMS, clinical protocol, or production system. Its purpose is to test whether OpenMAIC components can help Formalife transform approved source material into better learning experiences before any decision to scale or integrate.

## Operating principle

> AI may generate. Formalife authorizes.

The lab must keep generation separate from approval. Clinical, legal, privacy, consumer-sensitive, payment, production, and customer-facing changes remain outside this repository unless explicitly approved through the applicable Formalife gates.

## Current scope

- `@openmaic/dsl` as the canonical lesson/scene contract.
- `@openmaic/generation` for bounded draft generation.
- `@openmaic/renderer` for the internal read-only preview of accepted DSL slide scenes.
- Sandboxed local preview surfaces for interactive scenes and quizzes.
- A Formalife-specific instructional skill layer.
- A Formalife approval/provenance gate around generated educational content.
- Small internal prototypes designed to answer one testable question at a time.

`@openmaic/editor` remains intentionally deferred until the rendered learning experience proves useful enough to justify authoring infrastructure.

## Out of scope for v0

- Forking the full OpenMAIC application.
- Replacing WordPress, Stripe, current checkout, CRM, or customer systems.
- Storing real customer or learner data.
- Publishing clinical content directly from AI output.
- Treating AI review as professional or clinical approval.
- Building a full LMS before the learning hypothesis is proven.

## Prototype 001

Prototype 001 tests whether approved Formalife source material can become a short recognition/decision learning experience that is materially better than a conventional slide/video sequence.

The current deterministic pipeline is:

```text
approved Source Pack
→ scene-scoped facts
→ @openmaic/generation
→ @openmaic/dsl scenes
→ Formalife Envelope + provenance
→ deterministic Formalife gate
→ internal renderer preview
```

The preview contains seven scenes: OpenMAIC-rendered slides, sandboxed interactive scenarios and a local quiz. Interactive HTML is stripped of the OpenMAIC-injected KaTeX CDN assets at build time and receives a restrictive CSP before it is bundled.

## Local commands

Requires Node `>=22.19.0` and pnpm `10.28.0`.

```bash
pnpm install
pnpm typecheck
pnpm test
pnpm preview:build
pnpm preview:dev
```

`pnpm preview:build` regenerates the gated Prototype 001 data and writes the static preview to `preview/dist/`. The preview is internal-only and is not deployed by this repository.

See `docs/EXPERIMENT.md` and `docs/ARCHITECTURE.md` for the experiment contract and architecture.
