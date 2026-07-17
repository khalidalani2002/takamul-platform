// Shared rendering — used by the public pages AND the admin builder preview.

export function escapeHtml(s = "") {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

// Prefer the manually-set event date; fall back to the created date.
export function displayDate(post) {
  const d = post.event_date ? new Date(post.event_date + "T00:00:00") : new Date(post.created_at);
  if (isNaN(d)) return "";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

function maybeLink(html, url) {
  if (!url) return html;
  return `<a class="post-textlink" href="${encodeURI(url)}" target="_blank" rel="noopener noreferrer">${html}</a>`;
}

// ---- one element ----
export function elHtml(e) {
  const align = e.align === "center" || e.align === "right" ? e.align : "left";
  let inner = "";
  switch (e.type) {
    case "heading": inner = maybeLink(`<h3 class="post-heading" dir="auto">${escapeHtml(e.text)}</h3>`, e.link); break;
    case "text":    inner = maybeLink(`<p class="post-text" dir="auto">${escapeHtml(e.text)}</p>`, e.link); break;
    case "image":   inner = e.url ? `<img class="post-media" src="${e.url}" alt="" loading="lazy" />` : ""; break;
    case "video":   inner = e.url ? `<video class="post-media" src="${e.url}" controls preload="metadata"></video>` : ""; break;
    case "album": {
      const items = (Array.isArray(e.items) ? e.items : []).filter((i) => i && i.url);
      inner = items.length
        ? `<div class="album-grid">${items.map((i) => `<img class="album-img" src="${i.url}" alt="" loading="lazy" />`).join("")}</div>`
        : "";
      break;
    }
    case "photobar": {
      const items = (Array.isArray(e.items) ? e.items : []).filter((i) => i && i.url);
      if (!items.length) { inner = ""; break; }
      inner = `<div class="photobar" data-photobar>
        <div class="pbar-track">${items.map((i, k) => `<img class="pbar-slide${k === 0 ? " on" : ""}" src="${i.url}" alt="" loading="${k === 0 ? "eager" : "lazy"}" />`).join("")}</div>
        <button type="button" class="pbar-nav prev" aria-label="Previous">›</button>
        <button type="button" class="pbar-nav next" aria-label="Next">‹</button>
        <div class="pbar-dots">${items.map((_, k) => `<span class="pbar-dot${k === 0 ? " on" : ""}"></span>`).join("")}</div>
      </div>`;
      break;
    }
    case "button":
    case "link":
      inner = e.url ? `<a class="post-link" href="${encodeURI(e.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(e.label || e.url)}</a>` : "";
      break;
    case "spacer": inner = `<div style="height:${parseInt(e.height) || 40}px"></div>`; break;
  }
  if (!inner) return "";
  return `<div class="pb-el-r" style="text-align:${align}">${inner}</div>`;
}

// ---- structured layout (rows/columns) ----
export function renderLayout(layout) {
  if (!layout || !Array.isArray(layout.rows)) return "";
  return layout.rows.map((row) =>
    `<div class="pb-row">${(row.columns || []).map((col) =>
      `<div class="pb-col">${(col.elements || []).map(elHtml).join("")}</div>`
    ).join("")}</div>`
  ).join("");
}

// ---- legacy content blocks (older posts) ----
function blockHtml(b) {
  return elHtml(b.type === "link" ? { ...b, type: "button" } : b);
}
export function contentHtml(post) {
  let blocks = Array.isArray(post.content) ? post.content.slice() : [];
  if (!blocks.length) {
    if (post.body) blocks.push({ type: "text", text: post.body });
    (Array.isArray(post.media) ? post.media : []).forEach((m) => blocks.push({ type: m.type, url: m.url }));
  }
  return blocks.map(blockHtml).join("");
}

// ---- pick the right renderer ----
export function bodyHtml(post) {
  if (post.layout && Array.isArray(post.layout.rows) && post.layout.rows.length) {
    return renderLayout(post.layout);
  }
  return contentHtml(post);
}

export function coverUrl(post) {
  if (post.cover && post.cover.url) return post.cover.url;
  if (post.layout && Array.isArray(post.layout.rows)) {
    for (const r of post.layout.rows)
      for (const c of (r.columns || []))
        for (const e of (c.elements || [])) {
          if (e.type === "image" && e.url) return e.url;
          if (e.type === "album" && e.items && e.items[0]) return e.items[0].url;
        }
  }
  const blocks = Array.isArray(post.content) ? post.content : [];
  const img = blocks.find((b) => b.type === "image" && b.url);
  if (img) return img.url;
  const alb = blocks.find((b) => b.type === "album" && Array.isArray(b.items) && b.items[0]);
  if (alb) return alb.items[0].url;
  const m = (Array.isArray(post.media) ? post.media : []).find((x) => x.type === "image");
  return m ? m.url : null;
}
