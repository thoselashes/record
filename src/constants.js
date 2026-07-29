import TAG_GROUPS from "./constants/tags.json";

export function minutesToTime(m) {
  const h = Math.floor(m / 60);
  const mins = m % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(mins).padStart(2, "0")} ${ampm}`;
}

export function formatDate(iso) {
  const d = new Date(iso);
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${days[d.getDay()]}, ${String(d.getDate()).padStart(2, "0")} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

// Canonical tag order from tags.json — custom tags not in the list sort to the end
const TAG_ORDER = Object.values(TAG_GROUPS).flat().filter(Boolean);

export function sortTags(tags) {
  return [...tags].sort((a, b) => {
    const ia = TAG_ORDER.indexOf(a);
    const ib = TAG_ORDER.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
}
