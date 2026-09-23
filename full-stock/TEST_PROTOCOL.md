# OpenMAIC Full-Stock Test Protocol

## Goal

Evaluate the **native OpenMAIC product**, not a custom Formalife implementation.

Use one bounded topic from the professionally validated Formalife book so the content basis stays constant while the OpenMAIC mode changes.

Recommended bounded topic for the first pass:

> Recognize partial obstruction, notice deterioration toward total obstruction, and reassess the decision as observable cues change.

Do not broaden the first run into the entire choking course.

## Source material

Upload the final validated Formalife book from Drive into the local OpenMAIC instance.

Do not commit the PDF or a private Drive URL to this public repository.

For the baseline, treat the uploaded book as the factual source. If OpenMAIC adds clinical content not supported by the book, record that as a source-fidelity defect rather than repairing the system during the run.

---

# Phase 0 — Environment sanity

Confirm in the running stock app:

- Pro / Workbench entry is visible and opens;
- MAIC Editor is available;
- Pi chat is active;
- courseware reference UI is available during playback where supported;
- Vocational experimental toggle is visible;
- PPTX import affordance is visible;
- uploaded material can be read/extracted;
- a simple non-clinical one-page generation completes.

If one of these fails, diagnose configuration/upstream behavior before judging learning quality.

---

# Phase 1 — Standard baseline

Create a short stock course from the uploaded book using ordinary generation.

Suggested requirement:

> Crea in italiano una micro-lezione per genitori e caregiver che alleni a riconoscere se l'aria passa ancora durante un'ostruzione pediatrica e a rivalutare la situazione quando i segnali cambiano. Usa come fonte fattuale soltanto il materiale allegato. Mantieni il perimetro su riconoscimento e decisione; non trasformare la lezione in un addestramento digitale sostitutivo della pratica su manichino.

Record:

- page/scene structure;
- visual quality;
- narration quality;
- source fidelity;
- whether the learner is mostly reading/listening or actually deciding;
- editor usability;
- playback quality.

This is the control condition, not the desired final experience.

---

# Phase 2 — Deep Interactive stock mode

Repeat the same bounded learning objective with native Deep Interactive behavior.

Suggested requirement:

> Usa una struttura Deep Interactive: il learner deve osservare segnali, manipolare o esplorare stati e prendere decisioni. Non usare l'interazione come decorazione. Ogni scena interattiva deve rendere visibile quale informazione cambia e cosa il learner deve rivalutare. Usa soltanto il materiale allegato per i fatti clinici.

Observe whether native interactive scenes deliver materially more than the earlier MAIC Lab SDK prototypes:

- explicit learner task;
- visible state change;
- repeated decision/reassessment;
- useful widget actions;
- teacher guidance tied to the current widget state;
- stable rendering/runtime behavior.

---

# Phase 3 — Native Vocational Task Engine

This is a critical test.

Use the **stock generation path with Vocational / Task Engine enabled**. Do not try to reproduce this by calling the published generation package directly.

Reason: in the current upstream, `taskEngineMode` is wired at the application layer and `procedural-skill` is feature-gated. The Workbench `generate_scene` tool also does not directly expose `procedural-skill`.

Suggested requirement:

> Tratta questo come un training procedurale di riconoscimento e decisione, non come una lezione teorica. Il learner deve osservare lo stato, distinguere aria presente vs assente, prendere una decisione, ricevere una conseguenza didattica, riconoscere un cambiamento dello stato e rivalutare. Usa GO/STOP, recheck o stati equivalenti quando utili. Non inventare soglie, manovre o regole cliniche non presenti nel materiale allegato.

Evaluate the real native `procedural-skill` output for:

- statefulness;
- explicit operation/decision steps;
- consequence handling;
- recheck/reset;
- safe/unsafe/blocked/continue semantics where generated;
- clarity of controls;
- visual quality;
- whether it genuinely trains observation → decision → reassessment.

A generic diagram or ordinary game is **not** a successful Task Engine result.

---

# Phase 4 — Native PBL Scenario Roleplay

Test the same learning objective as a situational role-play rather than a deterministic task engine.

Target behavior:

- concrete setting;
- learner has an in-scene role;
- one realistic counterpart/character;
- observable facts remain distinct from hidden facts;
- learner responds freely rather than choosing A/B/C;
- the simulated character remains in-world and does not become a clinical tutor;
- role-play beats have hidden success criteria;
- state/situation can escalate between beats;
- debrief evaluates what the learner actually did.

Suggested scenario brief:

> Crea uno scenario role-play breve e realistico durante una merenda. Il learner è il caregiver presente. Un altro adulto è il personaggio simulato. La situazione deve iniziare con segnali compatibili con passaggio d'aria e poi cambiare in modo osservabile, richiedendo rivalutazione. Il personaggio non è un medico e non deve insegnare o valutare il learner durante la scena. Usa soltanto il materiale allegato come fonte dei fatti clinici.

If the stock UI does not expose a deterministic way to request `scenarioRoleplay`, record the routing gap as an upstream limitation; do not patch source during the baseline.

---

# Phase 5 — Native playback / classroom experience

For the best result from Phases 2–4, test the full learner surface rather than only inspecting generated JSON/pages.

Specifically exercise when available:

- TTS / narration;
- playback timing;
- widget highlight / setState / annotation / reveal;
- Pi chat;
- courseware references to a visible slide/widget element;
- whiteboard;
- agent/classroom discussion;
- interruption/resume;
- completion/debrief state.

Question to answer:

> Does OpenMAIC feel like a coherent interactive classroom, or like unrelated generated components placed next to each other?

---

# Phase 6 — Native authoring quality

Use the stock Pro Workbench / Editor to improve the strongest generated experience **without editing OpenMAIC source code**.

Test:

- `read_stage` / inspection through the agent;
- surgical edits rather than page regeneration;
- scene preview;
- narration edits + TTS regeneration;
- element-level visual editing;
- page duplication / layout reuse;
- PPTX import if a suitable Formalife teaching deck is available;
- built-in slide craft / style reuse workflows.

The objective is to find the quality ceiling of the stock authoring system, not the quality of the first one-shot generation.

---

# Evaluation dimensions

Score each relevant mode from 1–5 and add short evidence notes.

1. **Clinical source fidelity** — stays within the validated source.
2. **Decision relevance** — learner must make meaningful choices.
3. **Reassessment** — changed cues force a changed or renewed decision.
4. **Cognitive work** — learner observes/reasons rather than clicks decoratively.
5. **Interaction clarity** — learner knows what can/should be done.
6. **Feedback quality** — explains why, not merely right/wrong.
7. **Visual quality** — feels credible and intentional.
8. **Narrative/teaching quality** — explanations are coherent and useful.
9. **Runtime coherence** — interactions, narration, agents and state feel integrated.
10. **Authorability** — a human/agent can efficiently improve weak output.
11. **Controllability** — behavior can be bounded and reproduced.
12. **Failure transparency** — broken/unsupported behavior fails visibly rather than silently degrading.

## Decision rule

Do not decide based on feature count.

After the stock full-product run, classify each important capability:

- `USE STOCK`
- `CONFIGURE / SKILL ONLY`
- `THIN PATCH NEEDED`
- `REPLACE COMPONENT`
- `NOT USEFUL`
- `UPSTREAM BUG / WAIT`

Only then decide whether `maic-lab` should become a thin fork, an overlay/skill project, or stop.

## Stop rule

Do not build a custom editor or learner runtime during this protocol.

The first stock-product limitation that materially blocks learning value is evidence to record, not an invitation to immediately write replacement code.
