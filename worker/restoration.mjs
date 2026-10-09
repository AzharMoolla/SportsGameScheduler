const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Silbo Sports — Returning soon</title><meta name="robots" content="noindex"><style>body{margin:0;background:#111b20;color:#f6f0e2;font-family:system-ui,sans-serif;min-height:100vh;display:grid;place-items:center}main{padding:2rem;max-width:36rem}p{line-height:1.6}small{color:#c5d4cf}h1{font-size:clamp(2rem,7vw,3.5rem);line-height:1.1}</style></head><body><main><small>SILBO SPORTS</small><h1>Back to the fans.</h1><p>We’re restoring the sports scheduler. Schedules and accounts are temporarily unavailable while we rebuild.</p><p>Please check back soon.</p></main></body></html>`;

export default {
  fetch(request) {
    const url = new URL(request.url);
    if (url.hostname === 'www.silbosports.com' || url.protocol === 'http:') {
      url.hostname = 'silbosports.com';
      url.protocol = 'https:';
      return Response.redirect(url.toString(), 308);
    }
    const headers = {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'Retry-After': '3600',
      'X-Robots-Tag': 'noindex',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer',
      'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'",
    };
    return new Response(request.method === 'HEAD' ? null : html, { status: 503, headers });
  },
};
