# OpenMAIC full-stock — low-memory local path

Use this path when the stock production Docker image exhausts Docker Desktop memory during `next build` on Apple Silicon.

It keeps the OpenMAIC source on the exact pinned upstream commit and runs the official `pnpm dev` app on macOS. Docker is used only for PostgreSQL; Ollama remains on the host.

```bash
cd ~/Downloads/maic-lab
git pull
bash full-stock/start-dev.sh ~/Downloads/OpenMAIC-full-stock
```

The launcher:
- refuses a modified or wrong upstream checkout;
- requires the existing zero-cost Ollama configuration;
- starts a dedicated PostgreSQL container on localhost:55432;
- uses host-local Ollama at localhost:11434;
- installs stock dependencies once when `node_modules` is absent;
- enables the same full-product lab flags as the Docker baseline;
- runs upstream `pnpm dev` instead of the memory-heavy production Docker build.

Stop OpenMAIC with Ctrl-C. PostgreSQL data remains in the named Docker volume.
