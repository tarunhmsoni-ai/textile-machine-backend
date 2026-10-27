// Link-preview crawlers (WhatsApp, Facebook, etc.) don't run JavaScript, so
// they only ever saw this SPA's generic index.html with no image or details —
// which is why shared machine links looked untrustworthy with no preview.
// This serves those crawlers a small static HTML page with proper Open
// Graph tags for the specific machine, while real visitors pass straight
// through to the normal React app untouched.

const BOT_USER_AGENT = /facebookexternalhit|whatsapp|twitterbot|slackbot|telegrambot|linkedinbot|discordbot|pinterest|skypeuripreview|vkshare|w3c_validator/i;

const API_ORIGIN = 'https://textile-machine-backend.onrender.com';

function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

export default async function middleware(request) {
  const userAgent = request.headers.get('user-agent') || '';
  if (!BOT_USER_AGENT.test(userAgent)) {
    return; // not a known link-preview bot — let the SPA handle it normally
  }

  const url = new URL(request.url);
  const match = url.pathname.match(/^\/machines\/(\d+)$/);
  if (!match) {
    return;
  }

  const id = match[1];
  let machine;
  try {
    const res = await fetch(`${API_ORIGIN}/api/machines/${id}`);
    if (!res.ok) return;
    machine = await res.json();
  } catch {
    return; // backend unreachable — fall through to the normal SPA
  }

  const title = `${machine.brand} ${machine.model} — ${machine.subtype || machine.type}`.trim();
  const descriptionParts = [
    machine.subtype || machine.type,
    machine.location && `Location: ${machine.location}`,
    machine.year && `Year: ${machine.year}`,
    'Available for sale on Textile Machine',
  ].filter(Boolean);
  const description = descriptionParts.join(' · ');
  const rawPhoto = machine.photos?.[0];
  const image = rawPhoto
    ? (/^https?:\/\//i.test(rawPhoto) ? rawPhoto : `${API_ORIGIN}${rawPhoto}`)
    : `${url.origin}/machines/karl-mayer-hks3m-plate.webp`;
  const pageUrl = `${url.origin}/machines/${id}`;

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>${escapeHtml(title)}</title>
<meta property="og:title" content="${escapeHtml(title)}" />
<meta property="og:description" content="${escapeHtml(description)}" />
<meta property="og:image" content="${escapeHtml(image)}" />
<meta property="og:url" content="${escapeHtml(pageUrl)}" />
<meta property="og:type" content="product" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${escapeHtml(title)}" />
<meta name="twitter:description" content="${escapeHtml(description)}" />
<meta name="twitter:image" content="${escapeHtml(image)}" />
</head>
<body>
<p>${escapeHtml(title)}</p>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: { 'content-type': 'text/html; charset=utf-8' },
  });
}

export const config = {
  matcher: '/machines/:id',
};
