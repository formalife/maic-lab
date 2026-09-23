# Experiment 002 — Immersive decision scenario

## Status

**REDESIGN · INTERNAL ONLY · NON-PRODUCTION**

Prototype 001 did not pass the learning-value gate. The owner's completed A/B evaluation rated the interactive version lower on clarity, equal on decision relevance and mental work, equal on source fidelity, and only slightly higher on controllability. Qualitative feedback described both previews as too basic, visually poor, under-explained, and insufficiently explicit in their interaction.

Do not polish Prototype 001 incrementally. Prototype 002 is a deliberate ceiling test.

## Question

Can the useful parts of the MAIC Lab foundation — bounded source facts, provenance, deterministic gates and reusable educational primitives — support **one genuinely compelling Formalife decision-training experience** when the learner experience is designed intentionally rather than delegated to generic generated widgets?

## Core decision

The experiment now separates two layers:

1. **OpenMAIC / MAIC Lab foundation** — source boundary, generation contract, DSL/provenance, validation and reusable primitives.
2. **Formalife-owned learner experience** — the high-quality interaction, visual hierarchy, scenario state machine, feedback and debrief.

OpenMAIC is not assumed to provide production-quality learner UX out of the box.

## Scope

Build one scenario only: a child moves from a partial airway obstruction with audible cough/sound toward a total obstruction characterized by loss of cough/voice and silence.

The learner must:

1. inspect the initial observable cues;
2. distinguish decision-relevant cues from a dramatic but later cue;
3. choose the response coherent with effective cough;
4. observe the scenario change;
5. identify which cues disappeared;
6. abandon the previously correct decision;
7. choose the new response at the classification level;
8. review a rich, source-backed debrief.

No manual manoeuvre sequence is taught in this prototype.

## Interaction principles

- No decorative clicking.
- No hidden interaction affordances.
- No countdown or pseudo-emergency pressure.
- The learner should always know what action the interface expects.
- Wrong choices receive explanatory feedback, not only red/green grading.
- The same scenario must visibly change over time so reassessment is necessary.
- Source-backed explanations are inspectable in context, not buried in a developer panel.
- The debrief must explain the mental model, not merely repeat the correct answers.

## Visual bar

Prototype 002 should feel closer to a designed educational product than a framework demo:

- calm editorial visual system;
- clear focal scene;
- restrained animation that carries meaning;
- strong hierarchy between scene, prompt, choice and explanation;
- responsive desktop/mobile layout;
- no emergency-red aesthetic;
- no stock clinical imagery required for the ceiling test.

## Source boundary

Clinical meaning remains restricted to the professionally validated Formalife book Source Pack already used by Prototype 001.

The immersive scenario uses only these fact groups:

- partial obstruction / airflow / cough / appropriate response;
- transition from sound toward silence;
- do not wait for cyanosis;
- total obstruction recognized through absent cough/voice/breathing sound;
- total obstruction changes the response to immediate intervention;
- digital understanding does not replace hands-on manikin practice.

No model memory or external clinical knowledge may extend these rules.

## Success criterion

Prototype 002 is worth continuing only if the owner can say that it is materially closer to the kind of educational experience Formalife should be proud to show, and specifically that:

- interaction is obvious;
- the changing variable is visually legible;
- explanation is sufficiently rich;
- the visual layer supports rather than distracts;
- reassessment feels like the core activity rather than a quiz wrapper.

If it still feels like a basic prototype, pause MAIC Lab productization. Do not respond by building more infrastructure.

## Out of scope

- editor;
- live LLM variability;
- accounts/persistence;
- analytics;
- customer data;
- WordPress integration;
- public deployment;
- commercial offer changes;
- certification or clinical-outcome claims.
