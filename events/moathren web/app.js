const influencers = [
  { name: "Faten Hattab",   img: "images/faten_hattab.jpg",   followers: "1.3M", tag: "Public Relations · Lifestyle",  desc: "شخصية إعلامية وحضور مؤثر",   url: "https://www.instagram.com/faten_alhatab" },
  { name: "Nabaa Nahith",   img: "images/nabaa_nahith.jpg",   followers: "507K", tag: "Business & Tech",               desc: "مصداقية عالية للتطوير",       url: "https://www.instagram.com/nabaa.nahith" },
  { name: "Sarah Alrubaie", img: "images/sarah_alrubaie.jpg", followers: "456K", tag: "Lifestyle · Premium",           desc: "جمهور نوعي للبراندات الفاخرة",  url: "https://www.instagram.com/sarah_alruba3e" },
  { name: "Om Shahim",      img: "images/om_shahim.jpg",      followers: "444K", tag: "Public Relations · Lifestyle",  desc: "حضور راقٍ وثقة عالية",         url: "https://www.instagram.com/za.hu10" },
  { name: "Karrar Ibrahim", img: "images/karrar_ibrahim.jpg", followers: "384K", tag: "Tech & Travel",                 desc: "محتوى ذكي وسريع الانتشار",    url: "https://www.instagram.com/karrar_ibr" },
  { name: "Ali Aspirin",    img: "images/ali_aspirin.jpg",    followers: "308K", tag: "Health & Medical · Lifestyle",  desc: "موثوقية عالية",                url: "https://www.instagram.com/aspirin.iq" },
  { name: "Hajer Sadiq",    img: "images/hajer_sadiq.jpg",    followers: "269K", tag: "Lifestyle & Daily",             desc: "محتوى قريب من الجمهور",       url: "https://www.instagram.com/eng.hajir_sadiq" },
  { name: "Ahmed Salim",    img: "images/ahmed_salim.jpg",    followers: "211K", tag: "Career Coach · Legal & Hiring", desc: "محامي ومترجم مستشار مهني",    url: "https://www.instagram.com/ahmedsalim.jobs" },
  { name: "Ali Pharmacy",   img: "images/ali_pharmacy.jpg",   followers: "175K", tag: "Health & Medical",              desc: "ثقة علمية ومجتمعية",           url: "https://www.instagram.com/3ley3" },
  { name: "Hiba Beauty",    img: "images/hiba_beauty.jpg",    followers: "171K", tag: "Beauty & Cosmetics",            desc: "مثالية لمنتجات التجميل",       url: "https://www.instagram.com/hiba.beauty.99" },
  { name: "Israa Ismail",   img: "images/israa_ismail.jpg",   followers: "165K", tag: "Lifestyle",                     desc: "حضور مميز وتفاعل حقيقي",       url: "https://www.instagram.com/israa.ismaill" },
  { name: "Ihab Alawady",   img: "images/ihab_alawady.jpg",   followers: "53K",  tag: "Lifestyle & Impact",            desc: "حضور قوي ومؤثر",                url: "https://www.instagram.com/ihab_alawady" },
];

/* ---------- GRID ---------- */
function renderGrid() {
  const grid = document.getElementById("grid");
  grid.innerHTML = influencers.map(p => `
    <a class="card reveal" href="${p.url}" target="_blank" rel="noopener noreferrer" aria-label="${p.name} on Instagram">
      <div class="photo-frame">
        <img src="${p.img}" alt="${p.name}" loading="lazy" />
        <div class="photo-shine"></div>
      </div>
      <div class="card-body">
        <h3 class="card-name">${p.name}</h3>
        <p class="card-followers">Followers: <span class="num">${p.followers}</span></p>
        <div class="divider-line"></div>
        <p class="card-tag">${p.tag}</p>
        <p class="card-desc">${p.desc}</p>
        <div class="card-cta">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
          <span>View Profile</span>
        </div>
      </div>
    </a>
  `).join("");
}

/* ---------- STARS + PLANETS scattered along the page ---------- */
function makeStars() {
  const layer = document.getElementById("bgLayer");
  if (!layer) return;
  const frag = document.createDocumentFragment();

  // stars — density scales with page height
  const pageH = Math.max(document.body.scrollHeight, window.innerHeight);
  const density = Math.round(pageH / 60); // ~1 star per 60px of page
  const N = Math.min(400, Math.max(120, density));
  for (let i = 0; i < N; i++) {
    const s = document.createElement("span");
    s.className = "twinkle-star";
    const size = (Math.random() * 2 + 1).toFixed(1);
    s.style.setProperty("--size", size + "px");
    s.style.setProperty("--peak", (0.5 + Math.random() * 0.5).toFixed(2));
    s.style.setProperty("--dur", (3 + Math.random() * 5).toFixed(1) + "s");
    s.style.setProperty("--delay", (Math.random() * 6).toFixed(1) + "s");
    s.style.top = (Math.random() * 100).toFixed(2) + "%";
    s.style.left = (Math.random() * 100).toFixed(2) + "%";
    const cross = document.createElement("span");
    cross.className = "cross";
    s.appendChild(cross);
    frag.appendChild(s);
  }

  // planets — small, scattered every viewport-ish down the page
  const vh = window.innerHeight;
  const sections = Math.max(3, Math.round(pageH / vh));
  const planetCount = Math.min(10, sections + 2);
  const variants = ["plain", "warm", "plain ringed", "warm ringed", "plain"];
  for (let i = 0; i < planetCount; i++) {
    const p = document.createElement("div");
    const variant = variants[i % variants.length];
    p.className = "planet " + variant;
    const size = 26 + Math.random() * 34; // 26–60px
    p.style.setProperty("--psize", size.toFixed(0) + "px");
    p.style.setProperty("--pdur", (35 + Math.random() * 30).toFixed(0) + "s");
    p.style.setProperty("--pdelay", (-Math.random() * 30).toFixed(0) + "s");
    p.style.setProperty("--pring", (Math.random() * 60 - 30).toFixed(0) + "deg");
    // spread vertically across the page
    const topPct = ((i + 0.15 + Math.random() * 0.7) / planetCount) * 100;
    p.style.top = topPct.toFixed(1) + "%";
    p.style.left = (5 + Math.random() * 88).toFixed(1) + "%";
    frag.appendChild(p);
  }

  // slow shooting stars
  for (let i = 0; i < 3; i++) {
    const sh = document.createElement("span");
    sh.className = "shooting-star";
    sh.style.top = (5 + Math.random() * 90).toFixed(1) + "%";
    sh.style.setProperty("--sdur", (22 + Math.random() * 14).toFixed(1) + "s");
    sh.style.setProperty("--sdelay", (Math.random() * 20).toFixed(1) + "s");
    frag.appendChild(sh);
  }

  layer.appendChild(frag);
}

/* ---------- SCROLL TYPEWRITER (Arabic-safe, one-way) ---------- */
function initScrollType() {
  const els = document.querySelectorAll(".scroll-type");
  const targets = [];
  els.forEach(el => {
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
    // dynamic sweep duration + step count so it feels like typing
    const dur  = Math.min(2.8, Math.max(1.0, text.length * 0.05));
    const step = Math.max(8, Math.round(text.length / 1.3));
    fill.style.transition = `clip-path ${dur}s steps(${step}, end)`;
    targets.push({ el, fired: false });
  });

  function update() {
    const vh = window.innerHeight;
    for (const t of targets) {
      if (t.fired) continue;
      const rect = t.el.getBoundingClientRect();
      if (rect.top < vh * 0.78 && rect.bottom > 0) {
        t.fired = true;
        requestAnimationFrame(() => t.el.classList.add("done"));
      }
    }
  }

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { update(); ticking = false; });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  update();
}

/* ---------- REVEAL ---------- */
function observeReveal() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal, .quote-section, .closing").forEach(el => {
    el.classList.add("reveal");
    io.observe(el);
  });
}

renderGrid();
// wait a frame so grid layout settles before measuring page height
requestAnimationFrame(() => makeStars());
initScrollType();
observeReveal();
