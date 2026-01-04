document.addEventListener("DOMContentLoaded", () => {
  const qs = (s, ctx = document) => ctx.querySelector(s);
  const qsa = (s, ctx = document) => Array.from(ctx.querySelectorAll(s));

  // Footer year
  const yearEl = qs("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Scroll progress bar
  const scrollFill = qs(".scroll-bar__fill");
  const updateScrollBar = () => {
    if (!scrollFill) return;
    const doc = document.documentElement;
    const max = Math.max(1, doc.scrollHeight - doc.clientHeight);
    const val = (doc.scrollTop / max) * 100;
    scrollFill.style.width = `${val}%`;
  };
  window.addEventListener("scroll", updateScrollBar, { passive: true });
  updateScrollBar();

  // Overlay nav open/close
  const overlay = qs(".overlay");
  const openBtn = qs(".lux-menu-btn");
  const closeBtn = qs(".overlay__close");

  const setOverlayState = (open) => {
    if (!overlay || !openBtn) return;
    overlay.classList.toggle("overlay--open", open);
    overlay.setAttribute("aria-hidden", open ? "false" : "true");
    openBtn.setAttribute("aria-expanded", open ? "true" : "false");
    document.body.style.overflow = open ? "hidden" : "";
  };

  openBtn?.addEventListener("click", () => setOverlayState(true));
  closeBtn?.addEventListener("click", () => setOverlayState(false));

  overlay?.addEventListener("click", (e) => {
    if (e.target === overlay) setOverlayState(false);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay?.classList.contains("overlay--open")) {
      setOverlayState(false);
    }
  });

  // Close overlay after clicking a link
  qsa(".overlay__link").forEach((a) => {
    a.addEventListener("click", () => setOverlayState(false));
  });

  // Smooth scroll for internal anchors + buttons
  const headerOffset = () => {
    const h = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 78;
    return h + 10;
  };

  const smoothTo = (target) => {
    const el = typeof target === "string" ? qs(target) : target;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.pageYOffset - headerOffset();
    window.scrollTo({ top, behavior: "smooth" });
  };

  qsa('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href");
      if (!href || href === "#") return;
      const target = qs(href);
      if (!target) return;
      e.preventDefault();
      smoothTo(target);
    });
  });

  qsa("[data-scroll-target]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const t = btn.getAttribute("data-scroll-target");
      if (t) smoothTo(t);
    });
  });

  // Reveal on scroll
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("in-view");
      });
    },
    { threshold: 0.12 }
  );

  qsa(".reveal").forEach((el) => io.observe(el));

  // Tilt (clean + restrained)
  const tiltEls = qsa("[data-tilt]");
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  tiltEls.forEach((el) => {
    const intensityAttr = el.getAttribute("data-tilt-intensity");
    const base = intensityAttr === "strong" ? 12 : 8;

    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;

      const rx = clamp((0.5 - y) * base, -base, base);
      const ry = clamp((x - 0.5) * base, -base, base);

      el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-1px)`;
    };

    const onLeave = () => {
      el.style.transform = "";
    };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
  });

  // Form demo submit
  const form = qs(".contact-form");
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    alert("Danke! Deine Anfrage ist eingegangen – wir melden uns zeitnah");
  });
});
