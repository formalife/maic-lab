const PREVIEW_CSP = [
  "default-src 'none'",
  "style-src 'unsafe-inline'",
  "script-src 'unsafe-inline'",
  "img-src data: blob:",
  "media-src data: blob:",
  "font-src data:",
  "connect-src 'none'",
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
].join('; ');

const KATEX_EXTERNAL_LINK =
  /<link\b[^>]*href=["'][^"']*cdn\.jsdelivr\.net\/npm\/katex[^"']*["'][^>]*>/gi;
const KATEX_EXTERNAL_SCRIPT =
  /<script\b[^>]*src=["'][^"']*cdn\.jsdelivr\.net\/npm\/katex[^"']*["'][^>]*>\s*<\/script>/gi;
const KATEX_INLINE_BOOTSTRAP =
  /<script\b[^>]*>[\s\S]*?renderMathInElement[\s\S]*?<\/script>/gi;
const EXISTING_CSP =
  /<meta\b[^>]*http-equiv=["']Content-Security-Policy["'][^>]*>/i;

/**
 * OpenMAIC post-processes interactive HTML with KaTeX CDN assets even when the
 * generated scene does not use math. Prototype 001 does not use math, so the
 * preview build strips those assets and embeds a restrictive CSP before the
 * HTML reaches the browser.
 */
export function hardenInteractiveHtml(html: string): string {
  let hardened = html
    .replace(KATEX_EXTERNAL_LINK, '')
    .replace(KATEX_EXTERNAL_SCRIPT, '')
    .replace(KATEX_INLINE_BOOTSTRAP, '');

  if (EXISTING_CSP.test(hardened)) {
    return hardened;
  }

  const cspMeta = `<meta http-equiv="Content-Security-Policy" content="${PREVIEW_CSP}">`;

  if (/<head\b[^>]*>/i.test(hardened)) {
    hardened = hardened.replace(/<head\b[^>]*>/i, (head) => `${head}\n${cspMeta}`);
  } else {
    hardened = `${cspMeta}\n${hardened}`;
  }

  return hardened;
}
