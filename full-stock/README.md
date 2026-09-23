# OpenMAIC Full-Stock Experiment

## Purpose

This checkpoint tests the **actual OpenMAIC application as designed upstream**, not the earlier MAIC Lab SDK wrapper and not a Formalife fork.

The question is deliberately narrower than product adoption:

> What learning-experience ceiling can current OpenMAIC reach when its native full-product runtime is enabled and used correctly?

This is an internal, non-production Discovery Lane experiment. It does not change Formalife offers, WordPress, checkout, customer data, or production infrastructure.

## Current provider decision: ZERO COST

The current Formalife control experiment uses **Ollama locally on the owner's Apple Silicon Mac**.

Why:

- OpenMAIC natively supports Ollama as a keyless local provider;
- Ollama exposes an OpenAI-compatible endpoint with tool calling;
- Qwen3 supports tools and gives us useful local model sizes;
- there is no per-call API charge;
- all major OpenMAIC model stages are pinned to the local provider so the lab cannot silently fall back to a paid API.

This is a **quality-ceiling experiment under a zero-cost constraint**, not a claim that a small local model equals GPT-5.6 Sol. If local-model quality becomes the bottleneck, record that as evidence rather than paying to hide it.

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

## Setup — zero-cost path

From a local clone of `formalife/maic-lab`:

```bash
bash full-stock/bootstrap.sh
bash full-stock/configure-ollama.sh
bash full-stock/start.sh
```

Default OpenMAIC target on macOS:

```text
~/Downloads/OpenMAIC-full-stock
```

### What `configure-ollama.sh` does

The helper is intentionally fail-closed and Apple-Silicon specific for this experiment.

It:

1. installs Ollama via Homebrew if it is missing and Homebrew is available;
2. starts the local Ollama service when needed;
3. detects unified memory;
4. selects a default local model:
   - 24 GB+ → `qwen3:14b`
   - 12–23 GB → `qwen3:8b`
   - below 12 GB → `qwen3:4b`;
5. allows an explicit override through `OPENMAIC_LOCAL_MODEL`;
6. pulls the model locally;
7. verifies **OpenAI-compatible tool calling** before touching OpenMAIC config;
8. removes active cloud-provider API keys from this dedicated lab `.env.local`;
9. sets `FORMALIFE_ZERO_COST_MODE=1`;
10. routes all major model stages to `ollama:<model>`;
11. routes the mandatory `maic-agent-driver` through `openai-completions` with a 32k context pin;
12. sets `.env.local` permissions to `600`.

OpenMAIC runs inside Docker while Ollama runs on the host Mac, so the lab uses:

```text
OLLAMA_BASE_URL=http://host.docker.internal:11434/v1
```

### Zero-cost launch guard

When `FORMALIFE_ZERO_COST_MODE=1`, `start.sh` refuses to launch if:

- any supported cloud-provider API key is still active in the lab `.env.local`;
- `DEFAULT_MODEL` is not an Ollama model;
- the agent driver is not explicitly routed to Ollama with `openai-completions`;
- Ollama is not reachable locally;
- the required local model is not installed;
- the OpenMAIC checkout differs from the approved upstream pin;
- upstream source files have local modifications.

This makes “zero cost” an executable constraint rather than a convention.

Open:

```text
http://localhost:3000
```

## Optional paid path — not current

`full-stock/configure-openai.sh` remains in the repository only as a reversible future alternative. It is **not** part of the current experiment and must not be used while the owner requires zero API spend.

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
