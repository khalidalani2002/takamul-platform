// Renders a page's posts. <body data-category="..." data-view="cards|article">
import { supabase, NOT_CONFIGURED } from "./supabase-client.js";
import { escapeHtml, bodyHtml, coverUrl, displayDate } from "./render.js";

const category = document.body.dataset.category;
const view = document.body.dataset.view || "article";
const feed = document.getElementById("feed");

function renderArticles(posts) {
  if (!posts.length) { feed.innerHTML = `<div class="content">No posts yet.</div>`; return; }
  feed.innerHTML = posts.map((p) => {
    const cover = coverUrl(p);
    return `
    <article class="post-card">
      <div class="post-body">
        ${cover ? `<img class="post-cover" src="${cover}" alt="" loading="lazy" />` : ""}
        <h2 class="post-title" dir="auto">${escapeHtml(p.title)}</h2>
        ${bodyHtml(p)}
        <time class="post-date">${displayDate(p)}</time>
      </div>
    </article>`;
  }).join("");
}

function renderCards(posts) {
  if (!posts.length) { feed.innerHTML = `<div class="content">Nothing here yet.</div>`; return; }
  feed.innerHTML = posts.map((p) => {
    const cover = coverUrl(p);
    const photo = cover
      ? `<img class="event-photo" src="${cover}" alt="" loading="lazy" />`
      : `<div class="event-photo empty"><span>TAKAMUL</span></div>`;
    return `
    <a class="event-card" href="event.html?id=${p.id}">
      ${photo}
      <div class="event-overlay">
        <h3 dir="auto">${escapeHtml(p.title)}</h3>
        <time>${displayDate(p)}</time>
      </div>
    </a>`;
  }).join("");
}

async function load() {
  if (NOT_CONFIGURED) {
    feed.innerHTML = `<div class="content">Connect Supabase in <code>config.js</code> to load posts.</div>`;
    return;
  }
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("category", category)
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (error) {
    feed.innerHTML = `<div class="content">Could not load posts: ${escapeHtml(error.message)}</div>`;
    return;
  }
  (view === "cards" ? renderCards : renderArticles)(data);
}

load();
