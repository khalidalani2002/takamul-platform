// Public-page interactivity: click-to-enlarge lightbox + auto-advancing photo-bars.

let lightbox;
function ensureLightbox() {
  if (lightbox) return lightbox;
  lightbox = document.createElement("div");
  lightbox.className = "lightbox";
  lightbox.innerHTML = `<button class="lb-close" aria-label="Close">✕</button><img class="lb-img" alt="" />`;
  lightbox.addEventListener("click", (e) => { if (e.target !== lightbox.querySelector(".lb-img")) close(); });
  document.body.appendChild(lightbox);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
  return lightbox;
}
function open(src) {
  ensureLightbox();
  lightbox.querySelector(".lb-img").src = src;
  lightbox.classList.add("on");
  document.body.style.overflow = "hidden";
}
function close() {
  if (!lightbox) return;
  lightbox.classList.remove("on");
  document.body.style.overflow = "";
}

function initLightbox(root = document) {
  root.querySelectorAll("img.post-media, img.album-img, .pbar-slide").forEach((img) => {
    if (img.dataset.lb) return;
    img.dataset.lb = "1";
    img.style.cursor = "zoom-in";
    img.addEventListener("click", (e) => { e.stopPropagation(); open(img.src); });
  });
}

function initPhotobars(root = document) {
  root.querySelectorAll("[data-photobar]").forEach((bar) => {
    if (bar.dataset.init) return;
    bar.dataset.init = "1";
    const slides = [...bar.querySelectorAll(".pbar-slide")];
    const dots = [...bar.querySelectorAll(".pbar-dot")];
    if (slides.length < 2) { bar.querySelectorAll(".pbar-nav,.pbar-dots").forEach((n) => n.remove()); return; }
    let i = 0, timer;
    const show = (n) => {
      i = (n + slides.length) % slides.length;
      slides.forEach((s, k) => s.classList.toggle("on", k === i));
      dots.forEach((d, k) => d.classList.toggle("on", k === i));
    };
    const play = () => { clearInterval(timer); timer = setInterval(() => show(i + 1), 4000); };
    bar.querySelector(".next").addEventListener("click", (e) => { e.stopPropagation(); show(i + 1); play(); });
    bar.querySelector(".prev").addEventListener("click", (e) => { e.stopPropagation(); show(i - 1); play(); });
    dots.forEach((d, k) => d.addEventListener("click", (e) => { e.stopPropagation(); show(k); play(); }));
    bar.addEventListener("mouseenter", () => clearInterval(timer));
    bar.addEventListener("mouseleave", play);
    play();
  });
}

export function initViewer(root = document) {
  initPhotobars(root);
  initLightbox(root);
}
