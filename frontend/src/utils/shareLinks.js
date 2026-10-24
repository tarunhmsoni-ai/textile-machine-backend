// Direct share links for WhatsApp/Facebook — more reliable than the Web Share
// API, which silently does nothing on most desktop browsers.
export function whatsappShareUrl(text, url) {
  return `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`;
}

export function facebookShareUrl(url) {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
}
