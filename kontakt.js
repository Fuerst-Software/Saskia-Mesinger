/* ===========================================================
   kontakt.js — Kontaktformular Versand via Formspree
   Betreff: "saskiamesinger.de Kontakt Formular"
   - Honeypot (Spam-Schutz)
   - Feldfehler anzeigen (field-error)
   - Consent Pflicht
   - Edle Statusmeldung in #formNote
=========================================================== */

(() => {
  // Formspree Endpoint (nach Erstellung deines Forms)
  // Beispiel: https://formspree.io/f/abcdwxyz
  const FORMSPREE_ENDPOINT = "https://formspree.io/f/DEIN_FORM_ID";
  const SUBJECT = "saskiamesinger.de Kontakt Formular";

  const form = document.getElementById("contactForm");
  if (!form) return;

  const submitBtn = document.getElementById("contactSubmit") || form.querySelector('button[type="submit"]');
  const noteEl = document.getElementById("formNote") || form.querySelector(".form-note");

  // Feld-Mapper (deine IDs)
  const fields = {
    name: form.querySelector("#name"),
    email: form.querySelector("#email"),
    focus: form.querySelector("#focus"),
    message: form.querySelector("#message"),
    consent: form.querySelector("#consent"),
    honeypot: form.querySelector('input[name="website"]')
  };

  // Error-Elemente: <div class="field-error" data-error-for="name">...</div>
  const errorEl = (key) => form.querySelector(`.field-error[data-error-for="${key}"]`);

  const setNote = (text, type = "info") => {
    if (!noteEl) return;
    noteEl.textContent = text;

    // Edle, stabile Styles (ohne zusätzliche CSS Pflicht)
    noteEl.style.opacity = "1";
    noteEl.style.marginTop = "12px";
    noteEl.style.padding = "10px 12px";
    noteEl.style.borderRadius = "12px";
    noteEl.style.border = "1px solid rgba(255,255,255,.14)";
    noteEl.style.background = "rgba(3,5,10,.45)";
    noteEl.style.color = "var(--text-soft)";
    noteEl.style.textAlign = "center";

    if (type === "success") {
      noteEl.style.border = "1px solid rgba(255,211,106,.25)";
    }
    if (type === "error") {
      noteEl.style.border = "1px solid rgba(255,120,120,.28)";
    }
  };

  const lock = (state) => {
    if (!submitBtn) return;
    submitBtn.disabled = state;
    submitBtn.style.opacity = state ? ".78" : "1";
    submitBtn.style.cursor = state ? "not-allowed" : "pointer";
  };

  const hideAllErrors = () => {
    ["name", "email", "focus", "message", "consent"].forEach(k => {
      const el = errorEl(k);
      if (el) el.style.display = "none";
    });
  };

  const showError = (key) => {
    const el = errorEl(key);
    if (el) el.style.display = "block";
  };

  const markInvalid = (input, invalid) => {
    if (!input) return;
    input.setAttribute("aria-invalid", invalid ? "true" : "false");

    // Minimaler visueller Hinweis ohne CSS-Änderung
    if (invalid) {
      input.style.borderColor = "rgba(255,120,120,.38)";
      input.style.boxShadow = "0 0 0 1px rgba(255,120,120,.18)";
    } else {
      input.style.borderColor = "";
      input.style.boxShadow = "";
    }
  };

  const validate = () => {
    hideAllErrors();

    let ok = true;

    // Name
    if (!fields.name?.value.trim()) {
      ok = false;
      showError("name");
      markInvalid(fields.name, true);
    } else {
      markInvalid(fields.name, false);
    }

    // Email
    const emailVal = fields.email?.value.trim() || "";
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal);
    if (!emailOk) {
      ok = false;
      showError("email");
      markInvalid(fields.email, true);
    } else {
      markInvalid(fields.email, false);
    }

    // Focus
    if (!fields.focus?.value) {
      ok = false;
      showError("focus");
      markInvalid(fields.focus, true);
    } else {
      markInvalid(fields.focus, false);
    }

    // Message
    if (!fields.message?.value.trim()) {
      ok = false;
      showError("message");
      markInvalid(fields.message, true);
    } else {
      markInvalid(fields.message, false);
    }

    // Consent
    if (fields.consent && !fields.consent.checked) {
      ok = false;
      showError("consent");
      // Checkbox style lässt man in Ruhe, aria reicht
      fields.consent.setAttribute("aria-invalid", "true");
    } else if (fields.consent) {
      fields.consent.setAttribute("aria-invalid", "false");
    }

    return ok;
  };

  // Live-Validation light (optional, aber nice)
  ["name", "email", "focus", "message"].forEach(k => {
    const el = fields[k];
    if (!el) return;
    el.addEventListener("input", () => {
      // Nur Fehler zurücknehmen wenn es jetzt ok ist
      validate();
    });
    el.addEventListener("blur", () => validate());
  });
  if (fields.consent) {
    fields.consent.addEventListener("change", () => validate());
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Honeypot -> Bot => silently drop
    if (fields.honeypot && fields.honeypot.value.trim() !== "") {
      // Kein Hinweis an Bot
      return;
    }

    // Eigene Validierung (professioneller als reportValidity bei custom errors)
    if (!validate()) {
      setNote("Bitte prüfen Sie die markierten Felder.", "error");
      // Fokus auf erstes invalid field
      const firstInvalid =
        ["name", "email", "focus", "message"].map(k => fields[k]).find(el => el?.getAttribute("aria-invalid") === "true");
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    lock(true);
    setNote("Senden…", "info");

    const fd = new FormData(form);

    // Subject fix
    fd.set("_subject", SUBJECT);

    // Reply-To (damit du in Gmail direkt antworten kannst)
    // Formspree nutzt je nach Plan/Settings: _replyto
    fd.set("_replyto", fd.get("email") || "");

    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { "Accept": "application/json" },
        body: fd
      });

      if (res.ok) {
        setNote("Danke! Deine Anfrage ist eingegangen – wir melden uns zeitnah", "success");
        form.reset();
        hideAllErrors();

        // aria-invalid zurücksetzen
        ["name", "email", "focus", "message"].forEach(k => markInvalid(fields[k], false));
        if (fields.consent) fields.consent.setAttribute("aria-invalid", "false");
      } else {
        let msg = "Senden fehlgeschlagen. Bitte versuchen Sie es erneut.";
        try {
          const data = await res.json();
          if (data?.errors?.length) msg = data.errors.map(x => x.message).join(" ");
        } catch (_) {}
        setNote(msg, "error");
      }
    } catch (err) {
      setNote("Netzwerkfehler. Bitte später erneut versuchen.", "error");
    } finally {
      lock(false);
    }
  });
})();
