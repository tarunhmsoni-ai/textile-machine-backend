// Shared placeholder shown when a machine photo is missing or fails to load,
// so a broken image never renders as a jarring solid black box.
export const NO_PHOTO_PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23e9e9e9'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='18' fill='%23999' text-anchor='middle' dominant-baseline='middle'%3ENo photo available%3C/text%3E%3C/svg%3E";

export function onImageError(e) {
  e.currentTarget.onerror = null;
  e.currentTarget.src = NO_PHOTO_PLACEHOLDER;
}
