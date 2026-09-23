import { describe, expect, it } from 'vitest';

import { hardenInteractiveHtml } from '../src/preview/harden-interactive-html.js';

describe('Prototype 001 interactive preview hardening', () => {
  it('removes OpenMAIC KaTeX CDN assets and injects a restrictive CSP', () => {
    const input = `<!DOCTYPE html>
<html>
<head>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
<script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
<script>document.addEventListener('DOMContentLoaded', () => renderMathInElement(document.body));</script>
</head>
<body>
<button id="choice">Prova</button>
<script>document.getElementById('choice').onclick = () => document.body.dataset.clicked = 'yes';</script>
</body>
</html>`;

    const hardened = hardenInteractiveHtml(input);

    expect(hardened).not.toContain('cdn.jsdelivr.net');
    expect(hardened).not.toContain('renderMathInElement');
    expect(hardened).toContain('Content-Security-Policy');
    expect(hardened).toContain("connect-src 'none'");
    expect(hardened).toContain("default-src 'none'");
    expect(hardened).toContain("document.getElementById('choice').onclick");
  });

  it('adds CSP even when generated HTML has no head element', () => {
    const hardened = hardenInteractiveHtml('<main>Scenario</main>');

    expect(hardened).toContain('Content-Security-Policy');
    expect(hardened).toContain('<main>Scenario</main>');
  });

  it('is idempotent when preview data is hardened more than once', () => {
    const once = hardenInteractiveHtml('<html><head></head><body>Scenario</body></html>');
    const twice = hardenInteractiveHtml(once);

    expect(twice).toBe(once);
    expect(twice.match(/Content-Security-Policy/g)).toHaveLength(1);
  });
});
