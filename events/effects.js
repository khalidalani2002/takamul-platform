/* ============================================================
   Shared background + scroll effects for every page.
   - starfield + soft glowing orbs + shooting stars
   - scroll-reveal "shine" text (IntersectionObserver, reliable)
   - fade-in reveal
   ============================================================ */

function makeStars() {
  const layer = document.getElementById("bgLayer");
  if (!layer) return;
  const frag = document.createDocumentFragment();

  const pageH = Math.max(document.body.scrollHeight, window.innerHeight);

  // Stars — lighter density than before so repaints stay cheap.
  const density = Math.round(pageH / 95);
  const N = Math.min(170, Math.max(80, density));
  for (let i = 0; i < N; i++) {
    const s = document.createElement("span");
    s.className = "twinkle-star";
    const size = (Math.random() * 1.6 + 0.8).toFixed(1);
    s.style.setProperty("--size", size + "px");
    s.style.setProperty("--peak", (0.4 + Math.random() * 0.5).toFixed(2));
    s.style.setProperty("--dur", (3 + Math.random() * 5).toFixed(1) + "s");
    s.style.setProperty("--delay", (Math.random() * 6).toFixed(1) + "s");
    s.style.top = (Math.random() * 100).toFixed(2) + "%";
    s.style.left = (Math.random() * 100).toFixed(2) + "%";
    const cross = document.createElement("span");
    cross.className = "cross";
    s.appendChild(cross);
    frag.appendChild(s);
  }

  // Soft glowing orbs (replaces the old grey "planets").
  const vh = window.innerHeight;
  const sections = Math.max(3, Math.round(pageH / vh));
  const orbCount = Math.min(7, sections + 1);
  for (let i = 0; i < orbCount; i++) {
    const o = document.createElement("div");
    const isLarge = i % 3 === 0;
    o.className = "orb" + (isLarge ? " orb-lg" : "");
    const size = isLarge ? 90 + Math.random() * 110 : 22 + Math.random() * 34;
    o.style.setProperty("--osize", size.toFixed(0) + "px");
    o.style.setProperty("--odur", (34 + Math.random() * 30).toFixed(0) + "s");
    o.style.setProperty("--odelay", (-Math.random() * 30).toFixed(0) + "s");
    const topPct = ((i + 0.2 + Math.random() * 0.6) / orbCount) * 100;
    o.style.top = topPct.toFixed(1) + "%";
    o.style.left = (6 + Math.random() * 82).toFixed(1) + "%";
    frag.appendChild(o);
  }

  // A couple of slow shooting stars.
  for (let i = 0; i < 2; i++) {
    const sh = document.createElement("span");
    sh.className = "shooting-star";
    sh.style.top = (5 + Math.random() * 80).toFixed(1) + "%";
    sh.style.setProperty("--sdur", (20 + Math.random() * 14).toFixed(1) + "s");
    sh.style.setProperty("--sdelay", (Math.random() * 18).toFixed(1) + "s");
    frag.appendChild(sh);
  }

  layer.appendChild(frag);
}

/* Scroll-reveal "shine" text — Arabic-safe (clip-path keeps ligatures intact). */
function initScrollType() {
  const els = document.querySelectorAll(".scroll-type");
  if (!els.length) return;

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("done");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.2, rootMargin: "0px 0px -8% 0px" }
  );

  els.forEach((el) => {
    const text = (el.dataset.text || el.textContent).trim();
    el.textContent = "";
    const ghost = document.createElement("span");
    ghost.className = "st-ghost";
    ghost.textContent = text;
    const fill = document.createElement("span");
    fill.className = "st-fill";
    fill.textContent = text;
    el.appendChild(ghost);
    el.appendChild(fill);
    io.observe(el);
  });
}

/* Fade-in reveal for cards / sections. */
function observeReveal() {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  document.querySelectorAll(".reveal, .quote-section, .closing").forEach((el) => {
    el.classList.add("reveal");
    io.observe(el);
  });
}

function initEffects() {
  // small delay so layout (incl. any rendered grid) settles before measuring height.
  // setTimeout (not rAF) so it still runs if the tab loads in the background.
  setTimeout(makeStars, 60);
  initScrollType();
  observeReveal();
}

if (document.readyState !== "loading") initEffects();
else document.addEventListener("DOMContentLoaded", initEffects);
