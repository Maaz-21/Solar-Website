"use client";

/**
 * On-demand loader for the Google Translate widget.
 *
 * The widget script is ~96 KB of JS and sets ~28 third-party cookies, so it
 * must not load with the page. It is injected the first time a visitor
 * actually switches language (see Navbar's LanguageSelector).
 */

let loadPromise = null;

export function loadGoogleTranslate() {
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: "en,hi",
          autoDisplay: false,
        },
        "google_translate_container"
      );
      resolve();
    };

    const script = document.createElement("script");
    script.src =
      "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    script.onerror = () => {
      loadPromise = null; // allow a retry on the next click
      reject(new Error("Google Translate failed to load"));
    };
    document.body.appendChild(script);
  });

  return loadPromise;
}

/**
 * The widget builds its hidden <select class="goog-te-combo"> asynchronously
 * after TranslateElement is constructed — poll briefly until it exists.
 */
export function waitForTranslateCombo(timeoutMs = 5000) {
  return new Promise((resolve) => {
    const startedAt = Date.now();
    const check = () => {
      const combo = document.querySelector(".goog-te-combo");
      if (combo && combo.options.length > 0) return resolve(combo);
      if (Date.now() - startedAt > timeoutMs) return resolve(null);
      setTimeout(check, 100);
    };
    check();
  });
}
