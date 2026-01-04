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
