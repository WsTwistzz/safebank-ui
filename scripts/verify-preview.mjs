/** Verify real resource types; an SPA HTML fallback returning 200 is not a script. */
const pageUrl = process.argv[2] || 'http://127.0.0.1:4180/safebank-ui/';
const page = await fetch(pageUrl);
if (!page.ok) throw new Error(`Page request failed: ${page.status}`);
const html = await page.text();
const refs = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map(match => match[1]);
let checked = 0;
for (const ref of refs) {
  if (!/\.(?:js|css)(?:\?|$)/.test(ref)) continue;
  const url = new URL(ref, pageUrl);
  const response = await fetch(url);
  const contentType = response.headers.get('content-type') || '';
  const body = await response.text();
  const expected = /\.css$/.test(url.pathname) ? /text\/css/i : /javascript|ecmascript/i;
  if (!response.ok || !expected.test(contentType) || /^\s*<!doctype html/i.test(body)) {
    throw new Error(`${url.pathname}: expected ${url.pathname.endsWith('.css') ? 'CSS' : 'JavaScript'}, received HTTP ${response.status} ${contentType}. Check the preview server's --base option.`);
  }
  console.log(`PASS ${url.pathname}: ${contentType}`);
  checked++;
}
if (checked < 2) throw new Error('No application script and stylesheet found. Build the app first.');
console.log(`PASS: ${checked} resources have the correct content type.`);
