(() => {
  const $ = (s, p=document) => p.querySelector(s);
  const $$ = (s, p=document) => Array.from(p.querySelectorAll(s));

  const scrollFill = $("#scrollFill");
  const year = $("#year");
  const menuBtn = $("#menuBtn");
  const overlay = $("#overlayNav");
  const overlayClose = $("#overlayClose");

  // Footer year
  if (year) year.textContent = new Date().getFullYear();

  // Scroll progress
  const updateScrollBar = () => {
    if (!scrollFill) return;
    const doc = document.documentElement;
    const scrollTop = doc.scrollTop || document.body.scrollTop;
    const scrollHeight = doc.scrollHeight - doc.clientHeight;
    const p = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    scrollFill.style.width = `${p}%`;
  };
  window.addEventListener("scroll", updateScrollBar, { passive: true });
  updateScrollBar();

  // Overlay toggle
  const openOverlay = () => {
    overlay?.classList.add("overlay--open");
    if (overlay) overlay.setAttribute("aria-hidden", "false");
    if (menuBtn) menuBtn.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  };
  const closeOverlay = () => {
    overlay?.classList.remove("overlay--open");
    if (overlay) overlay.setAttribute("aria-hidden", "true");
    if (menuBtn) menuBtn.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  };

  menuBtn?.addEventListener("click", () => {
    if (!overlay) return;
    overlay.classList.contains("overlay--open") ? closeOverlay() : openOverlay();
  });
  overlayClose?.addEventListener("click", closeOverlay);
  overlay?.addEventListener("click", (e) => {
    if (e.target === overlay) closeOverlay();
  });
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeOverlay();
  });

  // Smooth scroll with fixed header offset
  const headerOffset = () => {
    const h = getComputedStyle(document.documentElement).getPropertyValue("--header-h").trim();
    const n = parseInt(h || "78", 10);
    return Number.isFinite(n) ? n : 78;
  };

  const smoothTo = (hash) => {
    const id = (hash || "").replace("#", "");
    const el = document.getElementById(id);
    if (!el) return;

    const y = el.getBoundingClientRect().top + window.pageYOffset - (headerOffset() + 14);
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  // Intercept internal anchor clicks
  const onAnchorClick = (a) => {
    const href = a.getAttribute("href") || "";
    if (!href.startsWith("#")) return;

    a.addEventListener("click", (e) => {
      e.preventDefault();
      closeOverlay();
      smoothTo(href);
      history.replaceState(null, "", href);
    });
  };

  $$('a[href^="#"]').forEach(onAnchorClick);

  // Reveal on scroll
  const revealEls = $$(".reveal");
  const io = new IntersectionObserver((entries) => {
    entries.forEach((ent) => {
      if (ent.isIntersecting) ent.target.classList.add("in-view");
    });
  }, { threshold: 0.12 });

  revealEls.forEach(el => io.observe(el));

  // If page opened with hash
  if (location.hash) {
    // give layout a moment (fonts etc.)
    window.addEventListener("load", () => smoothTo(location.hash), { once: true });
  }

  // Dummy form submit (nur UI)
  const form = $("#contactForm");
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    // Hier würdest du dein echtes Mail/Backend triggern.
    // Aktuell nur: "ok" UI, kein redirect.
    form.reset();
  });
})();
