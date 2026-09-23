# OpenMAIC Full-Stock Experiment

## Purpose

This checkpoint tests the **actual OpenMAIC application as designed upstream**, not the earlier MAIC Lab SDK wrapper and not a Formalife fork.

The question is deliberately narrower than product adoption:

> What learning-experience ceiling can current OpenMAIC reach when its native full-product runtime is enabled and used correctly?

This is an internal, non-production Discovery Lane experiment. It does not change Formalife offers, WordPress, checkout, customer data, or production infrastructure.

## Upstream pin

The experiment is pinned by `UPSTREAM_PIN` so results are reproducible. Do not silently advance the pin during a comparison run.

Current pin:

`56322a5e061a40c240a5814b58df306c3437fb85`

The pinned upstream is cloned at setup time. Its source is **not vendored or modified** in this repository.

## What is intentionally enabled

The local full-stack launcher enables the relevant native product surfaces:

- Pro Workbench;
- MAIC Editor;
- server Agent Runtime;
- PostgreSQL-backed local lab state;
- Pi classroom chat;
- courseware references;
- Vocational Task Engine;
- vocational test UI;
- experimental PPTX import.

The first checkpoint intentionally leaves these OFF:

- package playback renderer experiment;
- package editor renderer experiment;
- MP4 render-service/video export.

Reason: the stock application currently owns richer app-side playback/editor surfaces, while video rendering adds a large Chromium/FFmpeg runtime and does not answer the first learning-value question.

## No source modifications

For the first baseline, **do not patch OpenMAIC source code**.

Allowed changes are configuration and user-level actions inside the product:

- provider configuration;
- feature flags;
- uploaded materials;
- prompts/requirements;
- outline edits available in the stock UI;
- built-in skills/modes;
- stock editor/workbench operations.

If a result requires source modification, record that as a gap. Do not fix the gap during the baseline run.

## Clinical source rule for the experiment

Use the final professionally validated Formalife book as the source material when testing pediatric choking content. Upload it privately into the local OpenMAIC instance; **do not commit the PDF to this public repository**.

Generated clinical output remains experimental/internal until separately authorized. The point of this run is to evaluate OpenMAIC, not to publish new Formalife clinical material.

## Setup

From a local clone of `formalife/maic-lab`:

```bash
bash full-stock/bootstrap.sh
```

Default OpenMAIC target on macOS:

```text
~/Downloads/OpenMAIC-full-stock
```

The bootstrap checks out the exact upstream pin and appends the non-secret lab overlay to `.env.local`.

### Manual secret gate

Before launch, edit:

```text
~/Downloads/OpenMAIC-full-stock/.env.local
```

Configure at least one real **server-side LLM provider** and an explicit `MODEL_ROUTES` entry for `maic-agent-driver`.

Do not put provider keys in `maic-lab`, commits, issues, screenshots, or reusable prompts.

Then start the stock full stack:

```bash
bash full-stock/start.sh
```

Open:

```text
http://localhost:3000
```

## Why PostgreSQL is included

Classic OpenMAIC can run browser-only, but the Pro Workbench Agent Runtime is server-backed by design. The upstream workbench gate requires the public workbench flag, `OPENMAIC_AGENT_RUNTIME_ENABLED=true`, and a non-empty `DATABASE_URL`.

The Docker `server-persistence` profile is therefore part of this experiment. It is local lab infrastructure only, not a production architecture decision.

## Important upstream boundary

The current upstream has overlapping but not identical product paths.

In particular, the native Vocational Task Engine / `procedural-skill` path is gated above the published `@openmaic/generation` package. The Agent Workbench `generate_scene` tool does not currently expose `procedural-skill` directly.

Therefore **test the Vocational Task Engine through the stock generation path that actually carries `taskEngineMode`**, rather than assuming the Workbench is equivalent.

See `TEST_PROTOCOL.md`.

## Stop rule

Do not build a Formalife fork, custom editor, custom learner runtime, authentication layer, or production integration during this checkpoint.

First obtain evidence from the stock product. Source changes come only after a concrete stock-product limitation has been demonstrated.
