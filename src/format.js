// The API returns titles with HTML entities (&amp;, &#39;), so decode them.
export function decode(text = "") {
  const el = document.createElement("textarea");
  el.innerHTML = text;
  return el.value;
}

// ISO 8601 duration (PT1H2M3S) -> 1:02:03
export function formatDuration(iso) {
  if (!iso) return "";
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return "";
  const [h, min, s] = [m[1] || 0, m[2] || 0, m[3] || 0].map(Number);
  const pad = (n) => String(n).padStart(2, "0");
  return h ? `${h}:${pad(min)}:${pad(s)}` : `${min}:${pad(s)}`;
}

export function formatViews(n) {
  if (n === undefined) return "";
  const v = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(Number(n));
  return `${v} views`;
}

export function timeAgo(iso) {
  const diff = (new Date(iso) - Date.now()) / 1000;
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const units = [
    ["year", 31536000],
    ["month", 2592000],
    ["week", 604800],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  for (const [unit, secs] of units) {
    if (Math.abs(diff) >= secs) return rtf.format(Math.round(diff / secs), unit);
  }
  return "just now";
}
