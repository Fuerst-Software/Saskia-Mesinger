// Scrollbar + Year
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

// Reveal
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e => e.target.classList.toggle('in', e.isIntersecting));
}, { threshold: 0.14 });

document.querySelectorAll('.reveal').forEach(el => io.observe(el));
// ===== FAQ Search =====
const faqInput = document.getElementById('faqSearch');
const faqClear = document.getElementById('faqClear');
const faqCount = document.getElementById('faqCount');
const faqEmpty = document.getElementById('faqEmpty');
const openAllBtn = document.getElementById('faqOpenAll');
const closeAllBtn = document.getElementById('faqCloseAll');

const faqItems = Array.from(document.querySelectorAll('.faq .faq__item'));

function norm(s){
  return (s || "").toLowerCase().replace(/\s+/g, " ").trim();
}

function updateFaq(){
  const q = norm(faqInput?.value);
  let visible = 0;

  faqItems.forEach(item => {
    const text = norm(item.textContent);
    const hit = !q || text.includes(q);
    item.hidden = !hit;
    if (hit) visible++;
  });

  if (faqCount) faqCount.textContent = `${visible} Treffer`;
  if (faqEmpty) faqEmpty.style.display = (visible === 0) ? "block" : "none";

  const hasQuery = !!q;
  if (faqClear) faqClear.style.display = hasQuery ? "inline-flex" : "none";

  // Optional UX: Wenn gesucht wird, alle sichtbaren schließen (damit Liste übersichtlich bleibt)
  // Wenn du das nicht willst, diese Zeilen raus.
  if (hasQuery) {
    faqItems.forEach(item => { if (!item.hidden) item.open = false; });
  }
}

if (faqInput) faqInput.addEventListener('input', updateFaq);

if (faqClear) {
  faqClear.addEventListener('click', () => {
    faqInput.value = "";
    updateFaq();
    faqInput.focus();
  });
}

if (openAllBtn) {
  openAllBtn.addEventListener('click', () => {
    faqItems.forEach(item => { if (!item.hidden) item.open = true; });
  });
}

if (closeAllBtn) {
  closeAllBtn.addEventListener('click', () => {
    faqItems.forEach(item => { if (!item.hidden) item.open = false; });
  });
}

// Initial count
updateFaq();
// ===== FAQ Treffer-Anzeige: Zahl erst bei Eingabe =====
(function(){
  const input = document.getElementById('faqSearch');
  const count = document.getElementById('faqCount');

  if (!input || !count) return;

  function updateLabel(){
    const hasQuery = input.value.trim().length > 0;
    if (!hasQuery){
      count.textContent = 'Treffer';
    }
  }

  // Initialzustand
  updateLabel();

  // Bei jeder Eingabe prüfen
  input.addEventListener('input', updateLabel);

  // Falls Reset-Button genutzt wird
  const clear = document.getElementById('faqClear');
  if (clear){
    clear.addEventListener('click', () => {
      setTimeout(updateLabel, 0);
    });
  }
})();
