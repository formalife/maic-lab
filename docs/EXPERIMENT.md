# Experiment 001 — Decision-learning micro-prototype

## Status

**HYPOTHESIS · READY FOR INTERNAL A/B REVIEW · NON-PRODUCTION**

This experiment does not create a new Formalife offer and does not authorize customer-facing publication.

## Question

Can selected OpenMAIC components turn a professionally reviewed Formalife source pack into a short learning experience that helps a learner practice **recognition and decision-making** more effectively than a conventional passive sequence?

The purpose is to test the learning format, not to prove clinical outcomes, stress performance, conversion, or commercial demand.

## Why this question

Formalife's current positioning distinguishes information from preparation and puts **decision before technique**. The full in-person course also treats supervised physical practice as central. Therefore the most coherent digital hypothesis is not to imitate or replace practical training, but to test whether interactive scenarios can improve the recognition → assessment → decision layer.

## v0 prototype

The current prototype contains seven matched blocks:

1. short framing;
2. recognition/decision scenario;
3. explanation;
4. second scenario with one changed variable;
5. quiz/checkpoint;
6. transfer scenario;
7. final boundary/recap.

This is an experiment structure, not a clinical syllabus.

## Source rule

No clinical instruction may be invented for the prototype.

The prototype uses a bounded **Source Pack** containing the material that may be used. Every scene is traceable to source references in the Formalife envelope and to explicit fact IDs.

If a required rule, definition, sequence, exception, or wording is absent from the approved source material, mark it:

`HOLD / NEED PROFESSIONAL REVIEW`

Do not fill the gap from model memory.

## Hard scope

### In

- OpenMAIC DSL as the structural lesson contract;
- OpenMAIC generation as a draft-generation engine behind a Formalife-controlled call boundary;
- OpenMAIC renderer for the internal read-only preview;
- Formalife provenance metadata around stages/scenes;
- deterministic structural checks before review;
- a Formalife instructional skill;
- a source-matched passive baseline;
- internal qualitative A/B evaluation of the resulting learning flow.

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
- full OpenMAIC application fork;
- editor/authoring infrastructure before learning value is demonstrated.

## Success criteria

The experiment is worth continuing only if all of the following are true:

1. **Traceability:** every scene can be mapped to source IDs without manual detective work.
2. **Structural reliability:** OpenMAIC DSL validation and the Formalife gate reject malformed or untraceable documents deterministically.
3. **Learning value:** the interactive path is visibly more useful for recognition/decision practice than the same material presented passively.
4. **Editability / controllability:** a human can inspect the generated artifact and understand what would need correction without fighting hidden state or opaque provenance.
5. **Bounded complexity:** the prototype does not require adopting OpenMAIC auth, persistence, learner accounts, or the full SaaS application.

## Kill / pause criteria

Stop or redesign if:

- generated scenes routinely escape the supplied facts;
- provenance becomes manual bookkeeping rather than a reliable contract;
- the interaction is cosmetic rather than decision-relevant;
- the resulting authoring workflow is slower or less controllable than the current process;
- useful testing requires production/customer infrastructure before learning value is demonstrated.

## A/B evaluation protocol

The preview contains two matched versions.

### Version A — passive baseline

- same seven block titles as the interactive outline;
- same approved key points;
- exactly the same scene-level fact IDs;
- no quiz, branching, feedback loop or decision control.

This is intentionally a plain passive explanation baseline. It is not a second curriculum and it may not introduce facts that Version B does not have access to.

### Version B — MAIC Lab decision training

- generated through the OpenMAIC package pipeline;
- source-bound per scene;
- interactive scenarios, quiz and feedback where specified by the experiment outline;
- rendered in the internal preview with narration/provenance inspection.

### Review criteria

After reviewing both versions, score each 1–5 on:

1. clarity;
2. decision relevance;
3. mental work required from the learner;
4. source fidelity / inspectability;
5. controllability for human review and correction.

The preview computes `B − A` only as a descriptive delta. It does not make the decision for the reviewer.

### Minimum continuation signal

Do not advance to editor/authoring infrastructure merely because Version B is more polished or novel.

A useful continuation signal is:

- Version B is at least **+1** versus A on both **decision relevance** and **mental work**;
- Version B is not more than **−1** versus A on clarity, source fidelity or controllability;
- qualitative notes identify at least one interaction where a changing cue forces genuine reassessment rather than decorative clicking;
- the added interaction does not create an obvious correction/maintenance burden disproportionate to the learning value.

This is an internal experiment heuristic, not a validated educational-effectiveness threshold.

## Evaluation data boundary

The A/B panel runs locally in the browser.

- no analytics;
- no account;
- no learner identifier;
- no network submission;
- ratings exist only in page state unless the reviewer explicitly exports a JSON file.

The exported JSON contains only experiment ratings, descriptive deltas and optional notes supplied by the reviewer.

## Current evidence state

**FACT — technical criteria 1, 2 and 5 are currently supported by the repository checks and CI.**

**NEED DATA — criterion 3, learning value, still requires a human comparative review.**

**NEED DATA — criterion 4 is partially observable through the current preview/provenance inspector, but the correction workflow itself has not yet been tested with an editor.**

No claim of educational effectiveness should be generalized from this prototype alone.
