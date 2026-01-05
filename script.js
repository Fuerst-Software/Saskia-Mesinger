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
/* ===========================================================
   Goldschweif – dezente Maus-Interaktion (Parallax)
   (ans Ende von script.js)
=========================================================== */
(() => {
  const wrap = document.querySelector('.welcome-inline');
  if (!wrap) return;

  // Respect Reduced Motion
  const prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduce) return;

  let targetX = 0, targetY = 0, targetR = 0;
  let curX = 0, curY = 0, curR = 0;
  let raf = null;

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  const update = () => {
    // sanftes easing
    curX += (targetX - curX) * 0.08;
    curY += (targetY - curY) * 0.08;
    curR += (targetR - curR) * 0.08;

    wrap.style.setProperty('--swirl-x', `${curX.toFixed(2)}px`);
    wrap.style.setProperty('--swirl-y', `${curY.toFixed(2)}px`);
    wrap.style.setProperty('--swirl-r', `${curR.toFixed(3)}deg`);

    raf = requestAnimationFrame(update);
  };

  const onMove = (clientX, clientY) => {
    const r = wrap.getBoundingClientRect();
    const nx = (clientX - (r.left + r.width / 2)) / (r.width / 2);   // -1..1
    const ny = (clientY - (r.top + r.height / 2)) / (r.height / 2);  // -1..1

    // STUFE: sehr dezent (edler)
    targetX = clamp(nx * 14, -14, 14);   // px
    targetY = clamp(ny * 6, -6, 6);      // px
    targetR = clamp(nx * 0.9, -0.9, 0.9);// deg
  };

  // Start loop once
  raf = requestAnimationFrame(update);

  // Maus
  window.addEventListener('mousemove', (e) => onMove(e.clientX, e.clientY), { passive: true });

  // Touch: minimal reagieren (Fingerbewegung)
  window.addEventListener('touchmove', (e) => {
    if (!e.touches || !e.touches.length) return;
    const t = e.touches[0];
    onMove(t.clientX, t.clientY);
  }, { passive: true });

  // Wenn Maus raus: zurück zur Mitte
  window.addEventListener('mouseleave', () => {
    targetX = 0; targetY = 0; targetR = 0;
  });

  // Safety: falls Seite hidden -> CPU sparen
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (raf) cancelAnimationFrame(raf);
      raf = null;
    } else if (!raf) {
      raf = requestAnimationFrame(update);
    }
  });
})();
(() => {
  const banner = document.getElementById("cookieBanner");
  if (!banner) return;

  const accept = document.getElementById("cookieAccept");
  const decline = document.getElementById("cookieDecline");

  const decision = localStorage.getItem("cookieConsent");

  if (!decision) {
    banner.style.display = "block";
  }

  accept.addEventListener("click", () => {
    localStorage.setItem("cookieConsent", "accepted");
    banner.remove();
    loadAnalytics();
  });

  decline.addEventListener("click", () => {
    localStorage.setItem("cookieConsent", "declined");
    banner.remove();
  });

  function loadAnalytics(){
    // HIER später Google Analytics / Plausible / etc. laden
    // Beispiel:
    // const s = document.createElement("script");
    // s.src = "https://www.googletagmanager.com/gtag/js?id=G-XXXX";
    // document.head.appendChild(s);
  }

  if (decision === "accepted") {
    loadAnalytics();
  }
})();
