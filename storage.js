/* Accès au record, tolérant aux navigateurs sans localStorage
   (navigation privée, stockage désactivé, file:// restrictif). */
(() => {
  "use strict";

  window.Snake = window.Snake || {};

  const key = window.Snake.Config.storageBestKey;

  function readBest() {
    try {
      const raw = window.localStorage.getItem(key);
      const value = Number.parseInt(raw || "0", 10);
      return Number.isFinite(value) && value > 0 ? value : 0;
    } catch (error) {
      return 0;
    }
  }

  function writeBest(value) {
    try {
      if (value > readBest()) {
        window.localStorage.setItem(key, String(value));
      }
    } catch (error) {
      /* Le jeu reste jouable sans record persistant. */
    }
  }

  window.Snake.Storage = Object.freeze({ readBest, writeBest });
})();
