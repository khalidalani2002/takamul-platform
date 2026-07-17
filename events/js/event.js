// Event detail page: fetch one post by ?id= and render its full content.
import { supabase, NOT_CONFIGURED } from "./supabase-client.js";
import { escapeHtml, bodyHtml, coverUrl, displayDate } from "./render.js";
import { initViewer } from "./viewer.js";

const id = new URLSearchParams(location.search).get("id");
const wrap = document.getElementById("article");

function notFound(msg) {
  wrap.innerHTML = `
    <div class="content">
      ${escapeHtml(msg)}<br /><a class="back-link" href="events.html">← Back to events</a>
    </div>`;
}

async function load() {
  if (NOT_CONFIGURED) return notFound("Connect Supabase in config.js first.");
  if (!id) return notFound("No event selected.");

  const { data, error } = await supabase.from("posts").select("*").eq("id", id).single();
  if (error || !data) return notFound("Event not found.");

  document.title = `${data.title} — Takamul`;
  const cover = coverUrl(data);
  wrap.innerHTML = `
    <a class="back-link" href="events.html">← Back to events</a>
    <article class="post-card">
      <div class="post-body">
        ${cover ? `<img class="post-cover" src="${cover}" alt="" />` : ""}
        <h1 class="post-title" dir="auto">${escapeHtml(data.title)}</h1>
        <time class="post-date">${displayDate(data)}</time>
        ${bodyHtml(data)}
      </div>
    </article>`;
  initViewer(wrap);
}

load();
