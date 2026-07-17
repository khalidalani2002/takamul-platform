const influencers = [
  { name: "Faten Hattab",   img: "images/faten_hattab.webp",   followers: "1.3M", tag: "Public Relations · Lifestyle",  desc: "شخصية إعلامية وحضور مؤثر",   url: "https://www.instagram.com/faten_alhatab" },
  { name: "Nabaa Nahith",   img: "images/nabaa_nahith.webp",   followers: "507K", tag: "Business & Tech",               desc: "مصداقية عالية للتطوير",       url: "https://www.instagram.com/nabaa.nahith" },
  { name: "Sarah Alrubaie", img: "images/sarah_alrubaie.webp", followers: "456K", tag: "Lifestyle · Premium",           desc: "جمهور نوعي للبراندات الفاخرة",  url: "https://www.instagram.com/sarah_alruba3e" },
  { name: "Om Shahim",      img: "images/om_shahim.webp",      followers: "444K", tag: "Public Relations · Lifestyle",  desc: "حضور راقٍ وثقة عالية",         url: "https://www.instagram.com/za.hu10" },
  { name: "Karrar Ibrahim", img: "images/karrar_ibrahim.webp", followers: "384K", tag: "Tech & Travel",                 desc: "محتوى ذكي وسريع الانتشار",    url: "https://www.instagram.com/karrar_ibr" },
  { name: "Ali Aspirin",    img: "images/ali_aspirin.webp",    followers: "308K", tag: "Health & Medical · Lifestyle",  desc: "موثوقية عالية",                url: "https://www.instagram.com/aspirin.iq" },
  { name: "Hajer Sadiq",    img: "images/hajer_sadiq.webp",    followers: "269K", tag: "Lifestyle & Daily",             desc: "محتوى قريب من الجمهور",       url: "https://www.instagram.com/eng.hajir_sadiq" },
  { name: "Ahmed Salim",    img: "images/ahmed_salim.webp",    followers: "211K", tag: "Career Coach · Legal & Hiring", desc: "محامي ومترجم مستشار مهني",    url: "https://www.instagram.com/ahmedsalim.jobs" },
  { name: "Ali Pharmacy",   img: "images/ali_pharmacy.webp",   followers: "175K", tag: "Health & Medical",              desc: "ثقة علمية ومجتمعية",           url: "https://www.instagram.com/3ley3" },
  { name: "Hiba Beauty",    img: "images/hiba_beauty.webp",    followers: "171K", tag: "Beauty & Cosmetics",            desc: "مثالية لمنتجات التجميل",       url: "https://www.instagram.com/hiba.beauty.99" },
  { name: "Israa Ismail",   img: "images/israa_ismail.webp",   followers: "165K", tag: "Lifestyle",                     desc: "حضور مميز وتفاعل حقيقي",       url: "https://www.instagram.com/israa.ismaill" },
  { name: "Ihab Alawady",   img: "images/ihab_alawady.webp",   followers: "53K",  tag: "Lifestyle & Impact",            desc: "حضور قوي ومؤثر",                url: "https://www.instagram.com/ihab_alawady" },
];

function renderGrid() {
  const grid = document.getElementById("grid");
  if (!grid) return;
  grid.innerHTML = influencers.map((p) => `
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

// Render the grid immediately; effects.js then builds the starfield around it.
renderGrid();
