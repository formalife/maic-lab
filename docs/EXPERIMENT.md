# Experiment 001 — Decision-learning micro-prototype

## Status

**HYPOTHESIS · INTERNAL ONLY · NON-PRODUCTION**

This experiment does not create a new Formalife offer and does not authorize customer-facing publication.

## Question

Can selected OpenMAIC components turn a professionally reviewed Formalife source pack into a short learning experience that helps a learner practice **recognition and decision-making** more effectively than a conventional slide/video sequence?

The purpose is to test the learning format, not to prove clinical outcomes, stress performance, conversion, or commercial demand.

## Why this question

Formalife's current positioning distinguishes information from preparation and puts **decision before technique**. The full in-person course also treats supervised physical practice as central. Therefore the most coherent digital hypothesis is not to imitate or replace practical training, but to test whether interactive scenarios can improve the recognition → assessment → decision layer.

## v0 prototype

Target: one small module with **5–7 scenes**.

Suggested shape:

1. short framing slide;
2. recognition/decision interactive scenario;
3. consequence + explanation;
4. second scenario with one changed variable;
5. quiz/checkpoint;
6. recap or transfer scenario;
7. optional final reflection.

This is an experiment structure, not a clinical syllabus.

## Source rule

No clinical instruction may be invented for the prototype.

Before real sensitive content is inserted, the prototype must receive a bounded **Source Pack** containing the material that may be used. Every scene must be traceable to one or more source references in the Formalife envelope.

If the required rule, definition, sequence, exception, or wording is absent from the approved source material, mark it:

`HOLD / NEED PROFESSIONAL REVIEW`

Do not fill the gap from model memory.

## Hard scope

### In

- OpenMAIC DSL as the structural lesson contract.
- OpenMAIC generation as a draft-generation engine behind a Formalife-controlled call boundary.
- Formalife provenance metadata around stages/scenes.
- deterministic structural checks before review;
- a Formalife instructional skill;
- internal qualitative evaluation of the resulting learning flow.

### Out

- customer login;
- real learner/customer data;
- WordPress integration;
- Stripe/payment;
- public deployment;
- certificates;
- a new commercial offer;
- replacement of supervised physical practice;
- autonomous clinical approval by AI;
- full OpenMAIC application fork.

## Success criteria

The experiment is worth continuing only if all of the following are true:

1. **Traceability:** every scene can be mapped to source IDs without manual detective work.
2. **Structural reliability:** OpenMAIC DSL validation and the Formalife gate reject malformed or untraceable documents deterministically.
3. **Learning value:** the interactive path is visibly more useful for recognition/decision practice than the same material presented as passive slides alone.
4. **Editability:** a human can inspect and revise the generated artifact without fighting the system.
5. **Bounded complexity:** the prototype does not require adopting OpenMAIC auth, persistence, learner accounts, or the full SaaS application.

## Kill / pause criteria

Stop or redesign if:

- generated scenes routinely escape the supplied facts;
- provenance becomes manual bookkeeping rather than a reliable contract;
- the interaction is cosmetic rather than decision-relevant;
- the resulting authoring workflow is slower or less controllable than the current process;
- useful testing requires production/customer infrastructure before learning value is demonstrated.

## Evaluation

For v0, evaluation is internal and comparative:

- Version A: conventional passive explanation of the same approved material.
- Version B: MAIC Lab interactive sequence.

Review for clarity, decision relevance, source fidelity, correction effort, and whether the interaction changes what the learner must actually do mentally.

No claim of educational effectiveness should be generalized from this prototype alone.
