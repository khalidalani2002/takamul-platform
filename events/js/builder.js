// Visual page builder: drag elements onto a canvas, arrange in rows/columns,
// edit inline, preview per device, save to Supabase. Uses SortableJS (global).
import { supabase, MEDIA_BUCKET, NOT_CONFIGURED } from "./supabase-client.js";
import { escapeHtml } from "./render.js";

const $ = (id) => document.getElementById(id);
const statusEl = $("status");
const canvas = $("canvas");

let currentPosts = [];
let coverState = {};     // {file} | {url,path} | {}
let editingId = null;

function setStatus(msg, isError = false) {
  statusEl.textContent = msg || "";
  statusEl.className = "status" + (isError ? " error" : "");
}

/* ======================= AUTH ======================= */
async function refreshView() {
  const { data: { session } } = await supabase.auth.getSession();
  const on = !!session;
  $("login-view").hidden = on;
  $("admin-view").hidden = !on;
  if (on) { $("who").textContent = session.user.email; loadPosts(); }
}
$("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  setStatus("Signing in…");
  const { error } = await supabase.auth.signInWithPassword({
    email: $("email").value.trim(), password: $("password").value,
  });
  if (error) return setStatus(error.message, true);
  setStatus(""); refreshView();
});
$("logout").addEventListener("click", async () => { await supabase.auth.signOut(); refreshView(); });

/* ======================= COVER ======================= */
$("cover-drop").addEventListener("click", () => $("cover-file").click());
$("cover-file").addEventListener("change", () => { coverState = { file: $("cover-file").files[0] || null }; renderCover(); });
function renderCover() {
  const url = coverState.file ? URL.createObjectURL(coverState.file) : coverState.url;
  $("cover-prev").innerHTML = url ? `<img src="${url}" alt="cover" />` : "Click to set main photo";
}

/* ======================= ELEMENTS ======================= */
function applyAlign(node) {
  node.querySelector(".el-content").style.textAlign = node.dataset.align || "";
  node.querySelectorAll(".el-align button").forEach((b) => b.classList.toggle("on", b.dataset.al === node.dataset.align));
}

function createEl(type, data = {}) {
  const n = document.createElement("div");
  n.className = "pb-el";
  n.dataset.type = type;
  if (data.align) n.dataset.align = data.align;
  n.innerHTML = `
    <div class="el-toolbar">
      <span class="el-drag" title="Drag">⠿</span>
      <span class="el-type">${type}</span>
      <span class="el-align">
        <button type="button" data-al="left" title="Left">⯇</button>
        <button type="button" data-al="center" title="Center">▣</button>
        <button type="button" data-al="right" title="Right">⯈</button>
      </span>
      <button type="button" class="el-del" title="Delete">✕</button>
    </div>
    <div class="el-content"></div>`;
  const c = n.querySelector(".el-content");

  if (type === "heading" || type === "text") {
    const tag = type === "heading" ? "pb-h" : "pb-t";
    c.innerHTML = `<div class="${tag}" contenteditable="true" dir="auto" data-ph="${type === "heading" ? "Topic / heading" : "Write text…"}"></div>
                   <div class="el-linkrow"${data.link ? "" : " hidden"}><input class="el-link" type="url" placeholder="Link this text to a URL…" /></div>`;
    c.querySelector("[contenteditable]").textContent = data.text || "";
    c.querySelector(".el-link").value = data.link || "";
    const lb = document.createElement("button");
    lb.type = "button"; lb.className = "el-linkbtn" + (data.link ? " on" : "");
    lb.title = "Link this text"; lb.textContent = "🔗";
    n.querySelector(".el-align").after(lb);
    lb.addEventListener("click", () => {
      const row = c.querySelector(".el-linkrow");
      row.hidden = !row.hidden;
      lb.classList.toggle("on", !row.hidden);
      if (!row.hidden) row.querySelector("input").focus();
    });
  } else if (type === "image" || type === "video") {
    mediaEl(n, c, type, data);
  } else if (type === "album" || type === "photobar") {
    albumEl(c, data);
  } else if (type === "button") {
    c.innerHTML = `<a class="pb-btn" contenteditable="true" dir="auto" data-ph="Button text"></a>
                   <input class="btn-url" type="url" placeholder="https://…" />`;
    c.querySelector(".pb-btn").textContent = data.label || "";
    c.querySelector(".btn-url").value = data.url || "";
  } else if (type === "spacer") {
    n.dataset.height = data.height || "40";
    c.innerHTML = `<div class="pb-spacer" style="height:${n.dataset.height}px"></div>
                   <div class="sp-ctrl"><button type="button" data-h="-">−</button><span>space</span><button type="button" data-h="+">＋</button></div>`;
    c.querySelectorAll("[data-h]").forEach((b) => b.addEventListener("click", () => {
      let h = parseInt(n.dataset.height) + (b.dataset.h === "+" ? 20 : -20);
      h = Math.max(20, Math.min(240, h));
      n.dataset.height = String(h);
      c.querySelector(".pb-spacer").style.height = h + "px";
    }));
  }

  n.querySelector(".el-del").addEventListener("click", () => n.remove());
  n.querySelectorAll(".el-align button").forEach((b) =>
    b.addEventListener("click", () => { n.dataset.align = b.dataset.al; applyAlign(n); })
  );
  applyAlign(n);
  return n;
}

function mediaEl(n, c, type, data) {
  const show = (src) => {
    c.innerHTML = type === "video"
      ? `<video src="${src}" class="post-media" controls></video>`
      : `<img src="${src}" class="post-media" alt="" />`;
    const rep = document.createElement("button");
    rep.type = "button"; rep.className = "media-replace"; rep.textContent = "Replace";
    rep.addEventListener("click", (e) => { e.stopPropagation(); pick(); });
    c.appendChild(rep);
  };
  const pick = () => {
    const inp = document.createElement("input");
    inp.type = "file"; inp.accept = type === "video" ? "video/*" : "image/*";
    inp.onchange = () => { const f = inp.files[0]; if (f) { n._file = f; n.dataset.url = ""; show(URL.createObjectURL(f)); } };
    inp.click();
  };
  if (data.url) { n.dataset.url = data.url; n.dataset.path = data.path || ""; show(data.url); }
  else { c.innerHTML = `<div class="ph">Click to add ${type}</div>`; c.querySelector(".ph").addEventListener("click", pick); }
}

function albumEl(c, data) {
  c.innerHTML = `<div class="alb-thumbs"></div><button type="button" class="alb-add btn-ghost">+ Add photos</button>`;
  const wrap = c.querySelector(".alb-thumbs");
  const addThumb = (o) => {
    const t = document.createElement("div");
    t.className = "alb-thumb";
    const src = o.file ? URL.createObjectURL(o.file) : o.url;
    if (o.file) t._file = o.file; else { t.dataset.url = o.url; t.dataset.path = o.path || ""; }
    t.innerHTML = `<img src="${src}" alt="" /><button type="button" class="tdel">✕</button>`;
    t.querySelector(".tdel").addEventListener("click", () => t.remove());
    wrap.appendChild(t);
  };
  (data.items || []).forEach(addThumb);
  c.querySelector(".alb-add").addEventListener("click", () => {
    const inp = document.createElement("input");
    inp.type = "file"; inp.accept = "image/*"; inp.multiple = true;
    inp.onchange = () => Array.from(inp.files).forEach((f) => addThumb({ file: f }));
    inp.click();
  });
}

/* ======================= ROWS / COLUMNS ======================= */
function makeColumn(colData) {
  const col = document.createElement("div");
  col.className = "pb-col";
  (colData?.elements || []).forEach((e) => col.appendChild(createEl(e.type, e)));
  new Sortable(col, { group: "elements", handle: ".el-drag", animation: 150, onAdd: onColAdd });
  return col;
}

function onColAdd(evt) {
  const item = evt.item;
  if (item.classList.contains("widget")) {
    const real = createEl(item.dataset.widget);
    item.replaceWith(real);
  }
}

function makeRow(rowData) {
  const row = document.createElement("div");
  row.className = "pb-row";
  row.innerHTML = `
    <div class="pb-row-tools">
      <span class="pb-row-handle" title="Drag row">⠿</span>
      <button type="button" class="addcol" title="Add column">＋col</button>
      <button type="button" class="delrow" title="Delete row">✕</button>
    </div>
    <div class="pb-cols"></div>`;
  const cols = row.querySelector(".pb-cols");
  (rowData?.columns || [{ elements: [] }]).forEach((cd) => cols.appendChild(makeColumn(cd)));

  row.querySelector(".addcol").addEventListener("click", () => {
    if (cols.children.length < 4) cols.appendChild(makeColumn());
  });
  row.querySelector(".delrow").addEventListener("click", () => row.remove());
  return row;
}

function addRow(rowData) {
  canvas.appendChild(makeRow(rowData || { columns: [{ elements: [] }] }));
}

/* ======================= SERIALIZE ======================= */
function readEl(node) {
  const type = node.dataset.type;
  const align = node.dataset.align || "";
  if (type === "heading" || type === "text") {
    const txt = node.querySelector("[contenteditable]").innerText.trim();
    if (!txt) return null;
    const link = node.querySelector(".el-link")?.value.trim();
    const out = { type, text: txt, align };
    if (link) out.link = link;
    return out;
  }
  if (type === "image" || type === "video") {
    return node.dataset.url ? { type, url: node.dataset.url, path: node.dataset.path || "", align } : null;
  }
  if (type === "album" || type === "photobar") {
    const items = [...node.querySelectorAll(".alb-thumb")].filter((t) => t.dataset.url)
      .map((t) => ({ url: t.dataset.url, path: t.dataset.path || "" }));
    return items.length ? { type, items, align } : null;
  }
  if (type === "button") {
    const label = node.querySelector(".pb-btn").innerText.trim();
    const url = node.querySelector(".btn-url").value.trim();
    return url ? { type, label, url, align } : null;
  }
  if (type === "spacer") return { type, height: node.dataset.height || "40" };
  return null;
}

function serialize() {
  const rows = [...canvas.querySelectorAll(".pb-row")].map((row) => ({
    columns: [...row.querySelectorAll(".pb-col")].map((col) => ({
      elements: [...col.querySelectorAll(":scope > .pb-el")].map(readEl).filter(Boolean),
    })),
  })).filter((r) => r.columns.some((c) => c.elements.length));
  return { rows };
}

/* ======================= DEVICE PREVIEW ======================= */
document.querySelectorAll("[data-dev]").forEach((b) =>
  b.addEventListener("click", () => {
    document.querySelector(".pb-stage").className = "pb-stage " + b.dataset.dev;
    document.querySelectorAll("[data-dev]").forEach((x) => x.classList.toggle("on", x === b));
  })
);

/* ======================= SAVE ======================= */
async function up(file) {
  const type = file.type.startsWith("video/") ? "video" : "image";
  const safe = file.name.replace(/[^\w.\-]/g, "_");
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safe}`;
  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, file, { cacheControl: "3600", upsert: false });
  if (error) throw error;
  return { url: supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl, path, type };
}

$("save-btn").addEventListener("click", async () => {
  if (!$("title").value.trim()) return setStatus("Give it a name / title first.", true);
  try {
    setStatus("Uploading…");
    let cover = null;
    if (coverState.file) { const u = await up(coverState.file); cover = { url: u.url, path: u.path }; }
    else if (coverState.url) cover = { url: coverState.url, path: coverState.path };

    // upload any pending media in the canvas
    for (const node of canvas.querySelectorAll(".pb-el")) {
      const t = node.dataset.type;
      if ((t === "image" || t === "video") && node._file) {
        const u = await up(node._file); node.dataset.url = u.url; node.dataset.path = u.path; node._file = null;
      }
      if (t === "album" || t === "photobar") {
        for (const th of node.querySelectorAll(".alb-thumb")) {
          if (th._file) { const u = await up(th._file); th.dataset.url = u.url; th.dataset.path = u.path; th._file = null; }
        }
      }
    }

    const layout = serialize();
    setStatus("Publishing…");
    const rec = {
      category: $("category").value,
      title: $("title").value.trim(),
      event_date: $("event-date").value || null,
      cover, layout, content: [],
    };
    const res = editingId
      ? await supabase.from("posts").update(rec).eq("id", editingId)
      : await supabase.from("posts").insert(rec);
    if (res.error) return setStatus("Could not save: " + res.error.message, true);

    setStatus(editingId ? "Saved ✓" : "Published ✓");
    resetBuilder();
    loadPosts();
  } catch (e) {
    setStatus("Upload failed: " + e.message, true);
  }
});

/* ======================= NEW / RESET / LOAD ======================= */
$("new-btn").addEventListener("click", resetBuilder);
$("add-row").addEventListener("click", () => addRow());

function resetBuilder() {
  editingId = null;
  $("builder-title").textContent = "Builder";
  $("title").value = "";
  $("category").value = "events";
  $("event-date").value = "";
  coverState = {};
  renderCover();
  canvas.innerHTML = "";
  addRow();
  setStatus("");
}

// convert an old content[] post into a single-column layout so it can be edited
function contentToLayout(post) {
  const els = (Array.isArray(post.content) ? post.content : []).map((b) =>
    b.type === "link" ? { ...b, type: "button" } : b
  );
  return { rows: [{ columns: [{ elements: els }] }] };
}

function loadPost(post) {
  editingId = post.id;
  $("builder-title").textContent = "Editing";
  $("category").value = post.category || "events";
  $("title").value = post.title || "";
  $("event-date").value = post.event_date || "";
  coverState = post.cover ? { url: post.cover.url, path: post.cover.path } : {};
  renderCover();
  canvas.innerHTML = "";
  const layout = post.layout && Array.isArray(post.layout.rows) && post.layout.rows.length
    ? post.layout : contentToLayout(post);
  layout.rows.forEach((r) => addRow(r));
  if (!canvas.children.length) addRow();
  setStatus("Editing “" + post.title + "”");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ======================= LIST / DELETE ======================= */
async function loadPosts() {
  const { data, error } = await supabase.from("posts").select("*").order("created_at", { ascending: false });
  const list = $("post-list");
  if (error) { list.innerHTML = `<p class="status error">${error.message}</p>`; return; }
  currentPosts = data;
  if (!data.length) { list.innerHTML = `<p class="muted">No posts yet.</p>`; return; }
  list.innerHTML = data.map((p) => `
    <div class="row">
      <span class="tag">${p.category}</span>
      <span class="row-title">${escapeHtml(p.title)}</span>
      <button data-edit="${p.id}" class="btn-ghost small">Edit</button>
      <button data-del="${p.id}" class="del">Delete</button>
    </div>`).join("");
  list.querySelectorAll("[data-edit]").forEach((b) =>
    b.addEventListener("click", () => loadPost(currentPosts.find((p) => p.id === b.dataset.edit))));
  list.querySelectorAll("[data-del]").forEach((b) =>
    b.addEventListener("click", () => deletePost(b.dataset.del)));
}

function pathsOf(post) {
  const paths = [];
  if (post?.cover?.path) paths.push(post.cover.path);
  const scanEls = (els) => (els || []).forEach((e) => {
    if (e.path) paths.push(e.path);
    if (e.type === "album" || e.type === "photobar") (e.items || []).forEach((i) => i.path && paths.push(i.path));
  });
  if (post?.layout?.rows) post.layout.rows.forEach((r) => (r.columns || []).forEach((c) => scanEls(c.elements)));
  scanEls(post?.content);
  (post?.media || []).forEach((m) => m.path && paths.push(m.path));
  return paths;
}

async function deletePost(id) {
  if (!confirm("Delete this post?")) return;
  const post = currentPosts.find((p) => p.id === id);
  const paths = pathsOf(post);
  if (paths.length) await supabase.storage.from(MEDIA_BUCKET).remove(paths);
  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) return setStatus(error.message, true);
  if (editingId === id) resetBuilder();
  loadPosts();
}

/* ======================= BOOT ======================= */
let booted = false;
function boot() {
  if (booted) return;
  booted = true;
  // rows are reorderable; palette clones elements into columns
  new Sortable(canvas, { group: "rows", handle: ".pb-row-handle", draggable: ".pb-row", animation: 150 });
  new Sortable($("palette"), { group: { name: "elements", pull: "clone", put: false }, sort: false, draggable: ".widget" });
  addRow();
}

if (NOT_CONFIGURED) setStatus("Edit config.js with your Supabase URL and anon key first.", true);
renderCover();
boot();
refreshView();
