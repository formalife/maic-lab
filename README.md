# MAIC Lab

Internal, non-production laboratory for Formalife learning experiments built selectively on OpenMAIC components.

## Status

**EXPERIMENT / NON-PRODUCTION**

This repository is not a customer-facing product, LMS, clinical protocol, or production system. Its purpose is to test whether OpenMAIC components can help Formalife transform approved source material into better learning experiences before any decision to scale or integrate.

## Operating principle

> AI may generate. Formalife authorizes.

The lab must keep generation separate from approval. Clinical, legal, privacy, consumer-sensitive, payment, production, and customer-facing changes remain outside this repository unless explicitly approved through the applicable Formalife gates.

## Initial scope

- OpenMAIC DSL as the canonical lesson/scene contract.
- OpenMAIC generation pipeline as an optional content-generation engine.
- OpenMAIC renderer/editor components for internal authoring and preview.
- A Formalife-specific instructional skill layer.
- A Formalife approval/provenance gate around generated educational content.
- Small internal prototypes designed to answer one testable question at a time.

## Out of scope for v0

- Forking the full OpenMAIC application.
- Replacing WordPress, Stripe, current checkout, CRM, or customer systems.
- Storing real customer or learner data.
- Publishing clinical content directly from AI output.
- Treating AI review as professional or clinical approval.
- Building a full LMS before the learning hypothesis is proven.

## First experiment

Test whether approved Formalife source material can be converted into a short, interactive recognition/decision learning experience that is materially better than a conventional slide/video sequence.

See `docs/EXPERIMENT.md` and `docs/ARCHITECTURE.md` as the lab evolves.
