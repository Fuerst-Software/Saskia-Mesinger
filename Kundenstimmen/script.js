// Data (leer lassen bis echte Stimmen vorhanden sind)
const TESTIMONIALS = [];

// Elements
const grid = document.getElementById('testimonialsGrid');
const empty = document.getElementById('emptyState');
const countPill = document.getElementById('countPill');
const searchInput = document.getElementById('searchInput');
const categorySelect = document.getElementById('categorySelect');

function esc(s){
  return String(s ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}
function normalize(s){ return String(s ?? "").toLowerCase().trim(); }

function formatDate(iso){
  if(!iso) return "";
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if(!m) return iso;
  return `${m[3]}.${m[2]}.${m[1]}`;
}

function matches(t, q, cat){
  const hay = [t.name, t.company, t.category, t.project, t.quote].map(normalize).join(" ");
  const okQ = !q || hay.includes(q);
  const okC = !cat || normalize(t.category) === normalize(cat);
  return okQ && okC;
}

function render(list){
  if (!grid) return;

  grid.innerHTML = list.map(t => {
    const name = esc(t.name || "Anonym");
    const subParts = [t.company, t.project].filter(Boolean).map(esc);
    const sub = subParts.length ? subParts.join(" • ") : "—";
    const tag = t.category ? `<span class="tag">${esc(t.category)}</span>` : `<span class="tag">Feedback</span>`;
    const date = t.date ? esc(formatDate(t.date)) : "";
    const link = (t.linkText && t.linkUrl)
      ? `<a class="tcard__link" href="${esc(t.linkUrl)}">${esc(t.linkText)}</a>`
      : "";

    const quoteHtml = String(t.quote || "")
      .split("\n")
      .filter(Boolean)
      .map(p => `<p>${esc(p)}</p>`)
      .join("");

    return `
      <article class="tcard">
        <div class="tcard__top">
          <div class="tcard__meta">
            <h3 class="tcard__name">${name}</h3>
            <p class="tcard__sub">${sub}</p>
          </div>
          ${tag}
        </div>

        <div class="tcard__quote">${quoteHtml}</div>

        <div class="tcard__foot">
          <span>${date}</span>
          <span>${link}</span>
        </div>
      </article>
    `;
  }).join("");

  const n = list.length;
  if (countPill) countPill.textContent = `${n} ${n === 1 ? "Eintrag" : "Einträge"}`;

  if (empty) empty.style.display = (TESTIMONIALS.length === 0) ? "block" : "none";
}

function applyFilters(){
  const q = normalize(searchInput?.value);
  const cat = categorySelect?.value || "";
  const filtered = TESTIMONIALS.filter(t => matches(t, q, cat));
  render(filtered);
}

if (searchInput) searchInput.addEventListener('input', applyFilters);
if (categorySelect) categorySelect.addEventListener('change', applyFilters);

// Initial
render(TESTIMONIALS);

// Scrollbar + Year + Reveal
const fill = document.getElementById('scrollFill');
const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

function onScroll(){
  const h = document.documentElement;
  const max = (h.scrollHeight - h.clientHeight) || 1;
  const p = (h.scrollTop / max) * 100;
  if (fill) fill.style.width = p + "%";
}
window.addEventListener('scroll', onScroll, { passive:true });
onScroll();

const io = new IntersectionObserver((entries)=>{
  entries.forEach(e => e.target.classList.toggle('in', e.isIntersecting));
}, { threshold: 0.14 });

document.querySelectorAll('.reveal').forEach(el => io.observe(el));
